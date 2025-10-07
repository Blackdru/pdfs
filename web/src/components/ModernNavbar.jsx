import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
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
  Heart,
  DollarSign,
  Mail
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import ThemeToggle from './ThemeToggle'

const ModernNavbar = () => {
  const { user, signOut } = useAuth()
  const { subscription } = useSubscription()
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

  const publicNavItems = [
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
    { path: '/contact', label: 'Contact', icon: Mail },
  ]

  // Determine which nav items to show based on auth state
  const getVisibleNavItems = () => {
    if (user) return navItems
    // For non-auth users, show everything except Dashboard
    return navItems.filter(item => item.path !== '/dashboard')
  }

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-card border-b border-border shadow-lg' 
            : 'bg-background'
        }`}
      >
        <div className="layout-dark-container">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-blue rounded-2xl sm:rounded-3xl scale-110" />
                <div className="relative bg-white p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl group-hover:scale-105 transition-transform duration-300">
                  <img src="/logo.png" alt="RobotPDF Logo" className="h-6 w-6 sm:h-8 sm:w-8 object-contain" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-bold text-gradient-grey font-poppins">
                  RobotPDF
                </span>
                <span className="text-xs text-secondary -mt-1 font-semibold hidden lg:block">
                  ✨ AI-Powered Document Magic
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {getVisibleNavItems().map((item) => (
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

              {/* Public Navigation Items */}
              {publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-dark-link ${
                    isActivePath(item.path) ? 'nav-dark-active' : 'nav-dark-inactive'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Theme Toggle - Hidden on mobile */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              
              {user ? (
                /* User Menu */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-12 px-4 rounded-2xl hover:bg-elevated flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-blue flex items-center justify-center shadow-blue">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-semibold text-card-foreground">
                          {user.name || user.user_metadata?.name || 'User'}
                        </div>
                        <div className="text-xs text-secondary">
                          {(user.role || user.user_metadata?.role) === 'admin' ? 'Administrator' : 'Member'}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-secondary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dropdown-dark w-72">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-blue flex items-center justify-center shadow-blue">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">
                            {user.name || user.user_metadata?.name || user.email}
                          </p>
                          <p className="text-xs text-secondary">{user.email}</p>
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
                        <Settings className="mr-4 h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">Profile Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/billing')}
                        className="dropdown-item-dark"
                      >
                        <CreditCard className="mr-4 h-5 w-5 text-green-400" />
                        <span className="font-semibold">Billing & Usage</span>
                      </DropdownMenuItem>
                      {/* Only show Upgrade Plan for free users */}
                      {(!subscription?.plan || subscription?.plan === 'free') && (
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
                      )}
                      {(user.role === 'admin' || user.user_metadata?.role === 'admin') && (
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin')}
                          className="dropdown-item-dark bg-orange-950 hover:bg-orange-900"
                        >
                          <Shield className="mr-4 h-5 w-5 text-orange-400" />
                          <div>
                            <div className="font-semibold text-orange-300">Admin Panel</div>
                            <div className="text-xs text-orange-400">System management</div>
                          </div>
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
                /* Auth Buttons - Hidden on mobile */
                <div className="hidden md:flex items-center space-x-3">
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

                          </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-20 left-0 right-0 z-40 border-b border-border shadow-lg md:hidden animate-slide-down-fade" style={{ backgroundColor: 'rgb(15, 23, 42)' }}>
          <div className="layout-dark-container py-8">
            <div className="space-y-3 mb-8">
              {getVisibleNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    isActivePath(item.path)
                      ? 'text-blue-300 bg-blue-950 shadow-sm'
                      : 'text-grey-400 hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  <span>{item.label}</span>
                  {item.isPro && (
                    <Star className="h-4 w-4 text-blue-400 fill-current" />
                  )}
                </Link>
              ))}
              
              {/* Public Navigation Items */}
              {publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    isActivePath(item.path)
                      ? 'text-blue-300 bg-blue-950 shadow-sm'
                      : 'text-grey-400 hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {!user && (
              <div className="flex flex-col space-y-4">
                <Button 
                 
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
      <div className="mobile-nav-dark md:hidden">
        <div className="mobile-nav-grid-dark">
          {user ? (
            <>
              <Link
                to="/files"
                className={isActivePath('/files') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
              >
                <FolderOpen className="h-5 w-5" />
                <span className="text-xs">Files</span>
              </Link>
              <Link
                to="/tools"
                className={isActivePath('/tools') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
              >
                <GitMerge className="h-5 w-5" />
                <span className="text-xs">Tools</span>
              </Link>
              <Link
                to="/advanced-tools"
                className={isActivePath('/advanced-tools') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-xs">Pro</span>
              </Link>
              <Link
                to="/profile"
                className={isActivePath('/profile') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={isActivePath('/') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Home</span>
              </Link>
              <Link
                to="/tools"
                className={isActivePath('/tools') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
              >
                <GitMerge className="h-5 w-5" />
                <span className="text-xs">Tools</span>
              </Link>
              <Link
                to="/advanced-tools"
                className={isActivePath('/advanced-tools') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-xs">Pro Tools</span>
              </Link>
              <Link
                to="/contact"
                className={isActivePath('/contact') ? 'mobile-nav-item-dark-active' : 'mobile-nav-item-dark'}
              >
                <Mail className="h-5 w-5" />
                <span className="text-xs">Contact</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  )
}

export default ModernNavbar