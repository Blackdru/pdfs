import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useSubscription } from '../contexts/SubscriptionContext'
import PlanCard from '../components/subscription/PlanCard'
import SubscriptionModal from '../components/subscription/SubscriptionModal'
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Crown,
  ArrowLeft,
  Sparkles
} from 'lucide-react'

const Upgrade = () => {
  const navigate = useNavigate()
  const { plans, subscription, loading } = useSubscription()
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId)
    setShowModal(true)
  }

  const getCurrentPlanId = () => {
    return subscription?.plan || 'free'
  }

  // Updated plan comparison data with new pricing structure
  const comparisonFeatures = [
    {
      feature: 'Monthly Price',
      free: 'Free',
      pro: '$1/month',
      premium: '$10/month'
    },
    {
      feature: 'Files per month',
      free: '10',
      pro: '500',
      premium: 'Unlimited'
    },
    {
      feature: 'Max file size',
      free: '10 MB',
      pro: '50 MB',
      premium: '200 MB'
    },
    {
      feature: 'Storage',
      free: '100 MB',
      pro: '2 GB',
      premium: '20 GB'
    },
    {
      feature: 'OCR Processing',
      free: '5 pages/month',
      pro: '200 pages/month',
      premium: 'Unlimited'
    },
    {
      feature: 'AI Chat Messages',
      free: '10 messages/month',
      pro: '1,000 messages/month',
      premium: 'Unlimited'
    },
    {
      feature: 'Advanced OCR Features',
      free: false,
      pro: true,
      premium: true
    },
    {
      feature: 'Advanced AI Models',
      free: false,
      pro: false,
      premium: true
    },
    {
      feature: 'Batch Processing',
      free: 'Single files',
      pro: 'Up to 20 files',
      premium: 'Unlimited'
    },
    {
      feature: 'API Access',
      free: false,
      pro: true,
      premium: true
    },
    {
      feature: 'Custom Watermarks',
      free: false,
      pro: true,
      premium: true
    },
    {
      feature: 'Advanced Compression',
      free: false,
      pro: true,
      premium: true
    },
    {
      feature: 'Priority Processing',
      free: false,
      pro: false,
      premium: true
    },
    {
      feature: 'Priority Support',
      free: false,
      pro: false,
      premium: true
    },
    {
      feature: 'Advanced Analytics',
      free: false,
      pro: false,
      premium: true
    }
  ]

  const renderFeatureValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-green-500 mx-auto" />
      ) : (
        <X className="h-4 w-4 text-gray-300 mx-auto" />
      )
    }
    return <span className="text-sm">{value}</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-grey-950 mobile-spacing-dark">
        <div className="layout-dark-container py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-grey-800 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-grey-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grey-950 mobile-spacing-dark">
      <div className="layout-dark-container py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="btn-dark-glass mb-4 self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <h1 className="heading-dark-1 text-gradient-hero">Choose Your Plan</h1>
          </div>
          
          <p className="body-dark-large text-grey-300 max-w-2xl mx-auto">
            Unlock the full potential of PDFPet with advanced features, 
            higher limits, and priority support
          </p>
          
          {subscription && (
            <Badge variant="outline" className="badge-grey text-sm">
              Currently on {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} plan
            </Badge>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === getCurrentPlanId()}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        {/* Feature Comparison Table */}
        <Card className="dark-card">
          <CardHeader>
            <CardTitle className="heading-dark-4 text-center text-grey-100">Detailed Feature Comparison</CardTitle>
            <CardDescription className="text-center text-grey-400">
              Compare all features across our plans
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grey-800">
                    <th className="text-left py-3 px-4 font-medium text-grey-200">Feature</th>
                    <th className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="h-4 w-4 text-blue-400" />
                        <span className="font-medium text-grey-200">Free</span>
                      </div>
                    </th>
                    <th className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-4 w-4 text-purple-400" />
                        <span className="font-medium text-grey-200">Pro</span>
                        <Badge className="ml-1 badge-purple">Popular</Badge>
                      </div>
                    </th>
                    <th className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Crown className="h-4 w-4 text-blue-400" />
                        <span className="font-medium text-grey-200">Premium</span>
                        <Badge className="ml-1 badge-blue">Best Value</Badge>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-b border-grey-800 hover:bg-grey-800/50">
                      <td className="py-3 px-4 font-medium text-grey-300">{row.feature}</td>
                      <td className="py-3 px-4 text-center text-grey-300">
                        {renderFeatureValue(row.free)}
                      </td>
                      <td className="py-3 px-4 text-center text-grey-300">
                        {renderFeatureValue(row.pro)}
                      </td>
                      <td className="py-3 px-4 text-center text-grey-300">
                        {renderFeatureValue(row.premium)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="dark-card">
          <CardHeader>
            <CardTitle className="heading-dark-4 text-grey-100">Frequently Asked Questions</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-grey-200">Can I change plans anytime?</h4>
                <p className="text-sm text-grey-400">
                  Yes, you can upgrade or downgrade your plan at any time. 
                  Changes take effect immediately with prorated billing.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-grey-200">What happens to my files if I downgrade?</h4>
                <p className="text-sm text-grey-400">
                  Your files remain safe. You'll just have lower monthly limits 
                  for new operations going forward.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-grey-200">Is there a free trial?</h4>
                <p className="text-sm text-grey-400">
                  All paid plans come with a 7-day free trial. 
                  Cancel anytime during the trial with no charges.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-grey-200">How secure is my data?</h4>
                <p className="text-sm text-grey-400">
                  We use enterprise-grade security with end-to-end encryption. 
                  Your files are processed securely and never shared.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="heading-dark-2 text-grey-100">Ready to get started?</h2>
          <p className="text-grey-400">
            Join thousands of users who trust PDFPet for their document processing needs
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => handleSelectPlan('pro')}
              className="btn-purple"
            >
              Start Pro Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => handleSelectPlan('premium')}
              className="btn-dark-outline"
            >
              Go Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialTab="plans"
      />
    </div>
  )
}

export default Upgrade