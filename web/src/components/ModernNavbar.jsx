import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { 
  FileText, 
  User, 
  Settings, 
  LogOut,
  Shield,
  GitMerge,
  Scissors,
  Archive,
  Image,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Zap,
  CreditCard,
  ArrowUpCircle,
  FolderOpen,
  Home,
  Star,
  Sparkles,
  Rocket,
  Heart
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const ModernNavbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActivePath = (path) => location.pathname === path

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/files', label: 'Files', icon: FolderOpen },
    { path: '/tools', label: 'Tools', icon: GitMerge },
    { path: '/advanced-tools', label: 'Pro Tools', icon: Sparkles, isPro: true },
  ]

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-grey-900 border-b border-grey-800 shadow-lg' 
            : 'bg-grey-950'
        }`}
      >
        <div className="layout-dark-container">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-blue rounded-3xl blur-xl scale-110" />
                <div className="relative bg-gradient-blue p-4 rounded-3xl shadow-blue group-hover:scale-105 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-gradient-grey font-poppins">
                  PDFPet
                </span>
                <span className="text-xs text-grey-500 -mt-1 font-semibold hidden sm:block">
                  ✨ AI-Powered Document Magic
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {user && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-dark-link ${
                    isActivePath(item.path) ? 'nav-dark-active' : 'nav-dark-inactive'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-semibold">{item.label}</span>
                  {item.isPro && (
                    <Star className="h-4 w-4 text-blue-400 fill-current" />
                  )}
                </Link>
              ))}

              {/* Quick Tools Dropdown */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="nav-dark-link nav-dark-inactive">
                      <Zap className="h-5 w-5" />
                      <span className="font-semibold">Quick Tools</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="dropdown-dark">
                    <div className="p-3">
                      <div className="caption-dark mb-4 px-2">PDF Operations</div>
                      <DropdownMenuItem 
                        onClick={() => navigate('/tools')}
                        className="dropdown-item-dark"
                      >
                        <GitMerge className="mr-4 h-5 w-5 text-blue-400" />
                        <div>
                          <div className="font-semibold">Merge PDFs</div>
                          <div className="text-xs text-grey-500">Combine multiple files</div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/tools')}
                        className="dropdown-item-dark"
                      >
                        <Scissors className="mr-4 h-5 w-5 text-green-400" />
                        <div>
                          <div className="font-semibold">Split PDFs</div>
                          <div className="text-xs text-grey-500">Extract pages</div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/tools')}
                        className="dropdown-item-dark"
                      >
                        <Archive className="mr-4 h-5 w-5 text-purple-400" />
                        <div>
                          <div className="font-semibold">Compress PDFs</div>
                          <div className="text-xs text-grey-500">Reduce file size</div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/tools')}
                        className="dropdown-item-dark"
                      >
                        <Image className="mr-4 h-5 w-5 text-orange-400" />
                        <div>
                          <div className="font-semibold">Convert Images</div>
                          <div className="text-xs text-grey-500">Images to PDF</div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-3" />
                      <DropdownMenuItem 
                        onClick={() => navigate('/advanced-tools')}
                        className="dropdown-item-dark bg-blue-950 hover:bg-blue-900"
                      >
                        <Sparkles className="mr-4 h-5 w-5 text-blue-400" />
                        <div>
                          <div className="font-semibold flex items-center text-blue-300">
                            Professional Tools
                            <Star className="ml-2 h-4 w-4 text-blue-400 fill-current" />
                          </div>
                          <div className="text-xs text-blue-400">Advanced AI features</div>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                /* User Menu */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-12 px-4 rounded-2xl hover:bg-grey-800 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-blue flex items-center justify-center shadow-blue">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-semibold text-grey-200">
                          {user.user_metadata?.name || 'User'}
                        </div>
                        <div className="text-xs text-grey-500">
                          {user.user_metadata?.role === 'admin' ? 'Administrator' : 'Member'}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-grey-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dropdown-dark w-72">
                    <div className="p-4 border-b border-grey-800">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-blue flex items-center justify-center shadow-blue">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-grey-200">
                            {user.user_metadata?.name || user.email}
                          </p>
                          <p className="text-xs text-grey-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <DropdownMenuItem 
                        onClick={() => navigate('/dashboard')}
                        className="dropdown-item-dark"
                      >
                        <LayoutDashboard className="mr-4 h-5 w-5 text-blue-400" />
                        <span className="font-semibold">Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/profile')}
                        className="dropdown-item-dark"
                      >
                        <Settings className="mr-4 h-5 w-5 text-grey-400" />
                        <span className="font-semibold">Profile Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/billing')}
                        className="dropdown-item-dark"
                      >
                        <CreditCard className="mr-4 h-5 w-5 text-green-400" />
                        <span className="font-semibold">Billing & Usage</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/upgrade')}
                        className="dropdown-item-dark bg-purple-950 hover:bg-purple-900"
                      >
                        <ArrowUpCircle className="mr-4 h-5 w-5 text-purple-400" />
                        <div>
                          <div className="font-semibold flex items-center text-purple-300">
                            Upgrade Plan
                            <Star className="ml-2 h-4 w-4 text-purple-400 fill-current" />
                          </div>
                          <div className="text-xs text-purple-400">Unlock premium features</div>
                        </div>
                      </DropdownMenuItem>
                      {user.user_metadata?.role === 'admin' && (
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin')}
                          className="dropdown-item-dark"
                        >
                          <Shield className="mr-4 h-5 w-5 text-orange-400" />
                          <span className="font-semibold">Admin Panel</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="my-3" />
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="dropdown-item-dark text-red-400 hover:bg-red-950 hover:text-red-300"
                      >
                        <LogOut className="mr-4 h-5 w-5" />
                        <span className="font-semibold">Sign Out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* Auth Buttons */
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" asChild className="btn-dark-outline">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="btn-blue">
                    <Link to="/register">
                      <Rocket className="mr-2 h-4 w-4" />
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="h-12 w-12 rounded-2xl hover:bg-grey-800"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-grey-900 border-b border-grey-800 shadow-lg md:hidden animate-slide-down-fade">
          <div className="layout-dark-container py-8">
            {user && (
              <div className="space-y-3 mb-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                      isActivePath(item.path)
                        ? 'text-blue-300 bg-blue-950 shadow-sm'
                        : 'text-grey-400 hover:text-grey-200 hover:bg-grey-800'
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    <span>{item.label}</span>
                    {item.isPro && (
                      <Star className="h-4 w-4 text-blue-400 fill-current" />
                    )}
                  </Link>
                ))}
              </div>
            )}

            {!user && (
              <div className="flex flex-col space-y-4">
                <Button 
                  variant="ghost" 
                  asChild 
                  className="btn-dark-outline justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button 
                  asChild 
                  className="btn-blue"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/register">
                    <Rocket className="mr-2 h-4 w-4" />
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {user && (
        <div className="mobile-nav-dark md:hidden">
          <div className="mobile-nav-grid-dark">
            <Link
              to="/dashboard"
              className={isActivePath('/dashboard') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
            >
              <LayoutDashboard className="h-6 w-6" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/files"
              className={isActivePath('/files') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
            >
              <FolderOpen className="h-6 w-6" />
              <span>Files</span>
            </Link>
            <Link
              to="/tools"
              className={isActivePath('/tools') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
            >
              <GitMerge className="h-6 w-6" />
              <span>Tools</span>
            </Link>
            <Link
              to="/profile"
              className={isActivePath('/profile') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
            >
              <User className="h-6 w-6" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  )
}

export default ModernNavbar