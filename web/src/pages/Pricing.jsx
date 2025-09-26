import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Crown,
  Sparkles,
  DollarSign
} from 'lucide-react'

const Pricing = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSelectPlan = (planId) => {
    if (!user) {
      navigate('/register')
      return
    }
    navigate('/upgrade')
  }

  // Static plan data
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      features: [
        '10 files per month',
        '10 MB max file size',
        '100 MB storage',
        '5 OCR pages/month',
        '10 AI messages/month',
        'Basic PDF tools'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 1,
      description: 'Great for regular users',
      popular: true,
      features: [
        '500 files per month',
        '50 MB max file size',
        '2 GB storage',
        '200 OCR pages/month',
        '1,000 AI messages/month',
        'Advanced OCR features',
        'Batch processing (20 files)',
        'API access',
        'Custom watermarks'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 10,
      description: 'For power users and teams',
      bestValue: true,
      features: [
        'Unlimited files',
        '200 MB max file size',
        '20 GB storage',
        'Unlimited OCR',
        'Unlimited AI messages',
        'Advanced AI models',
        'Unlimited batch processing',
        'Priority processing',
        'Priority support',
        'Advanced analytics'
      ]
    }
  ]

  // Plan comparison data
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
      feature: 'Priority Support',
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



  return (
    <div className="min-h-screen bg-grey-950 mobile-spacing-dark">
      <div className="layout-dark-container py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="h-6 w-6 text-blue-400" />
            <h1 className="heading-dark-1 text-gradient-hero">Simple, Transparent Pricing</h1>
          </div>
          
          <p className="body-dark-large text-grey-300 max-w-2xl mx-auto">
            Choose the perfect plan for your PDF processing needs. 
            Start free and upgrade as you grow.
          </p>
          

        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative transition-all duration-200 hover:shadow-lg ${
              plan.popular ? 'border-purple-200 shadow-lg' : 
              plan.bestValue ? 'border-blue-200 shadow-xl' : 
              'border-gray-200'
            }`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500 hover:bg-purple-600">
                  Most Popular
                </Badge>
              )}
              
              {plan.bestValue && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600">
                  Best Value
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {plan.id === 'free' && <Star className="h-6 w-6 text-blue-500" />}
                  {plan.id === 'pro' && <Zap className="h-6 w-6 text-purple-500" />}
                  {plan.id === 'premium' && <Crown className="h-6 w-6 text-blue-500" />}
                </div>
                <CardTitle className="text-2xl font-bold text-grey-100">{plan.name}</CardTitle>
                <CardDescription className="text-lg text-grey-300">
                  {plan.price === 0 ? (
                    <span className="text-2xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-sm text-grey-400">/month</span>
                    </>
                  )}
                </CardDescription>
                <p className="text-sm text-grey-400 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-grey-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="p-6 pt-0">
                <Button
                  className="w-full"
                  variant={plan.id === 'free' ? 'outline' : 'default'}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.id === 'free' ? 'Get Started' : `Choose ${plan.name}`}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <Card className="dark-card">
          <CardHeader>
            <CardTitle className="heading-dark-4 text-center text-grey-100">Feature Comparison</CardTitle>
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
            {!user ? (
              <>
                <Button 
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="btn-purple"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Started Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="btn-dark-outline"
                >
                  Sign In
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg"
                  onClick={() => handleSelectPlan('pro')}
                  className="btn-purple"
                >
                  Start for free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => handleSelectPlan('premium')}
                  className="btn-dark-outline"
                >
                  Go Premium
                </Button>
              </>
            )}
          </div>
        </div>
      </div>


    </div>
  )
}

export default Pricing