import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Eye, FileText, Loader2 } from 'lucide-react'

const OCRProcessingModal = ({ isOpen, fileName, progress, stage }) => {
  if (!isOpen) return null

  const getStageText = (stage) => {
    switch (stage) {
      case 'initializing': return 'Initializing OCR engine...'
      case 'downloading': return 'Downloading file...'
      case 'processing': return 'Extracting text from document...'
      case 'saving': return 'Saving results...'
      case 'completed': return 'OCR completed successfully!'
      default: return 'Processing...'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full">
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">OCR Processing</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {fileName}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {getStageText(stage)}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <FileText className="h-4 w-4 mr-1" />
            Extracting text using advanced OCR technology
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OCRProcessingModal