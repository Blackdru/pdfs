import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Button } from './ui/button'
import toast from 'react-hot-toast'
import { 
  FileText, 
  FolderOpen,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  Star,
  Share,
  Copy,
  Calendar,
  FileIcon,
  Image as ImageIcon,
  Archive,
  Layers,
  Rocket
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const FileManager = () => {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [folders, setFolders] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [sortBy, setSortBy] = useState('date') // 'name', 'date', 'size', 'type'
  const [filterType, setFilterType] = useState('all') // 'all', 'pdf', 'image', 'document'
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFiles()
  }, [user])

  const loadFiles = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await api.getFiles(1, 100) // Get first 100 files
      
      // Transform API response to match component structure
      const transformedFiles = response.files.map(file => ({
        id: file.id,
        name: file.filename,
        type: getFileTypeFromMimeType(file.type),
        size: file.size,
        createdAt: file.created_at,
        modifiedAt: file.updated_at,
        thumbnail: null,
        starred: false, // TODO: Add starred field to API
        shared: false, // TODO: Add shared field to API
        has_ocr: file.has_ocr,
        has_summary: file.has_summary,
        has_embeddings: file.has_embeddings
      }))
      
      setFiles(transformedFiles)
      
      // TODO: Load folders from API when folder feature is implemented
      setFolders([])
      
    } catch (error) {
      console.error('Error loading files:', error)
      toast.error('Failed to load files')
      setFiles([])
    } finally {
      setIsLoading(false)
    }
  }

  const getFileTypeFromMimeType = (mimeType) => {
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive'
    return 'document'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return FileText
      case 'image':
        return ImageIcon
      case 'archive':
        return Archive
      default:
        return FileIcon
    }
  }

  const getFileColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'text-red-400 bg-red-950'
      case 'image':
        return 'text-green-400 bg-green-950'
      case 'archive':
        return 'text-purple-400 bg-purple-950'
      default:
        return 'text-grey-400 bg-grey-800'
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || file.type === filterType
    return matchesSearch && matchesFilter
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        return b.size - a.size
      case 'type':
        return a.type.localeCompare(b.type)
      case 'date':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === sortedFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(sortedFiles.map(file => file.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return
    
    try {
      // Delete files from API
      for (const fileId of selectedFiles) {
        await api.deleteFile(fileId)
      }
      
      // Remove from local state
      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)))
      setSelectedFiles([])
      toast.success(`${selectedFiles.length} file(s) deleted successfully`)
    } catch (error) {
      console.error('Error deleting files:', error)
      toast.error('Failed to delete files')
    }
  }

  const handleStarFile = (fileId) => {
    // TODO: Implement star/favorite functionality in API
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, starred: !file.starred } : file
    ))
    toast.success('File starred status updated')
  }

  const handleDownloadFile = async (fileId, filename) => {
    try {
      const blob = await api.downloadFile(fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('File downloaded successfully')
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Failed to download file')
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      await api.deleteFile(fileId)
      setFiles(prev => prev.filter(file => file.id !== fileId))
      toast.success('File deleted successfully')
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-grey-800 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-grey-800 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="dark-card p-6">
                <div className="h-32 bg-grey-800 rounded-2xl mb-4"></div>
                <div className="h-4 bg-grey-800 rounded mb-2"></div>
                <div className="h-3 bg-grey-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="inline-flex items-center px-6 py-3 bg-gradient-blue text-white rounded-full text-sm font-semibold mb-4">
              <Layers className="h-5 w-5 mr-2" />
              File Management
            </div>
            <h1 className="heading-dark-2 mb-3">File Manager</h1>
            <p className="body-dark-large text-grey-400">
              Manage your PDF documents and files with advanced organization tools
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Button className="btn-blue">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-grey-500" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dark-input pl-12"
            />
          </div>
          
          <div className="flex space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="btn-dark-outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dropdown-dark">
                <DropdownMenuItem onClick={() => setFilterType('all')} className="dropdown-item-dark">
                  All Files
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('pdf')} className="dropdown-item-dark">
                  PDF Files
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('image')} className="dropdown-item-dark">
                  Images
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('document')} className="dropdown-item-dark">
                  Documents
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="btn-dark-outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dropdown-dark">
                <DropdownMenuItem onClick={() => setSortBy('date')} className="dropdown-item-dark">
                  Date Modified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')} className="dropdown-item-dark">
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('size')} className="dropdown-item-dark">
                  File Size
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('type')} className="dropdown-item-dark">
                  File Type
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border border-grey-700 rounded-xl bg-grey-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`rounded-r-none ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-grey-400 hover:text-grey-200'}`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-l-none border-l border-grey-700 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-grey-400 hover:text-grey-200'}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Selection Actions */}
        {selectedFiles.length > 0 && (
          <div className="dark-card p-6 mb-8 bg-blue-950 border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-blue-300 font-semibold">
                  {selectedFiles.length} file(s) selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-blue-300 hover:text-blue-200 hover:bg-blue-900"
                >
                  {selectedFiles.length === sortedFiles.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    selectedFiles.forEach(fileId => {
                      const file = files.find(f => f.id === fileId)
                      if (file) handleDownloadFile(file.id, file.name)
                    })
                  }}
                  className="text-blue-300 hover:text-blue-200 hover:bg-blue-900"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-300 hover:text-blue-200 hover:bg-blue-900">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDeleteSelected}
                  className="text-red-400 hover:text-red-300 hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div>
          <h2 className="heading-dark-4 mb-6">Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map((folder) => (
              <div key={folder.id} className="dark-card-hover p-6 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-blue-900 rounded-2xl">
                    <FolderOpen className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-grey-200 truncate">{folder.name}</h3>
                    <p className="text-sm text-grey-400">
                      {folder.fileCount} files
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <h2 className="heading-dark-4 mb-6">
          Files ({sortedFiles.length})
        </h2>

        {sortedFiles.length === 0 ? (
          <div className="dark-card p-16 text-center">
            <div className="p-6 bg-grey-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <FileText className="h-12 w-12 text-grey-400" />
            </div>
            <h3 className="heading-dark-3 mb-4">No files found</h3>
            <p className="body-dark text-grey-400 mb-8">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first file to get started'
              }
            </p>
            <Button className="btn-blue">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-3'
          }>
            {sortedFiles.map((file) => {
              const FileIconComponent = getFileIcon(file.type)
              const isSelected = selectedFiles.includes(file.id)
              
              return viewMode === 'grid' ? (
                <div 
                  key={file.id}
                  className={`dark-card-hover p-6 cursor-pointer relative ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-950 shadow-blue' : ''
                  }`}
                  onClick={() => handleFileSelect(file.id)}
                >
                  {/* Selection checkbox */}
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFileSelect(file.id)}
                      className="rounded border-grey-600 bg-grey-800 text-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Star button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStarFile(file.id)
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-grey-700 transition-colors duration-200"
                  >
                    <Star className={`h-4 w-4 ${
                      file.starred ? 'text-blue-400 fill-current' : 'text-grey-500'
                    }`} />
                  </button>

                  {/* File preview */}
                  <div className="flex items-center justify-center h-32 mb-6 bg-grey-800 rounded-2xl">
                    <div className={`p-4 rounded-2xl ${getFileColor(file.type)}`}>
                      <FileIconComponent className="h-12 w-12" />
                    </div>
                  </div>

                  {/* File info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-grey-200 truncate" title={file.name}>
                      {file.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-grey-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                    {file.shared && (
                      <div className="flex items-center text-xs text-blue-400">
                        <Share className="h-3 w-3 mr-1" />
                        Shared
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex space-x-2">
                    <Button variant="ghost" size="sm" className="flex-1 btn-dark-glass">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-3 btn-dark-glass">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="dropdown-dark">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadFile(file.id, file.name)
                          }}
                          className="dropdown-item-dark"
                        >
                          <Download className="mr-3 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="dropdown-item-dark">
                          <Copy className="mr-3 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem className="dropdown-item-dark">
                          <Share className="mr-3 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteFile(file.id)
                          }}
                          className="dropdown-item-dark text-red-400 hover:bg-red-950"
                        >
                          <Trash2 className="mr-3 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ) : (
                <div 
                  key={file.id}
                  className={`dark-card p-6 cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-950 shadow-blue' : ''
                  }`}
                  onClick={() => handleFileSelect(file.id)}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFileSelect(file.id)}
                      className="rounded border-grey-600 bg-grey-800 text-blue-500 focus:ring-blue-500"
                    />
                    
                    <div className={`p-3 rounded-xl ${getFileColor(file.type)}`}>
                      <FileIconComponent className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-grey-200 truncate">{file.name}</h3>
                        {file.starred && (
                          <Star className="h-4 w-4 text-blue-400 fill-current flex-shrink-0" />
                        )}
                        {file.shared && (
                          <Share className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-grey-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.createdAt)}</span>
                        <span className="capitalize">{file.type}</span>
                        {file.has_ocr && (
                          <span className="text-green-400 text-xs">OCR</span>
                        )}
                        {file.has_summary && (
                          <span className="text-blue-400 text-xs">Summary</span>
                        )}
                        {file.has_embeddings && (
                          <span className="text-purple-400 text-xs">AI Ready</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="btn-dark-glass">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadFile(file.id, file.name)
                        }}
                        className="btn-dark-glass"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-3 btn-dark-glass">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="dropdown-dark">
                          <DropdownMenuItem className="dropdown-item-dark">
                            <Copy className="mr-3 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem className="dropdown-item-dark">
                            <Share className="mr-3 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFile(file.id)
                            }}
                            className="dropdown-item-dark text-red-400 hover:bg-red-950"
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FileManager