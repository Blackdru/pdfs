import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useSubscription } from '../contexts/SubscriptionContext'
import { 
  X, 
  Crown, 
  Zap, 
  Star, 
  Check, 
  Sparkles,
  ArrowRight,
  Lock,
  TrendingUp
} from 'lucide-react'

const UpgradeModal = ({ isOpen, onClose, requiredPlan = 'pro', toolName = '', toolDescription = '' }) => {
  const navigate = useNavigate()
  const { plans, subscription } = useSubscription()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = (planId) => {
    setLoading(true)
    navigate('/upgrade')
    onClose()
  }

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'pro':
        return <Zap className="h-6 w-6 text-purple-500" />
      case 'premium':
        return <Crown className="h-6 w-6 text-blue-500" />
      default:
        return <Star className="h-6 w-6 text-blue-500" />
    }
  }

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'pro':
        return 'from-purple-500 to-pink-500'
      case 'premium':
        return 'from-blue-500 to-indigo-500'
      default:
        return 'from-blue-500 to-purple-500'
    }
  }

  const getRecommendedPlans = () => {
    if (!plans || plans.length === 0) {
      return [
        {
          id: 'pro',
          name: 'Pro',
          price: 1,
          features: ['500 files/month', 'Advanced OCR', 'AI Chat', 'Batch processing']
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 10,
          features: ['Unlimited files', 'All AI features', 'Priority support', 'Advanced analytics']
        }
      ]
    }

    return plans.filter(plan => plan.id !== 'free')
  }

  const recommendedPlans = getRecommendedPlans()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl text-card-foreground">
                  Upgrade Required
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {toolName ? `${toolName} requires a Pro or Premium subscription` : 'This feature requires a paid subscription'}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tool Info */}
          {toolName && (
            <div className="bg-secondary rounded-xl p-6 border border-border">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{toolName}</h3>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  PRO
                </Badge>
              </div>
              {toolDescription && (
                <p className="text-muted-foreground mb-4">{toolDescription}</p>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Lock className="h-4 w-4 mr-2" />
                This advanced feature is available with Pro and Premium plans
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-800/30">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
              Why Upgrade?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-foreground">
                  <Check className="h-4 w-4 mr-3 text-green-400" />
                  Advanced AI-powered tools
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="h-4 w-4 mr-3 text-green-400" />
                  Higher processing limits
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="h-4 w-4 mr-3 text-green-400" />
                  OCR text extraction
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="h-4 w-4 mr-3 text-green-400" />
                  AI document chat
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-foreground">
                  <Check className="h-4 w-4 mr-3 text-green-400" />
                  Batch processing
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="h-4 w-4 mr-3 text-green-400" />
                  Priority support
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="h-4 w-4 mr-3 text-green-400" />
                  Advanced security features
                </div>
                <div className="flex items-center text-foreground">
                  <Check className="h-4 w-4 mr-3 text-green-400" />
                  No ads or watermarks
                </div>
              </div>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  plan.id === 'basic' 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                    : 'border-blue-500 shadow-lg shadow-blue-500/20'
                }`}
              >
                {plan.id === 'pro' && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500 hover:bg-purple-600">
                    Most Popular
                  </Badge>
                )}
                
                {plan.id === 'premium' && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600">
                    Best Value
                  </Badge>
                )}

                <div className="p-6">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.id)}
                  </div>

                  {/* Plan Info */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-card-foreground mb-1">
                      ${plan.price}
                      <span className="text-sm text-muted-foreground font-normal">/month</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {plan.id === 'pro' ? 'Perfect for regular users' : 'For power users and teams'}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {(plan.features || []).slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-foreground">
                        <Check className="h-4 w-4 mr-3 text-green-400 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                    className={`w-full bg-gradient-to-r ${getPlanColor(plan.id)} text-white hover:shadow-lg transition-all duration-300`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center space-y-4 pt-6 border-t border-border">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                7-day free trial
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                Cancel anytime
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                Secure payments
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-border text-foreground hover:bg-secondary"
              >
                Maybe Later
              </Button>
              <Button
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg"
              >
                View All Plans
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UpgradeModal