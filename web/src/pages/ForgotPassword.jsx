import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Mail, Lock, ArrowRight, CheckCircle, Shield, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: email, 2: otp & password
  const { forgotPassword, resetPassword, resendOTP } = useAuth()
  const navigate = useNavigate()

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await forgotPassword(email)
    
    if (!error) {
      setStep(2)
    }
    
    setLoading(false)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await resetPassword(email, otp, newPassword)
    
    if (!error) {
      navigate('/login')
    }
    
    setLoading(false)
  }

  const handleResendOTP = async () => {
    setLoading(true)
    await resendOTP(email, 'password_reset')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="max-w-lg w-full space-y-10 relative z-10">
        {/* Reset Password Form */}
        <div className="dark-card p-10 bg-surface shadow-blue-lg">
          <div className="space-y-2 pb-8">
            <h3 className="heading-dark-4 text-center">
              {step === 1 ? 'Reset your password' : 'Enter OTP & New Password'}
            </h3>
            <p className="body-dark-small text-muted-foreground text-center">
              {step === 1 
                ? 'Enter your email to receive a password reset OTP'
                : `Enter the 6-digit code sent to ${email}`
              }
            </p>
          </div>
          
          <div className="space-y-8">
            {step === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-8">
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

                <Button 
                  type="submit" 
                  className="w-full btn-blue text-lg py-4 h-auto font-semibold" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="loading-dark mr-3"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Mail className="mr-3 h-5 w-5" />
                      Send Reset OTP
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="text-sm text-muted-foreground hover:text-card-foreground font-semibold transition-colors duration-200 inline-flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-8">
                <div className="space-y-3">
                  <label htmlFor="otp" className="block text-sm font-semibold text-card-foreground">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-secondary" />
                    <input
                      id="otp"
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

                <div className="space-y-3">
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-card-foreground">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-secondary" />
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="dark-input pl-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-card-foreground">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-secondary" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="dark-input pl-12"
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
                      Resetting password...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="mr-3 h-5 w-5" />
                      Reset Password
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
                      setStep(1)
                      setOtp('')
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    variant="ghost"
                    className="text-muted-foreground hover:text-card-foreground inline-flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change email
                  </Button>
                </div>
              </form>
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
            Remember your password?{' '}
            <Link to="/login" className="underline hover:text-blue-400 transition-colors duration-200">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
