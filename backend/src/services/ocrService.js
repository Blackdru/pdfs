const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdf2pic = require('pdf2pic');
const pdfParse = require('pdf-parse');
const pdfPoppler = require('pdf-poppler');

class OCRService {
  constructor() {
    this.languages = process.env.OCR_LANGUAGES || 'eng';
    this.confidenceThreshold = parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD) || 0.5; // Lower threshold for mixed languages
    this.tempDir = path.join(__dirname, '../../temp');
    this.tessdataDir = path.join(__dirname, '../../tessdata');
    this.ensureTempDir();
    
    // Configure Tesseract.js to use local tessdata directory
    process.env.TESSDATA_PREFIX = this.tessdataDir;
    
    // Initialize worker pool for better performance
    this.workerPool = [];
    this.maxWorkers = 2; // Limit concurrent workers to prevent memory issues
    this.activeWorkers = 0;
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  // Check if OCR is enabled
  isEnabled() {
    return process.env.ENABLE_OCR === 'true';
  }

  // Check if Tesseract is properly initialized
  async checkTesseractHealth() {
    try {
      // Create a simple test image using Sharp instead of raw buffer
      const tempPath = path.join(this.tempDir, 'health_check.png');
      
      // Create a simple 100x50 white image with black text
      await sharp({
        create: {
          width: 100,
          height: 50,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
      .png()
      .toFile(tempPath);
      
      // Test OCR with a timeout
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: () => {} // Disable logging for health check
      });
      
      const { data } = await worker.recognize(tempPath);
      await worker.terminate();
      
      await this.cleanupFile(tempPath);
      
      return true;
    } catch (error) {
      console.warn('Tesseract health check failed (this is normal on first run):', error.message);
      return false; // Return false but don't throw - OCR might still work
    }
  }

  // Extract text from image file with multiple enhancement strategies
  async extractTextFromImage(imageBuffer, options = {}) {
    if (!this.isEnabled()) {
      throw new Error('OCR is not enabled');
    }

    const {
      language = this.languages,
      enhanceImage = true
    } = options;

    const tempImagePath = path.join(this.tempDir, `${uuidv4()}.png`);
    const enhancedPaths = [];

    try {
      // Save image buffer to temp file
      await fs.writeFile(tempImagePath, imageBuffer);

      let bestResult = null;
      let bestConfidence = 0;
      let imagesToTry = [tempImagePath]; // Start with original

      // Create multiple enhanced versions if requested
      if (enhanceImage) {
        const enhancements = await this.createMultipleEnhancements(tempImagePath);
        imagesToTry = [...imagesToTry, ...enhancements];
        enhancedPaths.push(...enhancements);
      }

      // Try OCR on each image version
      for (let i = 0; i < imagesToTry.length; i++) {
        const imagePath = imagesToTry[i];
        console.log(`Trying OCR on image version ${i + 1}/${imagesToTry.length}`);
        
        try {
          const ocrResult = await this.performOCR(imagePath, language);
          console.log(`Version ${i + 1} confidence: ${ocrResult.confidence}`);
          
          if (ocrResult.confidence > bestConfidence) {
            bestResult = ocrResult;
            bestConfidence = ocrResult.confidence;
            bestResult.imageVersion = i + 1;
          }
          
          // If we get very good confidence, use this result
          if (ocrResult.confidence > 0.8) {
            console.log(`High confidence achieved with version ${i + 1}, stopping`);
            break;
          }
        } catch (versionError) {
          console.warn(`OCR failed for image version ${i + 1}:`, versionError.message);
          continue;
        }
      }

      if (!bestResult) {
        throw new Error('OCR failed for all image enhancement versions');
      }

      console.log(`Best result from image version ${bestResult.imageVersion} with confidence ${bestResult.confidence}`);

      return {
        text: bestResult.text,
        confidence: bestResult.confidence,
        pageCount: 1,
        pages: [{
          page: 1,
          text: bestResult.text,
          confidence: bestResult.confidence,
          words: bestResult.words
        }],
        language: language,
        imageVersion: bestResult.imageVersion
      };

    } finally {
      // Clean up temp files
      await this.cleanupFile(tempImagePath);
      for (const enhancedPath of enhancedPaths) {
        await this.cleanupFile(enhancedPath);
      }
    }
  }

  // Extract text from PDF - tries direct text extraction first, then OCR
  async extractTextFromPDF(pdfBuffer, options = {}) {
    if (!this.isEnabled()) {
      throw new Error('OCR is not enabled');
    }

    const {
      language = this.languages,
      enhanceImage = true,
      maxPages = 50 // Limit pages for performance
    } = options;

    try {
      // Validate PDF buffer
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Invalid PDF buffer provided');
      }

      console.log('Step 1: Attempting direct text extraction from PDF...');
      
      // First, try to extract text directly from PDF (for text-based PDFs)
      try {
        const pdfData = await pdfParse(pdfBuffer);
        if (pdfData.text && pdfData.text.trim().length > 50) {
          console.log('Direct text extraction successful, text length:', pdfData.text.length);
          return {
            text: pdfData.text.trim(),
            confidence: 0.95, // High confidence for direct extraction
            pageCount: pdfData.numpages || 1,
            pages: [{
              page: 1,
              text: pdfData.text.trim(),
              confidence: 0.95,
              words: []
            }],
            language: language,
            method: 'direct_extraction'
          };
        } else {
          console.log('Direct text extraction yielded minimal text, proceeding with OCR...');
        }
      } catch (directExtractionError) {
        console.log('Direct text extraction failed, proceeding with OCR:', directExtractionError.message);
      }

      console.log('Step 2: Attempting OCR-based text extraction...');
      
      // If direct extraction fails or yields little text, use OCR
      return await this.extractTextFromPDFWithOCR(pdfBuffer, options);

    } catch (error) {
      console.error('Error in PDF text extraction:', error);
      throw new Error('PDF text extraction failed: ' + error.message);
    }
  }

