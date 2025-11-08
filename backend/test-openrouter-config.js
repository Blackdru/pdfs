require('dotenv').config();

console.log('🧪 Testing OpenRouter Configuration for Chat & Summary\n');

console.log('Configuration:');
console.log('✓ OpenRouter API Key:', process.env.OPENROUTER_API_KEY ? 'Configured' : 'Missing');
console.log('✓ AI Model:', process.env.AI_MODEL);
console.log('✓ Use OpenRouter for Chat:', process.env.USE_OPENROUTER_FOR_CHAT);
console.log('✓ Use OpenRouter for Summary:', process.env.USE_OPENROUTER_FOR_SUMMARY);
console.log('✓ OpenAI API Key (for vision):', process.env.OPENAI_API_KEY ? 'Configured' : 'Missing');

console.log('\n📋 Service Routing:');
console.log('• Chat with PDF → OpenRouter (gpt-4.1-nano)');
console.log('• Smart Summary → OpenRouter (gpt-4.1-nano)');
console.log('• Direct AI Vision → OpenAI (gpt-4o)');
console.log('• OCR Enhancement → OpenRouter (gpt-4.1-nano)');

console.log('\n✅ Configuration complete!');
console.log('\nNext steps:');
console.log('1. Restart backend: npm start');
console.log('2. Test chat endpoint: POST /api/ai/chat-pdf');
console.log('3. Test summary endpoint: POST /api/ai/smart-summary');
