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

  // Static plan data - All prices in INR
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'INR',
      description: 'Perfect for getting started',
      features: [
        'Unlimited use of free tools',
        '10 MB max file size',
        'No storage',
        'No AI features',
        'No advanced tools access'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 99,
      currency: 'INR',
      description: 'Great for regular users',
      popular: true,
      features: [
        '50 files per month',
        '50 MB max file size',
        '500 MB storage',
        '25 Advanced OCR pages',
        '25 AI chat messages',
        '25 AI summaries',
        'Access to all advanced tools'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 499,
      currency: 'INR',
      description: 'For power users and teams',
      bestValue: true,
      features: [
        'Unlimited files per month',
        '200 MB max file size',
        'Unlimited storage',
        'Unlimited OCR pages',
        'Unlimited AI chat',
        'Unlimited AI summaries',
        'All advanced tools & settings',
        'Priority support'
      ]
    }
  ]

  // Plan comparison data - All prices in INR
  const comparisonFeatures = [
    {
      feature: 'Monthly Price',
      free: 'Free',
      basic: '₹99/month',
      pro: '₹499/month'
    },
    {
      feature: 'Free Tools Usage',
      free: 'Unlimited',
      basic: 'Unlimited',
      pro: 'Unlimited'
    },
    {
      feature: 'Files per month',
      free: 'Unlimited (Free Tools)',
      basic: '50',
      pro: 'Unlimited'
    },
    {
      feature: 'Max file size',
      free: '10 MB',
      basic: '50 MB',
      pro: '200 MB'
    },
    {
      feature: 'Storage',
      free: 'No Storage',
      basic: '500 MB',
      pro: 'Unlimited'
    },
    {
      feature: 'Advanced OCR Pages',
      free: 'None',
      basic: '25',
      pro: 'Unlimited'
    },
    {
      feature: 'AI Chat Messages',
      free: 'None',
      basic: '25',
      pro: 'Unlimited'
    },
    {
      feature: 'AI Summaries',
      free: 'None',
      basic: '25',
      pro: 'Unlimited'
    },
    {
      feature: 'Advanced Tools Access',
      free: false,
      basic: true,
      pro: true
    },
    {
      feature: 'Advanced Settings',
      free: false,
      basic: false,
      pro: true
    },
    {
      feature: 'Priority Support',
      free: false,
      basic: false,
      pro: true
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
    <div className="min-h-screen bg-page mobile-spacing-dark">
      <div className="mobile-container py-8 sm:py-12 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gradient-hero">Simple, Transparent Pricing</h1>
          </div>
          
          <p className="text-base sm:text-lg md:text-xl text-card-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your PDF processing needs. 
            Start free and upgrade as you grow.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative transition-all duration-200 hover:shadow-lg dark-card ${
              plan.popular ? 'border-purple-500/30 shadow-lg shadow-purple-500/20' : 
              plan.bestValue ? 'border-blue-500/30 shadow-xl shadow-blue-500/20' : 
              'border-grey-700'
            }`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500 hover:bg-purple-600 text-xs sm:text-sm">
                  Most Popular
                </Badge>
              )}
              
              {plan.bestValue && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm">
                  Best Value
                </Badge>
              )}

              <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="flex justify-center mb-2">
                  {plan.id === 'free' && <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />}
                  {plan.id === 'basic' && <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />}
                  {plan.id === 'pro' && <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />}
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-base sm:text-lg text-card-foreground">
                  {plan.price === 0 ? (
                    <span className="text-xl sm:text-2xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-2xl sm:text-3xl font-bold">₹{plan.price}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">/month</span>
                    </>
                  )}
                </CardDescription>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                <div className="space-y-1.5 sm:space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-card-foreground leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="p-4 sm:p-6 pt-0">
                <Button
                  className="w-full text-sm sm:text-base py-2 sm:py-3"
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
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-center text-foreground">Feature Comparison</CardTitle>
            <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
              Compare all features across our plans
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 sm:px-6 font-medium text-card-foreground text-sm sm:text-base sticky left-0 bg-background">Feature</th>
                    <th className="text-center py-4 px-3 sm:px-6">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                        <span className="font-medium text-card-foreground text-xs sm:text-sm">Free</span>
                      </div>
                    </th>
                    <th className="text-center py-3 px-2 sm:px-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-col sm:flex-row">
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                          <span className="font-medium text-card-foreground text-xs sm:text-sm">Basic</span>
                        </div>
                        <Badge className="text-[10px] sm:text-xs badge-purple whitespace-nowrap">Popular</Badge>
                      </div>
                    </th>
                    <th className="text-center py-3 px-2 sm:px-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-col sm:flex-row">
                        <div className="flex items-center gap-1">
                          <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                          <span className="font-medium text-card-foreground text-xs sm:text-sm">Pro</span>
                        </div>
                        <Badge className="text-xs badge-blue">Best Value</Badge>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-b border-border hover:bg-elevated/50">
                      <td className="py-4 px-4 sm:px-6 font-medium text-card-foreground text-sm whitespace-normal sticky left-0 bg-background">{row.feature}</td>
                      <td className="py-4 px-3 sm:px-6 text-center text-card-foreground">
                        {renderFeatureValue(row.free)}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-center text-card-foreground">
                        {renderFeatureValue(row.basic)}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-center text-card-foreground">
                        {renderFeatureValue(row.pro)}
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
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-foreground">Frequently Asked Questions</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground text-sm sm:text-base">Can I change plans anytime?</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. 
                  Changes take effect immediately with prorated billing.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground text-sm sm:text-base">What happens to my files if I downgrade?</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your files remain safe. You'll just have lower monthly limits 
                  for new operations going forward.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground text-sm sm:text-base">Is there a free trial?</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  All paid plans come with a 7-day free trial. 
                  Cancel anytime during the trial with no charges.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground text-sm sm:text-base">How secure is my data?</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We use enterprise-grade security with end-to-end encryption. 
                  Your files are processed securely and never shared.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-3 sm:space-y-4 py-6 sm:py-8 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Ready to get started?</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Join thousands of users who trust RobotPDF for their document processing needs
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            {!user ? (
              <>
                <Button 
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="btn-purple w-full sm:w-auto"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Started Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="btn-dark-outline w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg"
                  onClick={() => handleSelectPlan('basic')}
                  className="btn-purple w-full sm:w-auto"
                >
                  Start for free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => handleSelectPlan('pro')}
                  className="btn-dark-outline w-full sm:w-auto"
                >
                  Go Pro
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