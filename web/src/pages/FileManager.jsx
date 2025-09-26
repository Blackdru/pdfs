import { useAuth } from '../contexts/AuthContext'
import FileManager from '../components/FileManager'
import { BannerAd, ResponsiveAd } from '../components/AdPlaceholder'

const FileManagerPage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-grey-950 mobile-spacing-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-950 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-950 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="layout-dark-container py-12 relative">
        {/* Top Banner Ad */}
        <div className="mb-8">
          <BannerAd className="w-full" />
        </div>
        
        <FileManager />

        {/* Bottom Responsive Ad */}
        <div className="mt-12">
          <ResponsiveAd className="w-full" />
        </div>
      </div>
    </div>
  )
}

export default FileManagerPage