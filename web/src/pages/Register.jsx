import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { FileText, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle, Shield, Zap, Star } from 'lucide-react'
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
  const [isVisible, setIsVisible] = useState(false)
  const { signUp, verifyOTP, resendOTP, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setIsVisible(true)
  }, [])

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

  const benefits = [
    { icon: <Zap className="h-5 w-5" />, text: "Lightning fast processing" },
    { icon: <Shield className="h-5 w-5" />, text: "Bank-level security" },
    { icon: <Star className="h-5 w-5" />, text: "Premium features included" },
    { icon: <CheckCircle className="h-5 w-5" />, text: "No credit card required" }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Animated Background Elements - Matching Home Page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className={`max-w-6xl w-full relative z-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Benefits */}
          <div className="hidden lg:block space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative bg-white p-3 rounded-2xl shadow-xl">
                  <img src="/logo.png" alt="RobotPDF Logo" className="h-16 w-16 object-contain" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RobotPDF
                </h1>
                <p className="text-muted-foreground">Your PDF companion</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 mb-4">
                <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">Start Free Today</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground">
                Join 50,000+ users transforming their PDFs
              </h2>
              <p className="text-xl text-muted-foreground">
                Create your free account and unlock the most powerful PDF toolkit available.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    {benefit.icon}
                  </div>
                  <span className="text-sm text-foreground font-medium pt-2">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  4.9/5
                </div>
                <div className="text-sm text-muted-foreground">User Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  1M+
                </div>
                <div className="text-sm text-muted-foreground">Files Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative bg-white p-2 rounded-2xl shadow-xl">
                    <img src="/logo.png" alt="RobotPDF Logo" className="h-12 w-12 object-contain" />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {showOTPVerification ? 'Verify Your Email' : 'Get Started Free'}
              </h2>
              <p className="text-muted-foreground">
                {showOTPVerification 
                  ? 'Enter the code sent to your email'
                  : 'Create your RobotPDF account'
                }
              </p>
            </div>

            {/* Register Form Card */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="hidden lg:block mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {showOTPVerification ? 'Verify your email' : 'Create your account'}
                  </h3>
                  <p className="text-muted-foreground">
                    {showOTPVerification 
                      ? `Enter the 6-digit code sent to ${registeredEmail}`
                      : 'Get started with your free RobotPDF account'
                    }
                  </p>
                </div>

                {showOTPVerification ? (
                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="otp" className="block text-sm font-semibold text-foreground">
                        Verification Code
                      </label>
                      <div className="relative">
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground text-center text-3xl tracking-widest font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none"
                          maxLength={6}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Check your email for the verification code
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" 
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Verify Email
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </div>
                      )}
                    </Button>

                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Didn't receive the code?
                      </p>
                      <Button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Resend Code
                      </Button>
                    </div>

                    <div className="text-center pt-4">
                      <Button
                        type="button"
                        onClick={() => {
                          setShowOTPVerification(false)
                          setOtp('')
                        }}
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ← Back to registration
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                          Full name
                        </label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                          <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                          Email address
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                          Password
                        </label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                          <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a strong password"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground">
                          Confirm password
                        </label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" 
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                            Creating account...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Sparkles className="mr-2 h-5 w-5" />
                            Create Free Account
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </div>
                        )}
                      </Button>
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800/50 px-4 text-muted-foreground font-medium">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      type="button"
                      className="w-full bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 py-6 text-base font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      <GoogleIcon className="mr-3 h-5 w-5" />
                      Continue with Google
                    </Button>

                    <div className="text-center pt-6">
                      <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link 
                          to="/login" 
                          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-6 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium">Secure Signup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-medium">Free Forever</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link to="/terms-conditions" className="underline hover:text-blue-600 transition-colors">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy-policy" className="underline hover:text-blue-600 transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
