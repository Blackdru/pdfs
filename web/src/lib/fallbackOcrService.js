// Fallback OCR Service for client-side processing
// This provides OCR functionality when the backend is unavailable

import Tesseract from 'tesseract.js';

class FallbackOCRService {
  constructor() {
    this.isProcessing = false;
    this.supportedLanguages = {
      'eng': 'English',
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
      'ara': 'Arabic',
      'hin': 'Hindi'
    };
  }

  // Check if OCR is currently processing
  isOCRProcessing() {
    return this.isProcessing;
  }

  // Get list of supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // Process image file with OCR
  async processImage(file, options = {}) {
    const {
      language = 'eng',
      onProgress = () => {},
      enhanceImage = true
    } = options;

    if (this.isProcessing) {
      throw new Error('OCR is already processing another file');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image (JPEG, PNG, GIF, WebP)');
    }

    // Validate file size (max 10MB for client-side processing)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Image file too large for client-side OCR (max 10MB)');
    }

    this.isProcessing = true;

    try {
      // Create image URL for processing
      const imageUrl = URL.createObjectURL(file);

      // Configure Tesseract worker
      const worker = await Tesseract.createWorker(language, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            onProgress({
              status: 'processing',
              progress: progress,
              message: `Processing OCR... ${progress}%`
            });
          }
        }
      });

      onProgress({
        status: 'initializing',
        progress: 0,
        message: 'Initializing OCR engine...'
      });

      // Perform OCR
      const { data } = await worker.recognize(imageUrl);

      // Clean up
      await worker.terminate();
      URL.revokeObjectURL(imageUrl);

      // Process results
      const result = {
        text: data.text,
        confidence: data.confidence / 100, // Convert to 0-1 scale
        language: language,
        pageCount: 1,
        pages: [{
          page: 1,
          text: data.text,
          confidence: data.confidence / 100,
          words: data.words.map(word => ({
            text: word.text,
            confidence: word.confidence / 100,
            bbox: word.bbox
          }))
        }]
      };

      onProgress({
        status: 'completed',
        progress: 100,
        message: 'OCR processing completed!'
      });

      return result;

    } catch (error) {
      console.error('Fallback OCR error:', error);
      
      onProgress({
        status: 'error',
        progress: 0,
        message: `OCR failed: ${error.message}`
      });

      throw new Error(`OCR processing failed: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  // Convert PDF to images and process with OCR (limited functionality)
  async processPDF(file, options = {}) {
    throw new Error('PDF OCR is not available in the free plan. Please upgrade to Pro for PDF OCR functionality.');
  }

  // Enhanced image preprocessing for better OCR results
  async enhanceImage(imageFile) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply image enhancements
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          
          // Apply contrast enhancement
          const contrast = 1.2;
          const enhanced = ((gray - 128) * contrast) + 128;
          
          // Apply threshold for better text recognition
          const threshold = enhanced > 128 ? 255 : 0;
          
          data[i] = threshold;     // Red
          data[i + 1] = threshold; // Green
          data[i + 2] = threshold; // Blue
          // Alpha channel remains unchanged
        }

        // Put enhanced image data back
        ctx.putImageData(imageData, 0, 0);

        // Convert to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for enhancement'));
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }

  // Get OCR statistics
  getOCRStats(result) {
    if (!result || !result.text) {
      return {
        wordCount: 0,
        characterCount: 0,
        averageConfidence: 0,
        languageDetected: 'unknown'
      };
    }

    const words = result.text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = result.text.length;
    
    return {
      wordCount: words.length,
      characterCount: characters,
      averageConfidence: result.confidence || 0,
      languageDetected: result.language || 'unknown',
      processingTime: result.processingTime || 0
    };
  }

  // Validate OCR result quality
  validateOCRResult(result, minConfidence = 0.5) {
    if (!result || !result.text) {
      return {
        isValid: false,
        issues: ['No text extracted'],
        suggestions: ['Try a clearer image', 'Ensure good lighting', 'Check image orientation']
      };
    }

    const issues = [];
    const suggestions = [];

    // Check confidence level
    if (result.confidence < minConfidence) {
      issues.push(`Low confidence (${Math.round(result.confidence * 100)}%)`);
      suggestions.push('Try enhancing image quality');
    }

    // Check text length
    if (result.text.trim().length < 10) {
      issues.push('Very little text extracted');
      suggestions.push('Ensure image contains readable text');
    }

    // Check for mostly special characters (indicates poor OCR)
    const specialCharRatio = (result.text.match(/[^a-zA-Z0-9\s]/g) || []).length / result.text.length;
    if (specialCharRatio > 0.3) {
      issues.push('High ratio of special characters detected');
      suggestions.push('Check image clarity and orientation');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
      confidence: result.confidence,
      textLength: result.text.length
    };
  }
}

// Create and export singleton instance
const fallbackOCRService = new FallbackOCRService();
export default fallbackOCRService;