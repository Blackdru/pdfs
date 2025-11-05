import { useState, useEffect } from 'react'
import { X, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

const PasswordRemoveModal = ({ isOpen, onClose, onConfirm, fileCount = 1 }) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setShowPassword(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setPassword('')
    setShowPassword(false)
    onClose()
  }

  const handleConfirm = () => {
    if (!password) {
      alert('Please enter the password')
      return
    }
    
    if (password.trim().length === 0) {
      alert('Password cannot be empty')
      return
    }

    onConfirm({ password: password.trim() })
    // Clear password after confirming
    setPassword('')
    setShowPassword(false)
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && password) {
      handleConfirm()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-700 text-white p-4 sm:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold truncate">Remove Password</h2>
                <p className="text-white/90 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  Unlock {fileCount} {fileCount === 1 ? 'file' : 'files'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Warning Notice */}
          <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-800">
              <div className="font-semibold mb-1">Password Required</div>
              <div className="text-amber-700">
                Enter the password to remove protection from {fileCount === 1 ? 'this PDF' : 'these PDFs'}.
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700">
              Document Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter the PDF password"
                autoFocus
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              The password will be used to decrypt and remove protection from the PDF{fileCount > 1 ? 's' : ''}.
            </p>
          </div>

          {/* Info Box */}
          <div className="p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="text-xs sm:text-sm text-blue-800">
              <div className="font-semibold mb-1">ℹ️ What happens next?</div>
              <ul className="text-blue-700 space-y-0.5 sm:space-y-1 ml-4 list-disc text-xs sm:text-sm">
                <li>Password protection will be removed</li>
                <li>All restrictions will be lifted</li>
                <li>Original content will be preserved</li>
                <li>You'll get an unlocked PDF file</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 rounded-b-2xl border-t flex gap-2 sm:gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1 text-sm sm:text-base py-2 sm:py-2.5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!password}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-700 hover:from-amber-600 hover:to-orange-800 text-sm sm:text-base py-2 sm:py-2.5"
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Remove Password</span>
            <span className="sm:hidden">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PasswordRemoveModal
