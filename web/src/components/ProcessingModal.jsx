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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="bg-grey-900 border-grey-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in duration-300">
        <CardHeader className="px-8 py-6 border-b border-grey-800 text-center pb-6">
          <div className={`mx-auto mb-6 p-6 rounded-full transition-all duration-500 ${getBgColor()} ${
            !isCompleted && !isError ? 'animate-pulse' : ''
          }`}>
            {isCompleted ? (
              <CheckCircle className="h-10 w-10 text-green-400" />
            ) : isError ? (
              <AlertCircle className="h-10 w-10 text-red-400" />
            ) : (
              <Icon className={`h-10 w-10 ${getIconColor()}`} />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-grey-100 mb-2">{title}</CardTitle>
          <p className="text-sm text-grey-400 break-words">
            {fileName}
          </p>
          
          {/* Time indicators */}
          <div className="flex justify-center items-center space-x-6 mt-4 text-xs text-grey-500">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Elapsed: {formatTime(elapsedTime)}</span>
            </div>
            {estimatedTime && !isCompleted && (
              <div className="flex items-center">
                <span>ETA: {formatTime(Math.max(0, estimatedTime - elapsedTime))}</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="px-8 py-6 space-y-6">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center flex-1 min-w-0">
                {!isCompleted && !isError && (
                  <Loader2 className="h-4 w-4 animate-spin mr-3 flex-shrink-0 text-blue-400" />
                )}
                <span className="text-sm font-medium text-grey-300 truncate">{stage}</span>
              </span>
              <span className={`font-bold text-lg ml-3 ${getIconColor()}`}>
                {Math.round(progress)}%
              </span>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="w-full bg-grey-800 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out relative`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  {!isCompleted && !isError && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          {processingSteps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-grey-300">Processing Steps</h4>
              <div className="space-y-2">
                {processingSteps.map((step, index) => {
                  const StepIcon = step.icon || FileText
                  const isCurrentStep = index === currentStep
                  const isCompletedStep = index < currentStep || isCompleted
                  const isFutureStep = index > currentStep && !isCompleted
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
                        isCurrentStep ? 'bg-blue-900/30 border border-blue-800' :
                        isCompletedStep ? 'bg-green-900/20' :
                        'bg-grey-800/50'
                      }`}
                    >
                      <div className={`p-1 rounded-full ${
                        isCompletedStep ? 'bg-green-600' :
                        isCurrentStep ? 'bg-blue-600' :
                        'bg-grey-700'
                      }`}>
                        {isCompletedStep ? (
                          <CheckCircle className="h-3 w-3 text-white" />
                        ) : isCurrentStep ? (
                          <Loader2 className="h-3 w-3 text-white animate-spin" />
                        ) : (
                          <StepIcon className="h-3 w-3 text-grey-400" />
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        isCompletedStep ? 'text-green-300' :
                        isCurrentStep ? 'text-blue-300' :
                        'text-grey-500'
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
            <div className="flex items-center justify-center text-xs text-grey-400 bg-grey-800 rounded-xl p-3">
              <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-center">{description}</span>
            </div>
          )}

          {/* Status Message */}
          <div className="text-center">
            {isCompleted ? (
              <div className="text-green-400 font-semibold flex items-center justify-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Processing completed successfully!
              </div>
            ) : isError ? (
              <div className="text-red-400 font-semibold flex items-center justify-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Processing failed. Please try again.
              </div>
            ) : (
              <div className="text-blue-400 font-semibold flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing in progress...
              </div>
            )}
          </div>

          {/* Cancel Button */}
          {onCancel && !isCompleted && !isError && (
            <div className="text-center pt-2">
              <button
                onClick={onCancel}
                className="text-xs text-grey-500 hover:text-grey-300 transition-colors"
              >
                Cancel Processing
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProcessingModal