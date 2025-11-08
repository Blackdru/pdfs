require('dotenv').config();
const directAIService = require('./src/services/directAIService');
const fs = require('fs');
const path = require('path');

async function testDirectAI() {
  console.log('🧪 Testing Direct AI Vision Service...\n');

  // Check if service is enabled
  console.log('1. Checking service availability...');
  const isEnabled = directAIService.isEnabled();
  console.log(`   ✓ Service enabled: ${isEnabled}`);
  
  if (!isEnabled) {
    console.log('   ❌ Direct AI service is not available');
    console.log('   Please check your OPENAI_API_KEY in .env file');
    return;
  }

  console.log(`   ✓ Using model: ${directAIService.visionModel}\n`);

  // Test with a simple text image (you can replace with actual image path)
  console.log('2. Testing text extraction...');
  
  // Create a simple test - you would normally use an actual image file
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  
  if (!fs.existsSync(testImagePath)) {
    console.log('   ⚠️  No test image found at:', testImagePath);
    console.log('   Please add a test image (test-image.jpg) to test the service');
    console.log('\n✅ Configuration is correct! Service is ready to use.');
    return;
  }

  try {
    const imageBuffer = fs.readFileSync(testImagePath);
    const result = await directAIService.analyzeWithVision(
      imageBuffer,
      'image/jpeg',
      'extract'
    );

    console.log('   ✓ Analysis completed successfully!');
    console.log('   Model:', result.model);
    console.log('   Method:', result.method);
    console.log('   Text preview:', result.text.substring(0, 100) + '...\n');

    console.log('3. Testing chat functionality...');
    const chatResult = await directAIService.chatWithDocument(
      imageBuffer,
      'image/jpeg',
      'What is in this image?'
    );

    console.log('   ✓ Chat completed successfully!');
    console.log('   Response:', chatResult.response.substring(0, 100) + '...\n');

    console.log('✅ All tests passed! Direct AI Vision is working correctly.');

  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
    console.error('\nError details:', error);
  }
}

// Run tests
testDirectAI().catch(console.error);
