import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { X, Copy, CheckCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const OCRResultsModal = ({ isOpen, onClose, result, fileName }) => {
  if (!isOpen || !result) return null

  const handleCopyText = () => {
    navigator.clipboard.writeText(result.text)
    toast.success('Text copied to clipboard!')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">OCR Results</CardTitle>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Eye className="h-3 w-3 mr-1" />
                Confidence: {Math.round(result.confidence * 100)}%
              </Badge>
              <Badge variant="outline">
                Pages: {result.pageCount}
              </Badge>
              <Badge variant="outline">
                Language: {result.language}
              </Badge>
            </div>
            <Button onClick={handleCopyText} size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy Text
            </Button>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Extracted Text:</label>
            <Textarea
              value={result.text}
              readOnly
              className="min-h-96 text-sm"
              placeholder="No text extracted..."
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OCRResultsModal