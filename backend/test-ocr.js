const ocrService = require('./src/services/ocrService');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function testOCR() {
  console.log('Testing OCR Service...');
  
  try {
    // Check if OCR is enabled
    console.log('OCR Enabled:', ocrService.isEnabled());
    
    // Create a simple test image with text
    const testImagePath = path.join(__dirname, 'test-image.png');
    
    // Create a simple image with text using Sharp
    await sharp({
      create: {
        width: 400,
        height: 100,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="400" height="100">
          <text x="20" y="50" font-family="Arial" font-size="20" fill="black">Hello World Test</text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .png()
    .toFile(testImagePath);
    
    console.log('Test image created');
    
    // Read the test image
    const imageBuffer = await fs.readFile(testImagePath);
    
    // Test OCR with English
    console.log('Testing OCR with English...');
    const result = await ocrService.extractTextFromImage(imageBuffer, {
      language: 'eng',
      enhanceImage: false
    });
    
    console.log('OCR Result:', {
      text: result.text,
      confidence: result.confidence,
      pageCount: result.pageCount
    });
    
    // Clean up
    await fs.unlink(testImagePath);
    
    console.log('OCR test completed successfully!');
    
  } catch (error) {
    console.error('OCR test failed:', error);
  }
}

// Set environment variable for testing
process.env.ENABLE_OCR = 'true';

testOCR();