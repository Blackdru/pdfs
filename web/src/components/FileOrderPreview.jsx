import { useState } from 'react'
import { X, GripVertical, FileText, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from './ui/button'

const FileOrderPreview = ({ files, onReorder, onRemove, onConfirm, onCancel }) => {
  const [orderedFiles, setOrderedFiles] = useState(files)
  const [draggedIndex, setDraggedIndex] = useState(null)

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...orderedFiles]
    const draggedFile = newFiles[draggedIndex]
    
    // Remove from old position
    newFiles.splice(draggedIndex, 1)
    
    // Insert at new position
    newFiles.splice(index, 0, draggedFile)
    
    setOrderedFiles(newFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const moveUp = (index) => {
    if (index === 0) return
    
    const newFiles = [...orderedFiles]
    const temp = newFiles[index]
    newFiles[index] = newFiles[index - 1]
    newFiles[index - 1] = temp
    
    setOrderedFiles(newFiles)
  }

  const moveDown = (index) => {
    if (index === orderedFiles.length - 1) return
    
    const newFiles = [...orderedFiles]
    const temp = newFiles[index]
    newFiles[index] = newFiles[index + 1]
    newFiles[index + 1] = temp
    
    setOrderedFiles(newFiles)
  }

  const removeFile = (index) => {
    const newFiles = orderedFiles.filter((_, i) => i !== index)
    setOrderedFiles(newFiles)
    if (onRemove) {
      onRemove(index)
    }
  }

  const handleConfirm = () => {
    if (onReorder) {
      onReorder(orderedFiles)
    }
    if (onConfirm) {
      onConfirm(orderedFiles)
    }
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />
    }
    return <FileText className="w-8 h-8 text-red-500" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Arrange Files Order
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Drag and drop files to reorder them, or use the arrow buttons. The order will be used for processing.
          </p>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {orderedFiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No files to display</p>
            </div>
          ) : (
            orderedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border-2 
                  ${draggedIndex === index 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                  }
                  hover:border-blue-300 dark:hover:border-blue-600
                  transition-all duration-200 cursor-move
                `}
              >
                {/* Drag Handle */}
                <div className="flex-shrink-0">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>

                {/* Order Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(file)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Move Up */}
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${index === 0
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                    title="Move up"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === orderedFiles.length - 1}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${index === orderedFiles.length - 1
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                    title="Move down"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {orderedFiles.length} file{orderedFiles.length !== 1 ? 's' : ''} selected
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={orderedFiles.length === 0}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileOrderPreview
