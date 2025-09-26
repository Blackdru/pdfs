import { useSubscription } from '../contexts/SubscriptionContext'

const AdPlaceholder = ({ 
  adSlot, 
  adFormat = 'auto',
  style = {},
  className = '',
  placeholderText = 'Advertisement Space'
}) => {
  const { subscription, isActive } = useSubscription()

  // Don't show ads for premium users
  if (isActive() && (subscription?.plan === 'pro' || subscription?.plan === 'premium')) {
    return null
  }

  // In development, show placeholder instead of real ads
  if (import.meta.env.DEV) {
    return (
      <div 
        className={`ad-placeholder border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 text-sm ${className}`}
        style={{
          minHeight: '90px',
          ...style
        }}
      >
        <div className="text-center">
          <div className="mb-1">📢 {placeholderText}</div>
          <div className="text-xs opacity-75">Slot: {adSlot}</div>
        </div>
      </div>
    )
  }

  // In production, this would load real ads
  return (
    <div className={`google-ads-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client="ca-pub-1234567890123456"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Banner Ad Component
export const BannerAd = ({ className = '' }) => (
  <AdPlaceholder
    adSlot="1234567890"
    adFormat="horizontal"
    style={{ width: '100%', height: '90px' }}
    className={`banner-ad ${className}`}
    placeholderText="Banner Advertisement"
  />
)

// Sidebar Ad Component  
export const SidebarAd = ({ className = '' }) => (
  <AdPlaceholder
    adSlot="2345678901"
    adFormat="vertical"
    style={{ width: '300px', height: '250px' }}
    className={`sidebar-ad ${className}`}
    placeholderText="Sidebar Advertisement"
  />
)

// Square Ad Component
export const SquareAd = ({ className = '' }) => (
  <AdPlaceholder
    adSlot="3456789012"
    adFormat="rectangle"
    style={{ width: '300px', height: '300px' }}
    className={`square-ad ${className}`}
    placeholderText="Square Advertisement"
  />
)

// Mobile Banner Ad Component
export const MobileBannerAd = ({ className = '' }) => (
  <AdPlaceholder
    adSlot="4567890123"
    adFormat="horizontal"
    style={{ width: '100%', height: '50px' }}
    className={`mobile-banner-ad ${className}`}
    placeholderText="Mobile Banner Ad"
  />
)

// Responsive Ad Component
export const ResponsiveAd = ({ className = '' }) => (
  <AdPlaceholder
    adSlot="6789012345"
    adFormat="auto"
    style={{ display: 'block', width: '100%', minHeight: '100px' }}
    className={`responsive-ad ${className}`}
    placeholderText="Responsive Advertisement"
  />
)

// Premium upgrade prompt component
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

export default AdPlaceholder