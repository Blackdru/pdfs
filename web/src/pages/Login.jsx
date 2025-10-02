import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { FileText, Mail, Lock, ArrowRight, Sparkles, Heart, Rocket, Shield } from 'lucide-react'
import GoogleIcon from '../components/icons/GoogleIcon'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/tools'

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await signIn(email, password)
    
    if (!error) {
      navigate(from, { replace: true })
    }
    
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className={`max-w-lg w-full space-y-10 relative z-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
       

        {/* Login Form */}
        <div className="dark-card p-10 bg-surface shadow-blue-lg">
          <div className="space-y-2 pb-8">
            <h3 className="heading-dark-4 text-center">Sign in to your account</h3>
            <p className="body-dark-small text-muted-foreground text-center">
              Enter your credentials to access your dashboard
            </p>
          </div>
          
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-card-foreground">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-secondary" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="dark-input pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="block text-sm font-semibold text-card-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-secondary" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="dark-input pl-12"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-blue text-lg py-4 h-auto font-semibold" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="loading-dark mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Rocket className="mr-3 h-5 w-5" />
                    Sign in
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-surface px-4 text-secondary font-semibold">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 text-lg py-4 h-auto font-semibold transition-all duration-200"
            >
              <GoogleIcon className="mr-3 h-5 w-5" />
              Continue with Google
            </Button>

            <div className="text-center space-y-6">
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
              >
                Forgot your password?
              </Link>
              
              <p className="body-dark-small text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-3 text-muted-foreground">
          <Shield className="h-5 w-5 text-green-400" />
          <span className="text-sm font-medium">Bank-level security & encryption</span>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-secondary leading-relaxed">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-blue-400 transition-colors duration-200">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-blue-400 transition-colors duration-200">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login