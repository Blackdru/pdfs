const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const { requireProPlan, trackUsage } = require('../middleware/subscriptionMiddleware');
const advancedPdfService = require('../services/advancedPdfService');
const { validateRequest } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Advanced merge with bookmarks and professional options
router.post('/advanced-merge', 
  authenticateUser, 
  requireProPlan,
  trackUsage('pdf_operation', 1),
  validateRequest({
    body: Joi.object({
      fileIds: Joi.array().items(Joi.string().uuid()).min(2).required(),
      outputName: Joi.string().required(),
      options: Joi.object({
        addBookmarks: Joi.boolean().default(true),
        addPageNumbers: Joi.boolean().default(false),
        addTitlePage: Joi.boolean().default(false),
        titlePageContent: Joi.string().when('addTitlePage', { is: true, then: Joi.required() }),
        pageNumberPosition: Joi.string().valid('top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right').default('bottom-center'),
        bookmarkStyle: Joi.string().valid('filename', 'custom').default('filename')
      }).default({})
    })
  }),
  async (req, res) => {
    try {
      const { fileIds, outputName, options } = req.body;

      // Get file metadata
      const { data: files, error: filesError } = await supabaseAdmin
        .from('files')
        .select('*')
        .in('id', fileIds)
        .eq('user_id', req.user.id);

      if (filesError || !files || files.length !== fileIds.length) {
        return res.status(404).json({ error: 'One or more files not found' });
      }

      // Validate all files are PDFs
      const nonPdfFiles = files.filter(file => file.type !== 'application/pdf');
      if (nonPdfFiles.length > 0) {
        return res.status(400).json({ 
          error: 'All files must be PDFs for advanced merge',
          invalidFiles: nonPdfFiles.map(f => f.filename)
        });
      }

      // Perform advanced merge
      const result = await advancedPdfService.advancedMerge(files, outputName, options);

      // Save merged file
      const { data: mergedFile, error: saveError } = await supabaseAdmin
        .from('files')
        .insert([{
          user_id: req.user.id,
          filename: result.filename,
          original_name: result.filename,
          type: 'application/pdf',
          size: result.size,
          path: result.path,
          metadata: {
            operation: 'advanced-merge',
            source_files: files.map(f => ({ id: f.id, filename: f.filename })),
            options: options,
            created_at: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (saveError) {
        throw new Error('Failed to save merged file: ' + saveError.message);
      }

      // Log operation
      await supabaseAdmin
        .from('history')
        .insert([{
          user_id: req.user.id,
          file_id: mergedFile.id,
          action: 'advanced_merge',
          metadata: { source_files: fileIds, options }
        }]);

      res.json({
        message: 'Advanced merge completed successfully',
        file: mergedFile
      });

    } catch (error) {
      console.error('Advanced merge error:', error);
      res.status(500).json({ error: error.message || 'Advanced merge failed' });
    }
  }
);

// Advanced split with custom ranges and batch processing
router.post('/advanced-split',
  authenticateUser,
  requireProPlan,
  trackUsage('pdf_operation', 1),
  validateRequest({
    body: Joi.object({
      fileId: Joi.string().uuid().required(),
      options: Joi.object({
        splitType: Joi.string().valid('pages', 'ranges', 'bookmarks', 'size').default('pages'),
        pageRanges: Joi.array().items(Joi.string()).when('splitType', { is: 'ranges', then: Joi.required() }),
        pagesPerFile: Joi.number().integer().min(1).when('splitType', { is: 'pages', then: Joi.required() }),
        maxFileSize: Joi.number().when('splitType', { is: 'size', then: Joi.required() }),
        customNaming: Joi.boolean().default(true),
        namingPattern: Joi.string().default('{filename}_part_{index}'),
        preserveBookmarks: Joi.boolean().default(true),
        preserveMetadata: Joi.boolean().default(true)
      }).required()
    })
  }),
  async (req, res) => {
    try {
      const { fileId, options } = req.body;

      // Get file metadata
      const { data: file, error: fileError } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', req.user.id)
        .single();

      if (fileError || !file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.type !== 'application/pdf') {
        return res.status(400).json({ error: 'File must be a PDF' });
      }

      // Perform advanced split
      const result = await advancedPdfService.advancedSplit(file, options);

      // Save split files
      const splitFiles = [];
      for (const splitFile of result.files) {
        const { data: savedFile, error: saveError } = await supabaseAdmin
          .from('files')
          .insert([{
            user_id: req.user.id,
            filename: splitFile.filename,
            original_name: splitFile.filename,
            type: 'application/pdf',
            size: splitFile.size,
            path: splitFile.path,
            metadata: {
              operation: 'advanced-split',
              source_file: { id: file.id, filename: file.filename },
              split_info: splitFile.info,
              options: options,
              created_at: new Date().toISOString()
            }
          }])
          .select()
          .single();

        if (!saveError) {
          splitFiles.push(savedFile);
        }
      }

      // Log operation
      await supabaseAdmin
        .from('history')
        .insert([{
          user_id: req.user.id,
          file_id: fileId,
          action: 'advanced_split',
          metadata: { 
            options,
            result_files: splitFiles.length,
            split_type: options.splitType
          }
        }]);

      // Return as ZIP download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename}_split.zip"`);
      
      const zipStream = await advancedPdfService.createZipFromFiles(result.files);
      zipStream.pipe(res);

    } catch (error) {
      console.error('Advanced split error:', error);
      res.status(500).json({ error: error.message || 'Advanced split failed' });
    }
  }
);

// Smart compression with quality control
router.post('/advanced-compress',
  authenticateUser,
  requireProPlan,
  trackUsage('pdf_operation', 1),
  validateRequest({
    body: Joi.object({
      fileId: Joi.string().uuid().required(),
      outputName: Joi.string().required(),
      options: Joi.object({
        compressionLevel: Joi.string().valid('low', 'medium', 'high', 'maximum').default('medium'),
        imageQuality: Joi.number().min(0.1).max(1.0).default(0.7),
        optimizeImages: Joi.boolean().default(true),
        removeMetadata: Joi.boolean().default(false),
        linearize: Joi.boolean().default(true),
        targetSize: Joi.number().optional(),
        preserveBookmarks: Joi.boolean().default(true),
        preserveForms: Joi.boolean().default(true)
      }).default({})
    })
  }),
  async (req, res) => {
    try {
      const { fileId, outputName, options } = req.body;

      // Get file metadata
      const { data: file, error: fileError } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', req.user.id)
        .single();

      if (fileError || !file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.type !== 'application/pdf') {
        return res.status(400).json({ error: 'File must be a PDF' });
      }

      // Perform smart compression
      const result = await advancedPdfService.smartCompress(file, outputName, options);

      // Save compressed file
      const { data: compressedFile, error: saveError } = await supabaseAdmin
        .from('files')
        .insert([{
          user_id: req.user.id,
          filename: result.filename,
          original_name: result.filename,
          type: 'application/pdf',
          size: result.size,
          path: result.path,
          metadata: {
            operation: 'smart-compress',
            source_file: { id: file.id, filename: file.filename },
            compression_ratio: result.compressionRatio,
            original_size: file.size,
            options: options,
            created_at: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (saveError) {
        throw new Error('Failed to save compressed file: ' + saveError.message);
      }

      // Log operation
      await supabaseAdmin
        .from('history')
        .insert([{
          user_id: req.user.id,
          file_id: compressedFile.id,
          action: 'smart_compress',
          metadata: { 
            source_file: fileId,
            compression_ratio: result.compressionRatio,
            options
          }
        }]);

      res.json({
        message: 'Smart compression completed successfully',
        file: compressedFile,
        compressionRatio: result.compressionRatio,
        sizeSaved: file.size - result.size
      });

    } catch (error) {
      console.error('Smart compression error:', error);
      res.status(500).json({ error: error.message || 'Smart compression failed' });
    }
  }
);

// Password protection with advanced security
router.post('/password-protect',
  authenticateUser,
  requireProPlan,
  trackUsage('pdf_operation', 1),
  validateRequest({
    body: Joi.object({
      fileId: Joi.string().uuid().required(),
      password: Joi.string().min(6).required(),
      permissions: Joi.object({
        printing: Joi.boolean().default(true),
        copying: Joi.boolean().default(true),
        editing: Joi.boolean().default(false),
        annotating: Joi.boolean().default(false),
        fillingForms: Joi.boolean().default(true),
        extracting: Joi.boolean().default(false),
        assembling: Joi.boolean().default(false),
        printingHighRes: Joi.boolean().default(false)
      }).default({}),
      outputName: Joi.string().required(),
      encryptionLevel: Joi.string().valid('128-bit', '256-bit').default('256-bit')
    })
  }),
  async (req, res) => {
    try {
      const { fileId, password, permissions, outputName, encryptionLevel } = req.body;

      // Get file metadata
      const { data: file, error: fileError } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', req.user.id)
        .single();

      if (fileError || !file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.type !== 'application/pdf') {
        return res.status(400).json({ error: 'File must be a PDF' });
      }

      // Perform password protection
      const result = await advancedPdfService.passwordProtect(file, password, permissions, outputName, encryptionLevel);

      // Save protected file
      const { data: protectedFile, error: saveError } = await supabaseAdmin
        .from('files')
        .insert([{
          user_id: req.user.id,
          filename: result.filename,
          original_name: result.filename,
          type: 'application/pdf',
          size: result.size,
          path: result.path,
          metadata: {
            operation: 'password-protect',
            source_file: { id: file.id, filename: file.filename },
            encryption_level: encryptionLevel,
            permissions: permissions,
            protected: true,
            created_at: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (saveError) {
        throw new Error('Failed to save protected file: ' + saveError.message);
      }

      // Log operation (don't log the password)
      await supabaseAdmin
        .from('history')
        .insert([{
          user_id: req.user.id,
          file_id: protectedFile.id,
          action: 'password_protect',
          metadata: { 
            source_file: fileId,
            encryption_level: encryptionLevel,
            permissions
          }
        }]);

      res.json({
        message: 'Password protection applied successfully',
        file: protectedFile,
        encryptionLevel,
        permissions
      });

    } catch (error) {
      console.error('Password protection error:', error);
      res.status(500).json({ error: error.message || 'Password protection failed' });
    }
  }
);

// Digital signature with certificate management
router.post('/digital-sign',
  authenticateUser,
  requireProPlan,
  trackUsage('pdf_operation', 1),
  validateRequest({
    body: Joi.object({
      fileId: Joi.string().uuid().required(),
      signatureData: Joi.object({
        name: Joi.string().required(),
        reason: Joi.string().required(),
        location: Joi.string().required(),
        contactInfo: Joi.string().email().required(),
        signatureImage: Joi.string().optional(), // Base64 encoded image
        certificateId: Joi.string().optional()
      }).required(),
      position: Joi.object({
        x: Joi.number().required(),
        y: Joi.number().required(),
        width: Joi.number().default(200),
        height: Joi.number().default(100),
        page: Joi.number().integer().min(1).default(1)
      }).default({ x: 100, y: 100 }),
      outputName: Joi.string().required(),
      signatureType: Joi.string().valid('simple', 'advanced', 'qualified').default('advanced'),
      timestampAuthority: Joi.boolean().default(true)
    })
  }),
  async (req, res) => {
    try {
      const { fileId, signatureData, position, outputName, signatureType, timestampAuthority } = req.body;

      // Get file metadata
      const { data: file, error: fileError } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', req.user.id)
        .single();

      if (fileError || !file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.type !== 'application/pdf') {
        return res.status(400).json({ error: 'File must be a PDF' });
      }

      // Perform digital signing
      const result = await advancedPdfService.digitalSign(
        file, 
        signatureData, 
        position, 
        outputName, 
        signatureType,
        timestampAuthority
      );

      // Save signed file
      const { data: signedFile, error: saveError } = await supabaseAdmin
        .from('files')
        .insert([{
          user_id: req.user.id,
          filename: result.filename,
          original_name: result.filename,
          type: 'application/pdf',
          size: result.size,
          path: result.path,
          metadata: {
            operation: 'digital-sign',
            source_file: { id: file.id, filename: file.filename },
            signature_info: {
              signer: signatureData.name,
              reason: signatureData.reason,
              location: signatureData.location,
              signature_type: signatureType,
              timestamp_authority: timestampAuthority,
              signed_at: new Date().toISOString()
            },
            digitally_signed: true,
            created_at: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (saveError) {
        throw new Error('Failed to save signed file: ' + saveError.message);
      }

      // Log operation
      await supabaseAdmin
        .from('history')
        .insert([{
          user_id: req.user.id,
          file_id: signedFile.id,
          action: 'digital_sign',
          metadata: { 
            source_file: fileId,
            signer: signatureData.name,
            signature_type: signatureType,
            timestamp_authority: timestampAuthority
          }
        }]);

      res.json({
        message: 'Digital signature applied successfully',
        file: signedFile,
        signatureInfo: {
          signer: signatureData.name,
          signedAt: new Date().toISOString(),
          signatureType,
          timestampAuthority
        }
      });

    } catch (error) {
      console.error('Digital signing error:', error);
      res.status(500).json({ error: error.message || 'Digital signing failed' });
    }
  }
);

// Advanced images to PDF with professional options
router.post('/advanced-images-to-pdf',
  authenticateUser,
  requireProPlan,
  trackUsage('pdf_operation', 1),
  validateRequest({
    body: Joi.object({
      fileIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
      outputName: Joi.string().required(),
      options: Joi.object({
        pageSize: Joi.string().valid('A4', 'A3', 'A5', 'Letter', 'Legal', 'Custom').default('A4'),
        customSize: Joi.object({
          width: Joi.number().when('pageSize', { is: 'Custom', then: Joi.required() }),
          height: Joi.number().when('pageSize', { is: 'Custom', then: Joi.required() })
        }).optional(),
        orientation: Joi.string().valid('portrait', 'landscape', 'auto').default('auto'),
        margin: Joi.number().min(0).max(100).default(20),
        imageQuality: Joi.number().min(0.1).max(1.0).default(0.9),
        fitToPage: Joi.boolean().default(true),
        centerImages: Joi.boolean().default(true),
        addPageNumbers: Joi.boolean().default(false),
        addTimestamp: Joi.boolean().default(false),
        backgroundColor: Joi.string().default('#FFFFFF'),
        compression: Joi.string().valid('none', 'jpeg', 'flate').default('jpeg')
      }).default({})
    })
  }),
  async (req, res) => {
    try {
      const { fileIds, outputName, options } = req.body;

      // Get file metadata
      const { data: files, error: filesError } = await supabaseAdmin
        .from('files')
        .select('*')
        .in('id', fileIds)
        .eq('user_id', req.user.id);

      if (filesError || !files || files.length !== fileIds.length) {
        return res.status(404).json({ error: 'One or more files not found' });
      }

      // Validate all files are images
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      const nonImageFiles = files.filter(file => !imageTypes.includes(file.type));
      if (nonImageFiles.length > 0) {
        return res.status(400).json({ 
          error: 'All files must be images',
          invalidFiles: nonImageFiles.map(f => f.filename)
        });
      }

      // Perform advanced conversion
      const result = await advancedPdfService.advancedImagesToPDF(files, outputName, options);

      // Save converted file
      const { data: convertedFile, error: saveError } = await supabaseAdmin
        .from('files')
        .insert([{
          user_id: req.user.id,
          filename: result.filename,
          original_name: result.filename,
          type: 'application/pdf',
          size: result.size,
          path: result.path,
          metadata: {
            operation: 'advanced-images-to-pdf',
            source_files: files.map(f => ({ id: f.id, filename: f.filename })),
            options: options,
            page_count: result.pageCount,
            created_at: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (saveError) {
        throw new Error('Failed to save converted file: ' + saveError.message);
      }

      // Log operation
      await supabaseAdmin
        .from('history')
        .insert([{
          user_id: req.user.id,
          file_id: convertedFile.id,
          action: 'advanced_images_to_pdf',
          metadata: { 
            source_files: fileIds,
            page_count: result.pageCount,
            options
          }
        }]);

      res.json({
        message: 'Advanced image to PDF conversion completed successfully',
        file: convertedFile,
        pageCount: result.pageCount
      });

    } catch (error) {
      console.error('Advanced images to PDF error:', error);
      res.status(500).json({ error: error.message || 'Advanced conversion failed' });
    }
  }
);

// PDF analysis and insights
router.get('/analyze/:fileId',
  authenticateUser,
  requireProPlan,
  async (req, res) => {
    try {
      const { fileId } = req.params;

      // Get file metadata
      const { data: file, error: fileError } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', req.user.id)
        .single();

      if (fileError || !file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.type !== 'application/pdf') {
        return res.status(400).json({ error: 'File must be a PDF' });
      }

      // Perform PDF analysis
      const analysis = await advancedPdfService.analyzePDF(file);

      res.json({
        message: 'PDF analysis completed successfully',
        analysis: analysis,
        fileInfo: {
          filename: file.filename,
          size: file.size,
          uploadedAt: file.created_at
        }
      });

    } catch (error) {
      console.error('PDF analysis error:', error);
      res.status(500).json({ error: error.message || 'PDF analysis failed' });
    }
  }
);

// Create PDF forms
router.post('/create-form',
  authenticateUser,
  requireProPlan,
  trackUsage('pdf_operation', 1),
  validateRequest({
    body: Joi.object({
      formFields: Joi.array().items(Joi.object({
        type: Joi.string().valid('text', 'textarea', 'checkbox', 'radio', 'dropdown', 'signature').required(),
        name: Joi.string().required(),
        label: Joi.string().required(),
        x: Joi.number().required(),
        y: Joi.number().required(),
        width: Joi.number().default(200),
        height: Joi.number().default(30),
        required: Joi.boolean().default(false),
        options: Joi.array().items(Joi.string()).when('type', { is: Joi.valid('radio', 'dropdown'), then: Joi.required() }),
        defaultValue: Joi.string().optional(),
        validation: Joi.object({
          pattern: Joi.string().optional(),
          minLength: Joi.number().optional(),
          maxLength: Joi.number().optional()
        }).optional()
      })).min(1).required(),
      pageSize: Joi.string().valid('A4', 'A3', 'A5', 'Letter', 'Legal').default('A4'),
      outputName: Joi.string().required(),
      options: Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        backgroundColor: Joi.string().default('#FFFFFF'),
        fontFamily: Joi.string().default('Helvetica'),
        fontSize: Joi.number().default(12),
        addSubmitButton: Joi.boolean().default(true),
        submitButtonText: Joi.string().default('Submit'),
        addResetButton: Joi.boolean().default(false),
        resetButtonText: Joi.string().default('Reset')
      }).default({})
    })
  }),
  async (req, res) => {
    try {
      const { formFields, pageSize, outputName, options } = req.body;

      // Create PDF form
      const result = await advancedPdfService.createPDFForm(formFields, pageSize, outputName, options);

      // Save form file
      const { data: formFile, error: saveError } = await supabaseAdmin
        .from('files')
        .insert([{
          user_id: req.user.id,
          filename: result.filename,
          original_name: result.filename,
          type: 'application/pdf',
          size: result.size,
          path: result.path,
          metadata: {
            operation: 'create-form',
            form_fields: formFields.length,
            page_size: pageSize,
            options: options,
            is_form: true,
            created_at: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (saveError) {
        throw new Error('Failed to save form file: ' + saveError.message);
      }

      // Log operation
      await supabaseAdmin
        .from('history')
        .insert([{
          user_id: req.user.id,
          file_id: formFile.id,
          action: 'create_form',
          metadata: { 
            form_fields: formFields.length,
            page_size: pageSize
          }
        }]);

      res.json({
        message: 'PDF form created successfully',
        file: formFile,
        fieldCount: formFields.length
      });

    } catch (error) {
      console.error('PDF form creation error:', error);
      res.status(500).json({ error: error.message || 'PDF form creation failed' });
    }
  }
);

// Add annotations to PDF
router.post('/annotate',
  authenticateUser,
  requireProPlan,
  trackUsage('pdf_operation', 1),
  validateRequest({
    body: Joi.object({
      fileId: Joi.string().uuid().required(),
      annotations: Joi.array().items(Joi.object({
        type: Joi.string().valid('text', 'highlight', 'underline', 'strikeout', 'note', 'stamp').required(),
        page: Joi.number().integer().min(1).required(),
        x: Joi.number().required(),
        y: Joi.number().required(),
        width: Joi.number().default(100),
        height: Joi.number().default(20),
        content: Joi.string().required(),
        color: Joi.string().default('#FFFF00'),
        author: Joi.string().default('User'),
        opacity: Joi.number().min(0).max(1).default(0.7)
      })).min(1).required(),
      outputName: Joi.string().required()
    })
  }),
  async (req, res) => {
    try {
      const { fileId, annotations, outputName } = req.body;

      // Get file metadata
      const { data: file, error: fileError } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', req.user.id)
        .single();

      if (fileError || !file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.type !== 'application/pdf') {
        return res.status(400).json({ error: 'File must be a PDF' });
      }

      // Add annotations
      const result = await advancedPdfService.annotatePDF(file, annotations, outputName);

      // Save annotated file
      const { data: annotatedFile, error: saveError } = await supabaseAdmin
        .from('files')
        .insert([{
          user_id: req.user.id,
          filename: result.filename,
          original_name: result.filename,
          type: 'application/pdf',
          size: result.size,
          path: result.path,
          metadata: {
            operation: 'annotate',
            source_file: { id: file.id, filename: file.filename },
            annotations_count: annotations.length,
            annotation_types: [...new Set(annotations.map(a => a.type))],
            created_at: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (saveError) {
        throw new Error('Failed to save annotated file: ' + saveError.message);
      }

      // Log operation
      await supabaseAdmin
        .from('history')
        .insert([{
          user_id: req.user.id,
          file_id: annotatedFile.id,
          action: 'annotate',
          metadata: { 
            source_file: fileId,
            annotations_count: annotations.length
          }
        }]);

      res.json({
        message: 'PDF annotations added successfully',
        file: annotatedFile,
        annotationsCount: annotations.length
      });

    } catch (error) {
      console.error('PDF annotation error:', error);
      res.status(500).json({ error: error.message || 'PDF annotation failed' });
    }
  }
);

module.exports = router;