  // Extract text from PDF using OCR (fallback method)
  async extractTextFromPDFWithOCR(pdfBuffer, options = {}) {
    const {
      language = this.languages,
      enhanceImage = true,
      maxPages = 50 // Limit pages for performance
    } = options;

    const tempPdfPath = path.join(this.tempDir, `${uuidv4()}.pdf`);
    const tempImagesDir = path.join(this.tempDir, `images_${uuidv4()}`);

    try {
      // Save PDF buffer to temp file
      await fs.writeFile(tempPdfPath, pdfBuffer);
      await fs.mkdir(tempImagesDir, { recursive: true });

      // Try pdf-poppler first (more reliable)
      let pages = [];
      let totalText = '';
      let totalConfidence = 0;
      let processedPages = 0;

      try {
        console.log('Trying pdf-poppler for PDF to image conversion...');
        
        const options = {
          format: 'png',
          out_dir: tempImagesDir,
          out_prefix: 'page',
          page: null // Convert all pages
        };

        const popplerResult = await pdfPoppler.convert(tempPdfPath, options);
        console.log('pdf-poppler conversion result:', popplerResult ? popplerResult.length : 0, 'pages');

        if (popplerResult && popplerResult.length > 0) {
          // Process each page with OCR
          for (let i = 0; i < Math.min(popplerResult.length, maxPages); i++) {
            const pageInfo = popplerResult[i];
            const imagePath = pageInfo.path;

            try {
              // Verify image file exists
              const stats = await fs.stat(imagePath);
              if (stats.size === 0) {
                console.warn(`Page ${i + 1} image is empty, skipping`);
                continue;
              }

              let processImagePath = imagePath;

              // Enhance image if requested
              if (enhanceImage) {
                try {
                  const enhancedPath = await this.enhanceImageForOCR(imagePath);
                  if (enhancedPath && enhancedPath !== imagePath) {
                    processImagePath = enhancedPath;
                  }
                } catch (enhanceError) {
                  console.warn(`Image enhancement failed for page ${i + 1}, using original:`, enhanceError.message);
                }
              }

              // Perform OCR on this page
              const ocrResult = await this.performOCR(processImagePath, language);

              pages.push({
                page: i + 1,
                text: ocrResult.text,
                confidence: ocrResult.confidence,
                words: ocrResult.words
              });

              totalText += ocrResult.text + '\n\n';
              totalConfidence += ocrResult.confidence;
              processedPages++;

              // Clean up enhanced image if different from original
              if (processImagePath !== imagePath) {
                await this.cleanupFile(processImagePath);
              }

            } catch (pageError) {
              console.warn(`Error processing page ${i + 1}:`, pageError.message);
              continue;
            }
          }
        }
      } catch (popplerError) {
        console.warn('pdf-poppler failed, trying pdf2pic:', popplerError.message);
        
        // Fallback to pdf2pic
        try {
          const convert = pdf2pic.fromPath(tempPdfPath, {
            density: 200,
            saveFilename: 'page',
            savePath: tempImagesDir,
            format: 'png',
            width: 2000,
            height: 2000
          });

          // Process pages with pdf2pic
          for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            try {
              const pageImage = await convert(pageNum, { responseType: 'image' });
              if (!pageImage || !pageImage.path) {
                console.log(`No more pages at page ${pageNum}`);
                break;
              }

              // Verify image file exists and is valid
              const imageStats = await fs.stat(pageImage.path);
              if (imageStats.size === 0) {
                console.warn(`Page ${pageNum} image is empty, skipping`);
                continue;
              }

              let imagePath = pageImage.path;

              // Enhance image if requested
              if (enhanceImage) {
                try {
                  const enhancedPath = await this.enhanceImageForOCR(pageImage.path);
                  if (enhancedPath && enhancedPath !== pageImage.path) {
                    imagePath = enhancedPath;
                  }
                } catch (enhanceError) {
                  console.warn(`Image enhancement failed for page ${pageNum}, using original:`, enhanceError.message);
                  imagePath = pageImage.path;
                }
              }

              // Perform OCR on this page
              const ocrResult = await this.performOCR(imagePath, language);

              pages.push({
                page: pageNum,
                text: ocrResult.text,
                confidence: ocrResult.confidence,
                words: ocrResult.words
              });

              totalText += ocrResult.text + '\n\n';
              totalConfidence += ocrResult.confidence;
              processedPages++;

              // Clean up enhanced image if different from original
              if (imagePath !== pageImage.path) {
                await this.cleanupFile(imagePath);
              }

            } catch (pageError) {
              console.warn(`Error processing page ${pageNum}:`, pageError.message);
              continue;
            }
          }
        } catch (pdf2picError) {
          console.error('Both pdf-poppler and pdf2pic failed:', pdf2picError.message);
          throw new Error('Failed to convert PDF to images. Please ensure the PDF is not corrupted or password-protected.');
        }
      }

      if (processedPages === 0) {
        throw new Error('No pages could be processed successfully');
      }

      const avgConfidence = processedPages > 0 ? totalConfidence / processedPages : 0;

      return {
        text: totalText.trim(),
        confidence: avgConfidence,
        pageCount: processedPages,
        pages: pages,
        language: language,
        method: 'ocr'
      };

    } catch (error) {
      console.error('Error in PDF OCR:', error);
      throw new Error('PDF OCR processing failed: ' + error.message);
    } finally {
      // Clean up temp files
      await this.cleanupFile(tempPdfPath);
      try {
        // Clean up images directory
        const files = await fs.readdir(tempImagesDir);
        for (const file of files) {
          await this.cleanupFile(path.join(tempImagesDir, file));
        }
        await fs.rmdir(tempImagesDir);
      } catch (cleanupError) {
        console.warn('Error cleaning up temp images:', cleanupError);
      }
    }
  }

  // Enhance image for better OCR results with multiple strategies
  async enhanceImageForOCR(imagePath) {
    const enhancedPath = path.join(this.tempDir, `enhanced_${uuidv4()}.png`);

    try {
      // Strategy 1: Aggressive enhancement for ID cards
      await sharp(imagePath)
        .resize({ width: 3000, height: 3000, fit: 'inside', withoutEnlargement: false }) // Higher resolution
        .grayscale() // Convert to grayscale
        .normalize() // Normalize contrast
        .sharpen({ sigma: 2.0 }) // Strong sharpening
        .linear(1.5, -30) // High contrast, reduce brightness
        .threshold(128) // Binary threshold
        .png({ quality: 100 })
        .toFile(enhancedPath);

      return enhancedPath;
    } catch (error) {
      console.error('Error enhancing image:', error);
      return imagePath; // Return original if enhancement fails
    }
  }

  // Create multiple enhanced versions for better OCR
  async createMultipleEnhancements(imagePath) {
    const enhancements = [];
    
    try {
      // Enhancement 1: High contrast binary
      const enhanced1 = path.join(this.tempDir, `enh1_${uuidv4()}.png`);
      await sharp(imagePath)
        .resize({ width: 3000, height: 3000, fit: 'inside', withoutEnlargement: false })
        .grayscale()
        .normalize()
        .linear(2.0, -50)
        .threshold(120)
        .png({ quality: 100 })
        .toFile(enhanced1);
      enhancements.push(enhanced1);

      // Enhancement 2: Moderate enhancement
      const enhanced2 = path.join(this.tempDir, `enh2_${uuidv4()}.png`);
      await sharp(imagePath)
        .resize({ width: 2500, height: 2500, fit: 'inside', withoutEnlargement: false })
        .grayscale()
        .normalize()
        .sharpen({ sigma: 1.0 })
        .linear(1.3, -15)
        .png({ quality: 100 })
        .toFile(enhanced2);
      enhancements.push(enhanced2);

      // Enhancement 3: Noise reduction focus
      const enhanced3 = path.join(this.tempDir, `enh3_${uuidv4()}.png`);
      await sharp(imagePath)
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: false })
        .grayscale()
        .blur(0.3) // Slight blur to reduce noise
        .normalize()
        .sharpen({ sigma: 1.5 })
        .linear(1.4, -25)
        .png({ quality: 100 })
        .toFile(enhanced3);
      enhancements.push(enhanced3);

      return enhancements;
    } catch (error) {
      console.error('Error creating multiple enhancements:', error);
      return [imagePath]; // Return original if all enhancements fail
    }
  }

  // Perform OCR on a single image with optimized settings
  async performOCR(imagePath, language) {
    try {
      console.log('Starting OCR process for:', imagePath);
      console.log('Using language:', language);
      
      // Validate inputs
      if (!imagePath) {
        throw new Error('Image path is required for OCR processing');
      }
      
      if (!language) {
        throw new Error('Language is required for OCR processing');
      }

      // Check if image file exists
      try {
        const stats = await fs.stat(imagePath);
        if (stats.size === 0) {
          throw new Error('Image file is empty');
        }
        console.log('Image file size:', stats.size, 'bytes');
      } catch (statError) {
        throw new Error(`Image file not accessible: ${statError.message}`);
      }
      
      // Create worker with initialization parameters
      const worker = await Tesseract.createWorker(language, 1, {
        logger: () => {}, // Disable verbose logging
        // Set engine mode during initialization
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
        // Dictionary settings during initialization
        load_system_dawg: '0',
        load_freq_dawg: '0',
        load_punc_dawg: '0',
        load_number_dawg: '0',
        load_unambig_dawg: '0',
        load_bigram_dawg: '0',
        load_fixed_length_dawgs: '0'
      });
      
      // Configure Tesseract for better text recognition (only runtime parameters)
      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO, // Auto page segmentation
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: '', // Allow all characters
        tessedit_char_blacklist: '',
        // Additional parameters for better recognition
        classify_bln_numeric_mode: '0',
        textord_really_old_xheight: '1',
        textord_min_xheight: '10',
        tessedit_reject_mode: '0' // Don't reject characters
      });
      
      // Perform OCR recognition
      const { data } = await worker.recognize(imagePath);
      
      await worker.terminate();
      
      // Validate OCR results
      if (!data) {
        throw new Error('OCR processing returned no data');
      }
      
      console.log('OCR confidence:', data.confidence);
      console.log('Text length:', data.text ? data.text.length : 0);

      // Handle case where no words are detected
      const words = data.words || [];
      const acceptableWords = words.filter(
        word => word && word.confidence > 20 // Lower threshold for better coverage
      );

      return {
        text: data.text || '',
        confidence: (data.confidence || 0) / 100,
        words: acceptableWords.map(word => ({
          text: word.text || '',
          confidence: (word.confidence || 0) / 100,
          bbox: word.bbox || {}
        }))
      };
    } catch (error) {
      console.error('Error in Tesseract OCR:', error);
      throw new Error(`OCR processing failed for language ${language}: ${error.message}`);
    }
  }

  // Clean up temporary files
  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Could not clean up file:', filePath);
    }
  }

  // Clean up old temp files (call periodically)
  async cleanupTempFiles(maxAge = 3600000) { // 1 hour default
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await this.cleanupFile(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  // Get supported languages
  getSupportedLanguages() {
    return {
      'eng': 'English',
      'tel': 'Telugu',
      'hin': 'Hindi',
      'eng+tel': 'English + Telugu',
      'eng+hin': 'English + Hindi',
      'spa': 'Spanish',
      'fra': 'French',
      'deu': 'German',
      'ita': 'Italian',
      'por': 'Portuguese',
      'rus': 'Russian',
      'chi_sim': 'Chinese (Simplified)',
      'chi_tra': 'Chinese (Traditional)',
      'jpn': 'Japanese',
      'kor': 'Korean',
      'ara': 'Arabic'
    };
  }
}

module.exports = new OCRService();