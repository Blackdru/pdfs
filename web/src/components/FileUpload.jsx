import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { api } from '../lib/api'
import { validateFile, formatFileSize } from '../lib/utils'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { X, Upload, File, CheckCircle, AlertCircle, Rocket } from 'lucide-react'
import toast from 'react-hot-toast'

const FileUpload = ({ onClose, onSuccess, onUploadSuccess, multiple = true }) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Max size is 50MB.`)
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type.`)
        }
      })
    })

    // Process accepted files
    const newFiles = acceptedFiles.map(file => {
      const validation = validateFile(file, allowedTypes)
      return {
        file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: validation.isValid ? 'ready' : 'error',
        errors: validation.errors,
        progress: 0
      }
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/webp': ['.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple
  })

  const removeFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId))
  }

  const uploadFiles = async () => {
    const validFiles = files.filter(f => f.status === 'ready')
    
    if (validFiles.length === 0) {
      toast.error('No valid files to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let uploadedCount = 0
      const uploadedFiles = []
      
      for (const fileData of validFiles) {
        try {
          // Update file status to uploading
          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'uploading' } : f
          ))

          // Upload individual file
          const result = await api.uploadFile(fileData.file)
          
          // Update file status to success
          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'success' } : f
          ))
          
          uploadedCount++
          uploadedFiles.push(result.file)
          
          // Update progress
          const progress = (uploadedCount / validFiles.length) * 100
          setUploadProgress(progress)
          
        } catch (fileError) {
          console.error(`Error uploading ${fileData.name}:`, fileError)
          
          // Update file status to error
          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'error', error: fileError.message } : f
          ))
          
          toast.error(`Failed to upload ${fileData.name}: ${fileError.message}`)
        }
      }

      if (uploadedCount > 0) {
        toast.success(`${uploadedCount} file(s) uploaded successfully`)
        
        // Wait a moment then close
        setTimeout(() => {
          onSuccess?.(uploadedFiles)
        }, 1500)
      } else {
        toast.error('No files were uploaded successfully')
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed: ' + error.message)
      
      setFiles(prev => prev.map(f => 
        validFiles.find(vf => vf.id === f.id) ? { ...f, status: 'error' } : f
      ))
    } finally {
      setUploading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'uploading':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      default:
        return <File className="h-4 w-4 text-grey-400" />
    }
  }

  return (
    <div className="modal-dark-overlay">
      <Card className="modal-dark-content max-w-3xl">
        <CardHeader className="modal-dark-header flex flex-row items-center justify-between">
          <div>
            <CardTitle className="heading-dark-3 text-grey-100">Upload Files</CardTitle>
            <CardDescription className="text-grey-400 mt-2">
              Upload PDF, images, Word, or Excel files (max 50MB each)
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="btn-dark-glass">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="modal-dark-body space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`file-upload-dark cursor-pointer transition-all duration-300 ${
              isDragActive ? 'dragover' : ''
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-16 w-16 text-grey-400 mb-6" />
            {isDragActive ? (
              <div>
                <p className="heading-dark-4 text-blue-300 mb-2">Drop the files here...</p>
                <p className="text-blue-400">Release to upload your files</p>
              </div>
            ) : (
              <div>
                <p className="heading-dark-4 text-grey-200 mb-3">
                  Drag & drop files here, or click to select
                </p>
                <p className="body-dark-small text-grey-400 mb-6">
                  Supports PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
                </p>
                <Button className="btn-blue">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h4 className="heading-dark-4 text-grey-200">Selected Files</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-dark">
                {files.map((fileData) => (
                  <div
                    key={fileData.id}
                    className="flex items-center justify-between p-4 border border-grey-800 rounded-2xl bg-grey-800"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(fileData.status)}
                      <div>
                        <p className="font-semibold text-grey-200">{fileData.name}</p>
                        <p className="text-sm text-grey-400">
                          {formatFileSize(fileData.size)}
                        </p>
                        {fileData.errors?.length > 0 && (
                          <p className="text-sm text-red-400 mt-1">
                            {fileData.errors[0]}
                          </p>
                        )}
                        {fileData.error && (
                          <p className="text-sm text-red-400 mt-1">
                            {fileData.error}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {!uploading && fileData.status !== 'success' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(fileData.id)}
                        className="btn-dark-glass"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-grey-300 font-medium">Uploading files...</span>
                <span className="text-blue-400 font-bold">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="progress-dark">
                <div 
                  className="progress-fill-blue" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="modal-dark-footer">
            <Button variant="outline" onClick={onClose} disabled={uploading} className="btn-dark-outline">
              Cancel
            </Button>
            <Button 
              onClick={uploadFiles} 
              disabled={files.length === 0 || uploading || !files.some(f => f.status === 'ready')}
              className="btn-blue"
            >
              {uploading ? (
                <>
                  <div className="loading-dark mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Upload {files.filter(f => f.status === 'ready').length} file(s)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FileUpload