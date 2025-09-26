import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useSubscription } from '../contexts/SubscriptionContext'
import UsageIndicator from '../components/subscription/UsageIndicator'
import BillingHistory from '../components/subscription/BillingHistory'
import SubscriptionModal from '../components/subscription/SubscriptionModal'
import CancelSubscription from '../components/subscription/CancelSubscription'
import { 
  CreditCard, 
  Calendar, 
  Settings, 
  Crown,
  AlertCircle,
  CheckCircle,
  ArrowUpCircle
} from 'lucide-react'

const Billing = () => {
  const { 
    subscription, 
    loading, 
    isActive, 
    isCancelledButActive, 
    getPlanDisplayName 
  } = useSubscription()
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = () => {
    if (!subscription) return null
    
    if (isCancelledButActive()) {
      return <Badge variant="destructive">Cancelling</Badge>
    }
    
    switch (subscription.status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'trialing':
        return <Badge variant="secondary">Trial</Badge>
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      case 'expired':
        return <Badge variant="outline">Expired</Badge>
      default:
        return <Badge variant="outline">{subscription.status}</Badge>
    }
  }

  const getPlanIcon = () => {
    if (!subscription) return <CreditCard className="h-5 w-5" />
    
    switch (subscription.plan) {
      case 'premium':
        return <Crown className="h-5 w-5 text-blue-500" />
      case 'pro':
        return <ArrowUpCircle className="h-5 w-5 text-purple-500" />
      default:
        return <CreditCard className="h-5 w-5 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-grey-950 mobile-spacing-dark">
        <div className="layout-dark-container py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-grey-800 rounded w-1/4"></div>
            <div className="h-32 bg-grey-800 rounded"></div>
            <div className="h-64 bg-grey-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grey-950 mobile-spacing-dark">
      <div className="layout-dark-container py-12 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="heading-dark-1 text-gradient-hero">Billing & Subscription</h1>
          <p className="body-dark-large text-grey-300 mt-4">
            Manage your subscription, view usage, and billing history
          </p>
        </div>

        {/* Current Subscription Card */}
        <Card className="dark-card">
          <CardHeader>
            <CardTitle className="heading-dark-4 flex items-center gap-2 text-grey-100">
              {getPlanIcon()}
              Current Plan
              {getStatusBadge()}
            </CardTitle>
            <CardDescription className="text-grey-400">
              Your current subscription details and status
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="heading-dark-4 text-grey-200">{getPlanDisplayName()} Plan</h3>
                <p className="text-2xl font-bold text-blue-400">
                  {subscription?.planLimits?.price === 0 ? (
                    'Free'
                  ) : (
                    `${subscription?.planLimits?.price}/month`
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-grey-300">
                  <Calendar className="h-4 w-4 text-grey-400" />
                  Billing Cycle
                </h4>
                <p className="text-sm text-grey-400">
                  {subscription?.current_period_end ? (
                    <>
                      Next billing: {formatDate(subscription.current_period_end)}
                    </>
                  ) : (
                    'No billing cycle'
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-grey-300">
                  <Settings className="h-4 w-4 text-grey-400" />
                  Status
                </h4>
                <div className="flex items-center gap-2">
                  {isActive() ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm text-grey-300">
                    {isActive() ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Notice */}
            {isCancelledButActive() && (
              <div className="p-4 bg-orange-950 border border-orange-800 rounded-xl">
                <div className="flex items-center gap-2 text-orange-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Subscription Ending</span>
                </div>
                <p className="text-sm text-orange-200 mt-1">
                  Your subscription will end on {formatDate(subscription?.current_period_end)}. 
                  You can reactivate it anytime before then.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                className="btn-blue flex items-center gap-2"
              >
                <ArrowUpCircle className="h-4 w-4" />
                {subscription?.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
              </Button>
              
              {subscription?.plan !== 'free' && isActive() && (
                <Button 
                  variant="outline"
                  onClick={() => setShowCancelModal(true)}
                  className="btn-dark-outline"
                >
                  {isCancelledButActive() ? 'Manage Cancellation' : 'Cancel Subscription'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Usage and Billing */}
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="tab-dark-list grid w-full grid-cols-2">
            <TabsTrigger value="usage" className="tab-dark-button">Usage & Limits</TabsTrigger>
            <TabsTrigger value="history" className="tab-dark-button">Billing History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="usage" className="space-y-6">
            <UsageIndicator />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <BillingHistory />
          </TabsContent>
        </Tabs>

        {/* Plan Features */}
        {subscription?.planLimits && (
          <Card className="dark-card">
            <CardHeader>
              <CardTitle className="heading-dark-4 text-grey-100">Plan Features</CardTitle>
              <CardDescription className="text-grey-400">
                What's included in your {getPlanDisplayName()} plan
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscription.planLimits.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm capitalize text-grey-300">
                      {feature.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      
      <CancelSubscription
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  )
}

export default Billing