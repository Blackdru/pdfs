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
      <div className="min-h-screen bg-page mobile-spacing-dark">
        <div className="layout-dark-container py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-elevated rounded w-1/4"></div>
            <div className="h-32 bg-elevated rounded"></div>
            <div className="h-64 bg-elevated rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page mobile-spacing-dark">
      <div className="mobile-container py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="mobile-text-3xl font-bold text-gradient-hero mb-2 sm:mb-4">Billing & Subscription</h1>
          <p className="mobile-text-base text-card-foreground">
            Manage your subscription, view usage, and billing history
          </p>
        </div>

        {/* Current Subscription Card */}
        <Card className="dark-card mobile-card">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2 text-foreground">
              {getPlanIcon()}
              <span>Current Plan</span>
              {getStatusBadge()}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
              Your current subscription details and status
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-card-foreground">{getPlanDisplayName()} Plan</h3>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">
                  {subscription?.planLimits?.price === 0 ? (
                    'Free'
                  ) : (
                    `${subscription?.planLimits?.price}/month`
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-medium flex items-center gap-2 text-card-foreground">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  Billing Cycle
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {subscription?.current_period_end ? (
                    <>
                      Next: {formatDate(subscription.current_period_end)}
                    </>
                  ) : (
                    'No billing cycle'
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-medium flex items-center gap-2 text-card-foreground">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  Status
                </h4>
                <div className="flex items-center gap-2">
                  {isActive() ? (
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                  )}
                  <span className="text-xs sm:text-sm text-card-foreground">
                    {isActive() ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Notice */}
            {isCancelledButActive() && (
              <div className="p-3 sm:p-4 bg-orange-950 border border-orange-800 rounded-xl">
                <div className="flex items-center gap-2 text-orange-300">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="font-medium text-xs sm:text-sm">Subscription Ending</span>
                </div>
                <p className="text-xs sm:text-sm text-orange-200 mt-1">
                  Your subscription will end on {formatDate(subscription?.current_period_end)}. 
                  You can reactivate it anytime before then.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                className="btn-blue flex items-center justify-center gap-2 w-full sm:w-auto mobile-btn mobile-touch-target"
              >
                <ArrowUpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-sm sm:text-base">{subscription?.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}</span>
              </Button>
              
              {subscription?.plan !== 'free' && isActive() && (
                <Button 
                  variant="outline"
                  onClick={() => setShowCancelModal(true)}
                  className="btn-dark-outline w-full sm:w-auto mobile-btn mobile-touch-target text-sm sm:text-base"
                >
                  {isCancelledButActive() ? 'Manage Cancellation' : 'Cancel Subscription'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Usage and Billing */}
        <Tabs defaultValue="usage" className="space-y-4 sm:space-y-6">
          <div className="mobile-overflow-x">
            <TabsList className="inline-flex w-full sm:w-auto min-w-max bg-elevated border border-border rounded-xl p-1">
              <TabsTrigger value="usage" className="mobile-btn-sm mobile-touch-target text-xs sm:text-sm">Usage & Limits</TabsTrigger>
              <TabsTrigger value="history" className="mobile-btn-sm mobile-touch-target text-xs sm:text-sm">Billing History</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="usage" className="space-y-6">
            <UsageIndicator />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <BillingHistory />
          </TabsContent>
        </Tabs>

        {/* Plan Features */}
        {subscription?.planLimits && (
          <Card className="dark-card mobile-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg text-foreground">Plan Features</CardTitle>
              <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                What's included in your {getPlanDisplayName()} plan
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {subscription.planLimits.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 mobile-touch-target">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm capitalize text-card-foreground">
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