import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { 
  X, 
  Copy, 
  CheckCircle, 
  Eye, 
  Brain, 
  Languages, 
  Sparkles, 
  Download,
  RefreshCw,
  Globe,
  Settings,
  Wand2,
  FileText,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'

const EnhancedOCRModal = ({ isOpen, onClose, result, fileName, fileId, onResultUpdate }) => {
  const [activeTab, setActiveTab] = useState('results')
  const [enhancedText, setEnhancedText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [enhanceWithAI, setEnhanceWithAI] = useState(true)
  const [extractOriginal, setExtractOriginal] = useState(false)
  const [autoDetectedLanguage, setAutoDetectedLanguage] = useState('')
  const [enhancementProgress, setEnhancementProgress] = useState(0)
  const [translationProgress, setTranslationProgress] = useState(0)

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'bn', name: 'Bengali' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'da', name: 'Danish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'he', name: 'Hebrew' },
    { code: 'cs', name: 'Czech' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'ro', name: 'Romanian' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'hr', name: 'Croatian' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'et', name: 'Estonian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' }
  ]

  useEffect(() => {
    if (result && result.detectedLanguage) {
      setAutoDetectedLanguage(result.detectedLanguage)
    }
  }, [result])

  if (!isOpen || !result) return null

  const handleCopyText = (text = result.text) => {
    navigator.clipboard.writeText(text)
    toast.success('Text copied to clipboard!')
  }

  const handleEnhanceWithAI = async () => {
    if (!result.text || !fileId) {
      toast.error('No text available to enhance')
      return
    }

    setIsEnhancing(true)
    setEnhancementProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setEnhancementProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await api.requestWithRetry('/ai/enhance-text', {
        method: 'POST',
        body: JSON.stringify({
          fileId: fileId,
          text: result.text,
          enhanceWithAI: true,
          extractOriginal: extractOriginal
        }),
        timeout: 120000 // 2 minutes timeout
      }, 2) // Retry up to 2 times

      clearInterval(progressInterval)
      setEnhancementProgress(100)

      if (response && response.enhancedText) {
        setEnhancedText(response.enhancedText)
        setActiveTab('enhanced')
        toast.success('Text enhanced with AI!')
        
        // Update the result if callback provided
        if (onResultUpdate) {
          onResultUpdate({
            ...result,
            enhancedText: response.enhancedText,
            aiEnhanced: true
          })
        }
      } else {
        throw new Error('No enhanced text received')
      }
    } catch (error) {
      console.error('Enhancement error:', error)
      toast.error(error.response?.data?.error || 'Failed to enhance text with AI')
    } finally {
      setIsEnhancing(false)
      setEnhancementProgress(0)
    }
  }

  const handleTranslate = async () => {
    if (!targetLanguage) {
      toast.error('Please select a target language')
      return
    }

    const textToTranslate = enhancedText || result.text
    if (!textToTranslate) {
      toast.error('No text available to translate')
      return
    }

    setIsTranslating(true)
    setTranslationProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setTranslationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 300)

      const targetLanguageName = languages.find(lang => lang.code === targetLanguage)?.name || targetLanguage

      const response = await api.requestWithRetry('/ai/translate-text', {
        method: 'POST',
        body: JSON.stringify({
          fileId: fileId,
          text: textToTranslate,
          targetLanguage: targetLanguageName
        }),
        timeout: 60000 // 1 minute timeout
      }, 2) // Retry up to 2 times

      clearInterval(progressInterval)
      setTranslationProgress(100)

      if (response && response.translatedText) {
        setTranslatedText(response.translatedText)
        setActiveTab('translated')
        toast.success(`Text translated to ${targetLanguageName}!`)
      } else {
        throw new Error('No translated text received')
      }
    } catch (error) {
      console.error('Translation error:', error)
      toast.error(error.response?.data?.error || 'Failed to translate text')
    } finally {
      setIsTranslating(false)
      setTranslationProgress(0)
    }
  }

  const handleReprocessOCR = async () => {
    if (!fileId) {
      toast.error('File ID not available')
      return
    }

    try {
      toast.loading('Reprocessing with new settings...')
      
      const response = await api.requestWithRetry('/ai/ocr', {
        method: 'POST',
        body: JSON.stringify({
          fileId: fileId,
          language: 'auto',
          enhanceImage: true,
          aiEnhanced: enhanceWithAI,
          extractOriginal: extractOriginal,
          confidenceThreshold: 0.6
        }),
        timeout: 120000 // 2 minutes timeout
      }, 1) // Retry once

      if (response && response.result) {
        // Update the result
        if (onResultUpdate) {
          onResultUpdate(response.result)
        }
        toast.dismiss()
        toast.success('OCR reprocessed successfully!')
      }
    } catch (error) {
      console.error('Reprocess error:', error)
      toast.dismiss()
      toast.error('Failed to reprocess OCR')
    }
  }

  const downloadText = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Text file downloaded!')
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-0 sm:p-4 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl sm:rounded-2xl overflow-hidden bg-card flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b p-3 sm:p-4 md:p-6 shrink-0 relative">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 pr-12">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-full flex-shrink-0">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base md:text-lg flex items-center">
                <span className="truncate">OCR Results</span>
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 text-yellow-500 flex-shrink-0" />
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{fileName}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute right-2 top-1/2 -translate-y-1/2 flex-shrink-0 h-10 w-10 sm:h-10 sm:w-10 z-10 hover:bg-destructive/10"
          >
            <X className="h-5 w-5 sm:h-5 sm:w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Left Panel - Settings - Mobile First */}
            <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r bg-muted/30 p-3 sm:p-4 overflow-y-auto shrink-0">
              <div className="space-y-3 sm:space-y-4">
                {/* OCR Info - Mobile Optimized */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-semibold flex items-center text-foreground">
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                      Info
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={onClose} 
                      className="h-8 w-8 hover:bg-destructive/10 lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge variant="secondary" className="bg-blue-600 text-white text-[10px] sm:text-xs px-2 py-1">
                      <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 flex-shrink-0" />
                      {Math.round(result.confidence * 100)}%
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-600 text-white text-[10px] sm:text-xs px-2 py-1">
                      Pages: {result.pageCount}
                    </Badge>
                    {autoDetectedLanguage && (
                      <Badge variant="secondary" className="bg-purple-600 text-white text-[10px] sm:text-xs px-2 py-1">
                        <Languages className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 flex-shrink-0" />
                        {autoDetectedLanguage}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Translation Settings - Mobile Optimized */}
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-semibold flex items-center text-foreground">
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                    Translate
                  </h3>
                  
                  <div className="space-y-2">
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="w-full h-10 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select language..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {languages.map((lang) => (
                          <SelectItem 
                            key={lang.code} 
                            value={lang.code} 
                            className="text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]"
                          >
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button 
                      onClick={handleTranslate}
                      disabled={isTranslating || !targetLanguage || (!result.text && !enhancedText)}
                      className="w-full h-10 sm:h-10 text-xs sm:text-sm"
                      size="sm"
                    >
                      {isTranslating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                          <span className="hidden sm:inline">Translating...</span>
                          <span className="sm:hidden">Wait...</span>
                        </>
                      ) : (
                        <>
                          <Languages className="h-4 w-4 mr-2 flex-shrink-0" />
                          Translate
                        </>
                      )}
                    </Button>

                    {isTranslating && (
                      <Progress value={translationProgress} className="h-2" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Results - Mobile First */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2 m-3 sm:m-4 mb-0 h-11 sm:h-11 shrink-0">
                  <TabsTrigger value="results" className="flex items-center text-xs sm:text-sm h-10">
                   <FileText className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Extracted</span>
                    <span className="sm:hidden">Text</span>
                  </TabsTrigger>
                  <TabsTrigger value="translated" className="flex items-center text-xs sm:text-sm h-10" disabled={!translatedText}>
                    <Globe className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Translated</span>
                    <span className="sm:hidden">Trans</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 p-3 sm:p-4 pt-2 sm:pt-3 overflow-y-auto min-h-0">
                  <TabsContent value="results" className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
                        <Label className="text-xs sm:text-sm font-medium">Extracted Text:</Label>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleCopyText(result.text)} 
                            size="sm" 
                            variant="outline" 
                            className="h-9 sm:h-9 text-xs sm:text-sm px-3"
                          >
                            <Copy className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
                            <span className="hidden sm:inline">Copy</span>
                          </Button>
                          <Button 
                            onClick={() => downloadText(result.text, `${fileName}_original.txt`)} 
                            size="sm" 
                            variant="outline"
                            className="h-9 sm:h-9 text-xs sm:text-sm px-3"
                          >
                            <Download className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
                            <span className="hidden sm:inline">Download</span>
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={result.text}
                        readOnly
                        className="flex-1 text-xs sm:text-sm resize-none min-h-0"
                        placeholder="No text extracted..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="translated" className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
                        <Label className="text-xs sm:text-sm font-medium flex items-center">
                          <Globe className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" />
                          Translated Text
                        </Label>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleCopyText(translatedText)} 
                            size="sm" 
                            variant="outline" 
                            className="h-9 sm:h-9 text-xs sm:text-sm px-3"
                          >
                            <Copy className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
                            <span className="hidden sm:inline">Copy</span>
                          </Button>
                          <Button 
                            onClick={() => downloadText(translatedText, `${fileName}_translated.txt`)} 
                            size="sm" 
                            variant="outline"
                            className="h-9 sm:h-9 text-xs sm:text-sm px-3"
                          >
                            <Download className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
                            <span className="hidden sm:inline">Download</span>
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={translatedText}
                        readOnly
                        className="flex-1 text-xs sm:text-sm resize-none min-h-0"
                        placeholder="Select a language and translate..."
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedOCRModal