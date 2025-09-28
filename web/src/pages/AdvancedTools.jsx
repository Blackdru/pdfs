import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useSubscriptionAccess } from '../hooks/useSubscriptionAccess'
import { api } from '../lib/api'
import { downloadBlob } from '../lib/utils'
import { Button } from '../components/ui/button'
import FileUploadModal from '../components/FileUploadModal'
import ProcessingModal from '../components/ProcessingModal'
import AIAssistant from '../components/AIAssistant'
import UpgradeModal from '../components/UpgradeModal'
import ToolsGrid from '../components/advanced-tools/ToolsGrid'
import ToolProcessor from '../components/advanced-tools/ToolProcessor'
import ResultsDisplay from '../components/advanced-tools/ResultsDisplay'
import { proTools, PROCESSING_STEPS_CONFIG } from '../components/advanced-tools/toolsConfig'
import toast from 'react-hot-toast'
import { Crown, Sparkles, AlertCircle } from 'lucide-react'

const AdvancedTools = () => {
  const { user, session } = useAuth()
  const { subscription, usage } = useSubscription()
  const { 
    checkAccess, 
    showUpgradeModal, 
    upgradeModalData, 
    closeUpgradeModal 
  } = useSubscriptionAccess()
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const [selectedTool, setSelectedTool] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResults, setOcrResults] = useState(null)
  const [toolResults, setToolResults] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [chatSessions, setChatSessions] = useState({})
  const [currentMessage, setCurrentMessage] = useState('')
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiAssistantMinimized, setAiAssistantMinimized] = useState(false)
  const [currentFileForAI, setCurrentFileForAI] = useState(null)
  const [initializingAIChat, setInitializingAIChat] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState('Initializing...')
  const [processingSteps, setProcessingSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)

  const categories = ['All', 'AI-Powered', 'Professional', 'Security']
  const [selectedCategory, setSelectedCategory] = useState('All')

  const getAvailableTools = () => {
    if (selectedCategory === 'All') {
      return proTools
    } else {
      return proTools.filter(tool => tool.category === selectedCategory)
    }
  }

  const filteredTools = getAvailableTools()

  const updateProgress = (progress, stage, step = null) => {
    setProcessingProgress(progress)
    setProcessingStage(stage)
    if (step !== null) {
      setCurrentStep(step)
    }
  }

  const initializeProcessingSteps = (toolId) => {
    const steps = PROCESSING_STEPS_CONFIG[toolId] || []
    setProcessingSteps(steps)
    setCurrentStep(0)
    setProcessingProgress(0)
    setProcessingStage('Initializing...')
  }

  const handleToolSelect = (tool) => {
    const hasToolAccess = checkAccess(tool.id, tool.title, tool.description)
    if (!hasToolAccess) return

    setSelectedTool(tool)
    setUploadedFiles([])
    setOcrResults(null)
    setToolResults(null)
    setIsProcessing(false)
    setChatSessions({})
    setCurrentMessage('')
    
    setTimeout(() => {
      const uploadSection = document.getElementById('upload-section')
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 200)
  }

  const handleFilesUploaded = async (files) => {
    setOcrResults(null)
    setToolResults(null)
    
    const validFiles = validateFilesForTool(files, selectedTool)
    if (validFiles.length === 0) return
    
    setUploadedFiles(validFiles)
    
    if (validFiles.length >= (selectedTool?.minFiles || 1)) {
      setIsProcessing(true)
      initializeProcessingSteps(selectedTool.id)
      updateProgress(5, 'Preparing files for processing...', 0)
      await handleAutoProcess(validFiles)
    }
  }

  const validateFilesForTool = (files, tool) => {
    if (!tool) return files
    
    const validFiles = []
    const invalidFiles = []
    
    files.forEach(file => {
      const isValid = tool.acceptedFiles.split(',').some(type => {
        const cleanType = type.trim().replace('.', '')
        return file.type.includes(cleanType) || file.name.toLowerCase().endsWith(type.trim())
      })
      
      if (isValid) {
        validFiles.push(file)
      } else {
        invalidFiles.push(file)
      }
    })
    
    if (invalidFiles.length > 0) {
      toast.error(`Invalid files for ${tool.title}: ${invalidFiles.map(f => f.name).join(', ')}`)
    }
    
    return validFiles
  }

  const handleAutoProcess = async (files, toolSettings = {}) => {
    if (!selectedTool || files.length === 0) return

    if (usage && usage.current >= usage.limit && subscription?.plan !== 'premium') {
      toast.error('You have reached your monthly processing limit. Please upgrade to continue.')
      setIsProcessing(false)
      return
    }
    
    try {
      let uploadedFileIds = []
      
      updateProgress(10, 'Uploading files to server...', 0)
      toast.success(`Uploading ${files.length} file(s)...`)
      
      for (const file of files) {
        try {
          const response = await api.uploadFile(file)
          uploadedFileIds.push(response.file.id)
          toast.success(`✅ ${file.name} uploaded successfully`)
        } catch (error) {
          toast.error(`❌ Failed to upload ${file.name}: ${error.message}`)
        }
      }

      if (uploadedFileIds.length === 0) {
        toast.error('No files were uploaded successfully. Please check your connection and try again.')
        return
      }

      let result
      const outputName = `${selectedTool.id}-${Date.now()}`
      
      switch (selectedTool.id) {
        case 'advanced-ocr':
          result = await handleAdvancedOCR(uploadedFileIds[0])
          break
        case 'ai-chat':
          result = await handleAIChat(uploadedFileIds[0], files)
          break
        case 'smart-summary':
          result = await handleSmartSummary(uploadedFileIds[0], toolSettings || {})
          break
        case 'pro-merge':
          result = await api.mergePDFs(uploadedFileIds, `${outputName}.pdf`)
          break
        case 'precision-split':
          result = await handlePrecisionSplit(uploadedFileIds[0], outputName)
          break
        case 'smart-compress':
          result = await handleSmartCompress(uploadedFileIds)
          break
        case 'encrypt-pro':
          result = await handleEncryptPro(uploadedFileIds)
          break
        case 'digital-sign':
          result = await handleDigitalSign(uploadedFileIds[0])
          break
        default:
          throw new Error('Tool not implemented yet')
      }

      setToolResults({
        type: selectedTool.id,
        result: result,
        timestamp: new Date().toISOString(),
        toolName: selectedTool.title
      })

      if (result.file) {
        const blob = await api.downloadFile(result.file.id)
        downloadBlob(blob, result.file.filename)
        toast.success('Processing completed! File downloaded.')
      } else if (result.files && result.files.length > 0) {
        let downloadCount = 0
        for (const file of result.files) {
          try {
            const blob = await api.downloadFile(file.id)
            downloadBlob(blob, file.filename)
            downloadCount++
          } catch (downloadError) {
            console.error('Download error for file:', file.filename, downloadError)
          }
        }
        if (downloadCount > 0) {
          toast.success(`Processing completed! ${downloadCount} file(s) downloaded.`)
        }
      } else {
        toast.success('Processing completed successfully!')
      }
      
      setUploadedFiles([])
      
    } catch (error) {
      console.error('Processing error:', error)
      toast.error(`Processing failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAdvancedOCR = async (fileId) => {
    toast.loading('Processing with AI-enhanced OCR...', { id: 'ocr-processing' })
    
    try {
      const result = await api.post('/ai/ocr', {
        fileId: fileId,
        language: 'eng+tel+spa+fra+deu',
        enhanceImage: true,
        aiEnhanced: true
      })
      
      toast.dismiss('ocr-processing')
      toast.success('Advanced OCR processing completed!')
      
      setOcrResults({
        text: result.result.text,
        confidence: result.result.confidence,
        filename: result.fileInfo.filename,
        pageCount: result.result.pageCount,
        detectedLanguage: result.result.detectedLanguage,
        entities: result.result.entities || [],
        summary: result.result.summary || ''
      })
      
      setUploadedFiles([])
      setIsProcessing(false)
      return result
    } catch (ocrError) {
      toast.dismiss('ocr-processing')
      throw ocrError
    }
  }

  const handleAIChat = async (fileId, files) => {
    if (initializingAIChat) return { initialized: false }
    
    setInitializingAIChat(true)
    
    try {
      toast.loading('Preparing document for AI chat...', { id: 'ai-chat-init' })
      
      try {
        const result = await api.post('/ai/create-embeddings', { fileId })
        toast.dismiss('ai-chat-init')
        toast.success('AI Chat initialized!')
      } catch (embeddingError) {
        if (embeddingError.message.includes('No text content found')) {
          toast.dismiss('ai-chat-init')
          toast.loading('Extracting text from document...', { id: 'ai-chat-ocr' })
          
          const ocrResult = await api.post('/ai/ocr', {
            fileId: fileId,
            language: 'eng+tel',
            enhanceImage: true
          })
          
          toast.dismiss('ai-chat-ocr')
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          toast.loading('Creating AI embeddings...', { id: 'ai-chat-embeddings' })
          await api.post('/ai/create-embeddings', { fileId })
          
          toast.dismiss('ai-chat-embeddings')
          toast.success('AI Chat initialized! Text extracted and processed successfully.')
        } else {
          toast.dismiss('ai-chat-init')
          throw embeddingError
        }
      }
      
      setCurrentFileForAI({
        id: fileId,
        name: files[0].name
      })
      setShowAIAssistant(true)
      setAiAssistantMinimized(false)
      
      setUploadedFiles([])
      setIsProcessing(false)
      return { initialized: true }
      
    } catch (error) {
      toast.dismiss('ai-chat-init')
      toast.dismiss('ai-chat-ocr')
      toast.dismiss('ai-chat-embeddings')
      throw error
    } finally {
      setInitializingAIChat(false)
    }
  }

  const handleSmartSummary = async (fileId, toolSettings = {}) => {
    updateProgress(30, 'Analyzing document text...', 1)
    
    try {
      const result = await api.requestWithRetry('/ai/smart-summary', {
        method: 'POST',
        body: JSON.stringify({
          fileId,
          includeKeyPoints: toolSettings.includeKeyPoints !== false,
          includeSentiment: toolSettings.includeSentiment !== false,
          includeEntities: toolSettings.includeEntities !== false,
          analysisDepth: toolSettings.analysisDepth || 'comprehensive',
          summaryLength: toolSettings.summaryLength || 'medium'
        }),
        timeout: 120000
      }, 2)
      
      updateProgress(70, 'Performing sentiment analysis...', 3)
      updateProgress(85, 'Extracting entities...', 4)
      
      updateProgress(100, 'Smart summary completed!', 5)
      
      // Extract the actual summary data from nested result structure
      const summaryData = result.result?.result || result.result
      
      console.log('Setting toolResults with data:', {
        type: 'smart-summary',
        result: summaryData,
        timestamp: new Date().toISOString(),
        fileId: fileId,
        filename: result.fileInfo?.filename || 'document'
      })
      
      setToolResults({
        type: 'smart-summary',
        result: summaryData,
        timestamp: new Date().toISOString(),
        fileId: fileId,
        filename: result.fileInfo?.filename || 'document'
      })
      
      toast.success('Smart summary generated with AI insights!')
      setUploadedFiles([])
      setIsProcessing(false)
      return result
      
    } catch (error) {
      updateProgress(0, 'Failed to generate summary', 0)
      throw new Error(`Smart summary failed: ${error.message}`)
    }
  }

  const handlePrecisionSplit = async (fileId, outputName) => {
    const splitResponse = await fetch(`${API_BASE_URL}/pdf/split`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ 
        fileId: fileId, 
        outputName: `${outputName}.pdf` 
      })
    })
    
    if (!splitResponse.ok) {
      const errorData = await splitResponse.json()
      throw new Error(errorData.error || 'Split failed')
    }
    
    const splitBlob = await splitResponse.blob()
    downloadBlob(splitBlob, `${outputName}_split.zip`)
    toast.success('PDF split successfully! Files downloaded as ZIP.')
    
    setUploadedFiles([])
    setIsProcessing(false)
    return { success: true }
  }

  const handleSmartCompress = async (fileIds) => {
    const compressedFiles = []
    for (const fileId of fileIds) {
      try {
        const compressed = await api.compressPDF(fileId, 0.5, `compressed-${fileId}.pdf`)
        compressedFiles.push(compressed.file)
      } catch (error) {
        if (error.message.includes('already optimized')) {
          toast.error(`File is already optimized and cannot be compressed further`)
        } else {
          toast.error(`Compression failed: ${error.message}`)
        }
      }
    }
    
    if (compressedFiles.length === 0) {
      toast.error('No files could be compressed - all files are already optimized')
      setUploadedFiles([])
      setIsProcessing(false)
      return { files: [] }
    }
    
    return { files: compressedFiles }
  }

  const handleEncryptPro = async (fileIds) => {
    const encryptedFiles = []
    
    for (const fileId of fileIds) {
      const password = `SecurePDF_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      
      try {
        const result = await api.passwordProtectPDF(
          fileId,
          password,
          {
            printing: true,
            copying: false,
            editing: false,
            annotating: false,
            fillingForms: true,
            extracting: false,
            assembling: false,
            printingHighRes: false
          },
          `encrypted_${Date.now()}.pdf`
        )
        
        encryptedFiles.push(result.file)
        
        toast.success(`File encrypted! Password: ${password}`, { duration: 10000 })
        
        try {
          await navigator.clipboard.writeText(password)
          toast.success('Password copied to clipboard!')
        } catch (clipboardError) {
          console.warn('Could not copy to clipboard:', clipboardError)
        }
      } catch (error) {
        toast.error(`Encryption failed for file: ${error.message}`)
      }
    }

    if (encryptedFiles.length > 0) {
      toast.success(`${encryptedFiles.length} file(s) encrypted successfully with AES-256!`)
    }
    return { files: encryptedFiles }
  }

  const handleDigitalSign = async (fileId) => {
    const signerName = user?.user_metadata?.full_name || user?.email || 'Digital Signer'
    
    try {
      const result = await api.digitalSignPDF(
        fileId,
        {
          name: signerName,
          reason: 'Document approval and authentication',
          location: 'Digital Platform',
          contactInfo: user?.email || 'contact@example.com'
        },
        {
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          page: 1
        },
        `signed_${Date.now()}.pdf`
      )
      
      toast.success('Document digitally signed with advanced certificate!')
      return { file: result.file }
    } catch (error) {
      toast.error(`Digital signing failed: ${error.message}`)
      throw error
    }
  }

  const sendChatMessage = async (fileId) => {
    if (!currentMessage.trim()) return

    const message = currentMessage.trim()
    setCurrentMessage('')

    setChatSessions(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        messages: [...(prev[fileId]?.messages || []), {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        }]
      }
    }))

    try {
      const result = await api.post('/ai/chat', {
        fileId,
        message,
        conversationHistory: chatSessions[fileId]?.messages || []
      })

      setChatSessions(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          messages: [...prev[fileId].messages, {
            role: 'assistant',
            content: result.response,
            timestamp: new Date().toISOString(),
            confidence: result.confidence
          }]
        }
      }))

    } catch (error) {
      toast.error('Failed to send message: ' + error.message)
    }
  }

  const canProcess = uploadedFiles.length >= (selectedTool?.minFiles || 1)
  const usageExceeded = usage && usage.current >= usage.limit && subscription?.plan !== 'premium'

  useEffect(() => {
    if (subscription?.plan === 'free' || !subscription?.plan) {
      const hasAccess = checkAccess('advanced-tools', 'Advanced PDF Tools', 'Professional-grade PDF processing with AI-powered tools')
      if (!hasAccess) return
    }
  }, [subscription?.plan, checkAccess])

  return (
    <div className="min-h-screen bg-grey-950 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-900 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-900 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-900 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Premium Hero Section */}
        <div className="bg-gradient-to-br from-grey-900 via-grey-800 to-grey-900 border-b border-grey-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium mb-6">
                <Crown className="h-4 w-4 mr-2" />
                Professional PDF Suite
                <Sparkles className="h-4 w-4 ml-2" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-grey-100 mb-6">
                Advanced PDF Tools
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Powered by AI
                </span>
              </h1>
              <p className="text-xl text-grey-400 max-w-3xl mx-auto mb-8">
                Unlock professional-grade PDF processing with AI-powered tools, advanced security features, and enterprise-level capabilities.
              </p>
              
              {/* Premium Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
                  <div className="text-grey-400">OCR Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400 mb-2">10x</div>
                  <div className="text-grey-400">Faster Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">256-bit</div>
                  <div className="text-grey-400">Encryption</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
                  <div className="text-grey-400">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Warning */}
        {usageExceeded && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-900 border border-red-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center">
              <AlertCircle className="h-6 w-6 text-red-400 mr-0 sm:mr-4 mb-3 sm:mb-0 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-300 mb-1">Usage Limit Reached</h3>
                <p className="text-red-400 text-sm sm:text-base">You've reached your monthly processing limit. Upgrade to Premium for unlimited access.</p>
              </div>
              <Button className="mt-3 sm:mt-0 sm:ml-auto bg-red-700 hover:bg-red-600 text-white w-full sm:w-auto">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="overflow-x-auto pb-2 mb-6 sm:mb-8 lg:mb-12">
            <div className="flex justify-center gap-2 sm:gap-3 min-w-max px-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-xs sm:text-sm lg:text-base whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-grey-800 text-grey-300 hover:bg-grey-700 hover:text-grey-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <ToolsGrid 
            tools={filteredTools}
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
          />

          {/* Selected Tool Processing Area */}
          {selectedTool && (
            <ToolProcessor
              selectedTool={selectedTool}
              uploadedFiles={uploadedFiles}
              onFilesUploaded={handleFilesUploaded}
              isProcessing={isProcessing}
              canProcess={canProcess}
              usageExceeded={usageExceeded}
              onProcess={handleAutoProcess}
              showUploadModal={showUploadModal}
              setShowUploadModal={setShowUploadModal}
            />
          )}

          {/* Results Section */}
          <ResultsDisplay
            ocrResults={ocrResults}
            toolResults={toolResults}
            chatSessions={chatSessions}
            currentMessage={currentMessage}
            setCurrentMessage={setCurrentMessage}
            onClearOCR={() => setOcrResults(null)}
            onClearToolResults={() => setToolResults(null)}
            onClearChat={() => setChatSessions({})}
            onSendMessage={sendChatMessage}
          />
        </div>
      </div>

      {/* Processing Modal */}
      <ProcessingModal 
        isOpen={isProcessing}
        title={selectedTool ? `${selectedTool.title}` : 'Processing'}
        fileName={uploadedFiles.map(f => f.name).join(', ')}
        progress={processingProgress}
        stage={processingStage}
        icon={selectedTool ? selectedTool.icon : null}
        description={selectedTool ? selectedTool.description : 'Processing your files with professional-grade tools'}
        steps={processingSteps}
        currentStep={currentStep}
        estimatedTime={useMemo(() => selectedTool ? parseInt(selectedTool.processingTime.replace(/[^\d]/g, '')) : 60, [selectedTool?.processingTime])}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFilesUploaded={handleFilesUploaded}
        acceptedFiles={selectedTool?.acceptedFiles || '.pdf'}
        multiple={selectedTool?.multipleFiles || false}
        maxFiles={selectedTool?.multipleFiles ? 10 : 1}
        title={`Upload Files for ${selectedTool?.title || 'Processing'}`}
        description={selectedTool?.description || 'Select files to upload and process'}
        toolName={selectedTool?.title || ''}
        toolIcon={selectedTool?.icon}
      />
        
      {/* AI Assistant */}
      {showAIAssistant && currentFileForAI && (
        <div className="fixed bottom-4 right-4 z-50">
          <AIAssistant
            fileId={currentFileForAI.id}
            fileName={currentFileForAI.name}
            onClose={() => setShowAIAssistant(false)}
            isMinimized={aiAssistantMinimized}
            onToggleMinimize={() => setAiAssistantMinimized(!aiAssistantMinimized)}
          />
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={closeUpgradeModal}
        requiredPlan={upgradeModalData.requiredPlan}
        toolName={upgradeModalData.toolName}
        toolDescription={upgradeModalData.toolDescription}
      />
    </div>
  )
}

export default AdvancedTools