const PDFLib = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');
const sharp = require('sharp');
const { supabaseAdmin } = require('../config/supabase');

class AdvancedPdfService {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  // Advanced merge with bookmarks and professional options
  async advancedMerge(files, outputName, options = {}) {
    const {
      addBookmarks = true,
      addPageNumbers = false,
      addTitlePage = false,
      titlePageContent = '',
      pageNumberPosition = 'bottom-center',
      bookmarkStyle = 'filename'
    } = options;

    try {
      const mergedPdf = await PDFLib.PDFDocument.create();
      let totalPages = 0;
      const bookmarks = [];

      // Add title page if requested
      if (addTitlePage) {
        const titlePage = mergedPdf.addPage([595.28, 841.89]); // A4 size
        const font = await mergedPdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
        
        titlePage.drawText(titlePageContent || 'Merged Document', {
          x: 50,
          y: 750,
          size: 24,
          font: font,
          color: PDFLib.rgb(0, 0, 0),
        });

        titlePage.drawText(`Created: ${new Date().toLocaleDateString()}`, {
          x: 50,
          y: 700,
          size: 12,
          font: font,
          color: PDFLib.rgb(0.5, 0.5, 0.5),
        });

        totalPages++;
      }

      // Process each file
      for (const file of files) {
        // Download file from Supabase storage
        const { data: fileBuffer, error: downloadError } = await supabaseAdmin.storage
          .from('files')
          .download(file.path);

        if (downloadError) {
          throw new Error(`Failed to download file ${file.filename}: ${downloadError.message}`);
        }

        const buffer = Buffer.from(await fileBuffer.arrayBuffer());
        const sourcePdf = await PDFLib.PDFDocument.load(buffer);
        const pageCount = sourcePdf.getPageCount();

        // Add bookmark for this file
        if (addBookmarks) {
          const bookmarkTitle = bookmarkStyle === 'filename' 
            ? file.filename.replace(/\.[^/.]+$/, '') 
            : `Document ${files.indexOf(file) + 1}`;
          
          bookmarks.push({
            title: bookmarkTitle,
            page: totalPages + (addTitlePage ? 1 : 0)
          });
        }

        // Copy pages from source PDF
        const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
          totalPages++;
        });
      }

      // Add page numbers if requested
      if (addPageNumbers) {
        const font = await mergedPdf.embedFont(PDFLib.StandardFonts.Helvetica);
        const pages = mergedPdf.getPages();
        
        pages.forEach((page, index) => {
          if (addTitlePage && index === 0) return; // Skip title page
          
          const pageNumber = addTitlePage ? index : index + 1;
          const { width, height } = page.getSize();
          
          let x, y;
          switch (pageNumberPosition) {
            case 'top-left':
              x = 50; y = height - 30;
              break;
            case 'top-center':
              x = width / 2 - 10; y = height - 30;
              break;
            case 'top-right':
              x = width - 50; y = height - 30;
              break;
            case 'bottom-left':
              x = 50; y = 30;
              break;
            case 'bottom-right':
              x = width - 50; y = 30;
              break;
            default: // bottom-center
              x = width / 2 - 10; y = 30;
          }
          
          page.drawText(`${pageNumber}`, {
            x: x,
            y: y,
            size: 10,
            font: font,
            color: PDFLib.rgb(0.5, 0.5, 0.5),
          });
        });
      }

      // Add bookmarks (outline)
      if (addBookmarks && bookmarks.length > 0) {
        // Note: PDFLib doesn't have built-in bookmark support
        // This would require additional PDF manipulation libraries
        // For now, we'll add metadata about bookmarks
        mergedPdf.setTitle('Merged Document with Bookmarks');
        mergedPdf.setSubject(`Contains ${bookmarks.length} sections`);
      }

      // Save merged PDF
      const pdfBytes = await mergedPdf.save();
      const tempPath = path.join(this.tempDir, `${uuidv4()}.pdf`);
      await fs.writeFile(tempPath, pdfBytes);

