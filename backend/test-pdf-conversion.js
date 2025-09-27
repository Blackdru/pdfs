const fs = require('fs');
const path = require('path');
const pdf2pic = require('pdf2pic');

async function testPdfConversion() {
  console.log('Testing PDF to image conversion with pdf2pic...');
  
  try {
    // Check if we have a test PDF file
    const testPdfPath = path.join(__dirname, 'test.pdf');
    
    if (!fs.existsSync(testPdfPath)) {
      console.log('No test.pdf found. Please place a test PDF file in the backend directory to test conversion.');
      return;
    }
    
    // Create temp directory for output
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Configure pdf2pic
    const convert = pdf2pic.fromPath(testPdfPath, {
      density: 200,
      saveFilename: 'test_page',
      savePath: tempDir,
      format: 'png',
      width: 2000,
      height: 2000
    });
    
    console.log('Converting first page...');
    const result = await convert(1, { responseType: 'image' });
    
    if (result && result.path) {
      console.log('✅ PDF conversion successful!');
      console.log('Output file:', result.path);
      
      // Check file size
      const stats = fs.statSync(result.path);
      console.log('File size:', stats.size, 'bytes');
      
      // Clean up test file
      fs.unlinkSync(result.path);
      console.log('Test file cleaned up.');
    } else {
      console.log('❌ PDF conversion failed - no output file generated');
    }
    
  } catch (error) {
    console.error('❌ PDF conversion test failed:', error.message);
    
    if (error.message.includes('convert')) {
      console.log('\n💡 This might be because ImageMagick is not installed or not in PATH.');
      console.log('On Windows, you can install ImageMagick from: https://imagemagick.org/script/download.php#windows');
      console.log('On Linux, install with: sudo apt install imagemagick (Ubuntu) or sudo yum install ImageMagick (CentOS)');
    }
  }
}

// Test basic pdf2pic loading
console.log('Testing pdf2pic module loading...');
try {
  console.log('✅ pdf2pic module loaded successfully');
  testPdfConversion();
} catch (error) {
  console.error('❌ Failed to load pdf2pic:', error.message);
}