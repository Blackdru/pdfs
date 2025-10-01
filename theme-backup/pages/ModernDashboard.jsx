import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
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

  useEffect(() => {
    setIsVisible(true)
    // Simulate loading recent files and stats
    setRecentFiles([
      { id: 1, name: 'Project_Report.pdf', size: '2.4 MB', date: '2 hours ago', type: 'pdf' },
      { id: 2, name: 'Invoice_2024.pdf', size: '1.2 MB', date: '1 day ago', type: 'pdf' },
      { id: 3, name: 'Presentation.pdf', size: '5.8 MB', date: '3 days ago', type: 'pdf' },
      { id: 4, name: 'Contract.pdf', size: '890 KB', date: '1 week ago', type: 'pdf' },
    ])

    setStats({
      totalFiles: 24,
      filesThisMonth: 12,
      storageUsed: 45.2,
      toolsUsed: 8
    })
  }, [])

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
    <div className="min-h-screen bg-grey-950 mobile-spacing-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-950 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-950 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="layout-dark-container py-12 relative">
        {/* Header */}
        <div className={`mb-12 ${isVisible ? 'animate-slide-down-fade' : ''}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="heading-dark-2 mb-3">
                Welcome back, <span className="text-gradient-blue">{user?.user_metadata?.name || 'User'}</span>! 
                <span className="inline-block ml-2">👋</span>
              </h1>
              <p className="body-dark text-grey-400">
                Manage your documents and unleash the power of intelligent PDF processing
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-4">
              <Button 
                onClick={() => navigate('/files')}
                className="btn-dark-outline"
              >
                <FolderOpen className="h-5 w-5 mr-2" />
                My Files
              </Button>
              <Button 
                onClick={() => navigate('/tools')}
                className="btn-blue"
              >
                <Rocket className="h-5 w-5 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 ${isVisible ? 'animate-slide-up-fade' : ''}`}>
          <div className="dark-card-hover p-8 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-dark-small text-grey-500 mb-2">Total Files</p>
                <p className="text-3xl font-bold text-grey-200 group-hover:text-blue-400 transition-colors duration-300">{stats.totalFiles}</p>
              </div>
              <div className="p-4 bg-blue-900 rounded-2xl group-hover:bg-blue-800 transition-all duration-300 group-hover:scale-110">
                <FileText className="h-7 w-7 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="dark-card-hover p-8 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-dark-small text-grey-500 mb-2">This Month</p>
                <p className="text-3xl font-bold text-grey-200 group-hover:text-green-400 transition-colors duration-300">{stats.filesThisMonth}</p>
              </div>
              <div className="p-4 bg-green-900 rounded-2xl group-hover:bg-green-800 transition-all duration-300 group-hover:scale-110">
                <TrendingUp className="h-7 w-7 text-green-400" />
              </div>
            </div>
          </div>

          <div className="dark-card-hover p-8 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-dark-small text-grey-500 mb-2">Storage Used</p>
                <p className="text-3xl font-bold text-grey-200 group-hover:text-purple-400 transition-colors duration-300">{stats.storageUsed} MB</p>
              </div>
              <div className="p-4 bg-purple-900 rounded-2xl group-hover:bg-purple-800 transition-all duration-300 group-hover:scale-110">
                <BarChart3 className="h-7 w-7 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="dark-card-hover p-8 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-dark-small text-grey-500 mb-2">Tools Used</p>
                <p className="text-3xl font-bold text-grey-200 group-hover:text-orange-400 transition-colors duration-300">{stats.toolsUsed}</p>
              </div>
              <div className="p-4 bg-orange-900 rounded-2xl group-hover:bg-orange-800 transition-all duration-300 group-hover:scale-110">
                <Activity className="h-7 w-7 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Quick Actions */}
            <div className={`dark-card p-10 ${isVisible ? 'animate-slide-left-fade' : ''}`} style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-blue rounded-2xl mr-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="heading-dark-3">Quick Actions</h2>
                    <p className="body-dark-small text-grey-500">Start processing your documents</p>
                  </div>
                </div>
                <Link 
                  to="/tools" 
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center group"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    to={action.path}
                    className="group p-6 rounded-3xl border border-grey-800 hover:border-grey-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-grey-800"
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${action.bgColor} rounded-2xl mb-4 group-hover:scale-110 transition-all duration-300`}>
                      <action.icon className={`h-8 w-8 ${action.color}`} />
                    </div>
                    <h3 className="font-semibold text-grey-200 mb-2">{action.title}</h3>
                    <p className="text-sm text-grey-500">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Files */}
            <div className={`dark-card p-10 ${isVisible ? 'animate-slide-left-fade' : ''}`} style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-green rounded-2xl mr-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="heading-dark-3">Recent Files</h2>
                    <p className="body-dark-small text-grey-500">Your latest processed documents</p>
                  </div>
                </div>
                <Link 
                  to="/files" 
                  className="text-green-400 hover:text-green-300 font-semibold flex items-center group"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
              
              {recentFiles.length > 0 ? (
                <div className="space-y-4">
                  {recentFiles.map((file, index) => (
                    <div key={file.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-grey-800 transition-all duration-200 group">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-900 rounded-2xl group-hover:bg-purple-800 transition-colors duration-200">
                          <FileText className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-grey-200 group-hover:text-grey-100 transition-colors duration-200">{file.name}</p>
                          <p className="text-sm text-grey-500">{file.size} • {file.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="p-3 rounded-xl hover:bg-grey-700">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-3 rounded-xl hover:bg-grey-700">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-6 bg-grey-800 rounded-3xl inline-block mb-6">
                    <FileText className="h-12 w-12 text-grey-500 mx-auto" />
                  </div>
                  <p className="body-dark text-grey-400 mb-6">No recent files yet</p>
                  <Button onClick={() => navigate('/tools')} className="btn-blue">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Your First File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Usage Card */}
            {usage && (
              <div className={`dark-card p-8 ${isVisible ? 'animate-slide-right-fade' : ''}`} style={{ animationDelay: '300ms' }}>
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-purple rounded-2xl mr-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="heading-dark-4">Usage This Month</h3>
                    <p className="body-dark-small text-grey-500">Track your progress</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-grey-400 font-medium">Files Processed</span>
                      <span className="font-semibold text-grey-200">{usage.current}/{usage.limit}</span>
                    </div>
                    <div className="progress-dark">
                      <div 
                        className="progress-fill-blue" 
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {subscription?.plan === 'free' && (
                    <div className="pt-6 border-t border-grey-800">
                      <p className="body-dark-small text-grey-400 mb-4">
                        Upgrade for unlimited processing and premium features
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
            <div className={`dark-card p-8 ${isVisible ? 'animate-slide-right-fade' : ''}`} style={{ animationDelay: '500ms' }}>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-orange rounded-2xl mr-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="heading-dark-4">Pro Features</h3>
                  <p className="body-dark-small text-grey-500">Unlock advanced tools</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {proFeatures.map((feature, index) => (
                  <Link
                    key={feature.title}
                    to={feature.path}
                    className="flex items-center p-4 rounded-2xl hover:bg-grey-800 transition-all duration-300 group"
                  >
                    <div className={`p-3 ${feature.bgColor} rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-grey-200 group-hover:text-grey-100 transition-colors duration-200">{feature.title}</p>
                      <p className="text-sm text-grey-500">{feature.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-grey-600 group-hover:text-grey-400 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-grey-800">
                <Button 
                  onClick={() => navigate('/advanced-tools')} 
                  className="w-full btn-orange"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Explore Pro Tools
                </Button>
              </div>
            </div>

            {/* Tips Card */}
            <div className={`dark-card p-8 bg-blue-950 border-blue-800 ${isVisible ? 'animate-slide-right-fade' : ''}`} style={{ animationDelay: '700ms' }}>
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-blue rounded-2xl mr-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="heading-dark-4 text-blue-300">Pro Tip</h3>
                  <p className="body-dark-small text-blue-400">Boost your productivity</p>
                </div>
              </div>
              <p className="body-dark-small text-blue-300 mb-6 leading-relaxed">
                Use keyboard shortcuts to speed up your workflow. Press <kbd className="px-2 py-1 bg-blue-900 rounded text-xs font-mono">Ctrl+U</kbd> to quickly upload files!
              </p>
              <Button 
                variant="ghost" 
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900 p-0 h-auto font-semibold group"
              >
                Learn More Shortcuts
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernDashboard