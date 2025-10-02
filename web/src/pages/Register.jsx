import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { FileText, Mail, Lock, User, ArrowRight, Sparkles, Heart, CheckCircle, Shield, Rocket } from 'lucide-react'
import GoogleIcon from '../components/icons/GoogleIcon'
import toast from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [otp, setOtp] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const { signUp, verifyOTP, resendOTP, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const { error } = await signUp(formData.email, formData.password, formData.name)
    
    if (!error) {
      setRegisteredEmail(formData.email)
      setShowOTPVerification(true)
    }
    
    setLoading(false)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)

    const { error } = await verifyOTP(registeredEmail, otp)
    
    if (!error) {
      navigate('/dashboard')
    }
    
    setLoading(false)
  }

  const handleResendOTP = async () => {
    setLoading(true)
    await resendOTP(registeredEmail, 'verification')
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
  }

  const features = [
    "Unlimited PDF processing",
    "Cloud storage included",
    "Advanced security",
    "24/7 support"
  ]

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="max-w-lg w-full space-y-10 relative z-10">
        {/* Register Form */}
        <div className="dark-card p-10 bg-surface shadow-blue-lg">
          <div className="space-y-2 pb-8">
            <h3 className="heading-dark-4 text-center">
              {showOTPVerification ? 'Verify your email' : 'Create your account'}
            </h3>
            <p className="body-dark-small text-muted-foreground text-center">
              {showOTPVerification 
                ? `Enter the 6-digit code sent to ${registeredEmail}`
                : 'Get started with your free PDFPet account'
              }
            </p>
          </div>
          
          <div className="space-y-8">
            {showOTPVerification ? (
              <form onSubmit={handleVerifyOTP} className="space-y-8">
                <div className="space-y-3">
                  <label htmlFor="otp" className="block text-sm font-semibold text-card-foreground">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-secondary" />
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="dark-input pl-12 text-center text-2xl tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-blue text-lg py-4 h-auto font-semibold" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="loading-dark mr-3"></div>
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="mr-3 h-5 w-5" />
                      Verify Email
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <p className="body-dark-small text-muted-foreground mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Resend OTP
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowOTPVerification(false)
                      setOtp('')
                    }}
                    variant="ghost"
                    className="text-muted-foreground hover:text-card-foreground"
                  >
                    ← Back to registration
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="name" className="block text-sm font-semibold text-card-foreground">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-secondary" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="dark-input pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-card-foreground">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-secondary" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="dark-input pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-card-foreground">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-secondary" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
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
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Rocket className="mr-3 h-5 w-5" />
                    Create account
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </div>
                )}
              </Button>
              </form>
            )}

            {!showOTPVerification && (
              <>
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
              <p className="body-dark-small text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
                </div>
              </>
            )}
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
            By creating an account, you agree to our{' '}
            <Link to="/terms-conditions" className="underline hover:text-blue-400 transition-colors duration-200">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy-policy" className="underline hover:text-blue-400 transition-colors duration-200">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register