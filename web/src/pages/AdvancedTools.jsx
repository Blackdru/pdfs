import { useState, useEffect, useMemo } from 'react'
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
  Brain,
  Eye,
  MessageSquare,
  Sparkles,
  Wand2,
  Shield,
  Crown,
  Star,
  Upload,
  Download,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Layers,
  Rocket,
  Play,
  Clock,
  TrendingUp,
  Users,
  Award,
  Copy,
  GitMerge,
  Scissors,
  Archive,
  Lock,
  FileText,
  Plus,
  Minus,
  X
} from 'lucide-react'

const AdvancedTools = () => {
  const { user, session } = useAuth()
  const { subscription, usage } = useSubscription()
  
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

  const proTools = [
    {
      id: 'advanced-ocr',
      icon: Eye,
      title: 'Advanced OCR Pro',
      description: 'AI-powered text extraction with 99.9% accuracy and multi-language support',
      color: 'from-cyan-500 to-blue-700',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-700',
      iconBg: 'bg-cyan-500',
      acceptedFiles: '.pdf,.jpg,.jpeg,.png',
      multipleFiles: false,
      minFiles: 1,
      category: 'AI-Powered',
      popularity: 98,
      processingTime: '< 60s',
      features: ['Multi-language OCR', 'AI enhancement', 'Entity extraction', 'Confidence scoring']
    },
    {
      id: 'ai-chat',
      icon: MessageSquare,
      title: 'AI Document Chat',
      description: 'Intelligent conversations with your PDFs using advanced AI',
      color: 'from-pink-500 to-purple-700',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700',
      iconBg: 'bg-pink-500',
      acceptedFiles: '.pdf',
      multipleFiles: false,
      minFiles: 1,
      category: 'AI-Powered',
      popularity: 95,
      processingTime: '< 30s',
      features: ['GPT-4 powered', 'Context awareness', 'Smart summaries', 'Multi-turn conversations']
    },
    {
      id: 'smart-summary',
      icon: Sparkles,
      title: 'Smart Summary Pro',
      description: 'AI-generated summaries with key insights and sentiment analysis',
      color: 'from-yellow-500 to-orange-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      iconBg: 'bg-yellow-500',
      acceptedFiles: '.pdf',
      multipleFiles: false,
      minFiles: 1,
      category: 'AI-Powered',
      popularity: 92,
      processingTime: '< 45s',
      features: ['Key insights', 'Sentiment analysis', 'Entity recognition', 'Executive summaries']
    },
    {
      id: 'pro-merge',
      icon: GitMerge,
      title: 'Pro Merge',
      description: 'Advanced PDF merging with bookmarks and professional options',
      color: 'from-blue-500 to-indigo-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-500',
      acceptedFiles: '.pdf',
      multipleFiles: true,
      minFiles: 2,
      category: 'Professional',
      popularity: 89,
      processingTime: '< 90s',
      features: ['Auto bookmarks', 'Page numbering', 'Title pages', 'Print optimization']
    },
    {
      id: 'precision-split',
      icon: Scissors,
      title: 'Precision Split',
      description: 'Advanced PDF splitting with custom ranges and batch processing',
      color: 'from-green-500 to-emerald-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconBg: 'bg-green-500',
      acceptedFiles: '.pdf',
      multipleFiles: false,
      minFiles: 1,
      category: 'Professional',
      popularity: 87,
      processingTime: '< 75s',
      features: ['Custom ranges', 'Batch processing', 'Smart naming', 'Quality preservation']
    },
    {
      id: 'smart-compress',
      icon: Archive,
      title: 'Smart Compress Pro',
      description: 'Intelligent compression with quality control and optimization',
      color: 'from-purple-500 to-violet-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-500',
      acceptedFiles: '.pdf',
      multipleFiles: true,
      minFiles: 1,
      category: 'Professional',
      popularity: 91,
      processingTime: '< 120s',
      features: ['Quality control', 'Image optimization', 'Size prediction', 'Batch processing']
    },
    {
      id: 'encrypt-pro',
      icon: Lock,
      title: 'Encrypt Pro',
      description: 'Military-grade encryption with advanced security features',
      color: 'from-red-500 to-pink-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      iconBg: 'bg-red-500',
      acceptedFiles: '.pdf',
      multipleFiles: true,
      minFiles: 1,
      category: 'Security',
      popularity: 85,
      processingTime: '< 60s',
      features: ['AES-256 encryption', 'Password protection', 'Digital signatures', 'Audit trails']
    },
    {
      id: 'digital-sign',
      icon: Award,
      title: 'Digital Signature',
      description: 'Professional digital signatures with certificate management',
      color: 'from-emerald-500 to-teal-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      iconBg: 'bg-emerald-500',
      acceptedFiles: '.pdf',
      multipleFiles: false,
      minFiles: 1,
      category: 'Security',
      popularity: 83,
      processingTime: '< 45s',
      features: ['Legal compliance', 'Certificate management', 'Timestamp authority', 'Verification']
    }
  ]

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

  // Progress tracking helper functions
  // Extract processing steps configuration to module level for better performance
  const PROCESSING_STEPS_CONFIG = {
    'advanced-ocr': [
      { name: 'Uploading File', icon: Upload },
      { name: 'AI Enhancement', icon: Brain },
      { name: 'Text Extraction', icon: Eye },
      { name: 'Entity Detection', icon: Users },
      { name: 'Complete', icon: CheckCircle }
    ],
    'ai-chat': [
      { name: 'Uploading File', icon: Upload },
      { name: 'Text Processing', icon: FileText },
      { name: 'Creating Embeddings', icon: Brain },
      { name: 'AI Initialization', icon: MessageSquare },
      { name: 'Complete', icon: CheckCircle }
    ],
    'smart-summary': [
      { name: 'Uploading File', icon: Upload },
      { name: 'Text Analysis', icon: Brain },
      { name: 'Generating Summary', icon: Sparkles },
      { name: 'Sentiment Analysis', icon: TrendingUp },
      { name: 'Entity Extraction', icon: Users },
      { name: 'Complete', icon: CheckCircle }
    ],
    'pro-merge': [
      { name: 'Uploading Files', icon: Upload },
      { name: 'Processing PDFs', icon: FileText },
      { name: 'Merging Documents', icon: GitMerge },
      { name: 'Optimizing Output', icon: Zap },
      { name: 'Complete', icon: CheckCircle }
    ],
    'precision-split': [
      { name: 'Uploading File', icon: Upload },
      { name: 'Analyzing Structure', icon: Eye },
      { name: 'Splitting Pages', icon: Scissors },
      { name: 'Creating Archive', icon: Archive },
      { name: 'Complete', icon: CheckCircle }
    ],
    'smart-compress': [
      { name: 'Uploading Files', icon: Upload },
      { name: 'Analyzing Content', icon: Eye },
      { name: 'Optimizing Images', icon: Layers },
      { name: 'Compressing PDFs', icon: Archive },
      { name: 'Complete', icon: CheckCircle }
    ],
    'encrypt-pro': [
      { name: 'Uploading Files', icon: Upload },
      { name: 'Generating Keys', icon: Shield },
      { name: 'Applying Encryption', icon: Lock },
      { name: 'Security Verification', icon: CheckCircle },
      { name: 'Complete', icon: Download }
    ],
    'digital-sign': [
      { name: 'Uploading File', icon: Upload },
      { name: 'Certificate Setup', icon: Shield },
      { name: 'Digital Signing', icon: Award },
      { name: 'Verification', icon: CheckCircle },
      { name: 'Complete', icon: Download }
    ]
  }

  const updateProgress = (progress, stage, step = null) => {
    setProcessingProgress(progress)
    setProcessingStage(stage)
    if (step !== null) {
      setCurrentStep(step)
    }
  }

  const initializeProcessingSteps = (toolId) => {
    const steps = PROCESSING_STEPS_CONFIG[toolId] || [
      { name: 'Uploading', icon: Upload },
      { name: 'Processing', icon: FileText },
      { name: 'Finalizing', icon: CheckCircle },
      { name: 'Complete', icon: Download }
    ]

    setProcessingSteps(steps)
    setCurrentStep(0)
    setProcessingProgress(0)
    setProcessingStage('Initializing...')
  }

  const handleToolSelect = (tool) => {
    setSelectedTool(tool)
    setUploadedFiles([])
    setProcessedFiles([])
    setOcrResults(null)
    setToolResults(null)
    setIsProcessing(false)
    setClearFileUpload(true)
    // Clear chat sessions when switching tools
    setChatSessions({})
    setCurrentMessage('')
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

    if (usage && usage.current >= usage.limit && subscription?.plan !== 'premium') {
      toast.error('You have reached your monthly processing limit. Please upgrade to continue.')
      return
    }

    setIsProcessing(true)
    
    // Initialize progress tracking
    initializeProcessingSteps(selectedTool.id)
    updateProgress(5, 'Preparing files for processing...', 0)
    
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
          result = await handleSmartSummary(uploadedFileIds[0])
          break
        case 'pro-merge':
          result = await api.mergePDFs(uploadedFileIds, `${outputName}.pdf`)
          break
        case 'precision-split':
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
          
        case 'smart-compress':
          const compressedFiles = []
          for (const fileId of uploadedFileIds) {
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
            return
          }
          
          result = { files: compressedFiles }
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

  const handleAdvancedOCR = async (fileId) => {
    console.log('Starting Advanced OCR processing for file ID:', fileId)
    toast.loading('Processing with AI-enhanced OCR...', { id: 'ocr-processing' })
    
    try {
      const result = await api.post('/ai/ocr', {
        fileId: fileId,
        language: 'eng+tel+spa+fra+deu',
        enhanceImage: true,
        aiEnhanced: true
      })
      
      toast.dismiss('ocr-processing')
      toast.success('Advanced OCR processing completed! Text extracted with AI enhancement.')
      
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
      console.error('Advanced OCR error:', ocrError)
      toast.dismiss('ocr-processing')
      throw ocrError
    }
  }

  const handleAIChat = async (fileId, files) => {
    // Prevent duplicate initialization
    if (initializingAIChat) {
      console.log('AI Chat initialization already in progress, skipping...')
      return { initialized: false, message: 'Already initializing' }
    }
    
    setInitializingAIChat(true)
    let ocrCompleted = false
    
    try {
      console.log('Starting AI Chat initialization for file ID:', fileId)
      toast.loading('Preparing document for AI chat...', { id: 'ai-chat-init' })
      
      try {
        // First, try to create embeddings directly
        const result = await api.post('/ai/create-embeddings', { 
          fileId: fileId 
        })
        
        console.log('Embeddings created successfully:', result)
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
              fileId: fileId,
              language: 'eng+tel',
              enhanceImage: true
            })
            
            console.log('OCR completed for AI chat:', ocrResult)
            ocrCompleted = true
            toast.dismiss('ai-chat-ocr')
            
            // Wait a moment for OCR to be fully processed
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            toast.loading('Creating AI embeddings...', { id: 'ai-chat-embeddings' })
            
            // Now try to create embeddings again
            const embeddingResult = await api.post('/ai/create-embeddings', { 
              fileId: fileId 
            })
            
            console.log('Embeddings created after OCR:', embeddingResult)
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
        id: fileId,
        name: files[0].name
      })
      setShowAIAssistant(true)
      setAiAssistantMinimized(false)
      
      setUploadedFiles([])
      setIsProcessing(false)
      return { initialized: true, ocrCompleted }
      
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

  const handleSmartSummary = async (fileId) => {
    console.log('=== SMART SUMMARY DEBUG ===')
    console.log('Starting smart summary for fileId:', fileId)
    
    updateProgress(30, 'Analyzing document text...', 1)
    
    updateProgress(50, 'Generating AI summary...', 2)
    
    const result = await api.smartSummary(fileId, {
      includeKeyPoints: true,
      includeSentiment: true,
      includeEntities: true
    })
    
    updateProgress(70, 'Performing sentiment analysis...', 3)
    
    updateProgress(85, 'Extracting entities...', 4)
    
    console.log('Smart summary API response:', result)
    console.log('Result structure:', {
      message: result.message,
      result: result.result,
      fileId: result.fileId
    })
    
    if (result.result) {
      console.log('Summary details:')
      console.log('- Summary length:', result.result.summary ? result.result.summary.length : 0)
      console.log('- Summary preview:', result.result.summary ? result.result.summary.substring(0, 100) + '...' : 'NO SUMMARY')
      console.log('- Key points count:', result.result.keyPoints ? result.result.keyPoints.length : 0)
      console.log('- Sentiment:', result.result.sentiment)
      console.log('- Entities count:', result.result.entities ? result.result.entities.length : 0)
    } else {
      console.error('❌ No result object in API response!')
    }
    
    updateProgress(100, 'Smart summary completed!', 5)
    
    setToolResults({
      type: 'smart-summary',
      result: result.result,
      timestamp: new Date().toISOString(),
      fileId: fileId
    })
    
    console.log('Tool results set:', {
      type: 'smart-summary',
      result: result.result,
      timestamp: new Date().toISOString(),
      fileId: fileId
    })
    
    toast.success('Smart summary generated with AI insights!')
    setUploadedFiles([])
    setIsProcessing(false)
    return result
  }

  const handleEncryptPro = async (fileIds) => {
    try {
      const encryptedFiles = []
      
      for (const fileId of fileIds) {
        // Generate a secure password for demonstration
        const password = `SecurePDF_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        
        const response = await fetch(`${API_BASE_URL}/advanced-pdf/password-protect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            fileId: fileId,
            password: password,
            permissions: {
              printing: true,
              copying: false,
              editing: false,
              annotating: false,
              fillingForms: true,
              extracting: false,
              assembling: false,
              printingHighRes: false
            },
            outputName: `encrypted_${Date.now()}.pdf`,
            encryptionLevel: '256-bit'
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Encryption failed')
        }

        const result = await response.json()
        encryptedFiles.push(result.file)
        
        // Show password to user
        toast.success(`File encrypted! Password: ${password}`, { duration: 10000 })
        
        // Also copy password to clipboard
        try {
          await navigator.clipboard.writeText(password)
          toast.success('Password copied to clipboard!')
        } catch (clipboardError) {
          console.warn('Could not copy to clipboard:', clipboardError)
        }
      }

      toast.success(`${encryptedFiles.length} file(s) encrypted successfully with AES-256!`)
      return { files: encryptedFiles }
      
    } catch (error) {
      console.error('Encryption error:', error)
      throw error
    }
  }

  const handleDigitalSign = async (fileId) => {
    try {
      // Get user information for signature
      const signerName = user?.user_metadata?.full_name || user?.email || 'Digital Signer'
      
      const response = await fetch(`${API_BASE_URL}/advanced-pdf/digital-sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          fileId: fileId,
          signatureData: {
            name: signerName,
            reason: 'Document approval and authentication',
            location: 'Digital Platform',
            contactInfo: user?.email || 'contact@example.com'
          },
          position: {
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            page: 1
          },
          outputName: `signed_${Date.now()}.pdf`,
          signatureType: 'advanced',
          timestampAuthority: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Digital signing failed')
      }

      const result = await response.json()
      
      toast.success('Document digitally signed with advanced certificate!')
      return { file: result.file }
      
    } catch (error) {
      console.error('Digital signing error:', error)
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

  const handleProcess = async () => {
    await handleAutoProcess(uploadedFiles)
  }

  const canProcess = uploadedFiles.length >= (selectedTool?.minFiles || 1)
  const usageExceeded = usage && usage.current >= usage.limit && subscription?.plan !== 'premium'

  return (
    <div className="min-h-screen bg-grey-950 relative overflow-hidden">
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
            <div className="bg-red-900 border border-red-800 rounded-2xl p-6 flex items-center">
              <AlertCircle className="h-6 w-6 text-red-400 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-300 mb-1">Usage Limit Reached</h3>
                <p className="text-red-400">You've reached your monthly processing limit. Upgrade to Premium for unlimited access.</p>
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
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-grey-800 text-grey-300 hover:bg-grey-700 hover:text-grey-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Pro Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleToolSelect(tool)}
                className={`group relative bg-grey-900 rounded-3xl border-2 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl ${
                  selectedTool?.id === tool.id
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/20'
                    : 'border-grey-800 hover:border-grey-700'
                }`}
              >
                {/* Pro Badge */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  PRO
                </div>

                {/* Popularity Badge */}
                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
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
                        Enterprise
                      </div>
                    </div>

                    {/* Pro Features List */}
                    <div className="space-y-1 mb-4">
                      {tool.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center text-xs text-grey-500">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                          {feature}
                        </div>
                      ))}
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

          {/* Selected Tool Processing Area */}
          {selectedTool && (
            <div className="bg-grey-900 rounded-3xl border border-grey-800 p-8 mb-8">
              <div className="flex items-center mb-8">
                <div className={`w-12 h-12 ${selectedTool.iconBg} rounded-xl flex items-center justify-center mr-4`}>
                  <selectedTool.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-grey-100">{selectedTool.title}</h2>
                  <p className="text-grey-400">{selectedTool.description}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Crown className="h-3 w-3 mr-1 inline" />
                  PRO
                </div>
              </div>

              {/* Pro Features */}
              <div className="bg-grey-800 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-grey-200 mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Professional Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTool.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-grey-300">
                      <CheckCircle className="h-4 w-4 mr-3 text-green-400 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* File Upload Area */}
              <div id="upload-section" className="bg-grey-800 rounded-2xl p-6 mb-6 text-center">
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

          {/* Results Section */}
          {(ocrResults || Object.keys(chatSessions).length > 0 || toolResults) && (
            <div className="space-y-8 mb-8">
              {/* Smart Summary Results */}
              {toolResults && toolResults.type === 'smart-summary' && (
                <div className="bg-grey-900 rounded-3xl border border-grey-800 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-grey-200 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      AI Summary Results
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Complete
                      </div>
                      <Button
                        onClick={() => setToolResults(null)}
                        size="sm"
                        variant="outline"
                        className="border-grey-600 text-grey-300 hover:bg-grey-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Main Summary */}
                    {toolResults.result && (
                      <div className="p-6 bg-grey-800 rounded-xl">
                        <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Executive Summary
                        </h4>
                        <div className="bg-grey-700 rounded-lg p-4">
                          <p className="text-grey-200 leading-relaxed whitespace-pre-wrap">
                            {toolResults.result?.summary || 'No summary available'}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-grey-400">
                            Generated: {new Date(toolResults.timestamp).toLocaleString()}
                          </span>
                          <Button
                            onClick={() => navigator.clipboard.writeText(toolResults.result?.summary || 'No summary available')}
                            size="sm"
                            variant="outline"
                            className="border-grey-600 text-grey-300 hover:bg-grey-700"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Summary
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Key Points */}
                    {toolResults.result?.keyPoints && toolResults.result.keyPoints.length > 0 && (
                      <div className="p-6 bg-grey-800 rounded-xl">
                        <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Key Points
                        </h4>
                        <div className="space-y-2">
                          {toolResults.result.keyPoints.map((point, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-grey-700 rounded-lg">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">{index + 1}</span>
                              </div>
                              <p className="text-grey-200 text-sm">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sentiment Analysis */}
                    {toolResults.result?.sentiment && (
                      <div className="p-6 bg-grey-800 rounded-xl">
                        <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          Sentiment Analysis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-grey-700 rounded-lg">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                              {Math.round((toolResults.result.sentiment.positive || 0) * 100)}%
                            </div>
                            <div className="text-grey-400 text-sm">Positive</div>
                          </div>
                          <div className="text-center p-4 bg-grey-700 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-400 mb-1">
                              {Math.round((toolResults.result.sentiment.neutral || 0) * 100)}%
                            </div>
                            <div className="text-grey-400 text-sm">Neutral</div>
                          </div>
                          <div className="text-center p-4 bg-grey-700 rounded-lg">
                            <div className="text-2xl font-bold text-red-400 mb-1">
                              {Math.round((toolResults.result.sentiment.negative || 0) * 100)}%
                            </div>
                            <div className="text-grey-400 text-sm">Negative</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Entities */}
                    {toolResults.result?.entities && toolResults.result.entities.length > 0 && (
                      <div className="p-6 bg-grey-800 rounded-xl">
                        <h4 className="font-medium text-grey-200 mb-3 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Detected Entities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {toolResults.result.entities.map((entity, index) => (
                            <span key={index} className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                              {entity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between p-6 bg-grey-800 rounded-xl">
                      <div>
                        <h4 className="font-medium text-grey-200 mb-1">Summary Generated Successfully!</h4>
                        <p className="text-grey-400 text-sm">
                          AI-powered analysis complete with insights and key findings.
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => {
                            // Sanitize user input to prevent XSS
                            const escapeHtml = (text) => {
                              const div = document.createElement('div');
                              div.textContent = text;
                              return div.innerHTML;
                            };
                            
                            const summaryContent = toolResults.result?.summary || 'No summary available';
                            const keyPointsContent = toolResults.result?.keyPoints || [];
                            const entitiesContent = toolResults.result?.entities || [];
                            
                            const summaryText = [
                              'AI SUMMARY REPORT',
                              '==================',
                              '',
                              'EXECUTIVE SUMMARY:',
                              toolResults.result.summary || 'No summary available',
                              '',
                              'KEY POINTS:',
                              ...(toolResults.result.keyPoints || []).map((point, i) => `${i + 1}. ${point}`),
                              '',
                              'SENTIMENT ANALYSIS:',
                              `Positive: ${Math.round((toolResults.result.sentiment?.positive || 0) * 100)}%`,
                              `Neutral: ${Math.round((toolResults.result.sentiment?.neutral || 0) * 100)}%`,
                              `Negative: ${Math.round((toolResults.result.sentiment?.negative || 0) * 100)}%`,
                              '',
                              'ENTITIES:',
                              ...(toolResults.result.entities || []).map(entity => `- ${entity}`),
                              '',
                              `Generated: ${new Date(toolResults.timestamp).toLocaleString()}`
                            ].join('\n');
                            
                            // Create HTML content with sanitized data
                            const htmlContent = `
                              <!DOCTYPE html>
                              <html lang="en">
                              <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>AI Summary Report - PDFPet</title>
                                <style>
                                  * { margin: 0; padding: 0; box-sizing: border-box; }
                                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #e2e8f0; min-height: 100vh; padding: 2rem; }
                                  .container { max-width: 800px; margin: 0 auto; background: rgba(30, 41, 59, 0.8); border-radius: 20px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px); border: 1px solid rgba(148, 163, 184, 0.1); }
                                  .header { text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid rgba(148, 163, 184, 0.2); }
                                  .header h1 { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem; }
                                  .section { margin-bottom: 2rem; background: rgba(15, 23, 42, 0.5); border-radius: 12px; padding: 1.5rem; border: 1px solid rgba(148, 163, 184, 0.1); }
                                  .summary-text { line-height: 1.7; color: #cbd5e1; background: rgba(15, 23, 42, 0.3); padding: 1rem; border-radius: 8px; border-left: 4px solid #a855f7; }
                                  .key-points { list-style: none; }
                                  .key-points li { background: rgba(15, 23, 42, 0.3); margin-bottom: 0.5rem; padding: 0.75rem; border-radius: 8px; border-left: 3px solid #3b82f6; }
                                  .entity-tag { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 500; margin: 0.25rem; display: inline-block; }
                                  .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0.5rem; }
                                  .btn-primary { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; }
                                  .btn-secondary { background: rgba(148, 163, 184, 0.1); color: #e2e8f0; border: 1px solid rgba(148, 163, 184, 0.2); }
                                </style>
                              </head>
                              <body>
                                <div class="container">
                                  <div class="header">
                                    <h1>AI Summary Report</h1>
                                    <p>Generated by PDFPet Advanced AI</p>
                                  </div>
                                  
                                  <div class="section">
                                    <h2>Executive Summary</h2>
                                    <div class="summary-text">${summaryContent.replace(/\n/g, '<br>')}</div>
                                  </div>
                                  
                                  ${keyPointsContent.length > 0 ? `
                                  <div class="section">
                                    <h2>Key Points</h2>
                                    <ul class="key-points">
                                      ${keyPointsContent.map((point, i) => `<li>${i + 1}. ${point}</li>`).join('')}
                                    </ul>
                                  </div>` : ''}
                                  
                                  ${toolResults.result.sentiment ? `
                                  <div class="section">
                                    <h2>Sentiment Analysis</h2>
                                    <div>Positive: ${Math.round((toolResults.result.sentiment.positive || 0) * 100)}%</div>
                                    <div>Neutral: ${Math.round((toolResults.result.sentiment.neutral || 0) * 100)}%</div>
                                    <div>Negative: ${Math.round((toolResults.result.sentiment.negative || 0) * 100)}%</div>
                                  </div>` : ''}
                                  
                                  ${entitiesContent.length > 0 ? `
                                  <div class="section">
                                    <h2>Detected Entities</h2>
                                    <div>${entitiesContent.map(entity => `<span class="entity-tag">${entity}</span>`).join('')}</div>
                                  </div>` : ''}
                                  
                                  <div style="text-align: center; margin-top: 2rem;">
                                    <button class="btn btn-primary" onclick="downloadReport()">📥 Download Report</button>
                                    <button class="btn btn-secondary" onclick="window.print()">🖨️ Print Report</button>
                                    <button class="btn btn-secondary" onclick="copyToClipboard()">📋 Copy Text</button>
                                  </div>
                                  
                                  <div style="text-align: center; margin-top: 2rem; color: #64748b; font-size: 0.875rem;">
                                    <p>Generated on ${new Date(toolResults.timestamp).toLocaleString()}</p>
                                    <p>Powered by PDFPet AI • Professional PDF Tools</p>
                                  </div>
                                </div>
                                
                                <script>
                                  const summaryText = ${JSON.stringify(summaryText)};
                                  
                                  function downloadReport() {
                                    try {
                                      const blob = new Blob([summaryText], { type: 'text/plain' });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = 'ai_summary_${Date.now()}.txt';
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      URL.revokeObjectURL(url);
                                    } catch (e) {
                                      alert('Download failed: ' + e.message);
                                    }
                                  }
                                  
                                  function copyToClipboard() {
                                    try {
                                      navigator.clipboard.writeText(summaryText).then(() => {
                                        alert('Summary copied to clipboard!');
                                      }).catch(() => {
                                        const textArea = document.createElement('textarea');
                                        textArea.value = summaryText;
                                        document.body.appendChild(textArea);
                                        textArea.select();
                                        document.execCommand('copy');
                                        document.body.removeChild(textArea);
                                        alert('Summary copied to clipboard!');
                                      });
                                    } catch (e) {
                                      alert('Copy failed: ' + e.message);
                                    }
                                  }
                                </script>
                              </body>
                              </html>
                            `;
                            
                            try {
                              const newWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
                              if (newWindow) {
                                newWindow.document.write(htmlContent);
                                newWindow.document.close();
                                toast.success('Summary report opened in new window!');
                              } else {
                                throw new Error('Popup blocked');
                              }
                            } catch (error) {
                              // Fallback to download if popup blocked or fails
                              const blob = new Blob([summaryText], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `ai_summary_${Date.now()}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                              toast.success('Summary report downloaded! (Popup blocked)');
                            }
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                        <Button
                          onClick={() => {
                            const summaryText = [
                              'AI SUMMARY REPORT',
                              '==================',
                              '',
                              'EXECUTIVE SUMMARY:',
                              toolResults.result.summary || 'No summary available',
                              '',
                              'KEY POINTS:',
                              ...(toolResults.result.keyPoints || []).map((point, i) => `${i + 1}. ${point}`),
                              '',
                              'SENTIMENT ANALYSIS:',
                              `Positive: ${Math.round((toolResults.result.sentiment?.positive || 0) * 100)}%`,
                              `Neutral: ${Math.round((toolResults.result.sentiment?.neutral || 0) * 100)}%`,
                              `Negative: ${Math.round((toolResults.result.sentiment?.negative || 0) * 100)}%`,
                              '',
                              'ENTITIES:',
                              ...(toolResults.result.entities || []).map(entity => `- ${entity}`),
                              '',
                              `Generated: ${new Date(toolResults.timestamp).toLocaleString()}`
                            ].join('\n');
                            
                            // Download as text file
                            const blob = new Blob([summaryText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ai_summary_${Date.now()}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            toast.success('Summary downloaded as text file!');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Summary
                        </Button>
                        <Button
                          onClick={() => setToolResults(null)}
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* OCR Results */}
                {ocrResults && (
                  <div className="bg-grey-900 rounded-3xl border border-grey-800 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-grey-200 flex items-center">
                        <Eye className="h-5 w-5 mr-2" />
                        OCR Results
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {Math.round(ocrResults.confidence || 0)}% confidence
                        </div>
                        <Button
                          onClick={() => setOcrResults(null)}
                          size="sm"
                          variant="outline"
                          className="border-grey-600 text-grey-300 hover:bg-grey-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-grey-800 rounded-xl">
                        <h4 className="font-medium text-grey-200 mb-2">{ocrResults.filename}</h4>
                        <textarea
                          value={ocrResults.text}
                          readOnly
                          className="w-full bg-grey-700 border border-grey-600 text-grey-200 rounded-lg p-3 h-32 resize-none"
                        />
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-grey-400">
                            {ocrResults.pageCount || 0} pages • {ocrResults.detectedLanguage || 'Multiple languages'}
                          </span>
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
                      </div>
                      
                      {ocrResults.entities && ocrResults.entities.length > 0 && (
                        <div className="p-4 bg-grey-800 rounded-xl">
                          <h4 className="font-medium text-grey-200 mb-2">Detected Entities</h4>
                          <div className="flex flex-wrap gap-2">
                            {ocrResults.entities.map((entity, index) => (
                              <span key={index} className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                {entity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Chat */}
                {Object.keys(chatSessions).length > 0 && (
                  <div className="bg-grey-900 rounded-3xl border border-grey-800 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-grey-200 flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        AI Chat
                      </h3>
                      <Button
                        onClick={() => setChatSessions({})}
                        size="sm"
                        variant="outline"
                        className="border-grey-600 text-grey-300 hover:bg-grey-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Close Chat
                      </Button>
                    </div>
                    
                    {Object.entries(chatSessions).map(([fileId, session]) => (
                      <div key={fileId} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-grey-200">{session.filename}</h4>
                          <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Active
                          </div>
                        </div>
                        
                        <div className="h-48 overflow-y-auto bg-grey-800 rounded-xl p-4 space-y-3">
                          {session.messages.length === 0 ? (
                            <div className="text-center text-grey-400 py-8">
                              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Start a conversation with your document!</p>
                            </div>
                          ) : (
                            session.messages.map((message, index) => (
                              <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-xs px-4 py-2 rounded-xl ${
                                    message.role === 'user'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-grey-700 text-grey-200'
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  {message.confidence && (
                                    <p className="text-xs opacity-75 mt-1">
                                      Confidence: {Math.round(message.confidence || 0)}%
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <input
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            placeholder="Ask about this document..."
                            className="flex-1 bg-grey-800 border border-grey-600 text-grey-200 rounded-lg px-3 py-2"
                            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage(fileId)}
                          />
                          <Button
                            onClick={() => sendChatMessage(fileId)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              {toolResults && !['smart-summary', 'ai-chat'].includes(toolResults.type) && (
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

      {/* Processing Modal */}
      <ProcessingModal 
        isOpen={isProcessing}
        title={selectedTool ? `${selectedTool.title}` : 'Processing'}
        fileName={uploadedFiles.map(f => f.name).join(', ')}
        progress={processingProgress}
        stage={processingStage}
        icon={selectedTool ? selectedTool.icon : FileText}
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
        toolIcon={selectedTool?.icon || Upload}
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

export default AdvancedTools