import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Loader2, CheckCircle, AlertCircle, Clock, FileText, Upload, Download } from 'lucide-react'
import { useState, useEffect } from 'react'

const ProcessingModal = ({ 
  isOpen, 
  title, 
  fileName, 
  progress = 0, 
  stage = 'Initializing...', 
  icon: Icon,
  description,
  steps = [],
  currentStep = 0,
  estimatedTime = null,
  onCancel = null
}) => {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0)
      return
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, startTime])

  if (!isOpen) return null

  const isCompleted = progress >= 100
  const isError = stage?.toLowerCase().includes('error') || stage?.toLowerCase().includes('failed')
  const isWarning = stage?.toLowerCase().includes('warning')

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressColor = () => {
    if (isCompleted) return 'from-green-500 to-green-600'
    if (isError) return 'from-red-500 to-red-600'
    if (isWarning) return 'from-yellow-500 to-yellow-600'
    return 'from-blue-500 to-blue-600'
  }

  const getIconColor = () => {
    if (isCompleted) return 'text-green-400'
    if (isError) return 'text-red-400'
    if (isWarning) return 'text-yellow-400'
    return 'text-blue-400'
  }

  const getBgColor = () => {
    if (isCompleted) return 'bg-green-800'
    if (isError) return 'bg-red-800'
    if (isWarning) return 'bg-yellow-800'
    return 'bg-blue-800'
  }

  // Default processing steps if none provided
  const defaultSteps = [
    { name: 'Uploading', icon: Upload },
    { name: 'Processing', icon: FileText },
    { name: 'Finalizing', icon: CheckCircle },
    { name: 'Complete', icon: Download }
  ]

  const processingSteps = steps.length > 0 ? steps : defaultSteps

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-3 sm:p-4 z-50">
      <Card className="bg-card border-border rounded-2xl shadow-2xl w-full max-w-[92vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border text-center">
          <div className={`mx-auto mb-3 sm:mb-4 p-3 sm:p-4 rounded-full transition-all duration-500 ${getBgColor()} ${
            !isCompleted && !isError ? 'animate-pulse' : ''
          }`}>
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
            ) : isError ? (
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
            ) : (
              <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${getIconColor()}`} />
            )}
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground mb-2">{title}</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground break-words px-2">
            {fileName}
          </p>
          
          {/* Time indicators */}
          <div className="flex justify-center items-center space-x-3 sm:space-x-4 mt-3 text-xs text-secondary">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
            {estimatedTime && !isCompleted && (
              <div className="flex items-center">
                <span>ETA: {formatTime(Math.max(0, estimatedTime - elapsedTime))}</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center flex-1 min-w-0">
                {!isCompleted && !isError && (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2 flex-shrink-0 text-blue-400" />
                )}
                <span className="text-xs sm:text-sm font-medium text-card-foreground truncate">{stage}</span>
              </span>
              <span className={`font-bold text-base sm:text-lg ${getIconColor()}`}>
                {Math.round(progress)}%
              </span>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5 overflow-hidden">
                <div 
                  className={`h-full ${isCompleted ? 'bg-green-600' : isError ? 'bg-red-600' : 'bg-blue-600'} transition-all duration-500 ease-out`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                </div>
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          {processingSteps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-medium text-card-foreground">Steps</h4>
              <div className="space-y-1.5 sm:space-y-2">
                {processingSteps.map((step, index) => {
                  const StepIcon = step.icon || FileText
                  const isCurrentStep = index === currentStep
                  const isCompletedStep = index < currentStep || isCompleted
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                        isCurrentStep ? 'bg-blue-600/20 border border-blue-600' :
                        isCompletedStep ? 'bg-green-600/20 border border-green-600' :
                        'bg-gray-700/50'
                      }`}
                    >
                      <div className={`p-0.5 sm:p-1 rounded-full ${
                        isCompletedStep ? 'bg-green-600' :
                        isCurrentStep ? 'bg-blue-600' :
                        'bg-gray-600'
                      }`}>
                        {isCompletedStep ? (
                          <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                        ) : isCurrentStep ? (
                          <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white animate-spin" />
                        ) : (
                          <StepIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        isCompletedStep ? 'text-green-400' :
                        isCurrentStep ? 'text-blue-400' :
                        'text-gray-500'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="flex items-center justify-center text-xs text-muted-foreground bg-gray-700/50 rounded-lg p-2 sm:p-3">
              <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
              <span className="text-center">{description}</span>
            </div>
          )}

          {/* Status Message */}
          <div className="text-center">
            {isCompleted ? (
              <div className="text-green-400 text-sm sm:text-base font-semibold flex items-center justify-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-xs sm:text-sm">Completed!</span>
              </div>
            ) : isError ? (
              <div className="text-red-400 text-sm sm:text-base font-semibold flex items-center justify-center">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-xs sm:text-sm">Failed. Try again.</span>
              </div>
            ) : (
              <div className="text-blue-400 text-sm sm:text-base font-semibold flex items-center justify-center">
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                <span className="text-xs sm:text-sm">Processing...</span>
              </div>
            )}
          </div>

          {/* Cancel Button */}
          {onCancel && !isCompleted && !isError && (
            <div className="text-center pt-1">
              <button
                onClick={onCancel}
                className="text-xs text-secondary hover:text-card-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProcessingModal