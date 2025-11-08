# Direct AI Vision Analysis - Usage Guide

## Overview

Instead of using OCR to extract text first, you can now send images and documents **directly to AI vision models** (like GPT-4 Vision). This is faster, more accurate, and works better for complex layouts.

## Benefits

✅ **No OCR needed** - Send files directly to AI
✅ **Better accuracy** - Vision models understand context and layout
✅ **Faster processing** - Skip the OCR step
✅ **Works with complex documents** - Tables, charts, mixed content
✅ **Supports multiple languages** - No need to specify language

## Supported File Types

- Images: JPEG, PNG, GIF, WebP
- Documents: PDF (with vision model support)

## API Endpoints

### 1. Direct Analysis (Extract Text)

**Endpoint:** `POST /api/ai/direct-analyze`

**Request:**
```json
{
  "fileId": "file-uuid",
  "action": "extract",  // or "summarize", "chat"
  "message": "Optional custom prompt"
}
```

**Response:**
```json
{
  "message": "Direct AI analysis completed",
  "result": {
    "success": true,
    "text": "Extracted text from document...",
    "model": "gpt-4o",
    "method": "direct_vision"
  },
  "fileInfo": {
    "filename": "document.jpg",
    "type": "image/jpeg"
  }
}
```

### 2. Direct Chat (Ask Questions)

**Endpoint:** `POST /api/ai/direct-chat`

**Request:**
```json
{
  "fileId": "file-uuid",
  "message": "What is the total amount in this invoice?",
  "conversationHistory": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ]
}
```

**Response:**
```json
{
  "message": "Chat response generated",
  "response": "The total amount in the invoice is $1,234.56",
  "model": "gpt-4o",
  "method": "direct_vision"
}
```

### 3. Direct Summary (Smart Summary)

**Endpoint:** `POST /api/ai/direct-summary`

**Request:**
```json
{
  "fileId": "file-uuid",
  "includeKeyPoints": true,
  "includeSentiment": true,
  "includeEntities": true
}
```

**Response:**
```json
{
  "message": "Summary generated successfully",
  "result": {
    "success": true,
    "summary": "This document is an invoice...",
    "keyPoints": [
      "Invoice number: INV-001",
      "Total amount: $1,234.56",
      "Due date: 2024-01-31"
    ],
    "sentiment": {
      "positive": 0.6,
      "neutral": 0.3,
      "negative": 0.1
    },
    "entities": [
      "ABC Company",
      "John Doe",
      "New York"
    ],
    "model": "gpt-4o",
    "method": "direct_vision"
  },
  "method": "direct_vision"
}
```

## Frontend Integration Example

### React/JavaScript Example

```javascript
// Direct AI Analysis
const analyzeWithDirectAI = async (fileId) => {
  try {
    const response = await fetch('/api/ai/direct-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fileId: fileId,
        action: 'extract'
      })
    });

    const data = await response.json();
    
    if (data.result.success) {
      console.log('Extracted text:', data.result.text);
      return data.result.text;
    }
  } catch (error) {
    console.error('Direct AI analysis failed:', error);
    // Fallback to OCR if needed
    return await fallbackToOCR(fileId);
  }
};

// Direct AI Chat
const chatWithDocument = async (fileId, message) => {
  try {
    const response = await fetch('/api/ai/direct-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fileId: fileId,
        message: message,
        conversationHistory: chatHistory
      })
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Direct AI chat failed:', error);
  }
};

// Direct AI Summary
const generateDirectSummary = async (fileId) => {
  try {
    const response = await fetch('/api/ai/direct-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fileId: fileId,
        includeKeyPoints: true,
        includeSentiment: true,
        includeEntities: true
      })
    });

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Direct AI summary failed:', error);
  }
};
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Enable AI features
ENABLE_AI_FEATURES=true

# OpenAI API Key (required for vision models)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Vision model (default: gpt-4o)
VISION_MODEL=gpt-4o
```

### Cost Considerations

**GPT-4 Vision Pricing (as of 2024):**
- Input: ~$0.01 per image
- Output: ~$0.03 per 1K tokens

**When to use Direct AI vs OCR:**
- ✅ Use Direct AI for: Complex layouts, tables, charts, handwriting, mixed content
- ✅ Use OCR for: Simple text documents, batch processing, cost-sensitive operations

## Fallback Strategy

The system automatically falls back to OCR if:
1. Direct AI service is not available
2. File type is not supported
3. API key is not configured
4. Vision model fails

```javascript
// Example with automatic fallback
const processDocument = async (fileId) => {
  try {
    // Try direct AI first
    return await analyzeWithDirectAI(fileId);
  } catch (error) {
    if (error.fallbackToOCR) {
      // Fallback to traditional OCR
      return await processWithOCR(fileId);
    }
    throw error;
  }
};
```

## Comparison: Direct AI vs OCR

| Feature | Direct AI Vision | Traditional OCR |
|---------|-----------------|-----------------|
| **Speed** | Fast (1 API call) | Slower (OCR + AI) |
| **Accuracy** | High (understands context) | Medium (text only) |
| **Complex Layouts** | Excellent | Poor |
| **Tables/Charts** | Excellent | Poor |
| **Handwriting** | Good | Poor |
| **Cost** | Higher | Lower |
| **Languages** | Auto-detect | Must specify |
| **Setup** | OpenAI API key | Tesseract + dependencies |

## Use Cases

### 1. Invoice Processing
```javascript
const result = await chatWithDocument(fileId, 
  "Extract invoice number, date, total amount, and vendor name"
);
```

### 2. ID Card/Document Verification
```javascript
const result = await analyzeWithDirectAI(fileId, {
  action: 'extract',
  message: 'Extract all personal information from this ID card'
});
```

### 3. Receipt Analysis
```javascript
const result = await chatWithDocument(fileId,
  "List all items purchased with their prices"
);
```

### 4. Form Processing
```javascript
const result = await analyzeWithDirectAI(fileId, {
  action: 'extract',
  message: 'Extract all form fields and their values'
});
```

## Error Handling

```javascript
try {
  const result = await analyzeWithDirectAI(fileId);
} catch (error) {
  if (error.message.includes('not available')) {
    // Service not configured
    console.log('Please configure OpenAI API key');
  } else if (error.message.includes('not supported')) {
    // File type not supported
    console.log('Use OCR for this file type');
  } else {
    // Other errors
    console.error('Analysis failed:', error);
  }
}
```

## Testing

Test the direct AI service:

```bash
# Test direct analysis
curl -X POST http://localhost:5000/api/ai/direct-analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"fileId": "file-uuid", "action": "extract"}'

# Test direct chat
curl -X POST http://localhost:5000/api/ai/direct-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"fileId": "file-uuid", "message": "What is this document about?"}'

# Test direct summary
curl -X POST http://localhost:5000/api/ai/direct-summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"fileId": "file-uuid", "includeKeyPoints": true}'
```

## Next Steps

1. ✅ Configure OpenAI API key in `.env`
2. ✅ Update frontend to use new endpoints
3. ✅ Test with sample images/documents
4. ✅ Implement fallback to OCR for unsupported files
5. ✅ Monitor costs and usage

## Support

For issues or questions:
- Check if OpenAI API key is configured
- Verify file type is supported
- Check API response for `fallbackToOCR` flag
- Review server logs for detailed errors
