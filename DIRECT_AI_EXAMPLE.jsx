import React, { useState } from 'react';
import { useDirectAI } from './hooks/useDirectAI';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

/**
 * Example component showing how to use Direct AI Vision Analysis
 * This bypasses OCR and sends files directly to AI models
 */
const DirectAIExample = ({ fileId, fileName }) => {
  const { 
    analyzeWithVision, 
    chatWithDocument, 
    generateSmartSummary,
    loading, 
    error 
  } = useDirectAI();

  const [extractedText, setExtractedText] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [summary, setSummary] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [useDirectAI, setUseDirectAI] = useState(true);

  // Example 1: Extract text directly with AI (no OCR)
  const handleDirectExtract = async () => {
    try {
      const result = await analyzeWithVision(fileId, 'extract');
      setExtractedText(result.text);
      console.log('Extracted with:', result.model, result.method);
    } catch (err) {
      if (err.message === 'FALLBACK_TO_OCR') {
        console.log('Falling back to traditional OCR...');
        // Call your existing OCR function here
        await handleTraditionalOCR();
      } else {
        console.error('Extraction failed:', err);
      }
    }
  };

  // Example 2: Chat with document directly
  const handleDirectChat = async () => {
    if (!chatMessage.trim()) return;

    try {
      const response = await chatWithDocument(fileId, chatMessage);
      setChatResponse(response);
      setChatMessage('');
    } catch (err) {
      if (err.message === 'FALLBACK_TO_OCR') {
        // Fallback to OCR-based chat
        await handleTraditionalChat();
      } else {
        console.error('Chat failed:', err);
      }
    }
  };

  // Example 3: Generate smart summary directly
  const handleDirectSummary = async () => {
    try {
      const result = await generateSmartSummary(fileId, {
        includeKeyPoints: true,
        includeSentiment: true,
        includeEntities: true
      });
      setSummary(result);
    } catch (err) {
      if (err.message === 'FALLBACK_TO_OCR') {
        // Fallback to OCR-based summary
        await handleTraditionalSummary();
      } else {
        console.error('Summary failed:', err);
      }
    }
  };

  // Fallback functions (your existing OCR-based methods)
  const handleTraditionalOCR = async () => {
    // Your existing OCR code here
    console.log('Using traditional OCR...');
  };

  const handleTraditionalChat = async () => {
    // Your existing OCR + chat code here
    console.log('Using traditional OCR + chat...');
  };

  const handleTraditionalSummary = async () => {
    // Your existing OCR + summary code here
    console.log('Using traditional OCR + summary...');
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Direct AI Vision Analysis</h2>
        <p className="text-gray-600 mb-4">
          Send {fileName} directly to AI without OCR preprocessing
        </p>

        {/* Toggle between Direct AI and Traditional OCR */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useDirectAI}
              onChange={(e) => setUseDirectAI(e.target.checked)}
              className="rounded"
            />
            <span>Use Direct AI Vision (faster, more accurate)</span>
          </label>
        </div>

        {/* Example 1: Text Extraction */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">1. Extract Text</h3>
          <Button 
            onClick={handleDirectExtract}
            disabled={loading}
            className="mb-2"
          >
            {loading ? 'Extracting...' : 'Extract Text with AI Vision'}
          </Button>
          {extractedText && (
            <div className="mt-2 p-4 bg-gray-100 rounded">
              <p className="text-sm whitespace-pre-wrap">{extractedText}</p>
            </div>
          )}
        </div>

        {/* Example 2: Chat with Document */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">2. Chat with Document</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a question about the document..."
              className="flex-1 px-4 py-2 border rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleDirectChat()}
            />
            <Button 
              onClick={handleDirectChat}
              disabled={loading || !chatMessage.trim()}
            >
              {loading ? 'Asking...' : 'Ask'}
            </Button>
          </div>
          {chatResponse && (
            <div className="mt-2 p-4 bg-blue-50 rounded">
              <p className="text-sm">{chatResponse}</p>
            </div>
          )}
        </div>

        {/* Example 3: Smart Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">3. Generate Smart Summary</h3>
          <Button 
            onClick={handleDirectSummary}
            disabled={loading}
            className="mb-2"
          >
            {loading ? 'Generating...' : 'Generate Summary with AI Vision'}
          </Button>
          {summary && (
            <div className="mt-2 space-y-4">
              <div className="p-4 bg-gray-100 rounded">
                <h4 className="font-semibold mb-2">Summary:</h4>
                <p className="text-sm">{summary.summary}</p>
              </div>
              
              {summary.keyPoints && summary.keyPoints.length > 0 && (
                <div className="p-4 bg-gray-100 rounded">
                  <h4 className="font-semibold mb-2">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.entities && summary.entities.length > 0 && (
                <div className="p-4 bg-gray-100 rounded">
                  <h4 className="font-semibold mb-2">Entities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {summary.entities.map((entity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 rounded text-sm">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {summary.sentiment && (
                <div className="p-4 bg-gray-100 rounded">
                  <h4 className="font-semibold mb-2">Sentiment:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-20">Positive:</span>
                      <div className="flex-1 bg-gray-200 rounded h-4">
                        <div 
                          className="bg-green-500 h-4 rounded"
                          style={{ width: `${summary.sentiment.positive * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{(summary.sentiment.positive * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-20">Neutral:</span>
                      <div className="flex-1 bg-gray-200 rounded h-4">
                        <div 
                          className="bg-gray-500 h-4 rounded"
                          style={{ width: `${summary.sentiment.neutral * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{(summary.sentiment.neutral * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-20">Negative:</span>
                      <div className="flex-1 bg-gray-200 rounded h-4">
                        <div 
                          className="bg-red-500 h-4 rounded"
                          style={{ width: `${summary.sentiment.negative * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{(summary.sentiment.negative * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold mb-2">💡 How it works:</h4>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Files are sent directly to GPT-4 Vision (no OCR needed)</li>
            <li>Faster processing with better accuracy</li>
            <li>Works great with complex layouts, tables, and charts</li>
            <li>Automatically falls back to OCR if vision model is unavailable</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default DirectAIExample;
