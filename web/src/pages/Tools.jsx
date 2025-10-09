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
import toast from 'react-hot-toast'
import { 
  GitMerge, 
  Scissors, 
  Archive, 
  Image, 
  FileText,
  Upload,
  Download,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Layers,
  Rocket,
  Eye,
  MessageSquare,
  Play,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  Copy
} from 'lucide-react'

const Tools = () => {
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
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [ocrResults, setOcrResults] = useState(null)
  const [toolResults, setToolResults] = useState(null)
  const [clearFileUpload, setClearFileUpload] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiAssistantMinimized, setAiAssistantMinimized] = useState(false)
  const [currentFileForAI, setCurrentFileForAI] = useState(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState('Initializing...')
  const [processingSteps, setProcessingSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)

  const tools = [
    {
      id: 'merge',
      icon: GitMerge,
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into one document',
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-500',
      acceptedFiles: '.pdf',
      multipleFiles: true,
      minFiles: 2,
      category: 'Basic',
      popularity: 95,
      processingTime: '< 30s'
    },
    {
      id: 'split',
      icon: Scissors,
      title: 'Split PDF',
      description: 'Extract specific pages or split into multiple files',
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconBg: 'bg-green-500',
      acceptedFiles: '.pdf',
      multipleFiles: false,
      minFiles: 1,
      category: 'Basic',
      popularity: 88,
      processingTime: '< 45s'
    },
    {
      id: 'compress',
      icon: Archive,
      title: 'Compress PDF',
      description: 'Reduce file size while maintaining quality',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-500',
      acceptedFiles: '.pdf',
      multipleFiles: true,
      minFiles: 1,
      category: 'Optimization',
      popularity: 92,
      processingTime: '< 60s'
    },
    {
      id: 'convert',
      icon: Image,
      title: 'Images to PDF',
      description: 'Convert images (JPG, PNG) to PDF format',
      color: 'from-orange-500 to-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      iconBg: 'bg-orange-500',
      acceptedFiles: '.jpg,.jpeg,.png,.gif,.bmp,.webp',
      multipleFiles: true,
      minFiles: 1,
      category: 'Conversion',
      popularity: 85,
      processingTime: '< 90s'
    },
      ]

  const categories = ['All', 'Basic', 'Optimization', 'Conversion']
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Filter tools based on category (show all tools regardless of plan)
  const getAvailableTools = () => {
    // Apply category filter only
    if (selectedCategory === 'All') {
      return tools
    } else {
      return tools.filter(tool => tool.category === selectedCategory)
    }
  }

  const filteredTools = getAvailableTools()

  // Progress tracking helper functions
  const updateProgress = (progress, stage, step = null) => {
    setProcessingProgress(progress)
    setProcessingStage(stage)
    if (step !== null) {
      setCurrentStep(step)
    }
  }

  const initializeProcessingSteps = (toolId) => {
    const stepsByTool = {
      'merge': [
        { name: 'Uploading Files', icon: Upload },
        { name: 'Processing PDFs', icon: FileText },
        { name: 'Merging Documents', icon: GitMerge },
        { name: 'Complete', icon: CheckCircle }
      ],
      'split': [
        { name: 'Uploading File', icon: Upload },
        { name: 'Analyzing Structure', icon: Eye },
        { name: 'Splitting Pages', icon: Scissors },
        { name: 'Complete', icon: CheckCircle }
      ],
      'compress': [
        { name: 'Uploading Files', icon: Upload },
        { name: 'Analyzing Content', icon: Eye },
        { name: 'Compressing PDFs', icon: Archive },
        { name: 'Complete', icon: CheckCircle }
      ],
      'convert': [
        { name: 'Uploading Images', icon: Upload },
        { name: 'Processing Images', icon: Image },
        { name: 'Creating PDF', icon: FileText },
        { name: 'Complete', icon: CheckCircle }
      ],
      'ocr': [
        { name: 'Uploading File', icon: Upload },
        { name: 'Image Enhancement', icon: Sparkles },
        { name: 'Text Extraction', icon: Eye },
        { name: 'Complete', icon: CheckCircle }
      ],
      'ai-chat': [
        { name: 'Uploading File', icon: Upload },
        { name: 'Text Processing', icon: FileText },
        { name: 'AI Initialization', icon: MessageSquare },
        { name: 'Complete', icon: CheckCircle }
      ]
    }

    const steps = stepsByTool[toolId] || [
      { name: 'Uploading', icon: Upload },
      { name: 'Processing', icon: FileText },
      { name: 'Complete', icon: CheckCircle }
    ]

    setProcessingSteps(steps)
    setCurrentStep(0)
    setProcessingProgress(0)
    setProcessingStage('Initializing...')
  }

  const handleToolSelect = (tool) => {

    // Check if user has access to this tool
    const hasToolAccess = checkAccess(tool.id, tool.title, tool.description)

    if (!hasToolAccess) {
      
      return // Access denied, upgrade modal will be shown
    }

    setSelectedTool(tool)
    setUploadedFiles([])
    setProcessedFiles([])
    setOcrResults(null)
    setToolResults(null)
    setIsProcessing(false)
    setClearFileUpload(true)
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
    // Clear previous results when new files are uploaded
    setOcrResults(null)
    setToolResults(null)
    setProcessedFiles([])
    
    // Validate files for selected tool
    const validFiles = validateFilesForTool(files, selectedTool)
    if (validFiles.length === 0) {
      return
    }
    
    setUploadedFiles(validFiles)
    
    // Auto-process if we have enough files
    if (validFiles.length >= (selectedTool?.minFiles || 1)) {
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

  const handleAutoProcess = async (files) => {
    if (!selectedTool || files.length === 0) return

    // Free tools don't require authentication
    // Only check usage limits if user is authenticated
    if (user && session && usage && usage.current >= usage.limit && subscription?.plan === 'free') {
      toast.error('You have reached your monthly processing limit. Please upgrade to continue.')
      return
    }

    setIsProcessing(true)
    
    // Initialize progress tracking
    initializeProcessingSteps(selectedTool.id)
    updateProgress(5, 'Preparing files for processing...', 0)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      let uploadedFileIds = []
      
      // Upload files with detailed progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileNum = i + 1
        const totalFiles = files.length
        
        try {
          // Calculate progress: 5% to 30% for uploads
          const uploadProgress = 5 + ((fileNum - 1) / totalFiles) * 25
          updateProgress(uploadProgress, `Uploading file ${fileNum}/${totalFiles}: ${file.name}...`, 0)

          const response = await api.uploadFile(file)
          
          uploadedFileIds.push(response.file.id)
          
          // Show completion for this file
          const completedProgress = 5 + (fileNum / totalFiles) * 25
          updateProgress(completedProgress, `Uploaded ${fileNum}/${totalFiles} files`, 0)
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error) {
          console.error('Upload error for', file.name, ':', error)
          toast.error(`Failed to upload ${file.name}: ${error.message}`)
        }
      }

      if (uploadedFileIds.length === 0) {
        toast.error('No files were uploaded successfully. Please check your connection and try again.')
        return
      }

      updateProgress(35, `All ${uploadedFileIds.length} file(s) uploaded successfully`, 1)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Process based on tool type with detailed progress
      let result
      const outputName = `${selectedTool.id}-${Date.now()}`
      
      updateProgress(40, 'Initializing processing...', 1)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      switch (selectedTool.id) {
        case 'merge':
          if (uploadedFileIds.length < 2) {
            toast.error('Need at least 2 PDF files to merge')
            return
          }
          updateProgress(50, 'Analyzing PDF structures...', 2)
          await new Promise(resolve => setTimeout(resolve, 500))
          updateProgress(65, 'Merging PDFs...', 2)
          result = await api.mergePDFs(uploadedFileIds, `${outputName}.pdf`)
          updateProgress(85, 'Merge complete!', 2)
          break
          
        case 'split':
          updateProgress(50, 'Analyzing PDF structure...', 2)
          await new Promise(resolve => setTimeout(resolve, 500))
          updateProgress(65, 'Splitting pages...', 2)
          
          // Split returns a ZIP stream directly
          const splitResponse = await fetch(`${API_BASE_URL}/pdf/split`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ 
              fileId: uploadedFileIds[0], 
              outputName: `${outputName}.pdf` 
            })
          })
          
          if (!splitResponse.ok) {
            const errorData = await splitResponse.json()
            throw new Error(errorData.error || 'Split failed')
          }
          
          updateProgress(85, 'Preparing download...', 3)
          const splitBlob = await splitResponse.blob()
          updateProgress(100, 'Complete!', 3)
          downloadBlob(splitBlob, `${outputName}_split.zip`)
          toast.success('PDF split successfully! Files downloaded as ZIP.')
          
          setUploadedFiles([])
          setIsProcessing(false)
          return
          
        case 'compress':
          updateProgress(50, 'Analyzing file content...', 2)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // For multiple files, compress each one
          const compressedFiles = []
          const totalToCompress = uploadedFileIds.length
          
          for (let i = 0; i < uploadedFileIds.length; i++) {
            const fileId = uploadedFileIds[i]
            try {
              const compressProgress = 50 + ((i + 1) / totalToCompress) * 35
              updateProgress(compressProgress, `Compressing file ${i + 1}/${totalToCompress}...`, 2)
              
              const compressed = await api.compressPDF(fileId, 0.5, `compressed-${fileId}.pdf`)
              compressedFiles.push(compressed.file)
            } catch (error) {
              console.error('Compression error:', error)
              if (error.message.includes('already optimized')) {
                toast.error(`File ${i + 1} is already optimized`)
              } else {
                toast.error(`Compression failed for file ${i + 1}: ${error.message}`)
              }
            }
          }
          
          if (compressedFiles.length === 0) {
            toast.error('No files could be compressed - all files are already optimized')
            setUploadedFiles([])
            setIsProcessing(false)
            return
          }
          
          updateProgress(85, 'Compression complete!', 2)
          result = { files: compressedFiles }
          break
          
        case 'convert':
          // Validate that all files are images
          const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
          const hasNonImages = files.some(file => !imageTypes.includes(file.type))
          
          if (hasNonImages) {
            const nonImageFiles = files.filter(file => !imageTypes.includes(file.type))
            toast.error(`Only image files allowed. Remove: ${nonImageFiles.map(f => f.name).join(', ')}`)
            return
          }
          
          updateProgress(50, 'Processing images...', 2)
          await new Promise(resolve => setTimeout(resolve, 500))
          updateProgress(70, 'Creating PDF...', 2)
          result = await api.convertImagesToPDF(uploadedFileIds, `${outputName}.pdf`)
          updateProgress(85, 'Conversion complete!', 2)
          break
          
        case 'ocr':
          // Perform OCR on the uploaded file
          
          toast.loading('Processing OCR with multi-language support...', { id: 'ocr-processing' })
          
          try {
            result = await api.post('/ai/ocr', {
              fileId: uploadedFileIds[0],
              language: 'eng+tel', // Default to English + Telugu for better ID card recognition
              enhanceImage: true
            })
            
            toast.dismiss('ocr-processing')
            toast.success('OCR processing completed! Text extracted successfully.')
            
            // Store OCR results for display
            setOcrResults({
              text: result.result.text,
              confidence: result.result.confidence,
              filename: result.fileInfo.filename,
              pageCount: result.result.pageCount,
              detectedLanguage: result.result.detectedLanguage
            })
          } catch (ocrError) {
            console.error('OCR specific error:', ocrError)
            toast.dismiss('ocr-processing')
            throw ocrError
          }
          
          setUploadedFiles([])
          setIsProcessing(false)
          return
          
        case 'ai-chat':
          // Initialize AI chat for the uploaded PDF
          
          toast.loading('Preparing document for AI chat...', { id: 'ai-chat-init' })
          
          try {
            // First, try to create embeddings directly
            result = await api.post('/ai/create-embeddings', { 
              fileId: uploadedFileIds[0] 
            })
            
            toast.dismiss('ai-chat-init')
            toast.success('AI Chat initialized! You can now chat with your document.')
          } catch (embeddingError) {

            // If embeddings fail due to no text content, run OCR first
            if (embeddingError.message.includes('No text content found') || 
                embeddingError.message.includes('Please run OCR')) {
              
              toast.dismiss('ai-chat-init')
              toast.loading('Extracting text from document...', { id: 'ai-chat-ocr' })
              
              try {
                // Run OCR first
                const ocrResult = await api.post('/ai/ocr', {
                  fileId: uploadedFileIds[0],
                  language: 'eng+tel',
                  enhanceImage: true
                })

                toast.dismiss('ai-chat-ocr')
                toast.loading('Creating AI embeddings...', { id: 'ai-chat-embeddings' })
                
                // Now try to create embeddings again
                result = await api.post('/ai/create-embeddings', { 
                  fileId: uploadedFileIds[0] 
                })
                
                toast.dismiss('ai-chat-embeddings')
                toast.success('AI Chat initialized! Text extracted and processed successfully.')
                
              } catch (ocrError) {
                console.error('OCR failed for AI chat:', ocrError)
                toast.dismiss('ai-chat-ocr')
                toast.dismiss('ai-chat-embeddings')
                throw new Error(`Failed to extract text from document: ${ocrError.message}`)
              }
            } else {
              // Different error, re-throw
              toast.dismiss('ai-chat-init')
              throw embeddingError
            }
          }
          
          // Set up AI Assistant
          setCurrentFileForAI({
            id: uploadedFileIds[0],
            name: files[0].name
          })
          setShowAIAssistant(true)
          setAiAssistantMinimized(false)
          
          setUploadedFiles([])
          setIsProcessing(false)
          return
          
        default:
          throw new Error('Unknown tool type')
      }

      // Store results for display
      setToolResults({
        type: selectedTool.id,
        result: result,
        timestamp: new Date().toISOString(),
        toolName: selectedTool.title
      })

      // Handle download with progress
      updateProgress(90, 'Preparing download...', processingSteps.length - 1)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (result.file) {
        // Single file result
        try {
          updateProgress(95, 'Downloading result...', processingSteps.length - 1)
          const blob = await api.downloadFile(result.file.id)
          downloadBlob(blob, result.file.filename)
          updateProgress(100, 'Complete!', processingSteps.length - 1)
          toast.success('Processing completed! File downloaded.')
        } catch (downloadError) {
          console.error('Download error:', downloadError)
          toast.error('File processed but download failed. Please try again.')
        }
      } else if (result.files && result.files.length > 0) {
        // Multiple files result
        let downloadCount = 0
        const totalFiles = result.files.length
        
        for (let i = 0; i < result.files.length; i++) {
          const file = result.files[i]
          try {
            const downloadProgress = 90 + ((i + 1) / totalFiles) * 10
            updateProgress(downloadProgress, `Downloading file ${i + 1}/${totalFiles}...`, processingSteps.length - 1)
            
            const blob = await api.downloadFile(file.id)
            downloadBlob(blob, file.filename)
            downloadCount++
            await new Promise(resolve => setTimeout(resolve, 200))
          } catch (downloadError) {
            console.error('Download error for file:', file.filename, downloadError)
          }
        }
        
        updateProgress(100, 'Complete!', processingSteps.length - 1)
        
        if (downloadCount > 0) {
          toast.success(`Processing completed! ${downloadCount} file(s) downloaded.`)
        } else {
          toast.error('Files processed but downloads failed. Please try again.')
        }
      } else if (result instanceof Blob) {
        // Handle blob response (like split which returns a zip)
        updateProgress(95, 'Downloading result...', processingSteps.length - 1)
        const filename = `${selectedTool.id}-result-${Date.now()}.zip`
        downloadBlob(result, filename)
        updateProgress(100, 'Complete!', processingSteps.length - 1)
        toast.success('Processing completed! Files downloaded.')
      } else if (result && typeof result === 'object' && result.downloadUrl) {
        // Handle direct download URL
        updateProgress(95, 'Downloading result...', processingSteps.length - 1)
        const link = document.createElement('a')
        link.href = result.downloadUrl
        link.download = result.filename || `${selectedTool.id}-result.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        updateProgress(100, 'Complete!', processingSteps.length - 1)
        toast.success('Processing completed! Files downloaded.')
      } else {
        // No downloadable result
        updateProgress(100, 'Complete!', processingSteps.length - 1)
        toast.success('Processing completed successfully!')
      }
      
      // Clear uploaded files after successful processing
      setUploadedFiles([])
      
    } catch (error) {
      console.error('Processing error:', error)
      
      // Enhanced error messages
      const errorMsg = error?.message || String(error)
      
      if (errorMsg.includes('File too large') || errorMsg.includes('File size exceeds')) {
        toast.error(errorMsg, { duration: 6000 })
      } else if (errorMsg.includes('No token provided') || errorMsg.includes('Unauthorized')) {
        toast.error('Authentication required. Please sign in to use this feature.')
      } else if (errorMsg.includes('File not found')) {
        toast.error('File upload failed. Please check your connection and try again.')
      } else if (errorMsg.includes('Invalid file type')) {
        toast.error('Invalid file type. Please upload supported file formats only.')
      } else if (errorMsg.includes('Network error') || errorMsg.includes('timeout') || errorMsg.includes('Upload timeout')) {
        toast.error('Upload timeout. The file may be too large or your connection is slow. Please try with a smaller file or check your internet connection.', { duration: 6000 })
      } else if (errorMsg.includes('404')) {
        toast.error('Service temporarily unavailable. Please try again later.')
      } else if (errorMsg.includes('Too many requests')) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.')
      } else {
        toast.error(`Processing failed: ${errorMsg}`, { duration: 5000 })
      }
    } finally {
      setTimeout(() => setIsProcessing(false), 1500)
    }
  }

  const handleProcess = async () => {
    await handleAutoProcess(uploadedFiles)
  }

  const canProcess = uploadedFiles.length >= (selectedTool?.minFiles || 1)
  const usageExceeded = usage && usage.current >= usage.limit && subscription?.plan === 'free'

  return (
    <div className="min-h-screen bg-page relative overflow-hidden">
      {/* Modern Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-900 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-900 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10">

        {/* Usage Warning */}
        {usageExceeded && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="bg-red-900 border border-red-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-red-300 mb-1 text-sm sm:text-base">Usage Limit Reached</h3>
                <p className="text-red-400 text-xs sm:text-sm">You've reached your monthly processing limit. Upgrade to continue processing files.</p>
              </div>
              <Button className="w-full sm:w-auto bg-red-700 hover:bg-red-600 text-white text-sm sm:text-base">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="max-w-7xl mx-auto mobile-container py-6 sm:py-8">
        <div className="mobile-overflow-x pb-2 mb-6 sm:mb-8 lg:mb-12">
        <div className="flex justify-center gap-2 sm:gap-3 min-w-max px-2">
        {categories.map((category) => (
        <button
        key={category}
        onClick={() => setSelectedCategory(category)}
        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium transition-all duration-300 whitespace-nowrap text-xs sm:text-sm mobile-touch-target ${
        selectedCategory === category
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
        : 'bg-grey-800 text-grey-300 hover:bg-accent hover:text-foreground'
        }`}
        >
        {category}
        </button>
        ))}
        </div>
        </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleToolSelect(tool)}
                className={`group relative bg-grey-900 rounded-2xl sm:rounded-3xl border-2 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl mobile-touch-target ${
                  selectedTool?.id === tool.id
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                    : 'border-grey-800 hover:border-border'
                }`}
              >
                {/* Popularity Badge */}
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full flex items-center">
                  <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                  {tool.popularity}%
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${tool.iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground flex-1">{tool.title}</h3>
                      <span className="text-xs bg-elevated text-muted-foreground px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{tool.description}</p>
                    
                    {/* Features */}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="truncate">{tool.processingTime}</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>Secure</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={`w-full bg-gradient-to-r ${tool.color} text-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm h-9 sm:h-10 mobile-touch-target`}
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Select Tool
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Tool Processing Area */}
          {selectedTool && (
            <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedTool.iconBg} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <selectedTool.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">{selectedTool.title}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{selectedTool.description}</p>
                </div>
              </div>

              {/* File Upload Button */}
              <div id="upload-section" className="bg-elevated rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
                <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-3 sm:mb-4">
                  {selectedTool.multipleFiles ? 'Upload Files' : 'Upload File'}
                </h3>
                
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className={`bg-gradient-to-r ${selectedTool.color} text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold hover:shadow-lg transition-all duration-300 mobile-touch-target w-full sm:w-auto`}
                >
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {selectedTool.multipleFiles ? 'Select Files' : 'Select File'}
                </Button>

                <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                  Supports: {selectedTool.acceptedFiles.replace(/\./g, '').toUpperCase()}
                  {selectedTool.multipleFiles && ` • Up to 10 files`}
                </p>

                {/* Uploaded Files Display */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-card-foreground">
                      Selected Files ({uploadedFiles.length})
                    </h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-accent rounded-lg mobile-touch-target">
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-card-foreground truncate">{file.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tool-specific info */}
                {selectedTool.minFiles > 1 && uploadedFiles.length > 0 && uploadedFiles.length < selectedTool.minFiles && (
                  <div className="mt-4 p-3 sm:p-4 bg-blue-900 border border-blue-800 rounded-xl flex items-start sm:items-center">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-xs sm:text-sm text-blue-300">
                      You need at least {selectedTool.minFiles} files to use this tool. 
                      Upload {selectedTool.minFiles - uploadedFiles.length} more file(s).
                    </p>
                  </div>
                )}
              </div>

              {/* Process Button */}
              {uploadedFiles.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-elevated rounded-xl sm:rounded-2xl gap-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-1">Ready to Process</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {uploadedFiles.length} file(s) ready for {selectedTool.title.toLowerCase()}
                    </p>
                  </div>
                  <Button
                    onClick={handleProcess}
                    disabled={!canProcess || usageExceeded || isProcessing}
                    className={`bg-gradient-to-r ${selectedTool.color} text-white px-6 sm:px-8 py-2.5 sm:py-3 hover:shadow-lg transition-all duration-300 w-full sm:w-auto mobile-touch-target text-sm sm:text-base`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Process Files
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* OCR Results Display - Mobile First */}
          {ocrResults && (
            <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400 mr-2 sm:mr-3" />
                  <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">OCR Results</h3>
                </div>
                <div className="flex items-center gap-2 sm:space-x-3">
                  <div className="bg-green-600 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                    {Math.round((ocrResults.confidence || 0) * 100)}%
                  </div>
                  <span className="text-xs sm:text-sm bg-elevated text-muted-foreground px-2 sm:px-3 py-1 rounded-full truncate">
                    {ocrResults.detectedLanguage || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {/* File Info - Mobile First */}
                <div className="bg-elevated rounded-xl p-3 sm:p-4">
                  <h4 className="font-medium text-card-foreground mb-2 flex items-center text-sm sm:text-base">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{ocrResults.filename}</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <span>{ocrResults.pageCount || 1} page(s)</span>
                    <span className="truncate">Lang: {ocrResults.detectedLanguage || 'Auto'}</span>
                    <span>{Math.round((ocrResults.confidence || 0) * 100)}%</span>
                  </div>
                </div>

                {/* Extracted Text - Mobile First */}
                <div className="bg-elevated rounded-xl p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                    <h4 className="font-medium text-card-foreground text-sm sm:text-base">Extracted Text</h4>
                    <Button
                      onClick={() => navigator.clipboard.writeText(ocrResults.text)}
                      size="sm"
                      variant="outline"
                      className="border-border text-card-foreground hover:bg-accent w-full sm:w-auto mobile-touch-target"
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-accent rounded-lg p-3 sm:p-4 max-h-64 sm:max-h-96 overflow-y-auto">
                    <pre className="text-card-foreground text-xs sm:text-sm whitespace-pre-wrap font-mono leading-relaxed">
                      {ocrResults.text || 'No text extracted'}
                    </pre>
                  </div>
                  <div className="mt-2 sm:mt-3 text-xs text-secondary">
                    {ocrResults.text ? `${ocrResults.text.length} characters extracted` : 'No text found'}
                  </div>
                </div>

                {/* Actions - Mobile First */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-elevated rounded-xl gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-card-foreground mb-1 text-sm sm:text-base">Text Extracted Successfully!</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      You can now copy the text or use it for further processing.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
                    <Button
                      onClick={() => {
                        const blob = new Blob([ocrResults.text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${ocrResults.filename.replace(/\.[^/.]+$/, '')}_extracted_text.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        toast.success('Text file downloaded!');
                      }}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto mobile-touch-target text-sm"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => setOcrResults(null)}
                      variant="outline"
                      className="border-border text-card-foreground hover:bg-accent w-full sm:w-auto mobile-touch-target text-sm"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Chat Results Display - Mobile First */}
          {toolResults && toolResults.type === 'ai-chat' && (
            <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-pink-400 mr-2 sm:mr-3" />
                  <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">AI Chat Initialized</h3>
                </div>
                <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto">
                  Ready
                </div>
              </div>
              
              <div className="bg-elevated rounded-xl p-4 sm:p-6 text-center">
                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-pink-400 mx-auto mb-3 sm:mb-4" />
                <h4 className="text-base sm:text-lg font-semibold text-card-foreground mb-2">
                  AI Chat is Ready!
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 px-2">
                  Your document has been processed and is ready for AI-powered conversations.
                  You can now ask questions about the content.
                </p>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white w-full sm:w-auto mobile-touch-target">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Start Chatting
                </Button>
              </div>
            </div>
          )}

          {/* Tool Results Display - Mobile First */}
          {toolResults && !['ocr', 'ai-chat'].includes(toolResults.type) && (
            <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2 sm:mr-3" />
                  <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">Processing Complete</h3>
                </div>
                <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto">
                  Success
                </div>
              </div>
              
              <div className="bg-elevated rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-base sm:text-lg font-semibold text-card-foreground mb-1">
                      {toolResults.toolName} Completed
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Your files have been processed successfully and downloaded.
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(toolResults.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

                  </div>
      </div>

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
        toolIcon={selectedTool?.icon || Upload}
      />

      {/* Processing Modal */}
      <ProcessingModal 
        isOpen={isProcessing}
        title={selectedTool ? `${selectedTool.title}` : 'Processing'}
        fileName={uploadedFiles.map(f => f.name).join(', ')}
        progress={processingProgress}
        stage={processingStage}
        icon={selectedTool ? selectedTool.icon : FileText}
        description={selectedTool ? selectedTool.description : 'Processing your files with advanced options'}
        steps={processingSteps}
        currentStep={currentStep}
        estimatedTime={selectedTool ? parseInt(selectedTool.processingTime.replace(/[^\d]/g, '')) : 60}
      />

        {/* Hero Section - Mobile First */}
        <div className="bg-gradient-to-br from-grey-900 via-grey-800 to-grey-900 border-b border-border">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-900 text-blue-300 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Professional PDF Tools
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 px-2">
                Transform Your PDFs
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-1 sm:mt-2">
                  Like Magic
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
                Choose from our powerful suite of PDF tools to merge, split, compress, and convert your documents with professional-grade quality.
              </p>
              
              {/* Stats - Mobile Optimized */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto px-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400 mb-1 sm:mb-2">1M+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Files Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 mb-1 sm:mb-2">99.9%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-400 mb-1 sm:mb-2">50K+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Happy Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

export default Tools