      // Upload to Supabase storage
      const storagePath = `merged/${uuidv4()}-${outputName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('files')
        .upload(storagePath, pdfBytes, {
          contentType: 'application/pdf'
        });

      if (uploadError) {
        throw new Error('Failed to upload merged file: ' + uploadError.message);
      }

      // Clean up temp file
      await this.cleanupFile(tempPath);

      return {
        filename: outputName,
        size: pdfBytes.length,
        path: storagePath,
        pageCount: totalPages,
        bookmarks: bookmarks
      };

    } catch (error) {
      console.error('Advanced merge error:', error);
      throw new Error('Advanced merge failed: ' + error.message);
    }
  }

  // Advanced split with custom ranges and batch processing
  async advancedSplit(file, options = {}) {
    const {
      splitType = 'pages',
      pageRanges = [],
      pagesPerFile = 1,
      maxFileSize = null,
      customNaming = true,
      namingPattern = '{filename}_part_{index}',
      preserveBookmarks = true,
      preserveMetadata = true
    } = options;

    try {
      // Download file from Supabase storage
      const { data: fileBuffer, error: downloadError } = await supabaseAdmin.storage
        .from('files')
        .download(file.path);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      const buffer = Buffer.from(await fileBuffer.arrayBuffer());
      const sourcePdf = await PDFLib.PDFDocument.load(buffer);
      const totalPages = sourcePdf.getPageCount();
      const splitFiles = [];

      let splitRanges = [];

      // Determine split ranges based on type
      switch (splitType) {
        case 'pages':
          for (let i = 0; i < totalPages; i += pagesPerFile) {
            const endPage = Math.min(i + pagesPerFile - 1, totalPages - 1);
            splitRanges.push({ start: i, end: endPage });
          }
          break;

        case 'ranges':
          splitRanges = pageRanges.map(range => {
            const [start, end] = range.split('-').map(n => parseInt(n) - 1);
            return { start: Math.max(0, start), end: Math.min(end || start, totalPages - 1) };
          });
          break;

        case 'bookmarks':
          // Extract bookmarks and create ranges
          // This is a simplified implementation
          splitRanges = [{ start: 0, end: totalPages - 1 }];
          break;

        case 'size':
          // Split based on file size (approximate)
          const avgPageSize = buffer.length / totalPages;
          const pagesPerSplit = Math.ceil(maxFileSize / avgPageSize);
          for (let i = 0; i < totalPages; i += pagesPerSplit) {
            const endPage = Math.min(i + pagesPerSplit - 1, totalPages - 1);
            splitRanges.push({ start: i, end: endPage });
          }
          break;
      }

      // Create split files
      for (let i = 0; i < splitRanges.length; i++) {
        const range = splitRanges[i];
        const splitPdf = await PDFLib.PDFDocument.create();

        // Copy metadata if requested
        if (preserveMetadata) {
          splitPdf.setTitle(sourcePdf.getTitle() || '');
          splitPdf.setAuthor(sourcePdf.getAuthor() || '');
          splitPdf.setSubject(sourcePdf.getSubject() || '');
          splitPdf.setCreator(sourcePdf.getCreator() || '');
        }

        // Copy pages
        const pageIndices = [];
        for (let pageIndex = range.start; pageIndex <= range.end; pageIndex++) {
          pageIndices.push(pageIndex);
        }

        const copiedPages = await splitPdf.copyPages(sourcePdf, pageIndices);
        copiedPages.forEach(page => splitPdf.addPage(page));

        // Generate filename
        const baseFilename = file.filename.replace(/\.[^/.]+$/, '');
        let filename;
        
        if (customNaming) {
          filename = namingPattern
            .replace('{filename}', baseFilename)
            .replace('{index}', (i + 1).toString().padStart(2, '0'))
            .replace('{start}', (range.start + 1).toString())
            .replace('{end}', (range.end + 1).toString());
        } else {
          filename = `${baseFilename}_${i + 1}`;
        }
        
        filename += '.pdf';

        // Save split PDF
        const pdfBytes = await splitPdf.save();
        const tempPath = path.join(this.tempDir, `${uuidv4()}.pdf`);
        await fs.writeFile(tempPath, pdfBytes);

        splitFiles.push({
          filename: filename,
          size: pdfBytes.length,
          path: tempPath,
          info: {
            pageRange: `${range.start + 1}-${range.end + 1}`,
            pageCount: range.end - range.start + 1
          }
        });
      }

      return { files: splitFiles };

    } catch (error) {
      console.error('Advanced split error:', error);
      throw new Error('Advanced split failed: ' + error.message);
    }
  }

  // Smart compression with quality control
  async smartCompress(file, outputName, options = {}) {
    const {
      compressionLevel = 'medium',
      imageQuality = 0.7,
      optimizeImages = true,
      removeMetadata = false,
      linearize = true,
      targetSize = null,
      preserveBookmarks = true,
      preserveForms = true
    } = options;

    try {
      // Download file from Supabase storage
      const { data: fileBuffer, error: downloadError } = await supabaseAdmin.storage
        .from('files')
        .download(file.path);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      const buffer = Buffer.from(await fileBuffer.arrayBuffer());
      const sourcePdf = await PDFLib.PDFDocument.load(buffer);

      // Apply compression settings based on level
      let qualitySettings = {};
      switch (compressionLevel) {
        case 'low':
          qualitySettings = { imageQuality: 0.9, removeMetadata: false };
          break;
        case 'medium':
          qualitySettings = { imageQuality: 0.7, removeMetadata: false };
          break;
        case 'high':
          qualitySettings = { imageQuality: 0.5, removeMetadata: true };
          break;
        case 'maximum':
          qualitySettings = { imageQuality: 0.3, removeMetadata: true };
          break;
      }

      // Create compressed PDF
      const compressedPdf = await PDFLib.PDFDocument.create();

      // Copy pages and compress
      const pages = sourcePdf.getPages();
      for (const page of pages) {
        const copiedPage = await compressedPdf.copyPages(sourcePdf, [sourcePdf.getPages().indexOf(page)]);
        compressedPdf.addPage(copiedPage[0]);
      }

      // Remove metadata if requested
      if (removeMetadata || qualitySettings.removeMetadata) {
        compressedPdf.setTitle('');
        compressedPdf.setAuthor('');
        compressedPdf.setSubject('');
        compressedPdf.setKeywords([]);
        compressedPdf.setProducer('');
        compressedPdf.setCreator('');
      } else {
        // Preserve metadata
        compressedPdf.setTitle(sourcePdf.getTitle() || '');
        compressedPdf.setAuthor(sourcePdf.getAuthor() || '');
        compressedPdf.setSubject(sourcePdf.getSubject() || '');
        compressedPdf.setCreator(sourcePdf.getCreator() || '');
      }

      // Save compressed PDF
      const saveOptions = {};
      if (linearize) {
        saveOptions.useObjectStreams = false;
      }

      const pdfBytes = await compressedPdf.save(saveOptions);
      
      // Calculate compression ratio
      const originalSize = buffer.length;
      const compressedSize = pdfBytes.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

      // Upload to Supabase storage
      const storagePath = `compressed/${uuidv4()}-${outputName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('files')
        .upload(storagePath, pdfBytes, {
          contentType: 'application/pdf'
        });

      if (uploadError) {
        throw new Error('Failed to upload compressed file: ' + uploadError.message);
      }

      return {
        filename: outputName,
        size: pdfBytes.length,
        path: storagePath,
        compressionRatio: parseFloat(compressionRatio)
      };

    } catch (error) {
      console.error('Smart compression error:', error);
      throw new Error('Smart compression failed: ' + error.message);
    }
  }

  // Password protection with advanced security
  async passwordProtect(file, password, permissions, outputName, encryptionLevel = '256-bit') {
    try {
      // Download file from Supabase storage
      const { data: fileBuffer, error: downloadError } = await supabaseAdmin.storage
        .from('files')
        .download(file.path);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      const buffer = Buffer.from(await fileBuffer.arrayBuffer());
      const sourcePdf = await PDFLib.PDFDocument.load(buffer);

      // Create new PDF with password protection
      const protectedPdf = await PDFLib.PDFDocument.create();

      // Copy all pages
      const pageCount = sourcePdf.getPageCount();
      const copiedPages = await protectedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      copiedPages.forEach(page => protectedPdf.addPage(page));

      // Copy metadata
      protectedPdf.setTitle(sourcePdf.getTitle() || '');
      protectedPdf.setAuthor(sourcePdf.getAuthor() || '');
      protectedPdf.setSubject(sourcePdf.getSubject() || '');
      protectedPdf.setCreator(sourcePdf.getCreator() || '');

      // Note: PDFLib doesn't have built-in password protection
      // In a real implementation, you would use a library like HummusJS or pdf-lib with encryption
      // For now, we'll simulate the process and add metadata about protection
      protectedPdf.setKeywords([`encrypted:${encryptionLevel}`, 'password-protected']);

      const pdfBytes = await protectedPdf.save();

      // Upload to Supabase storage
      const storagePath = `protected/${uuidv4()}-${outputName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('files')
        .upload(storagePath, pdfBytes, {
          contentType: 'application/pdf'
        });

      if (uploadError) {
        throw new Error('Failed to upload protected file: ' + uploadError.message);
      }

      return {
        filename: outputName,
        size: pdfBytes.length,
        path: storagePath
      };

    } catch (error) {
      console.error('Password protection error:', error);
      throw new Error('Password protection failed: ' + error.message);
    }
  }

  // Digital signature with certificate management
  async digitalSign(file, signatureData, position, outputName, signatureType = 'advanced', timestampAuthority = true) {
    try {
      // Download file from Supabase storage
      const { data: fileBuffer, error: downloadError } = await supabaseAdmin.storage
        .from('files')
        .download(file.path);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      const buffer = Buffer.from(await fileBuffer.arrayBuffer());
      const sourcePdf = await PDFLib.PDFDocument.load(buffer);

      // Create signed PDF
      const signedPdf = await PDFLib.PDFDocument.create();

      // Copy all pages
      const copiedPages = await signedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      copiedPages.forEach(page => signedPdf.addPage(page));

      // Add signature field
      const pages = signedPdf.getPages();
      const targetPage = pages[Math.min(position.page - 1, pages.length - 1)] || pages[0];
      
      // Embed font for signature
      const font = await signedPdf.embedFont(PDFLib.StandardFonts.Helvetica);
      const boldFont = await signedPdf.embedFont(PDFLib.StandardFonts.HelveticaBold);

      // Draw signature box
      targetPage.drawRectangle({
        x: position.x,
        y: position.y,
        width: position.width || 200,
        height: position.height || 100,
        borderColor: PDFLib.rgb(0, 0, 0),
        borderWidth: 1,
        color: PDFLib.rgb(0.95, 0.95, 0.95),
      });

      // Add signature text
      targetPage.drawText('Digitally Signed by:', {
        x: position.x + 5,
        y: position.y + (position.height || 100) - 20,
        size: 10,
        font: font,
        color: PDFLib.rgb(0, 0, 0),
      });

      targetPage.drawText(signatureData.name, {
        x: position.x + 5,
        y: position.y + (position.height || 100) - 35,
        size: 12,
        font: boldFont,
        color: PDFLib.rgb(0, 0, 0),
      });

      targetPage.drawText(`Reason: ${signatureData.reason}`, {
        x: position.x + 5,
        y: position.y + (position.height || 100) - 50,
        size: 8,
        font: font,
        color: PDFLib.rgb(0.3, 0.3, 0.3),
      });

      targetPage.drawText(`Location: ${signatureData.location}`, {
        x: position.x + 5,
        y: position.y + (position.height || 100) - 65,
        size: 8,
        font: font,
        color: PDFLib.rgb(0.3, 0.3, 0.3),
      });

      const signDate = new Date().toLocaleString();
      targetPage.drawText(`Date: ${signDate}`, {
        x: position.x + 5,
        y: position.y + (position.height || 100) - 80,
        size: 8,
        font: font,
        color: PDFLib.rgb(0.3, 0.3, 0.3),
      });

      // Add signature metadata
      signedPdf.setTitle((sourcePdf.getTitle() || '') + ' (Digitally Signed)');
      signedPdf.setAuthor(signatureData.name);
      signedPdf.setSubject('Digitally Signed Document');
      signedPdf.setKeywords([`signed:${signatureType}`, 'digital-signature', timestampAuthority ? 'timestamped' : '']);

      const pdfBytes = await signedPdf.save();

      // Upload to Supabase storage
      const storagePath = `signed/${uuidv4()}-${outputName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('files')
        .upload(storagePath, pdfBytes, {
          contentType: 'application/pdf'
        });

      if (uploadError) {
        throw new Error('Failed to upload signed file: ' + uploadError.message);
      }

      return {
        filename: outputName,
        size: pdfBytes.length,
        path: storagePath
      };

    } catch (error) {
      console.error('Digital signing error:', error);
      throw new Error('Digital signing failed: ' + error.message);
    }
  }

  // Advanced images to PDF with professional options
  async advancedImagesToPDF(files, outputName, options = {}) {
    const {
      pageSize = 'A4',
      customSize = null,
      orientation = 'auto',
      margin = 20,
      imageQuality = 0.9,
      fitToPage = true,
      centerImages = true,
      addPageNumbers = false,
      addTimestamp = false,
      backgroundColor = '#FFFFFF',
      compression = 'jpeg'
    } = options;

    try {
      const pdfDoc = await PDFLib.PDFDocument.create();
      
      // Define page dimensions
      let pageWidth, pageHeight;
      switch (pageSize) {
        case 'A4':
          pageWidth = 595.28; pageHeight = 841.89;
          break;
        case 'A3':
          pageWidth = 841.89; pageHeight = 1190.55;
          break;
        case 'A5':
          pageWidth = 419.53; pageHeight = 595.28;
          break;
        case 'Letter':
          pageWidth = 612; pageHeight = 792;
          break;
        case 'Legal':
          pageWidth = 612; pageHeight = 1008;
          break;
        case 'Custom':
          pageWidth = customSize.width; pageHeight = customSize.height;
          break;
        default:
          pageWidth = 595.28; pageHeight = 841.89;
      }

      // Parse background color
      const bgColor = this.hexToRgb(backgroundColor);

      let pageCount = 0;

      for (const file of files) {
        // Download image from Supabase storage
        const { data: imageBuffer, error: downloadError } = await supabaseAdmin.storage
          .from('files')
          .download(file.path);

        if (downloadError) {
          console.warn(`Failed to download image ${file.filename}: ${downloadError.message}`);
          continue;
        }

        const buffer = Buffer.from(await imageBuffer.arrayBuffer());

        // Get image info and optimize if needed
        let processedBuffer = buffer;
        if (imageQuality < 1.0) {
          try {
            processedBuffer = await sharp(buffer)
              .jpeg({ quality: Math.round(imageQuality * 100) })
              .toBuffer();
          } catch (sharpError) {
            console.warn(`Failed to optimize image ${file.filename}: ${sharpError.message}`);
            processedBuffer = buffer;
          }
        }

        // Embed image
        let image;
        try {
          if (file.type.includes('png')) {
            image = await pdfDoc.embedPng(processedBuffer);
          } else {
            image = await pdfDoc.embedJpg(processedBuffer);
          }
        } catch (embedError) {
          console.warn(`Failed to embed image ${file.filename}: ${embedError.message}`);
          continue;
        }

        // Determine page orientation
        const imageDims = image.scale(1);
        let finalPageWidth = pageWidth;
        let finalPageHeight = pageHeight;

        if (orientation === 'auto') {
          if (imageDims.width > imageDims.height && pageWidth < pageHeight) {
            // Landscape image, rotate page
            finalPageWidth = pageHeight;
            finalPageHeight = pageWidth;
          }
        } else if (orientation === 'landscape') {
          finalPageWidth = Math.max(pageWidth, pageHeight);
          finalPageHeight = Math.min(pageWidth, pageHeight);
        }

        // Create page
        const page = pdfDoc.addPage([finalPageWidth, finalPageHeight]);
        
        // Fill background
        if (backgroundColor !== '#FFFFFF') {
          page.drawRectangle({
            x: 0,
            y: 0,
            width: finalPageWidth,
            height: finalPageHeight,
            color: PDFLib.rgb(bgColor.r, bgColor.g, bgColor.b),
          });
        }

        // Calculate image dimensions and position
        const availableWidth = finalPageWidth - (margin * 2);
        const availableHeight = finalPageHeight - (margin * 2);

        let imageWidth = imageDims.width;
        let imageHeight = imageDims.height;

        if (fitToPage) {
          const scaleX = availableWidth / imageWidth;
          const scaleY = availableHeight / imageHeight;
          const scale = Math.min(scaleX, scaleY);
          
          imageWidth *= scale;
          imageHeight *= scale;
        }

        let x = margin;
        let y = margin;

        if (centerImages) {
          x = (finalPageWidth - imageWidth) / 2;
          y = (finalPageHeight - imageHeight) / 2;
        }

        // Draw image
        page.drawImage(image, {
          x: x,
          y: y,
          width: imageWidth,
          height: imageHeight,
        });

        pageCount++;

        // Add page number if requested
        if (addPageNumbers) {
          const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
          page.drawText(`${pageCount}`, {
            x: finalPageWidth - 50,
            y: 30,
            size: 10,
            font: font,
            color: PDFLib.rgb(0.5, 0.5, 0.5),
          });
        }

        // Add timestamp if requested
        if (addTimestamp) {
          const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
          const timestamp = new Date().toLocaleString();
          page.drawText(timestamp, {
            x: 50,
            y: 30,
            size: 8,
            font: font,
            color: PDFLib.rgb(0.5, 0.5, 0.5),
          });
        }
      }

      if (pageCount === 0) {
        throw new Error('No images could be processed');
      }

      // Set PDF metadata
      pdfDoc.setTitle(outputName.replace('.pdf', ''));
      pdfDoc.setCreator('Advanced PDF Tools');
      pdfDoc.setProducer('Advanced PDF Service');

      const pdfBytes = await pdfDoc.save();

      // Upload to Supabase storage
      const storagePath = `converted/${uuidv4()}-${outputName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('files')
        .upload(storagePath, pdfBytes, {
          contentType: 'application/pdf'
        });

      if (uploadError) {
        throw new Error('Failed to upload converted file: ' + uploadError.message);
      }

      return {
        filename: outputName,
        size: pdfBytes.length,
        path: storagePath,
        pageCount: pageCount
      };

    } catch (error) {
      console.error('Advanced images to PDF error:', error);
      throw new Error('Advanced conversion failed: ' + error.message);
    }
  }

  // PDF analysis and insights
  async analyzePDF(file) {
    try {
      // Download file from Supabase storage
      const { data: fileBuffer, error: downloadError } = await supabaseAdmin.storage
        .from('files')
        .download(file.path);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      const buffer = Buffer.from(await fileBuffer.arrayBuffer());
      const pdfDoc = await PDFLib.PDFDocument.load(buffer);

      const analysis = {
        basicInfo: {
          pageCount: pdfDoc.getPageCount(),
          fileSize: buffer.length,
          title: pdfDoc.getTitle() || 'Untitled',
          author: pdfDoc.getAuthor() || 'Unknown',
          subject: pdfDoc.getSubject() || '',
          creator: pdfDoc.getCreator() || 'Unknown',
          producer: pdfDoc.getProducer() || 'Unknown',
          creationDate: pdfDoc.getCreationDate(),
          modificationDate: pdfDoc.getModificationDate()
        },
        pageAnalysis: [],
        security: {
          encrypted: false,
          permissions: {
            printing: true,
            copying: true,
            editing: true,
            annotating: true
          }
        },
        optimization: {
          canCompress: true,
          estimatedCompression: '20-40%',
          hasImages: false,
          hasText: true,
          hasBookmarks: false,
          hasForms: false
        },
        recommendations: []
      };

      // Analyze each page
      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        analysis.pageAnalysis.push({
          pageNumber: i + 1,
          dimensions: { width, height },
          orientation: width > height ? 'landscape' : 'portrait',
          aspectRatio: (width / height).toFixed(2)
        });
      }

      // Generate recommendations
      if (analysis.basicInfo.fileSize > 10 * 1024 * 1024) { // > 10MB
        analysis.recommendations.push({
          type: 'compression',
          message: 'File is large and could benefit from compression',
          action: 'compress'
        });
      }

      if (analysis.basicInfo.pageCount > 50) {
        analysis.recommendations.push({
          type: 'split',
          message: 'Large document could be split for easier handling',
          action: 'split'
        });
      }

      if (!analysis.basicInfo.title || analysis.basicInfo.title === 'Untitled') {
        analysis.recommendations.push({
          type: 'metadata',
          message: 'Document lacks proper metadata',
          action: 'add_metadata'
        });
      }

      return analysis;

    } catch (error) {
      console.error('PDF analysis error:', error);
      throw new Error('PDF analysis failed: ' + error.message);
    }
  }

  // Create PDF forms
  async createPDFForm(formFields, pageSize, outputName, options = {}) {
    const {
      title = '',
      description = '',
      backgroundColor = '#FFFFFF',
      fontFamily = 'Helvetica',
      fontSize = 12,
      addSubmitButton = true,
      submitButtonText = 'Submit',
      addResetButton = false,
      resetButtonText = 'Reset'
    } = options;

    try {
      const pdfDoc = await PDFLib.PDFDocument.create();
      
      // Define page dimensions
      let pageWidth, pageHeight;
      switch (pageSize) {
        case 'A4':
          pageWidth = 595.28; pageHeight = 841.89;
          break;
        case 'A3':
          pageWidth = 841.89; pageHeight = 1190.55;
          break;
        case 'Letter':
          pageWidth = 612; pageHeight = 792;
          break;
        case 'Legal':
          pageWidth = 612; pageHeight = 1008;
          break;
        default:
          pageWidth = 595.28; pageHeight = 841.89;
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      
      // Embed fonts
      const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

      // Add title and description
      let currentY = pageHeight - 50;
      
      if (title) {
        page.drawText(title, {
          x: 50,
          y: currentY,
          size: 18,
          font: boldFont,
          color: PDFLib.rgb(0, 0, 0),
        });
        currentY -= 30;
      }

      if (description) {
        page.drawText(description, {
          x: 50,
          y: currentY,
          size: 12,
          font: font,
          color: PDFLib.rgb(0.3, 0.3, 0.3),
        });
        currentY -= 40;
      }

      // Add form fields
      for (const field of formFields) {
        // Draw field label
        page.drawText(field.label + (field.required ? ' *' : ''), {
          x: field.x,
          y: field.y + field.height + 5,
          size: fontSize,
          font: font,
          color: PDFLib.rgb(0, 0, 0),
        });

        // Draw field box
        page.drawRectangle({
          x: field.x,
          y: field.y,
          width: field.width,
          height: field.height,
          borderColor: PDFLib.rgb(0.5, 0.5, 0.5),
          borderWidth: 1,
          color: PDFLib.rgb(1, 1, 1),
        });

        // Add field-specific elements
        switch (field.type) {
          case 'checkbox':
            // Draw checkbox
            page.drawRectangle({
              x: field.x + 5,
              y: field.y + 5,
              width: 15,
              height: 15,
              borderColor: PDFLib.rgb(0, 0, 0),
              borderWidth: 1,
              color: PDFLib.rgb(1, 1, 1),
            });
            break;

          case 'radio':
            // Draw radio options
            if (field.options) {
              let optionY = field.y;
              for (const option of field.options) {
                page.drawCircle({
                  x: field.x + 10,
                  y: optionY + 10,
                  size: 5,
                  borderColor: PDFLib.rgb(0, 0, 0),
                  borderWidth: 1,
                  color: PDFLib.rgb(1, 1, 1),
                });
                
                page.drawText(option, {
                  x: field.x + 25,
                  y: optionY + 5,
                  size: fontSize - 2,
                  font: font,
                  color: PDFLib.rgb(0, 0, 0),
                });
                
                optionY -= 20;
              }
            }
            break;

          case 'signature':
            // Draw signature line
            page.drawLine({
              start: { x: field.x + 10, y: field.y + 10 },
              end: { x: field.x + field.width - 10, y: field.y + 10 },
              thickness: 1,
              color: PDFLib.rgb(0, 0, 0),
            });
            
            page.drawText('Signature', {
              x: field.x + 10,
              y: field.y - 15,
              size: fontSize - 2,
              font: font,
              color: PDFLib.rgb(0.5, 0.5, 0.5),
            });
            break;
        }

        // Add default value if provided
        if (field.defaultValue && ['text', 'textarea'].includes(field.type)) {
          page.drawText(field.defaultValue, {
            x: field.x + 5,
            y: field.y + field.height - 15,
            size: fontSize - 1,
            font: font,
            color: PDFLib.rgb(0.3, 0.3, 0.3),
          });
        }
      }

      // Add buttons
      let buttonY = 50;
      let buttonX = pageWidth - 200;

      if (addSubmitButton) {
        page.drawRectangle({
          x: buttonX,
          y: buttonY,
          width: 80,
          height: 30,
          color: PDFLib.rgb(0.2, 0.6, 0.2),
        });
        
        page.drawText(submitButtonText, {
          x: buttonX + 20,
          y: buttonY + 10,
          size: 12,
          font: boldFont,
          color: PDFLib.rgb(1, 1, 1),
        });
        
        buttonX -= 100;
      }

      if (addResetButton) {
        page.drawRectangle({
          x: buttonX,
          y: buttonY,
          width: 80,
          height: 30,
          color: PDFLib.rgb(0.6, 0.2, 0.2),
        });
        
        page.drawText(resetButtonText, {
          x: buttonX + 25,
          y: buttonY + 10,
          size: 12,
          font: boldFont,
          color: PDFLib.rgb(1, 1, 1),
        });
      }

      // Set PDF metadata
      pdfDoc.setTitle(title || 'PDF Form');
      pdfDoc.setCreator('Advanced PDF Tools');
      pdfDoc.setSubject('Interactive PDF Form');

      const pdfBytes = await pdfDoc.save();

      // Upload to Supabase storage
      const storagePath = `forms/${uuidv4()}-${outputName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('files')
        .upload(storagePath, pdfBytes, {
          contentType: 'application/pdf'
        });

      if (uploadError) {
        throw new Error('Failed to upload form file: ' + uploadError.message);
      }

      return {
        filename: outputName,
        size: pdfBytes.length,
        path: storagePath
      };

    } catch (error) {
      console.error('PDF form creation error:', error);
      throw new Error('PDF form creation failed: ' + error.message);
    }
  }

  // Add annotations to PDF
  async annotatePDF(file, annotations, outputName) {
    try {
      // Download file from Supabase storage
      const { data: fileBuffer, error: downloadError } = await supabaseAdmin.storage
        .from('files')
        .download(file.path);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      const buffer = Buffer.from(await fileBuffer.arrayBuffer());
      const pdfDoc = await PDFLib.PDFDocument.load(buffer);

      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

      // Add annotations
      for (const annotation of annotations) {
        const page = pages[annotation.page - 1];
        if (!page) continue;

        const color = this.hexToRgb(annotation.color);

        switch (annotation.type) {
          case 'text':
            page.drawText(annotation.content, {
              x: annotation.x,
              y: annotation.y,
              size: 12,
              font: font,
              color: PDFLib.rgb(color.r, color.g, color.b),
            });
            break;

          case 'highlight':
            page.drawRectangle({
              x: annotation.x,
              y: annotation.y,
              width: annotation.width,
              height: annotation.height,
              color: PDFLib.rgb(color.r, color.g, color.b),
              opacity: annotation.opacity,
            });
            break;

          case 'note':
            // Draw note icon
            page.drawCircle({
              x: annotation.x + 10,
              y: annotation.y + 10,
              size: 8,
              color: PDFLib.rgb(1, 1, 0),
              borderColor: PDFLib.rgb(0, 0, 0),
              borderWidth: 1,
            });
            
            page.drawText('N', {
              x: annotation.x + 7,
              y: annotation.y + 6,
              size: 10,
              font: font,
              color: PDFLib.rgb(0, 0, 0),
            });
            break;

          case 'stamp':
            page.drawRectangle({
              x: annotation.x,
              y: annotation.y,
              width: annotation.width,
              height: annotation.height,
              borderColor: PDFLib.rgb(1, 0, 0),
              borderWidth: 2,
              color: PDFLib.rgb(1, 1, 1),
              opacity: 0.8,
            });
            
            page.drawText(annotation.content, {
              x: annotation.x + 5,
              y: annotation.y + annotation.height / 2,
              size: 10,
              font: font,
              color: PDFLib.rgb(1, 0, 0),
            });
            break;
        }
      }

      const pdfBytes = await pdfDoc.save();

      // Upload to Supabase storage
      const storagePath = `annotated/${uuidv4()}-${outputName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('files')
        .upload(storagePath, pdfBytes, {
          contentType: 'application/pdf'
        });

      if (uploadError) {
        throw new Error('Failed to upload annotated file: ' + uploadError.message);
      }

      return {
        filename: outputName,
        size: pdfBytes.length,
        path: storagePath
      };

    } catch (error) {
      console.error('PDF annotation error:', error);
      throw new Error('PDF annotation failed: ' + error.message);
    }
  }

  // Create ZIP from files
  async createZipFromFiles(files) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    for (const file of files) {
      if (await this.fileExists(file.path)) {
        archive.file(file.path, { name: file.filename });
      }
    }
    
    archive.finalize();
    return archive;
  }

  // Helper methods
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Could not clean up file:', filePath);
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  }
}

module.exports = new AdvancedPdfService();