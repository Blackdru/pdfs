// Load environment variables first
require('dotenv').config();

const aiService = require('./src/services/aiService');

async function testAIService() {
  console.log('=== AI Service Test ===');
  
  // Test 1: Check if AI service is enabled
  console.log('\n1. Checking AI service status...');
  console.log('AI Service enabled:', aiService.isEnabled());
  console.log('Using OpenRouter:', aiService.isUsingOpenRouter);
  console.log('Using OpenAI:', aiService.isUsingOpenAI);
  console.log('Model:', aiService.model);
  
  // Test 2: Test connection
  console.log('\n2. Testing AI connection...');
  try {
    const connectionTest = await aiService.testConnection();
    console.log('Connection test result:', connectionTest);
  } catch (error) {
    console.error('Connection test failed:', error.message);
  }
  
  // Test 3: Test summarization with sample text
  console.log('\n3. Testing summarization...');
  const sampleText = `
    This is a sample document about artificial intelligence and machine learning. 
    Artificial intelligence (AI) is a branch of computer science that aims to create 
    intelligent machines that work and react like humans. Machine learning is a subset 
    of AI that provides systems the ability to automatically learn and improve from 
    experience without being explicitly programmed. Deep learning is a subset of 
    machine learning that uses neural networks with multiple layers to model and 
    understand complex patterns in data. These technologies are revolutionizing 
    various industries including healthcare, finance, transportation, and entertainment.
  `;
  
  try {
    if (aiService.isEnabled()) {
      console.log('Attempting to generate summary...');
      const summary = await aiService.summarizeText(sampleText, 'detailed');
      console.log('Summary generated successfully:');
      console.log('---');
      console.log(summary);
      console.log('---');
      console.log('Summary length:', summary.length, 'characters');
    } else {
      console.log('AI service is not enabled, skipping summarization test');
    }
  } catch (error) {
    console.error('Summarization test failed:', error.message);
    console.error('Full error:', error);
  }
  
  // Test 4: Check environment variables
  console.log('\n4. Environment variables check...');
  console.log('ENABLE_AI_FEATURES:', process.env.ENABLE_AI_FEATURES);
  console.log('ENABLE_SUMMARIZATION:', process.env.ENABLE_SUMMARIZATION);
  console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
  console.log('OPENAI_API_KEY value:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'not set');
  console.log('OPENROUTER_API_KEY present:', !!process.env.OPENROUTER_API_KEY);
  console.log('OPENROUTER_API_KEY value:', process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 10) + '...' : 'not set');
  console.log('AI_MODEL:', process.env.AI_MODEL);
  
  // Test 5: Debug validation logic
  console.log('\n5. Validation logic debug...');
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;
  
  console.log('OpenRouter key checks:');
  console.log('- Key exists:', !!openRouterKey);
  console.log('- Not placeholder 1:', openRouterKey !== 'your_openrouter_api_key_here');
  console.log('- Not placeholder 2:', openRouterKey !== 'sk-test-key-for-development');
  console.log('- Starts with sk-or-:', openRouterKey ? openRouterKey.startsWith('sk-or-') : false);
  console.log('- Starts with sk-or-v1-:', openRouterKey ? openRouterKey.startsWith('sk-or-v1-') : false);
  
  console.log('OpenAI key checks:');
  console.log('- Key exists:', !!openAIKey);
  console.log('- Not placeholder 1:', openAIKey !== 'your_openai_api_key_here');
  console.log('- Not placeholder 2:', openAIKey !== 'sk-test-key-for-development');
  console.log('- Starts with sk-:', openAIKey ? openAIKey.startsWith('sk-') : false);
}

testAIService().catch(console.error);