import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { formatFileSize, formatDate, getFileIcon } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Download,
  Trash2,
  Eye,
  MoreHorizontal,
  HardDrive,
  Activity,
  Files,
  GitMerge,
  Bot,
  Brain,
  MessageSquare,
  Zap,
  FolderOpen,
  Sparkles,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs'
import FileUpload from '../components/FileUpload'
import FileManager from '../components/FileManager'
import BatchProcessor from '../components/BatchProcessor'
import AIAssistant from '../components/AIAssistant'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showUpload, setShowUpload] = useState(false)
  const [showBatchProcessor, setShowBatchProcessor] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [filesResponse, statsResponse] = await Promise.all([
        api.getFiles(1, 50),
        api.getUserStats()
      ])
      
      setFiles(filesResponse.files || [])
      setStats(statsResponse.stats || {
        totalFiles: 0,
        totalStorage: 0,
        recentActivity: 0,
        storageLimit: 1024 * 1024 * 1024 * 5,
        filesLimit: 1000
      })
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error('Dashboard load error:', error)
      // Set default stats on error
      setStats({
        totalFiles: 0,
        totalStorage: 0,
        recentActivity: 0,
        storageLimit: 1024 * 1024 * 1024 * 5,
        filesLimit: 1000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    setShowUpload(false)
    loadDashboardData()
  }

  const handleOpenAIAssistant = (file) => {
    setSelectedFile(file)
    setShowAIAssistant(true)
  }

  if (loading && !files.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page mobile-container mobile-spacing-dark py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mobile-flex-col space-y-4 sm:space-y-0 sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="mobile-text-2xl font-bold mb-2 text-foreground break-words">
              Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="mobile-text-sm text-muted-foreground">
              Manage your PDF files with AI-powered tools
            </p>
          </div>
          <div className="flex flex-col sm:flex-row mobile-gap w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowBatchProcessor(true)}
              className="w-full sm:w-auto btn-dark-outline mobile-btn-sm mobile-touch-target"
            >
              <Zap className="mr-2 mobile-icon flex-shrink-0" />
              <span className="truncate">Batch Process</span>
            </Button>
            <Button 
              onClick={() => setShowUpload(true)}
              className="w-full sm:w-auto btn-blue mobile-btn-sm mobile-touch-target"
            >
              <Upload className="mr-2 mobile-icon flex-shrink-0" />
              <span className="truncate">Upload Files</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="mobile-card-compact overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">Total Files</CardTitle>
              <Files className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-base sm:text-lg lg:text-2xl font-bold">{stats.totalFiles}</div>
              <p className="text-xs text-muted-foreground truncate">
                {stats.filesLimit - stats.totalFiles} left
              </p>
            </CardContent>
          </Card>

          <Card className="mobile-card-compact overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">Storage</CardTitle>
              <HardDrive className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-base sm:text-lg lg:text-2xl font-bold truncate">{formatFileSize(stats.totalStorage)}</div>
              <p className="text-xs text-muted-foreground truncate">
                / {formatFileSize(stats.storageLimit)}
              </p>
            </CardContent>
          </Card>

          <Card className="mobile-card-compact overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">AI Files</CardTitle>
              <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-base sm:text-lg lg:text-2xl font-bold">
                {files.filter(f => f.has_ocr || f.has_summary || f.has_embeddings).length}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Enhanced
              </p>
            </CardContent>
          </Card>

          <Card className="mobile-card-compact overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">Activity</CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-base sm:text-lg lg:text-2xl font-bold">{stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground truncate">
                this month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center justify-center px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 mb-1 sm:mb-0 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex flex-col sm:flex-row items-center justify-center px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm">
                <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 mb-1 sm:mb-0 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Files</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex flex-col sm:flex-row items-center justify-center px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mb-1 sm:mb-0 sm:mr-2 flex-shrink-0" />
                <span className="truncate">AI</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex flex-col sm:flex-row items-center justify-center px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mb-1 sm:mb-0 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Recent</span>
              </TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card className="mobile-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Common tasks and workflows</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Button variant="outline" className="h-16 sm:h-20 flex-col mobile-touch-target text-xs sm:text-sm" onClick={() => setShowUpload(true)}>
                  <Upload className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="truncate">Upload</span>
                </Button>
                <Button variant="outline" className="h-16 sm:h-20 flex-col mobile-touch-target text-xs sm:text-sm" onClick={() => setActiveTab('files')}>
                  <FolderOpen className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="truncate">Browse</span>
                </Button>
                <Button variant="outline" className="h-16 sm:h-20 flex-col mobile-touch-target text-xs sm:text-sm" onClick={() => setShowBatchProcessor(true)}>
                  <Zap className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="truncate">Batch</span>
                </Button>
                <Button variant="outline" className="h-16 sm:h-20 flex-col mobile-touch-target text-xs sm:text-sm" onClick={() => setActiveTab('ai')}>
                  <Bot className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="truncate">AI Tools</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Files */}
          <Card className="mobile-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Recent Files</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your recently uploaded and processed files</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {files.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <FileText className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">No files yet</p>
                  <Button size="sm" onClick={() => setShowUpload(true)} className="mobile-btn-sm mobile-touch-target">
                    Upload Your First File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.slice(0, 5).map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-muted/50 mobile-touch-target">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="text-base sm:text-xl flex-shrink-0">{getFileIcon(file.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{file.filename}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                            <p className="text-xs text-muted-foreground truncate">
                              {formatFileSize(file.size)} • {formatDate(file.created_at)}
                            </p>
                            <div className="flex space-x-1 mt-1 sm:mt-0">
                              {file.has_ocr && <Badge variant="secondary" className="text-xs px-1 py-0">OCR</Badge>}
                              {file.has_summary && <Badge variant="secondary" className="text-xs px-1 py-0">Summary</Badge>}
                              {file.has_embeddings && <Badge variant="secondary" className="text-xs px-1 py-0">Chat</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAIAssistant(file)}
                        className="ml-2 flex-shrink-0 mobile-touch-target"
                      >
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                  {files.length > 5 && (
                    <Button variant="outline" className="w-full mobile-btn-sm mobile-touch-target" onClick={() => setActiveTab('files')}>
                      View All Files ({files.length})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <FileManager onUpload={() => setShowUpload(true)} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {/* AI Features Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  OCR & Text Extraction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Extract searchable text from scanned PDFs and images
                </p>
                <div className="text-2xl font-bold mb-2">
                  {files.filter(f => f.has_ocr).length}
                </div>
                <p className="text-xs text-muted-foreground">files processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  AI Summaries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate intelligent summaries of your documents
                </p>
                <div className="text-2xl font-bold mb-2">
                  {files.filter(f => f.has_summary).length}
                </div>
                <p className="text-xs text-muted-foreground">summaries created</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  PDF Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with your PDFs using AI-powered conversations
                </p>
                <div className="text-2xl font-bold mb-2">
                  {files.filter(f => f.has_embeddings).length}
                </div>
                <p className="text-xs text-muted-foreground">chat-ready files</p>
              </CardContent>
            </Card>
          </div>

          {/* AI-Processed Files */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Enhanced Files</CardTitle>
              <CardDescription>Files with AI features enabled</CardDescription>
            </CardHeader>
            <CardContent>
              {files.filter(f => f.has_ocr || f.has_summary || f.has_embeddings).length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No AI-processed files yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Upload files and use AI features to enhance them
                  </p>
                  <Button size="sm" onClick={() => setShowUpload(true)}>
                    Upload Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.filter(f => f.has_ocr || f.has_summary || f.has_embeddings).map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{getFileIcon(file.type)}</div>
                        <div>
                          <p className="font-medium text-sm">{file.filename}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {file.has_ocr && (
                              <Badge variant="secondary" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                OCR
                              </Badge>
                            )}
                            {file.has_summary && (
                              <Badge variant="secondary" className="text-xs">
                                <Brain className="h-3 w-3 mr-1" />
                                Summary
                              </Badge>
                            )}
                            {file.has_embeddings && (
                              <Badge variant="secondary" className="text-xs">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Chat
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAIAssistant(file)}
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        AI Assistant
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent file operations and AI processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.slice(0, 10).map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{getFileIcon(file.type)}</div>
                      <div>
                        <p className="font-medium text-sm">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(file.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.has_ocr && <Eye className="h-4 w-4 text-green-500" />}
                      {file.has_summary && <Brain className="h-4 w-4 text-blue-500" />}
                      {file.has_embeddings && <MessageSquare className="h-4 w-4 text-purple-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      {showUpload && (
        <FileUpload
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Batch Processor */}
      {showBatchProcessor && (
        <BatchProcessor
          files={files}
          onClose={() => setShowBatchProcessor(false)}
        />
      )}

      {/* AI Assistant */}
      {showAIAssistant && selectedFile && (
        <AIAssistant
          fileId={selectedFile.id}
          fileName={selectedFile.filename}
          isOpen={showAIAssistant}
          onClose={() => {
            setShowAIAssistant(false)
            setSelectedFile(null)
          }}
        />
      )}
      </div>
    </div>
  )
}

export default Dashboard