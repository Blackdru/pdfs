import { useState, useEffect } from 'react'
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
import EnhancedOCRModal from '../components/EnhancedOCRModal'
import { proTools, PROCESSING_STEPS_CONFIG } from '../components/advanced-tools/toolsConfig'
import toast from 'react-hot-toast'
import { AlertCircle, FileText } from 'lucide-react'

const AdvancedTools = () => {
  const { user, session } = useAuth()
  const { subscription, usage } = useSubscription()
  const { 
    checkAccess, 
    showUpgradeModal, 
    upgradeModalData, 
    closeUpgradeModal,
    filterToolsByAccess 
  } = useSubscriptionAccess()
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const [selectedTool, setSelectedTool] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedFiles, setProcessedFiles] = useState([])
  const [ocrResults, setOcrResults] = useState(null)
  const [toolResults, setToolResults] = useState(null)
  const [clearFileUpload, setClearFileUpload] = useState(false)
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
  const [showEnhancedOCRModal, setShowEnhancedOCRModal] = useState(false)
  const [enhancedOCRResult, setEnhancedOCRResult] = useState(null)
  const [currentFileId, setCurrentFileId] = useState(null)
  const [toolSettings, setToolSettings] = useState({})

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
    const steps = PROCESSING_STEPS_CONFIG[toolId] || [
      { name: 'Uploading', icon: 'Upload' },
      { name: 'Processing', icon: 'FileText' },
      { name: 'Finalizing', icon: 'CheckCircle' },
      { name: 'Complete', icon: 'Download' }
    ]

    setProcessingSteps(steps)
    setCurrentStep(0)
    setProcessingProgress(0)
    setProcessingStage('Initializing...')
  }

  const handleToolSelect = (tool) => {
    console.log('Advanced tool selected:', tool.id, 'Current plan:', subscription?.plan)
    
    // Check if user has access to this advanced tool
    const hasToolAccess = checkAccess(tool.id, tool.title, tool.description)
    console.log('Advanced tool access check result:', hasToolAccess)
    
    if (!hasToolAccess) {
      console.log('Access denied for advanced tool, showing upgrade modal')
      return // Access denied, upgrade modal will be shown
    }

    console.log('Access granted for advanced tool, proceeding with tool selection')
    setSelectedTool(tool)
    setUploadedFiles([])
    setProcessedFiles([])
    setOcrResults(null)
    setToolResults(null)
    setIsProcessing(false)
    setClearFileUpload(true)
    // Clear chat sessions and settings when switching tools
    setChatSessions({})
    setCurrentMessage('')
    setToolSettings({})
    setTimeout(() => setClearFileUpload(false), 100)
    
    // Scroll to upload section after tool selection
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
    setProcessedFiles([])
    
    const validFiles = validateFilesForTool(files, selectedTool)
    if (validFiles.length === 0) {
      return
    }
    
    setUploadedFiles(validFiles)
    setShowUploadModal(false)
    
    // Auto-process if minimum files requirement is met
    if (validFiles.length >= (selectedTool?.minFiles || 1)) {
      await handleAutoProcess(validFiles, toolSettings)
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

    console.log('=== Processing Started ===')
    console.log('Tool:', selectedTool.id)
    console.log('Settings received:', toolSettings)
    
    // Initialize processing modal
    initializeProcessingSteps(selectedTool.id)
    setIsProcessing(true)
    
    try {
      let uploadedFileIds = []
      
      updateProgress(10, 'Uploading files to server...', 0)
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          updateProgress(10 + (i / files.length) * 15, `Uploading ${file.name}...`, 0)
          const response = await api.uploadFile(file)
          uploadedFileIds.push(response.file.id)
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error)
          toast.error(`Failed to upload ${file.name}`)
        }
      }

      if (uploadedFileIds.length === 0) {
        throw new Error('No files were uploaded successfully')
      }
      
      updateProgress(25, `${uploadedFileIds.length} file(s) uploaded successfully`, 1)

      let result
      const outputName = `${selectedTool.id}-${Date.now()}`
      
      updateProgress(30, 'Processing...', 1)
      
      switch (selectedTool.id) {
        case 'advanced-ocr':
          result = await handleAdvancedOCR(uploadedFileIds[0], toolSettings)
          break
        case 'ai-chat':
          result = await handleAIChat(uploadedFileIds[0], files)
          break
        case 'smart-summary':
          result = await handleSmartSummary(uploadedFileIds[0], toolSettings)
          break
        case 'pro-merge':
          updateProgress(50, 'Merging PDFs...', 2)
          result = await api.mergePDFs(uploadedFileIds, `${outputName}.pdf`)
          updateProgress(90, 'Merge complete!', 3)
          break
        case 'precision-split':
          result = await handlePrecisionSplit(uploadedFileIds[0], toolSettings)
          break
        case 'smart-compress':
          result = await handleSmartCompress(uploadedFileIds, toolSettings)
          break
        case 'encrypt-pro':
          result = await handleEncryptPro(uploadedFileIds, toolSettings)
          break
        case 'images-to-pdf':
          result = await handleImagesToPDF(uploadedFileIds, toolSettings)
          break
        default:
          throw new Error('Tool not implemented yet')
      }
      
      updateProgress(95, 'Finalizing...', processingSteps.length - 1)

      setToolResults({
        type: selectedTool.id,
        result: result,
        timestamp: new Date().toISOString(),
        toolName: selectedTool.title
      })

      // Handle file downloads
      if (result.file) {
        try {
          const blob = await api.downloadFile(result.file.id)
          downloadBlob(blob, result.file.filename)
          toast.success('Processing completed! File downloaded.')
        } catch (downloadError) {
          toast.error('File processed but download failed. Please try again.')
        }
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
        } else {
          toast.error('Files processed but downloads failed. Please try again.')
        }
      } else {
        toast.success('Processing completed successfully!')
      }
      
      setUploadedFiles([])
      
    } catch (error) {
      console.error('Processing error:', error)
      updateProgress(0, 'Processing failed', 0)
      
      if (error.message.includes('No token provided') || error.message.includes('Unauthorized')) {
        toast.error('Please sign in to use this feature')
      } else if (error.message.includes('File not found')) {
        toast.error('File upload failed. Please try again.')
      } else if (error.message.includes('Network error') || error.message.includes('timeout')) {
        toast.error('Request timed out. The file may be too large or the server is busy. Please try again.')
      } else if (error.message.includes('404')) {
        toast.error('Service temporarily unavailable. Please try again later.')
      } else {
        toast.error(`Processing failed: ${error.message}`)
      }
    } finally {
      setTimeout(() => setIsProcessing(false), 1000)
    }
  }

  // Individual tool handlers
  const handleAdvancedOCR = async (fileId, settings = {}) => {
    console.log('Starting Advanced OCR processing for file ID:', fileId)
    
    try {
      updateProgress(40, 'Processing with AI-enhanced OCR...', 2)
      
      const result = await api.request('/ai/ocr', {
        method: 'POST',
        body: JSON.stringify({
          fileId: fileId,
          language: settings.ocrLanguage || 'auto',
          enhanceImage: settings.enhanceImage !== false,
          aiEnhanced: settings.enhanceWithAI !== false,
          extractOriginal: settings.extractOriginal || false,
          confidenceThreshold: settings.confidenceThreshold || 0.6
        }),
        timeout: 120000, // 2 minutes for OCR
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      updateProgress(90, 'OCR completed, preparing results...', 3)
      
      // Store the result and show the Enhanced OCR Modal
      setEnhancedOCRResult(result.result)
      setCurrentFileId(fileId)
      setShowEnhancedOCRModal(true)
      
      updateProgress(100, 'Complete!', 4)
      toast.success('Advanced OCR processing completed!')
      
      setUploadedFiles([])
      setTimeout(() => setIsProcessing(false), 500)
      return result
    } catch (ocrError) {
      console.error('Advanced OCR error:', ocrError)
      throw ocrError
    }
  }

  const handleOCRResultUpdate = (updatedResult) => {
    setEnhancedOCRResult(updatedResult)
  }

  const handleAIChat = async (fileId, files) => {
    if (initializingAIChat) {
      console.log('AI Chat initialization already in progress, skipping...')
      return { initialized: false, message: 'Already initializing' }
    }
    
    setInitializingAIChat(true)
    
    try {
      console.log('Starting AI Chat initialization for file ID:', fileId)
      toast.loading('Preparing document for AI chat...', { id: 'ai-chat-init' })
      
      try {
        const result = await api.post('/ai/create-embeddings', { 
          fileId: fileId 
        })
        
        console.log('Embeddings created successfully:', result)
        toast.dismiss('ai-chat-init')
        toast.success('AI Chat initialized! You can now chat with your document.')
        
      } catch (embeddingError) {
        console.log('Embeddings failed, checking if OCR is needed:', embeddingError?.message || String(embeddingError))
        
        const errorMsg = embeddingError?.message || String(embeddingError)
        if (errorMsg.includes('No text content found') || 
            errorMsg.includes('Please run OCR')) {
          
          toast.dismiss('ai-chat-init')
          toast.loading('Extracting text from document (this may take a few minutes)...', { id: 'ai-chat-ocr' })
          
          const ocrResult = await api.request('/ai/ocr', {
            method: 'POST',
            body: JSON.stringify({
              fileId: fileId,
              language: 'eng+tel',
              enhanceImage: true
            }),
            timeout: 180000 // 3 minutes for OCR
          })
          
          console.log('OCR completed for AI chat:', ocrResult)
          toast.dismiss('ai-chat-ocr')
          
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          toast.loading('Creating AI embeddings...', { id: 'ai-chat-embeddings' })
          
          const embeddingResult = await api.post('/ai/create-embeddings', { 
            fileId: fileId 
          })
          
          console.log('Embeddings created after OCR:', embeddingResult)
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
      console.error('AI Chat initialization error:', error)
      toast.dismiss('ai-chat-init')
      toast.dismiss('ai-chat-ocr')
      toast.dismiss('ai-chat-embeddings')
      throw error
    } finally {
      setInitializingAIChat(false)
    }
  }

  const handleSmartSummary = async (fileId, settings = {}) => {
    console.log('Starting smart summary for fileId:', fileId)
    
    updateProgress(30, 'Analyzing document text...', 1)
    updateProgress(50, 'Generating AI summary...', 2)
    
    try {
      const result = await api.smartSummary(fileId, {
        includeKeyPoints: settings.includeKeyPoints !== false,
        includeSentiment: settings.includeSentiment !== false,
        includeEntities: settings.includeEntities !== false,
        analysisDepth: settings.analysisDepth || 'comprehensive',
        summaryLength: settings.summaryLength || 'medium'
      })
      
      updateProgress(70, 'Performing sentiment analysis...', 3)
      updateProgress(85, 'Extracting entities...', 4)
      updateProgress(100, 'Smart summary completed!', 5)
      
      const summaryData = result.result
      
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
      console.error('Smart summary error:', error)
      updateProgress(0, 'Failed to generate summary', 0)
      throw new Error(`Smart summary failed: ${error.message}`)
    }
  }

  const handlePrecisionSplit = async (fileId, settings = {}) => {
    const splitResponse = await fetch(`${API_BASE_URL}/pdf/split`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ 
        fileId: fileId, 
        outputName: `split-${Date.now()}.pdf`,
        splitMethod: settings.splitMethod || 'pages',
        pageRanges: settings.pageRanges || '',
        namingPattern: settings.namingPattern || 'document_part_{n}'
      })
    })
    
    if (!splitResponse.ok) {
      const errorData = await splitResponse.json()
      throw new Error(errorData.error || 'Split failed')
    }
    
    const splitBlob = await splitResponse.blob()
    downloadBlob(splitBlob, `split_${Date.now()}.zip`)
    toast.success('PDF split successfully! Files downloaded as ZIP.')
    
    setUploadedFiles([])
    setIsProcessing(false)
    return { success: true }
  }

  const handleSmartCompress = async (fileIds, settings = {}) => {
    const compressedFiles = []
    const compressionLevel = settings.compressionLevel || 'balanced'
    const qualityMap = { light: 0.9, balanced: 0.75, aggressive: 0.5, maximum: 0.25 }
    const quality = qualityMap[compressionLevel] || 0.75
    
    for (const fileId of fileIds) {
      try {
        const compressed = await api.compressPDF(fileId, quality, `compressed-${fileId}.pdf`)
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

  const handleEncryptPro = async (fileIds, settings = {}) => {
    const encryptedFiles = []
    
    for (const fileId of fileIds) {
      const password = settings.passwordType === 'custom' && settings.customPassword 
        ? settings.customPassword 
        : `SecurePDF_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      
      const response = await fetch(`${API_BASE_URL}/pdf/advanced/password-protect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          fileId: fileId,
          password: password,
          permissions: {
            printing: settings.allowPrinting !== false,
            copying: settings.allowCopying || false,
            editing: settings.allowEditing || false,
            annotating: settings.allowAnnotations || false,
            fillingForms: true,
            extracting: false,
            assembling: false,
            printingHighRes: false
          },
          outputName: `encrypted_${Date.now()}.pdf`,
          encryptionLevel: settings.encryptionLevel || '256-bit'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Encryption failed')
      }

      const result = await response.json()
      encryptedFiles.push(result.file)
      
      if (settings.passwordType !== 'custom') {
        toast.success(`File encrypted! Password: ${password}`, { duration: 10000 })
        try {
          await navigator.clipboard.writeText(password)
          toast.success('Password copied to clipboard!')
        } catch (clipboardError) {
          console.warn('Could not copy to clipboard:', clipboardError)
        }
      }
    }

    toast.success(`${encryptedFiles.length} file(s) encrypted successfully!`)
    return { files: encryptedFiles }
  }

  const handleImagesToPDF = async (fileIds, settings = {}) => {
    updateProgress(30, 'Processing images...', 1)
    
    // Prepare options object with all settings - ensure all values are properly set
    const options = {
      pageSize: settings.pageSize || 'A4',
      orientation: settings.orientation || 'auto',
      margin: typeof settings.margin === 'number' ? settings.margin : 20,
      imageQuality: typeof settings.imageQuality === 'number' ? settings.imageQuality : 0.9,
      fitToPage: settings.fitToPage !== false,
      centerImages: settings.centerImages !== false,
      addPageNumbers: settings.addPageNumbers === true,
      addTimestamp: settings.addTimestamp === true,
      backgroundColor: settings.backgroundColor || '#FFFFFF',
      compression: settings.compression || 'jpeg'
    }
    
    // Add custom size if specified
    if (settings.pageSize === 'Custom' && settings.customWidth && settings.customHeight) {
      options.customSize = {
        width: parseFloat(settings.customWidth),
        height: parseFloat(settings.customHeight)
      }
    }
    
    console.log('Images to PDF - Settings received:', settings)
    console.log('Images to PDF - Options being sent:', options)
    
    const response = await fetch(`${API_BASE_URL}/pdf/advanced/advanced-images-to-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        fileIds: fileIds,
        outputName: `images_to_pdf_${Date.now()}.pdf`,
        options: options
      })
    })

    updateProgress(70, 'Creating PDF...', 2)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Images to PDF conversion failed')
    }

    updateProgress(90, 'Finalizing...', 3)
    const result = await response.json()
    updateProgress(100, 'Complete!', 4)
    
    toast.success(`${fileIds.length} image(s) converted to PDF successfully!`)
    return { file: result.file }
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

  // Check if user has access to advanced tools page
  useEffect(() => {
    if (!subscription) return // Wait for subscription to load
    
    console.log('AdvancedTools: Checking page access, current plan:', subscription.plan)
    
    if (subscription.plan === 'free') {
      console.log('AdvancedTools: Free user detected, checking access')
      
      const hasAccess = checkAccess('advanced-tools', 'Advanced PDF Tools', 'Professional-grade PDF processing with AI-powered tools')
      
      if (!hasAccess) {
        console.log('AdvancedTools: Access denied, upgrade modal should be shown')
      }
    }
  }, [subscription, checkAccess])

  return (
    <div className="min-h-screen bg-page relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-900 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-900 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-900 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-grey-800 text-grey-300 hover:bg-accent hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <ToolsGrid 
            tools={filteredTools}
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
          />

          {/* Tool Processor */}
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
              toolSettings={toolSettings}
              setToolSettings={setToolSettings}
            />
          )}

          {/* Results Display */}
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

          {/* Modals */}
          {showUploadModal && (
            <FileUploadModal
              isOpen={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              onFilesUploaded={handleFilesUploaded}
              acceptedFiles={selectedTool?.acceptedFiles}
              multiple={selectedTool?.multipleFiles}
              clearTrigger={clearFileUpload}
            />
          )}

          {isProcessing && (
            <ProcessingModal
              isOpen={isProcessing}
              title={selectedTool ? `Processing ${selectedTool.title}` : 'Processing'}
              fileName={uploadedFiles.length > 0 ? uploadedFiles[0].name : 'Document'}
              progress={processingProgress}
              stage={processingStage}
              steps={processingSteps}
              currentStep={currentStep}
              icon={selectedTool ? selectedTool.icon : FileText}
            />
          )}

          {showAIAssistant && currentFileForAI && (
            <AIAssistant
              isOpen={showAIAssistant}
              onClose={() => setShowAIAssistant(false)}
              fileId={currentFileForAI.id}
              fileName={currentFileForAI.name}
              isMinimized={aiAssistantMinimized}
              onMinimize={() => setAiAssistantMinimized(!aiAssistantMinimized)}
            />
          )}

          {showUpgradeModal && (
            <UpgradeModal
              isOpen={showUpgradeModal}
              onClose={closeUpgradeModal}
              feature={upgradeModalData?.feature}
              description={upgradeModalData?.description}
            />
          )}

          {showEnhancedOCRModal && enhancedOCRResult && (
            <EnhancedOCRModal
              isOpen={showEnhancedOCRModal}
              onClose={() => setShowEnhancedOCRModal(false)}
              result={enhancedOCRResult}
              fileName={enhancedOCRResult?.filename || 'Document'}
              fileId={currentFileId}
              onResultUpdate={handleOCRResultUpdate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AdvancedTools