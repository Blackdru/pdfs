import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { X, Upload, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const FileUploadModal = ({ 
  isOpen,
  onClose,
  onFilesUploaded, 
  acceptedFiles = '.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.doc,.docx,.xls,.xlsx',
  multiple = true,
  maxFiles = 10,
  title = 'Upload Files',
  description = 'Select files to upload and process',
  toolName = '',
  toolIcon: ToolIcon = Upload
}) => {
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  
  // Clear files when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFiles([])
      setIsUploading(false)
    }
  }, [isOpen])

  const allowedTypes = acceptedFiles.split(',').map(type => {
    if (type === '.pdf') return 'application/pdf'
    if (type === '.jpg' || type === '.jpeg') return 'image/jpeg'
    if (type === '.png') return 'image/png'
    if (type === '.gif') return 'image/gif'
    if (type === '.bmp') return 'image/bmp'
    if (type === '.webp') return 'image/webp'
    return type
  })

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Max size is 50MB.`)
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type.`)
        } else if (error.code === 'too-many-files') {
          toast.error(`Too many files. Maximum ${maxFiles} files allowed.`)
        }
      })
    })

    // Process accepted files
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready'
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(
      allowedTypes.map(type => [type, acceptedFiles.split(',').filter(ext => {
        if (type === 'application/pdf') return ext === '.pdf'
        if (type === 'image/jpeg') return ['.jpg', '.jpeg'].includes(ext)
        if (type === 'image/png') return ext === '.png'
        if (type === 'image/gif') return ext === '.gif'
        if (type === 'image/bmp') return ext === '.bmp'
        if (type === 'image/webp') return ext === '.webp'
        return false
      })])
    ),
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple,
    maxFiles
  })

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file')
      return
    }

    setIsUploading(true)
    
    try {
      // Update file statuses to uploading
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })))
      
      // Call the upload handler
      await onFilesUploaded(files.map(f => f.file))
      
      // Update file statuses to success
      setFiles(prev => prev.map(f => ({ ...f, status: 'success' })))
      
      toast.success(`${files.length} file(s) uploaded successfully!`)
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' })))
      toast.error('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <File className="h-4 w-4 text-grey-400" />
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="bg-grey-900 border-grey-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in duration-300">
        <CardHeader className="px-8 py-6 border-b border-grey-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <ToolIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-grey-100">{title}</CardTitle>
                {toolName && (
                  <p className="text-sm text-blue-400 mt-1">for {toolName}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-grey-400 hover:text-grey-200 hover:bg-grey-800 p-2 rounded-xl"
              disabled={isUploading}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {description && (
            <p className="text-sm text-grey-400 mt-3">{description}</p>
          )}
        </CardHeader>
        
        <CardContent className="px-8 py-6 space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'border-blue-400 bg-blue-900/20' 
                : 'border-grey-700 hover:border-grey-600 hover:bg-grey-800/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`mx-auto h-12 w-12 mb-4 ${
              isDragActive ? 'text-blue-400' : 'text-grey-400'
            }`} />
            {isDragActive ? (
              <div>
                <p className="text-lg font-semibold text-blue-300 mb-2">Drop the files here...</p>
                <p className="text-blue-400">Release to upload your files</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-grey-200 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-grey-400 mb-4">
                  {acceptedFiles.includes('.pdf') && 'PDF, '}
                  {acceptedFiles.includes('.jpg') && 'JPG, '}
                  {acceptedFiles.includes('.png') && 'PNG, '}
                  {acceptedFiles.includes('.gif') && 'GIF '}
                  files supported (max 50MB each)
                </p>
                <p className="text-xs text-grey-500">
                  {multiple ? `Up to ${maxFiles} files` : 'Single file only'}
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-grey-200">
                  Selected Files ({files.length})
                </h4>
                {!isUploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiles([])}
                    className="text-grey-400 border-grey-600 hover:bg-grey-800"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {files.map((fileData) => (
                  <div
                    key={fileData.id}
                    className="flex items-center justify-between p-4 border border-grey-800 rounded-xl bg-grey-800/50"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {getStatusIcon(fileData.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-grey-200 truncate">{fileData.name}</p>
                        <p className="text-sm text-grey-400">
                          {formatFileSize(fileData.size)}
                        </p>
                      </div>
                    </div>
                    
                    {!isUploading && fileData.status !== 'uploading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileData.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950 p-2 rounded-xl ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-grey-800">
            <div className="text-sm text-grey-400">
              {files.length > 0 && (
                <span>
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                  {files.length > 0 && ` (${formatFileSize(files.reduce((total, f) => total + f.size, 0))} total)`}
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
                className="border-grey-600 text-grey-300 hover:bg-grey-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Process
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FileUploadModal