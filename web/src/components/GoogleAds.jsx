import { useEffect, useRef } from 'react'
import { useSubscription } from '../contexts/SubscriptionContext'

// Global ad loading state to prevent duplicates across all components
const globalAdState = {
  scriptLoaded: false,
  loadedAds: new Set()
}

const GoogleAds = ({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {},
  className = ''
}) => {
  const { subscription, isActive } = useSubscription()
  const adRef = useRef(null)
  const adId = `ad-${adSlot}-${Math.random().toString(36).substr(2, 9)}`
  
  useEffect(() => {
    // Don't load ads for premium users
    if (isActive() && (subscription?.plan === 'pro' || subscription?.plan === 'premium')) {
      return
    }

    // Prevent duplicate ad loading for this specific ad
    if (globalAdState.loadedAds.has(adSlot)) {
      return
    }

    const loadAd = () => {
      if (adRef.current && !globalAdState.loadedAds.has(adSlot)) {
        try {
          // Mark this ad as loaded before pushing
          globalAdState.loadedAds.add(adSlot)
          
          // Only push if the element hasn't been processed
          if (!adRef.current.hasAttribute('data-adsbygoogle-status')) {
            window.adsbygoogle = window.adsbygoogle || []
            window.adsbygoogle.push({})
          }
        } catch (error) {
          // Remove from loaded set if failed
          globalAdState.loadedAds.delete(adSlot)
          console.warn('AdSense error (this is normal in development):', error.message)
        }
      }
    }

    // Load Google AdSense script if not already loaded
    if (!globalAdState.scriptLoaded) {
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]')
      
      if (!existingScript) {
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456'
        script.crossOrigin = 'anonymous'
        script.onload = () => {
          globalAdState.scriptLoaded = true
          loadAd()
        }
        script.onerror = () => {
          console.warn('Failed to load AdSense script')
        }
        document.head.appendChild(script)
      } else {
        globalAdState.scriptLoaded = true
        loadAd()
      }
    } else {
      loadAd()
    }

    // Cleanup function
    return () => {
      globalAdState.loadedAds.delete(adSlot)
    }
  }, [adSlot, isActive, subscription?.plan])

  // Don't show ads for premium users
  if (isActive() && (subscription?.plan === 'pro' || subscription?.plan === 'premium')) {
    return null
  }

  return (
    <div className={`google-ads-container ${className}`} id={adId}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client="ca-pub-1234567890123456" // Test ad unit
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  )
}

// Banner Ad Component
export const BannerAd = ({ className = '' }) => (
  <GoogleAds
    adSlot="1234567890"
    adFormat="horizontal"
    style={{ width: '100%', height: '90px' }}
    className={`banner-ad ${className}`}
  />
)

// Sidebar Ad Component  
export const SidebarAd = ({ className = '' }) => (
  <GoogleAds
    adSlot="2345678901"
    adFormat="vertical"
    style={{ width: '300px', height: '250px' }}
    className={`sidebar-ad ${className}`}
  />
)

// Square Ad Component
export const SquareAd = ({ className = '' }) => (
  <GoogleAds
    adSlot="3456789012"
    adFormat="rectangle"
    style={{ width: '300px', height: '300px' }}
    className={`square-ad ${className}`}
  />
)

// Mobile Banner Ad Component
export const MobileBannerAd = ({ className = '' }) => (
  <GoogleAds
    adSlot="4567890123"
    adFormat="horizontal"
    style={{ width: '100%', height: '50px' }}
    className={`mobile-banner-ad ${className}`}
  />
)

// Large Rectangle Ad Component
export const LargeRectangleAd = ({ className = '' }) => (
  <GoogleAds
    adSlot="5678901234"
    adFormat="rectangle"
    style={{ width: '336px', height: '280px' }}
    className={`large-rectangle-ad ${className}`}
  />
)

// Responsive Ad Component
export const ResponsiveAd = ({ className = '' }) => (
  <GoogleAds
    adSlot="6789012345"
    adFormat="auto"
    style={{ display: 'block', width: '100%', minHeight: '100px' }}
    className={`responsive-ad ${className}`}
    fullWidthResponsive={true}
  />
)

// In-Article Ad Component
export const InArticleAd = ({ className = '' }) => (
  <div className={`in-article-ad-wrapper my-8 ${className}`}>
    <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
    <GoogleAds
      adSlot="7890123456"
      adFormat="fluid"
      style={{ display: 'block', textAlign: 'center' }}
      className="in-article-ad"
    />
  </div>
)

// Multiplex Ad Component (for related content)
export const MultiplexAd = ({ className = '' }) => (
  <GoogleAds
    adSlot="8901234567"
    adFormat="multiplex"
    style={{ display: 'block', width: '100%', minHeight: '200px' }}
    className={`multiplex-ad ${className}`}
  />
)

// Premium upgrade prompt component (shows instead of ads for free users)
export const UpgradePrompt = ({ className = '' }) => {
  const { subscription, isActive } = useSubscription()
  
  // Don't show for premium users
  if (isActive() && (subscription?.plan === 'pro' || subscription?.plan === 'premium')) {
    return null
  }

  return (
    <div className={`${className} bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg text-center`}>
      <h3 className="font-semibold mb-2">🚀 Upgrade to Pro</h3>
      <p className="text-sm mb-3">Remove ads, get unlimited OCR, advanced AI chat, and more!</p>
      <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
        Upgrade Now
      </button>
    </div>
  )
}

export default GoogleAds