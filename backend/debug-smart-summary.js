// Load environment variables first
require('dotenv').config();

const aiService = require('./src/services/aiService');

async function debugSmartSummary() {
  console.log('=== Smart Summary Debug ===');
  
  // Test sample text that would come from a PDF
  const sampleText = `
    EMPLOYMENT CONTRACT
    
    This Employment Agreement is entered into between ABC Corporation and John Smith.
    
    Position: Senior Software Engineer
    Start Date: January 1, 2024
    Salary: $95,000 per year
    Benefits: Health insurance, dental coverage, 401k matching
    
    Responsibilities:
    - Develop and maintain web applications
    - Collaborate with cross-functional teams
    - Participate in code reviews and technical discussions
    - Mentor junior developers
    
    The employee agrees to work full-time, 40 hours per week.
    Vacation time: 15 days per year.
    
    This contract is governed by the laws of California.
  `;
  
  console.log('1. Testing AI service status...');
  console.log('AI Service enabled:', aiService.isEnabled());
  console.log('Using OpenRouter:', aiService.isUsingOpenRouter);
  console.log('Model:', aiService.model);
  
  if (!aiService.isEnabled()) {
    console.error('❌ AI service is not enabled!');
    return;
  }
  
  try {
    console.log('\n2. Testing direct summarization...');
    const summary = await aiService.summarizeText(sampleText, 'detailed');
    console.log('✅ Summary generated successfully:');
    console.log('Summary length:', summary.length);
    console.log('Summary preview:', summary.substring(0, 200) + '...');
    
    console.log('\n3. Testing key points extraction...');
    const keyPointsPrompt = `Extract 5-7 key points from the following text. Format as a numbered list:

${sampleText.substring(0, 3000)}`;
    
    const keyPointsResponse = await aiService.openai.chat.completions.create({
      model: aiService.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts key points from documents. Return only the key points as a numbered list, one point per line.'
        },
        {
          role: 'user',
          content: keyPointsPrompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });
    
    const keyPointsText = keyPointsResponse.choices[0].message.content.trim();
    const keyPoints = keyPointsText.split('\n')
      .filter(line => line.trim().length > 0)
      .map(point => point.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '').trim())
      .filter(point => point.length > 10)
      .slice(0, 7);
      
    console.log('✅ Key points extracted:', keyPoints.length);
    keyPoints.forEach((point, index) => {
      console.log(`${index + 1}. ${point}`);
    });
    
    console.log('\n4. Testing sentiment analysis...');
    const sentimentPrompt = `Analyze the sentiment of the following text and provide percentages for positive, neutral, and negative sentiment. Respond with only a JSON object in this format: {"positive": 0.0, "neutral": 0.0, "negative": 0.0}

${sampleText.substring(0, 2000)}`;
    
    const sentimentResponse = await aiService.openai.chat.completions.create({
      model: aiService.model,
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis expert. Analyze text and return sentiment percentages as JSON. The three values should add up to 1.0.'
        },
        {
          role: 'user',
          content: sentimentPrompt
        }
      ],
      max_tokens: 100,
      temperature: 0.1,
    });
    
    const sentimentText = sentimentResponse.choices[0].message.content.trim();
    const sentimentMatch = sentimentText.match(/\{[^}]+\}/);
    let sentiment = { positive: 0.4, neutral: 0.5, negative: 0.1 };
    
    if (sentimentMatch) {
      try {
        sentiment = JSON.parse(sentimentMatch[0]);
        console.log('✅ Sentiment analysis completed:', sentiment);
      } catch (parseError) {
        console.log('⚠️ Sentiment parsing failed, using fallback:', sentiment);
      }
    }
    
    console.log('\n5. Testing entity extraction...');
    const entityPrompt = `Extract important entities (names, organizations, locations, dates, etc.) from the following text. Return only the entities as a simple list, one per line:

${sampleText.substring(0, 2000)}`;
    
    const entityResponse = await aiService.openai.chat.completions.create({
      model: aiService.model,
      messages: [
        {
          role: 'system',
          content: 'You are an entity extraction expert. Extract important named entities from text and return them as a simple list.'
        },
        {
          role: 'user',
          content: entityPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.2,
    });
    
    const entityText = entityResponse.choices[0].message.content.trim();
    const entities = entityText.split('\n')
      .filter(line => line.trim().length > 0)
      .map(entity => entity.replace(/^[-•*]\s*/, '').trim())
      .filter(entity => entity.length > 1 && entity.length < 50)
      .slice(0, 10);
      
    console.log('✅ Entities extracted:', entities.length);
    entities.forEach((entity, index) => {
      console.log(`- ${entity}`);
    });
    
    console.log('\n6. Creating complete smart summary object...');
    const smartSummary = {
      summary: summary || 'Unable to generate summary for this document.',
      keyPoints: keyPoints,
      sentiment: sentiment,
      entities: entities
    };
    
    console.log('✅ Complete Smart Summary Object:');
    console.log('Summary length:', smartSummary.summary.length);
    console.log('Key points count:', smartSummary.keyPoints.length);
    console.log('Sentiment:', smartSummary.sentiment);
    console.log('Entities count:', smartSummary.entities.length);
    
    console.log('\n7. Simulating API response...');
    const apiResponse = {
      message: 'Smart summary generated successfully',
      result: smartSummary,
      fileId: 'test-file-id'
    };
    
    console.log('API Response structure:');
    console.log('- message:', apiResponse.message);
    console.log('- result.summary length:', apiResponse.result.summary.length);
    console.log('- result.keyPoints length:', apiResponse.result.keyPoints.length);
    console.log('- result.sentiment:', apiResponse.result.sentiment);
    console.log('- result.entities length:', apiResponse.result.entities.length);
    
    console.log('\n🎉 All AI functions are working correctly!');
    console.log('The issue is likely in the frontend display logic or API call.');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    console.error('Full error details:', error.message);
    
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

debugSmartSummary().catch(console.error);