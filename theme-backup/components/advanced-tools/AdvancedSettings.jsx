import { Button } from '../ui/button'
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Languages, 
  Gauge, 
  Scissors, 
  Key, 
  GitMerge, 
  Brain, 
  Award 
} from 'lucide-react'

const AdvancedSettings = ({
  selectedTool,
  showAdvancedSettings,
  setShowAdvancedSettings,
  toolSettings,
  setToolSettings
}) => {
  return (
    <div className="bg-grey-800 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-grey-200 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Advanced Settings
        </h3>
        <Button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          variant="outline"
          size="sm"
          className="border-grey-600 text-grey-300 hover:bg-grey-700"
        >
          {showAdvancedSettings ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Settings
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Settings
            </>
          )}
        </Button>
      </div>

      {showAdvancedSettings && (
        <div className="space-y-6">
          {/* Enhanced OCR Settings */}
          {(selectedTool.id === 'advanced-ocr' || selectedTool.id === 'ai-chat') && (
            <div className="p-4 bg-grey-700 rounded-xl">
              <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Enhanced OCR with AI
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Language Detection
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.ocrLanguage || 'auto'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, ocrLanguage: e.target.value }))}
                  >
                    <option value="auto">🤖 Auto-detect (AI)</option>
                    <option value="eng">English</option>
                    <option value="eng+tel">English + Telugu</option>
                    <option value="eng+hin">English + Hindi</option>
                    <option value="eng+spa">English + Spanish</option>
                    <option value="eng+fra">English + French</option>
                    <option value="eng+deu">English + German</option>
                    <option value="tel">Telugu</option>
                    <option value="hin">Hindi</option>
                    <option value="spa">Spanish</option>
                    <option value="fra">French</option>
                    <option value="deu">German</option>
                    <option value="multi">Multi-language (All)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Processing Mode
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.processingMode || 'enhanced'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, processingMode: e.target.value }))}
                  >
                    <option value="enhanced">✨ Enhanced with AI</option>
                    <option value="original">📄 Extract Original</option>
                    <option value="both">🔄 Both (Compare)</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-grey-300">
                    AI Text Enhancement
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.enhanceWithAI !== false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, enhanceWithAI: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-grey-400">Fix OCR errors with AI</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-grey-300">
                    Image Enhancement
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.enhanceImage !== false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, enhanceImage: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-grey-400">Multiple enhancement strategies</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-grey-300">
                    Translation Ready
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.enableTranslation !== false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, enableTranslation: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-grey-400">Enable AI translation</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-grey-300 mb-2">
                  Confidence Threshold
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0.3"
                    max="0.9"
                    step="0.1"
                    value={toolSettings.confidenceThreshold || 0.6}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm text-grey-300 min-w-[3rem]">
                    {Math.round((toolSettings.confidenceThreshold || 0.6) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-grey-400 mt-1">Lower = more text extracted, Higher = better accuracy</p>
              </div>

              {toolSettings.enableTranslation && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Default Translation Language
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.defaultTranslationLang || ''}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, defaultTranslationLang: e.target.value }))}
                  >
                    <option value="">Select language...</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Compression Settings */}
          {selectedTool.id === 'smart-compress' && (
            <div className="p-4 bg-grey-700 rounded-xl">
              <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                <Gauge className="h-4 w-4 mr-2" />
                Compression Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Compression Level
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.compressionLevel || 'balanced'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, compressionLevel: e.target.value }))}
                  >
                    <option value="light">Light (90% quality)</option>
                    <option value="balanced">Balanced (75% quality)</option>
                    <option value="aggressive">Aggressive (50% quality)</option>
                    <option value="maximum">Maximum (25% quality)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Image Quality
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="25"
                      max="95"
                      step="5"
                      value={toolSettings.imageQuality || 75}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, imageQuality: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-grey-300 min-w-[3rem]">
                      {toolSettings.imageQuality || 75}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={toolSettings.optimizeImages !== false}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, optimizeImages: e.target.checked }))}
                    className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-grey-300">Optimize embedded images</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={toolSettings.removeMetadata || false}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, removeMetadata: e.target.checked }))}
                    className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-grey-300">Remove metadata for smaller size</span>
                </div>
              </div>
            </div>
          )}

          {/* Split Settings */}
          {selectedTool.id === 'precision-split' && (
            <div className="p-4 bg-grey-700 rounded-xl">
              <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                <Scissors className="h-4 w-4 mr-2" />
                Split Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Split Method
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.splitMethod || 'pages'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, splitMethod: e.target.value }))}
                  >
                    <option value="pages">By page ranges</option>
                    <option value="size">By file size</option>
                    <option value="bookmarks">By bookmarks</option>
                    <option value="equal">Equal parts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Page Ranges (e.g., 1-5, 10-15)
                  </label>
                  <input
                    type="text"
                    placeholder="1-5, 10-15, 20"
                    value={toolSettings.pageRanges || ''}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, pageRanges: e.target.value }))}
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-grey-300 mb-2">
                  Output Naming
                </label>
                <input
                  type="text"
                  placeholder="document_part_{n}"
                  value={toolSettings.namingPattern || 'document_part_{n}'}
                  onChange={(e) => setToolSettings(prev => ({ ...prev, namingPattern: e.target.value }))}
                  className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                />
                <p className="text-xs text-grey-400 mt-1">Use {'{n}'} for part number, {'{page}'} for page number</p>
              </div>
            </div>
          )}

          {/* Encryption Settings */}
          {selectedTool.id === 'encrypt-pro' && (
            <div className="p-4 bg-grey-700 rounded-xl">
              <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Encryption Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Encryption Level
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.encryptionLevel || '256-bit'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, encryptionLevel: e.target.value }))}
                  >
                    <option value="128-bit">128-bit AES (Standard)</option>
                    <option value="256-bit">256-bit AES (Military Grade)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Password Type
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.passwordType || 'auto'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, passwordType: e.target.value }))}
                  >
                    <option value="auto">Auto-generated</option>
                    <option value="custom">Custom password</option>
                  </select>
                </div>
              </div>
              {toolSettings.passwordType === 'custom' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Custom Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter secure password"
                    value={toolSettings.customPassword || ''}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, customPassword: e.target.value }))}
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                  />
                </div>
              )}
              <div className="mt-4 space-y-3">
                <h5 className="text-sm font-medium text-grey-300">Document Permissions</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.allowPrinting !== false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, allowPrinting: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-grey-300">Allow printing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.allowCopying || false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, allowCopying: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-grey-300">Allow copying</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.allowEditing || false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, allowEditing: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-grey-300">Allow editing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.allowAnnotations || false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, allowAnnotations: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-grey-300">Allow annotations</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Merge Settings */}
          {selectedTool.id === 'pro-merge' && (
            <div className="p-4 bg-grey-700 rounded-xl">
              <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                <GitMerge className="h-4 w-4 mr-2" />
                Merge Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Page Orientation
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.pageOrientation || 'auto'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, pageOrientation: e.target.value }))}
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Page Size
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.pageSize || 'auto'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, pageSize: e.target.value }))}
                  >
                    <option value="auto">Keep original</option>
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={toolSettings.addBookmarks !== false}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, addBookmarks: e.target.checked }))}
                    className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-grey-300">Add bookmarks for each document</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={toolSettings.addPageNumbers || false}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, addPageNumbers: e.target.checked }))}
                    className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-grey-300">Add page numbers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={toolSettings.optimizeForPrint || false}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, optimizeForPrint: e.target.checked }))}
                    className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-grey-300">Optimize for printing</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Settings */}
          {(selectedTool.id === 'smart-summary' || selectedTool.id === 'ai-chat') && (
            <div className="p-4 bg-grey-700 rounded-xl">
              <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                AI Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Analysis Depth
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.analysisDepth || 'comprehensive'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, analysisDepth: e.target.value }))}
                  >
                    <option value="quick">Quick analysis</option>
                    <option value="standard">Standard analysis</option>
                    <option value="comprehensive">Comprehensive analysis</option>
                    <option value="deep">Deep analysis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Summary Length
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.summaryLength || 'medium'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, summaryLength: e.target.value }))}
                  >
                    <option value="brief">Brief (1-2 paragraphs)</option>
                    <option value="medium">Medium (3-5 paragraphs)</option>
                    <option value="detailed">Detailed (6+ paragraphs)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={toolSettings.includeKeyPoints !== false}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, includeKeyPoints: e.target.checked }))}
                    className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-grey-300">Extract key points</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={toolSettings.includeSentiment !== false}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, includeSentiment: e.target.checked }))}
                    className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-grey-300">Perform sentiment analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={toolSettings.includeEntities !== false}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, includeEntities: e.target.checked }))}
                    className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-grey-300">Detect entities and topics</span>
                </div>
              </div>
            </div>
          )}

          {/* Images to PDF Settings */}
          {selectedTool.id === 'images-to-pdf' && (
            <div className="p-4 bg-grey-700 rounded-xl">
              <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Image to PDF Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Page Size
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.pageSize || 'A4'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, pageSize: e.target.value }))}
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="A3">A3 (297 × 420 mm)</option>
                    <option value="A5">A5 (148 × 210 mm)</option>
                    <option value="Letter">Letter (8.5 × 11 in)</option>
                    <option value="Legal">Legal (8.5 × 14 in)</option>
                    <option value="Custom">Custom Size</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Orientation
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.orientation || 'auto'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, orientation: e.target.value }))}
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              {toolSettings.pageSize === 'Custom' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-grey-300 mb-2">
                      Width (points)
                    </label>
                    <input
                      type="number"
                      placeholder="595.28"
                      value={toolSettings.customWidth || ''}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, customWidth: parseFloat(e.target.value) }))}
                      className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-grey-300 mb-2">
                      Height (points)
                    </label>
                    <input
                      type="number"
                      placeholder="841.89"
                      value={toolSettings.customHeight || ''}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, customHeight: parseFloat(e.target.value) }))}
                      className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Page Margin (points)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={toolSettings.margin || 20}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-grey-300 min-w-[3rem]">
                      {toolSettings.margin || 20}pt
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Image Quality
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={toolSettings.imageQuality || 0.9}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, imageQuality: parseFloat(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-grey-300 min-w-[3rem]">
                      {Math.round((toolSettings.imageQuality || 0.9) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-grey-300 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={toolSettings.backgroundColor || '#FFFFFF'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-12 h-10 rounded border border-grey-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={toolSettings.backgroundColor || '#FFFFFF'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="#FFFFFF"
                    className="flex-1 bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <h5 className="text-sm font-medium text-grey-300">Image Options</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.fitToPage !== false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, fitToPage: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-grey-300">Fit images to page</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.centerImages !== false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, centerImages: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-grey-300">Center images</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.addPageNumbers || false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, addPageNumbers: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-grey-300">Add page numbers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={toolSettings.addTimestamp || false}
                      onChange={(e) => setToolSettings(prev => ({ ...prev, addTimestamp: e.target.checked }))}
                      className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-grey-300">Add timestamp</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-grey-300 mb-2">
                  Compression Method
                </label>
                <select 
                  className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                  value={toolSettings.compression || 'jpeg'}
                  onChange={(e) => setToolSettings(prev => ({ ...prev, compression: e.target.value }))}
                >
                  <option value="none">None (Larger file)</option>
                  <option value="jpeg">JPEG (Recommended)</option>
                  <option value="flate">Flate (Lossless)</option>
                </select>
                <p className="text-xs text-grey-400 mt-1">
                  JPEG provides good quality with smaller file size
                </p>
              </div>
            </div>
          )}

          {/* Digital Signature Settings */}
          {selectedTool.id === 'digital-sign' && (
            <div className="p-4 bg-grey-700 rounded-xl">
              <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Signature Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Signature Position
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.signaturePosition || 'bottom-right'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, signaturePosition: e.target.value }))}
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="center">Center</option>
                    <option value="custom">Custom Position</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-300 mb-2">
                    Signature Size
                  </label>
                  <select 
                    className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                    value={toolSettings.signatureSize || 'medium'}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, signatureSize: e.target.value }))}
                  >
                    <option value="small">Small (100x50)</option>
                    <option value="medium">Medium (200x100)</option>
                    <option value="large">Large (300x150)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-grey-300 mb-2">
                  Signature Reason
                </label>
                <input
                  type="text"
                  placeholder="Document approval and authentication"
                  value={toolSettings.signatureReason || 'Document approval and authentication'}
                  onChange={(e) => setToolSettings(prev => ({ ...prev, signatureReason: e.target.value }))}
                  className="w-full bg-grey-600 border border-grey-500 text-grey-200 rounded-lg px-3 py-2"
                />
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={toolSettings.addTimestamp !== false}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, addTimestamp: e.target.checked }))}
                    className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-grey-300">Add timestamp authority</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={toolSettings.visibleSignature !== false}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, visibleSignature: e.target.checked }))}
                    className="rounded border-grey-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-grey-300">Make signature visible</span>
                </div>
              </div>
            </div>
          )}

          {/* Reset Settings */}
          <div className="flex justify-between items-center pt-4 border-t border-grey-600">
            <p className="text-sm text-grey-400">
              Customize processing parameters for optimal results
            </p>
            <Button
              onClick={() => setToolSettings({})}
              variant="outline"
              size="sm"
              className="border-grey-600 text-grey-300 hover:bg-grey-700"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSettings