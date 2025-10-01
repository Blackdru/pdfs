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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center">
                Enhanced OCR Results
                <Sparkles className="h-5 w-5 ml-2 text-yellow-500" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex h-[calc(95vh-120px)]">
            {/* Left Panel - Settings */}
            <div className="w-80 border-r bg-card p-4 overflow-y-auto">
              <div className="space-y-6">
                {/* OCR Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    OCR Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <Eye className="h-3 w-3 mr-1" />
                        Confidence: {Math.round(result.confidence * 100)}%
                      </Badge>
                      <Badge variant="outline">
                        Pages: {result.pageCount}
                      </Badge>
                    </div>
                    {autoDetectedLanguage && (
                      <Badge variant="outline" className="w-full justify-center">
                        <Languages className="h-3 w-3 mr-1" />
                        Detected: {autoDetectedLanguage}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* AI Enhancement Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    AI Enhancement
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enhance-ai" className="text-sm">
                        Enhance with AI
                      </Label>
                      <Switch
                        id="enhance-ai"
                        checked={enhanceWithAI}
                        onCheckedChange={setEnhanceWithAI}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="extract-original" className="text-sm">
                        Extract Original
                      </Label>
                      <Switch
                        id="extract-original"
                        checked={extractOriginal}
                        onCheckedChange={setExtractOriginal}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleEnhanceWithAI}
                    disabled={isEnhancing || !result.text}
                    className="w-full"
                    variant="default"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Enhance with AI
                      </>
                    )}
                  </Button>

                  {isEnhancing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Processing...</span>
                        <span>{enhancementProgress}%</span>
                      </div>
                      <Progress value={enhancementProgress} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Translation Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Translation
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="target-language" className="text-sm">
                        Target Language
                      </Label>
                      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select language..." />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleTranslate}
                      disabled={isTranslating || !targetLanguage || (!result.text && !enhancedText)}
                      className="w-full"
                      variant="outline"
                    >
                      {isTranslating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Languages className="h-4 w-4 mr-2" />
                          Translate Text
                        </>
                      )}
                    </Button>

                    {isTranslating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Translating...</span>
                          <span>{translationProgress}%</span>
                        </div>
                        <Progress value={translationProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleReprocessOCR}
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reprocess OCR
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Results */}
            <div className="flex-1 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
                  <TabsTrigger value="results" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Original
                  </TabsTrigger>
                  <TabsTrigger value="enhanced" className="flex items-center" disabled={!enhancedText}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enhanced
                  </TabsTrigger>
                  <TabsTrigger value="translated" className="flex items-center" disabled={!translatedText}>
                    <Globe className="h-4 w-4 mr-2" />
                    Translated
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 p-4 pt-2">
                  <TabsContent value="results" className="h-full mt-2">
                    <div className="space-y-4 h-full">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Original Extracted Text:</Label>
                        <div className="flex space-x-2">
                          <Button onClick={() => handleCopyText(result.text)} size="sm" variant="outline">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button 
                            onClick={() => downloadText(result.text, `${fileName}_original.txt`)} 
                            size="sm" 
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={result.text}
                        readOnly
                        className="flex-1 min-h-96 text-sm resize-none"
                        placeholder="No text extracted..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="enhanced" className="h-full mt-2">
                    <div className="space-y-4 h-full">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                          AI Enhanced Text:
                        </Label>
                        <div className="flex space-x-2">
                          <Button onClick={() => handleCopyText(enhancedText)} size="sm" variant="outline">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button 
                            onClick={() => downloadText(enhancedText, `${fileName}_enhanced.txt`)} 
                            size="sm" 
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={enhancedText}
                        readOnly
                        className="flex-1 min-h-96 text-sm resize-none"
                        placeholder="Click 'Enhance with AI' to improve the extracted text..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="translated" className="h-full mt-2">
                    <div className="space-y-4 h-full">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-blue-500" />
                          Translated Text:
                          {targetLanguage && (
                            <Badge variant="outline" className="ml-2">
                              {languages.find(lang => lang.code === targetLanguage)?.name}
                            </Badge>
                          )}
                        </Label>
                        <div className="flex space-x-2">
                          <Button onClick={() => handleCopyText(translatedText)} size="sm" variant="outline">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button 
                            onClick={() => downloadText(translatedText, `${fileName}_translated.txt`)} 
                            size="sm" 
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={translatedText}
                        readOnly
                        className="flex-1 min-h-96 text-sm resize-none"
                        placeholder="Select a target language and click 'Translate Text' to translate the extracted text..."
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