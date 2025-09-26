import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { api } from '../lib/api'
import { downloadBlob } from '../lib/utils'
import { Button } from '../components/ui/button'
import FileUploadModal from '../components/FileUploadModal'
import ProcessingModal from '../components/ProcessingModal'
import AIAssistant from '../components/AIAssistant'
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
    {
      id: 'ocr',
      icon: Eye,
      title: 'OCR Text Extract',
      description: 'Extract text from scanned PDFs and images',
      color: 'from-cyan-500 to-cyan-700',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-700',
      iconBg: 'bg-cyan-500',
      acceptedFiles: '.pdf,.jpg,.jpeg,.png',
      multipleFiles: false,
      minFiles: 1,
      category: 'AI-Powered',
      popularity: 78,
      processingTime: '< 120s'
    },
    {
      id: 'ai-chat',
      icon: MessageSquare,
      title: 'AI Chat',
      description: 'Chat with your PDF documents using AI',
      color: 'from-pink-500 to-pink-700',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700',
      iconBg: 'bg-pink-500',
      acceptedFiles: '.pdf',
      multipleFiles: false,
      minFiles: 1,
      category: 'AI-Powered',
      popularity: 82,
      processingTime: '< 180s'
    }
  ]

  const categories = ['All', 'Basic', 'Optimization', 'Conversion', 'AI-Powered']
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Filter tools based on user's plan
  const getAvailableTools = () => {
    let availableTools = tools
    
    // If user is on free plan, remove OCR and AI Chat tools
    if (subscription?.plan === 'free' || !subscription?.plan) {
      availableTools = tools.filter(tool => !['ocr', 'ai-chat'].includes(tool.id))
    }
    
    // Apply category filter
    if (selectedCategory === 'All') {
      return availableTools
    } else {
      return availableTools.filter(tool => tool.category === selectedCategory)
    }
  }

  const filteredTools = getAvailableTools()

  const handleToolSelect = (tool) => {
    setSelectedTool(tool)
    setUploadedFiles([])
    setProcessedFiles([])
    setOcrResults(null)
    setToolResults(null)
    setIsProcessing(false)
    setClearFileUpload(true)
    setTimeout(() => setClearFileUpload(false), 100)
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

    // Check plan limits before processing
    if (usage && usage.current >= usage.limit && subscription?.plan === 'free') {
      toast.error('You have reached your monthly processing limit. Please upgrade to continue.')
      return
    }

    setIsProcessing(true)
    
    try {
      let uploadedFileIds = []
      
      // First upload files to server
      toast.success(`Uploading ${files.length} file(s)...`)
      
      for (const file of files) {
        try {
          console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)
          const response = await api.uploadFile(file)
          console.log('Upload response:', response)
          uploadedFileIds.push(response.file.id)
          toast.success(`✅ ${file.name} uploaded successfully`)
        } catch (error) {
          console.error('Upload error for', file.name, ':', error)
          toast.error(`❌ Failed to upload ${file.name}: ${error.message}`)
        }
      }

      if (uploadedFileIds.length === 0) {
        toast.error('No files were uploaded successfully. Please check your connection and try again.')
        return
      }
      
      console.log('Successfully uploaded file IDs:', uploadedFileIds)

      // Process based on tool type
      let result
      const outputName = `${selectedTool.id}-${Date.now()}`
      
      switch (selectedTool.id) {
        case 'merge':
          if (uploadedFileIds.length < 2) {
            toast.error('Need at least 2 PDF files to merge')
            return
          }
          result = await api.mergePDFs(uploadedFileIds, `${outputName}.pdf`)
          break
          
        case 'split':
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
          
          const splitBlob = await splitResponse.blob()
          downloadBlob(splitBlob, `${outputName}_split.zip`)
          toast.success('PDF split successfully! Files downloaded as ZIP.')
          
          setUploadedFiles([])
          setIsProcessing(false)
          return
          
        case 'compress':
          // For multiple files, compress each one
          const compressedFiles = []
          for (const fileId of uploadedFileIds) {
            try {
              const compressed = await api.compressPDF(fileId, 0.5, `compressed-${fileId}.pdf`)
              compressedFiles.push(compressed.file)
            } catch (error) {
              console.error('Compression error:', error)
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
            return
          }
          
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
          
          result = await api.convertImagesToPDF(uploadedFileIds, `${outputName}.pdf`)
          break
          
        case 'ocr':
          // Perform OCR on the uploaded file
          console.log('Starting OCR processing for file ID:', uploadedFileIds[0])
          toast.loading('Processing OCR with multi-language support...', { id: 'ocr-processing' })
          
          try {
            result = await api.post('/ai/ocr', {
              fileId: uploadedFileIds[0],
              language: 'eng+tel', // Default to English + Telugu for better ID card recognition
              enhanceImage: true
            })
            console.log('OCR result:', result)
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
          console.log('Starting AI Chat initialization for file ID:', uploadedFileIds[0])
          toast.loading('Preparing document for AI chat...', { id: 'ai-chat-init' })
          
          try {
            // First, try to create embeddings directly
            result = await api.post('/ai/create-embeddings', { 
              fileId: uploadedFileIds[0] 
            })
            
            toast.dismiss('ai-chat-init')
            toast.success('AI Chat initialized! You can now chat with your document.')
          } catch (embeddingError) {
            console.log('Embeddings failed, checking if OCR is needed:', embeddingError.message)
            
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
                
                console.log('OCR completed for AI chat:', ocrResult)
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

      // Handle download
      if (result.file) {
        // Single file result
        try {
          const blob = await api.downloadFile(result.file.id)
          downloadBlob(blob, result.file.filename)
          toast.success('Processing completed! File downloaded.')
        } catch (downloadError) {
          console.error('Download error:', downloadError)
          toast.error('File processed but download failed. Please try again.')
        }
      } else if (result.files && result.files.length > 0) {
        // Multiple files result
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
      } else if (result instanceof Blob) {
        // Handle blob response (like split which returns a zip)
        const filename = `${selectedTool.id}-result-${Date.now()}.zip`
        downloadBlob(result, filename)
        toast.success('Processing completed! Files downloaded.')
      } else if (result && typeof result === 'object' && result.downloadUrl) {
        // Handle direct download URL
        const link = document.createElement('a')
        link.href = result.downloadUrl
        link.download = result.filename || `${selectedTool.id}-result.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Processing completed! Files downloaded.')
      } else {
        // No downloadable result
        toast.success('Processing completed successfully!')
      }
      
      // Clear uploaded files after successful processing
      setUploadedFiles([])
      
    } catch (error) {
      console.error('Processing error:', error)
      
      // Provide specific error messages
      if (error.message.includes('No token provided') || error.message.includes('Unauthorized')) {
        toast.error('Please sign in to use this feature')
      } else if (error.message.includes('File not found')) {
        toast.error('File upload failed. Please try again.')
      } else if (error.message.includes('Network error')) {
        toast.error('Network error. Please check your connection and try again.')
      } else if (error.message.includes('404')) {
        toast.error('Service temporarily unavailable. Please try again later.')
      } else {
        toast.error(`Processing failed: ${error.message}`)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProcess = async () => {
    await handleAutoProcess(uploadedFiles)
  }

  const canProcess = uploadedFiles.length >= (selectedTool?.minFiles || 1)
  const usageExceeded = usage && usage.current >= usage.limit && subscription?.plan === 'free'

  return (
    <div className="min-h-screen bg-grey-950 relative overflow-hidden">
      {/* Modern Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-900 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-900 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-grey-900 via-grey-800 to-grey-900 border-b border-grey-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-900 text-blue-300 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                Professional PDF Tools
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-grey-100 mb-6">
                Transform Your PDFs
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Like Magic
                </span>
              </h1>
              <p className="text-xl text-grey-400 max-w-3xl mx-auto mb-8">
                Choose from our powerful suite of PDF tools to merge, split, compress, and convert your documents with professional-grade quality.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">1M+</div>
                  <div className="text-grey-400">Files Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
                  <div className="text-grey-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">50K+</div>
                  <div className="text-grey-400">Happy Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Warning */}
        {usageExceeded && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-900 border border-red-800 rounded-2xl p-6 flex items-center">
              <AlertCircle className="h-6 w-6 text-red-400 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-300 mb-1">Usage Limit Reached</h3>
                <p className="text-red-400">You've reached your monthly processing limit. Upgrade to continue processing files.</p>
              </div>
              <Button className="ml-auto bg-red-700 hover:bg-red-600 text-white">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-grey-800 text-grey-300 hover:bg-grey-700 hover:text-grey-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleToolSelect(tool)}
                className={`group relative bg-grey-900 rounded-3xl border-2 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl ${
                  selectedTool?.id === tool.id
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                    : 'border-grey-800 hover:border-grey-700'
                }`}
              >
                {/* Popularity Badge */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {tool.popularity}%
                </div>

                <div className="p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 ${tool.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-grey-100">{tool.title}</h3>
                      <span className="text-xs bg-grey-800 text-grey-400 px-2 py-1 rounded-full">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-grey-400 mb-4">{tool.description}</p>
                    
                    {/* Features */}
                    <div className="flex items-center justify-between text-sm text-grey-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {tool.processingTime}
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        Secure
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={`w-full bg-gradient-to-r ${tool.color} text-white hover:shadow-lg transition-all duration-300`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Select Tool
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Premium Tools Section for Free Users */}
          {(subscription?.plan === 'free' || !subscription?.plan) && (
            <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 rounded-3xl border border-purple-800 p-8 mb-16">
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-purple-800 text-purple-300 rounded-full text-sm font-medium mb-4">
                  <Star className="h-4 w-4 mr-2" />
                  Premium Features
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Unlock Advanced AI Tools
                </h2>
                <p className="text-purple-200 max-w-2xl mx-auto">
                  Upgrade to Pro or Premium to access powerful AI-driven features like OCR text extraction and AI document chat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {tools.filter(tool => ['ocr', 'ai-chat'].includes(tool.id)).map((tool) => (
                  <div
                    key={tool.id}
                    className="relative bg-grey-900/50 rounded-2xl border border-purple-700/50 p-6 opacity-75"
                  >
                    {/* Premium Lock Badge */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      PRO
                    </div>

                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 ${tool.iconBg} rounded-xl flex items-center justify-center mr-4 opacity-75`}>
                        <tool.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{tool.title}</h3>
                        <p className="text-purple-300 text-sm">{tool.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-purple-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {tool.processingTime}
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {tool.popularity}% Popular
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 text-lg font-semibold hover:shadow-2xl transition-all duration-300">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Upgrade to Pro - $1/month
                </Button>
                <p className="text-purple-300 text-sm mt-3">
                  ✨ Unlimited processing • 🤖 AI features • 📊 Advanced analytics
                </p>
              </div>
            </div>
          )}

          {/* Selected Tool Processing Area */}
          {selectedTool && (
            <div className="bg-grey-900 rounded-3xl border border-grey-800 p-8 mb-8">
              <div className="flex items-center mb-8">
                <div className={`w-12 h-12 ${selectedTool.iconBg} rounded-xl flex items-center justify-center mr-4`}>
                  <selectedTool.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-grey-100">{selectedTool.title}</h2>
                  <p className="text-grey-400">{selectedTool.description}</p>
                </div>
              </div>

              {/* File Upload Button */}
              <div className="bg-grey-800 rounded-2xl p-6 mb-6 text-center">
                <h3 className="text-lg font-semibold text-grey-200 mb-4">
                  {selectedTool.multipleFiles ? 'Upload Files' : 'Upload File'}
                </h3>
                
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className={`bg-gradient-to-r ${selectedTool.color} text-white px-8 py-4 text-lg font-semibold hover:shadow-lg transition-all duration-300`}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {selectedTool.multipleFiles ? 'Select Files' : 'Select File'}
                </Button>

                <p className="text-sm text-grey-400 mt-3">
                  Supports: {selectedTool.acceptedFiles.replace(/\./g, '').toUpperCase()}
                  {selectedTool.multipleFiles && ` • Up to 10 files`}
                </p>

                {/* Uploaded Files Display */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-medium text-grey-300">
                      Selected Files ({uploadedFiles.length})
                    </h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-grey-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-grey-400" />
                            <span className="text-sm text-grey-200 truncate">{file.name}</span>
                          </div>
                          <span className="text-xs text-grey-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tool-specific info */}
                {selectedTool.minFiles > 1 && uploadedFiles.length > 0 && uploadedFiles.length < selectedTool.minFiles && (
                  <div className="mt-4 p-4 bg-blue-900 border border-blue-800 rounded-xl flex items-center">
                    <Info className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                    <p className="text-blue-300">
                      You need at least {selectedTool.minFiles} files to use this tool. 
                      Upload {selectedTool.minFiles - uploadedFiles.length} more file(s).
                    </p>
                  </div>
                )}
              </div>

              {/* Process Button */}
              {uploadedFiles.length > 0 && (
                <div className="flex items-center justify-between p-6 bg-grey-800 rounded-2xl">
                  <div>
                    <h3 className="text-lg font-semibold text-grey-200 mb-1">Ready to Process</h3>
                    <p className="text-grey-400">
                      {uploadedFiles.length} file(s) ready for {selectedTool.title.toLowerCase()}
                    </p>
                  </div>
                  <Button
                    onClick={handleProcess}
                    disabled={!canProcess || usageExceeded || isProcessing}
                    className={`bg-gradient-to-r ${selectedTool.color} text-white px-8 py-3 hover:shadow-lg transition-all duration-300`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Process Files
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* OCR Results Display */}
          {ocrResults && (
            <div className="bg-grey-900 rounded-3xl border border-grey-800 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Eye className="h-6 w-6 text-cyan-400 mr-3" />
                  <h3 className="text-xl font-semibold text-grey-200">OCR Results</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {Math.round((ocrResults.confidence || 0) * 100)}% confidence
                  </div>
                  <span className="text-sm bg-grey-800 text-grey-400 px-3 py-1 rounded-full">
                    {ocrResults.detectedLanguage || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* File Info */}
                <div className="bg-grey-800 rounded-xl p-4">
                  <h4 className="font-medium text-grey-200 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {ocrResults.filename}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-grey-400">
                    <span>{ocrResults.pageCount || 1} page(s)</span>
                    <span>Language: {ocrResults.detectedLanguage || 'Auto-detected'}</span>
                    <span>Confidence: {Math.round((ocrResults.confidence || 0) * 100)}%</span>
                  </div>
                </div>

                {/* Extracted Text */}
                <div className="bg-grey-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-grey-200">Extracted Text</h4>
                    <Button
                      onClick={() => navigator.clipboard.writeText(ocrResults.text)}
                      size="sm"
                      variant="outline"
                      className="border-grey-600 text-grey-300 hover:bg-grey-700"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-grey-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-grey-200 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                      {ocrResults.text || 'No text extracted'}
                    </pre>
                  </div>
                  <div className="mt-3 text-xs text-grey-500">
                    {ocrResults.text ? `${ocrResults.text.length} characters extracted` : 'No text found'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between p-4 bg-grey-800 rounded-xl">
                  <div>
                    <h4 className="font-medium text-grey-200 mb-1">Text Extracted Successfully!</h4>
                    <p className="text-grey-400 text-sm">
                      You can now copy the text or use it for further processing.
                    </p>
                  </div>
                  <div className="flex space-x-3">
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
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Text
                    </Button>
                    <Button
                      onClick={() => setOcrResults(null)}
                      variant="outline"
                      className="border-grey-600 text-grey-300 hover:bg-grey-700"
                    >
                      Clear Results
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Chat Results Display */}
          {toolResults && toolResults.type === 'ai-chat' && (
            <div className="bg-grey-900 rounded-3xl border border-grey-800 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MessageSquare className="h-6 w-6 text-pink-400 mr-3" />
                  <h3 className="text-xl font-semibold text-grey-200">AI Chat Initialized</h3>
                </div>
                <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Ready
                </div>
              </div>
              
              <div className="bg-grey-800 rounded-xl p-6 text-center">
                <MessageSquare className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-grey-200 mb-2">
                  AI Chat is Ready!
                </h4>
                <p className="text-grey-400 mb-4">
                  Your document has been processed and is ready for AI-powered conversations.
                  You can now ask questions about the content.
                </p>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chatting
                </Button>
              </div>
            </div>
          )}

          {/* Tool Results Display */}
          {toolResults && !['ocr', 'ai-chat'].includes(toolResults.type) && (
            <div className="bg-grey-900 rounded-3xl border border-grey-800 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                  <h3 className="text-xl font-semibold text-grey-200">Processing Complete</h3>
                </div>
                <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Success
                </div>
              </div>
              
              <div className="bg-grey-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-grey-200 mb-1">
                      {toolResults.toolName} Completed
                    </h4>
                    <p className="text-grey-400">
                      Your files have been processed successfully and downloaded.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-grey-400">
                      Processed at: {new Date(toolResults.timestamp).toLocaleString()}
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
        progress={50}
        stage="Processing your files..."
        icon={selectedTool ? selectedTool.icon : FileText}
        description={selectedTool ? selectedTool.description : 'Processing your files with advanced options'}
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
    </div>
  )
}

export default Tools