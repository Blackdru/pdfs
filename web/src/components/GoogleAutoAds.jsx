import { useEffect } from 'react'
import { useSubscription } from '../contexts/SubscriptionContext'

// Your actual AdSense Publisher ID
const ADSENSE_CLIENT_ID = 'ca-pub-4179117508545067'

/**
 * Google Auto Ads Component
 * 
 * This component automatically loads Google Auto Ads which will:
 * - Automatically place ads in optimal positions
 * - Choose the best ad formats for each placement
 * - Optimize ad density for best user experience
 * - Maximize revenue without manual configuration
 * 
 * Benefits of Auto Ads:
 * - No need to create individual ad units
 * - No need to manually place ads
 * - Google's AI optimizes everything
 * - Easier to maintain
 * - Often higher revenue than manual placement
 */

const GoogleAutoAds = () => {
  const { subscription } = useSubscription()

  useEffect(() => {
    // Only show ads for free users or anonymous users
    // Hide ads for Basic, Pro, and Premium users (ad-free benefit)
    if (subscription && subscription.plan !== 'free') {
      return
    }

    // Check if Auto Ads script is already loaded
    const existingScript = document.querySelector(`script[data-ad-client="${ADSENSE_CLIENT_ID}"]`)
    
    if (!existingScript) {
      // Create and load the Auto Ads script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`
      script.crossOrigin = 'anonymous'
      script.setAttribute('data-ad-client', ADSENSE_CLIENT_ID)
      
      // Optional: Configure Auto Ads behavior
      script.setAttribute('data-ad-frequency-hint', '30s') // Show interstitial ads max every 30 seconds
      script.setAttribute('data-adbreak-test', 'on') // Enable for testing (remove in production)
      
      script.onload = () => {
        console.log('✅ Google Auto Ads loaded successfully')
      }
      
      script.onerror = () => {
        console.error('❌ Failed to load Google Auto Ads')
      }
      
      document.head.appendChild(script)
    }

    // Cleanup function
    return () => {
      // Note: We don't remove the script on unmount as it should persist across page navigation
    }
  }, [subscription])

  // This component doesn't render anything visible
  return null
}

/**
 * Ad-Free Badge Component
 * Shows a badge for premium users indicating they have ad-free experience
 */
export const AdFreeBadge = () => {
  const { subscription, isActive } = useSubscription()
  
  // Only show for premium users
  if (!isActive() || subscription?.plan === 'free') {
    return null
  }

  return (
    <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Ad-Free Experience
    </div>
  )
}

/**
 * Upgrade Prompt Component
 * Shows a prompt to upgrade for ad-free experience
 * Can be placed strategically on the page
 */
export const UpgradePrompt = ({ className = '', compact = false }) => {
  const { subscription, isActive } = useSubscription()
  
  // Don't show for premium users
  if (isActive() && subscription?.plan !== 'free') {
    return null
  }

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl text-center ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <span className="text-2xl">🚀</span>
          <div className="text-left">
            <h4 className="font-bold text-sm">Remove Ads</h4>
            <p className="text-xs opacity-90">Upgrade to Pro</p>
          </div>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Upgrade
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl text-center shadow-lg ${className}`}>
      <div className="text-4xl mb-3">🚀</div>
      <h3 className="font-bold text-xl mb-2">Remove Ads Forever</h3>
      <p className="text-sm mb-4 opacity-90">
        Upgrade to Pro for an ad-free experience, unlimited processing, and premium features!
      </p>
      <button 
        onClick={() => window.location.href = '/pricing'}
        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
      >
        Upgrade Now
      </button>
      <p className="text-xs mt-3 opacity-75">
        Join 50,000+ users enjoying ad-free PDF tools
      </p>
    </div>
  )
}

/**
 * Ad Status Indicator (for development/testing)
 * Shows whether ads are enabled for current user
 */
export const AdStatusIndicator = () => {
  const { subscription } = useSubscription()
  
  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  const adsEnabled = !subscription || subscription.plan === 'free'

  return (
    <div className={`fixed bottom-4 left-4 z-50 px-3 py-2 rounded-lg text-xs font-mono ${
      adsEnabled 
        ? 'bg-yellow-500 text-yellow-900' 
        : 'bg-green-500 text-green-900'
    }`}>
      {adsEnabled ? '📢 Ads: ON (Free User)' : '✨ Ads: OFF (Premium User)'}
    </div>
  )
}

export default GoogleAutoAds
