import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { api } from '../lib/api'
import { formatFileSize, formatDate } from '../lib/utils'
import { Button } from '../components/ui/button'
import { 
  FileText, 
  GitMerge, 
  Scissors, 
  Archive, 
  Image, 
  Plus,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Upload,
  FolderOpen,
  Zap,
  BarChart3,
  Calendar,
  Activity,
  Users,
  Download,
  Eye,
  Sparkles,
  Rocket,
  Heart,
  Award,
  Target,
  Layers,
  Palette
} from 'lucide-react'

const ModernDashboard = () => {
  const { user } = useAuth()
  const { subscription, usage } = useSubscription()
  const navigate = useNavigate()
  const [recentFiles, setRecentFiles] = useState([])
  const [stats, setStats] = useState({
    totalFiles: 0,
    filesThisMonth: 0,
    storageUsed: 0,
    toolsUsed: 0
  })
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsVisible(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [filesResponse, statsResponse] = await Promise.all([
        api.getFiles(1, 4),
        api.getUserStats()
      ])
      
      setRecentFiles(filesResponse.files || [])
      
      if (statsResponse.stats) {
        setStats({
          totalFiles: statsResponse.stats.totalFiles || 0,
          filesThisMonth: statsResponse.stats.recentActivity || 0,
          storageUsed: (statsResponse.stats.totalStorage || 0) / (1024 * 1024),
          toolsUsed: statsResponse.stats.toolsUsed || 0
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      icon: GitMerge,
      title: 'Smart Merge',
      description: 'Combine multiple files',
      path: '/tools',
      gradient: 'bg-gradient-blue',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900'
    },
    {
      icon: Scissors,
      title: 'Precision Split',
      description: 'Extract pages',
      path: '/tools',
      gradient: 'bg-gradient-green',
      color: 'text-green-400',
      bgColor: 'bg-green-900'
    },
    {
      icon: Archive,
      title: 'Ultra Compress',
      description: 'Reduce file size',
      path: '/tools',
      gradient: 'bg-gradient-purple',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900'
    },
    {
      icon: Image,
      title: 'Image Magic',
      description: 'Images to PDF',
      path: '/tools',
      gradient: 'bg-gradient-orange',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900'
    }
  ]

  const proFeatures = [
    {
      icon: Sparkles,
      title: 'AI Text Extraction',
      description: 'Extract text with AI precision',
      path: '/advanced-tools',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900'
    },
    {
      icon: Eye,
      title: 'Advanced OCR',
      description: 'Scan documents intelligently',
      path: '/advanced-tools',
      color: 'text-green-400',
      bgColor: 'bg-green-900'
    },
    {
      icon: Zap,
      title: 'Batch Processing',
      description: 'Process multiple files',
      path: '/advanced-tools',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900'
    }
  ]

  const usagePercentage = usage ? (usage.current / usage.limit) * 100 : 0

  return (
    <div className="min-h-screen bg-page mobile-spacing-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-950 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-950 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="layout-dark-container py-12 relative">
        {/* Header */}
        <div className={`mb-8 sm:mb-12 ${isVisible ? 'animate-slide-down-fade' : ''}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                Welcome back, <span className="text-gradient-blue break-words">{user?.user_metadata?.name || 'User'}</span>! 
                <span className="inline-block ml-2">👋</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your documents and unleash the power of intelligent PDF processing
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
              <Button 
                onClick={() => navigate('/files')}
                className="btn-dark-outline w-full sm:w-auto"
              >
                <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                My Files
              </Button>
              <Button 
                onClick={() => navigate('/tools')}
                className="btn-blue w-full sm:w-auto"
              >
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 ${isVisible ? 'animate-slide-up-fade' : ''}`}>
          <div className="dark-card-hover p-4 sm:p-6 lg:p-8 group overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-sm text-secondary mb-1 sm:mb-2 truncate">Total Files</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground group-hover:text-blue-400 transition-colors duration-300 truncate">{stats.totalFiles}</p>
              </div>
              <div className="p-2 sm:p-3 lg:p-4 bg-blue-900 rounded-xl sm:rounded-2xl group-hover:bg-blue-800 transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="dark-card-hover p-4 sm:p-6 lg:p-8 group overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-sm text-secondary mb-1 sm:mb-2 truncate">This Month</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground group-hover:text-green-400 transition-colors duration-300 truncate">{stats.filesThisMonth}</p>
              </div>
              <div className="p-2 sm:p-3 lg:p-4 bg-green-900 rounded-xl sm:rounded-2xl group-hover:bg-green-800 transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-400" />
              </div>
            </div>
          </div>

          <div className="dark-card-hover p-4 sm:p-6 lg:p-8 group overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-sm text-secondary mb-1 sm:mb-2 truncate">Storage</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground group-hover:text-purple-400 transition-colors duration-300 truncate">{stats.storageUsed.toFixed(1)} MB</p>
              </div>
              <div className="p-2 sm:p-3 lg:p-4 bg-purple-900 rounded-xl sm:rounded-2xl group-hover:bg-purple-800 transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="dark-card-hover p-4 sm:p-6 lg:p-8 group overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-sm text-secondary mb-1 sm:mb-2 truncate">Tools Used</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground group-hover:text-orange-400 transition-colors duration-300 truncate">{stats.toolsUsed}</p>
              </div>
              <div className="p-2 sm:p-3 lg:p-4 bg-orange-900 rounded-xl sm:rounded-2xl group-hover:bg-orange-800 transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 lg:space-y-12">
            {/* Quick Actions */}
            <div className={`dark-card p-4 sm:p-6 lg:p-10 ${isVisible ? 'animate-slide-left-fade' : ''}`} style={{ animationDelay: '200ms' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-gradient-blue rounded-xl sm:rounded-2xl mr-3 sm:mr-4 flex-shrink-0">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold truncate">Quick Actions</h2>
                    <p className="text-xs sm:text-sm text-secondary truncate">Start processing</p>
                  </div>
                </div>
                <Link 
                  to="/tools" 
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center group text-sm sm:text-base flex-shrink-0"
                >
                  View All
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    to={action.path}
                    className="group p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl border border-border hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-elevated overflow-hidden"
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 ${action.bgColor} rounded-xl sm:rounded-2xl mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-all duration-300 flex-shrink-0`}>
                      <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 ${action.color}`} />
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base truncate">{action.title}</h3>
                    <p className="text-xs sm:text-sm text-secondary truncate">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Files */}
            <div className={`dark-card p-4 sm:p-6 lg:p-10 ${isVisible ? 'animate-slide-left-fade' : ''}`} style={{ animationDelay: '400ms' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-gradient-green rounded-xl sm:rounded-2xl mr-3 sm:mr-4 flex-shrink-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold truncate">Recent Files</h2>
                    <p className="text-xs sm:text-sm text-secondary truncate">Latest documents</p>
                  </div>
                </div>
                <Link 
                  to="/files" 
                  className="text-green-400 hover:text-green-300 font-semibold flex items-center group text-sm sm:text-base flex-shrink-0"
                >
                  View All
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : recentFiles.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentFiles.map((file, index) => (
                    <div key={file.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-elevated transition-all duration-200 group overflow-hidden">
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
                        <div className="p-2 sm:p-3 bg-purple-900 rounded-xl sm:rounded-2xl group-hover:bg-purple-800 transition-colors duration-200 flex-shrink-0">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-card-foreground group-hover:text-foreground transition-colors duration-200 text-xs sm:text-sm lg:text-base truncate">{file.filename}</p>
                          <p className="text-xs sm:text-sm text-secondary truncate">{formatFileSize(file.size)} • {formatDate(file.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <Button variant="ghost" size="sm" className="p-2 sm:p-3 rounded-xl hover:bg-accent" onClick={() => navigate(`/files/${file.id}`)}>
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 sm:p-3 rounded-xl hover:bg-accent" onClick={async () => {
                          try {
                            const blob = await api.downloadFile(file.id)
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = file.filename
                            a.click()
                            window.URL.revokeObjectURL(url)
                          } catch (error) {
                            console.error('Download failed:', error)
                          }
                        }}>
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-6 bg-elevated rounded-3xl inline-block mb-6">
                    <FileText className="h-12 w-12 text-secondary mx-auto" />
                  </div>
                  <p className="body-dark text-muted-foreground mb-6">No recent files yet</p>
                  <Button onClick={() => navigate('/tools')} className="btn-blue">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Your First File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Usage Card */}
            {usage && (
              <div className={`dark-card p-4 sm:p-6 lg:p-8 ${isVisible ? 'animate-slide-right-fade' : ''}`} style={{ animationDelay: '300ms' }}>
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-purple rounded-xl sm:rounded-2xl mr-3 sm:mr-4 flex-shrink-0">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold truncate">Usage This Month</h3>
                    <p className="text-xs sm:text-sm text-secondary truncate">Track progress</p>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2 sm:mb-3">
                      <span className="text-muted-foreground font-medium truncate">Files Processed</span>
                      <span className="font-semibold text-card-foreground flex-shrink-0 ml-2">{usage.current}/{usage.limit}</span>
                    </div>
                    <div className="progress-dark">
                      <div 
                        className="progress-fill-blue" 
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {subscription?.plan === 'free' && (
                    <div className="pt-4 sm:pt-6 border-t border-border">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        Upgrade for unlimited processing
                      </p>
                      <Button 
                        onClick={() => navigate('/upgrade')} 
                        className="w-full btn-purple"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pro Features */}
            <div className={`dark-card p-4 sm:p-6 lg:p-8 ${isVisible ? 'animate-slide-right-fade' : ''}`} style={{ animationDelay: '500ms' }}>
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-gradient-orange rounded-xl sm:rounded-2xl mr-3 sm:mr-4 flex-shrink-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold truncate">Pro Features</h3>
                  <p className="text-xs sm:text-sm text-secondary truncate">Advanced tools</p>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {proFeatures.map((feature, index) => (
                  <Link
                    key={feature.title}
                    to={feature.path}
                    className="flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-elevated transition-all duration-300 group overflow-hidden"
                  >
                    <div className={`p-2 sm:p-3 ${feature.bgColor} rounded-xl sm:rounded-2xl mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      <feature.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${feature.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-card-foreground group-hover:text-foreground transition-colors duration-200 text-xs sm:text-sm lg:text-base truncate">{feature.title}</p>
                      <p className="text-xs sm:text-sm text-secondary truncate">{feature.description}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-grey-600 group-hover:text-muted-foreground group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                  </Link>
                ))}
              </div>
              
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                <Button 
                  onClick={() => navigate('/advanced-tools')} 
                  className="w-full btn-orange text-sm sm:text-base"
                >
                  <Rocket className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Explore Pro Tools
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernDashboard