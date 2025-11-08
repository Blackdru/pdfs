import { Link } from 'react-router-dom'
import { FileText, Heart, Shield, CreditCard, RefreshCw, Mail, HelpCircle } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-page border-t border-border mt-auto">
      <div className="layout-dark-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <img src="/icon.png" alt="RobotPDF Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
              </div>
              <div>
                <span className="text-xl font-bold text-gradient-grey font-poppins">
                  RobotPDF
                </span>
                <p className="text-sm text-primary-200 -mt-1">
                  ✨ AI-Powered Document Magic
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Transform your PDF workflow with intelligent OCR, AI-powered summaries,
              and advanced document processing tools. Built for professionals who demand excellence.
            </p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center text-primary-200 text-sm">
                <span>Made with</span>
                <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" />
                <span>for document productivity</span>
              </div>
              
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-card-foreground font-semibold mb-4">Legal</h3>
            <div className="space-y-3">
              <Link
                to="/privacy-policy"
                className="flex items-center text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Link>
              <Link
                to="/terms-conditions"
                className="flex items-center text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Terms & Conditions
              </Link>
              <Link
                to="/cancellation-refunds"
                className="flex items-center text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Cancellation & Refunds
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-card-foreground font-semibold mb-4">Support</h3>
            <div className="space-y-3">
              <Link
                to="/pricing"
                className="flex items-center text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pricing
              </Link>
              <Link
                to="/contact"
                className="flex items-center text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Us
              </Link>
              <Link
                to="/help"
                className="flex items-center text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Center
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-primary-200 text-sm">
              © 2025. All rights reserved.
            </p>
            <div>
             <p className="text-primary-200 text-sm">
              Budrock Technologies Private Limited.
             </p>
            </div>
            <div className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 via-white/5 to-green-500/10 border border-orange-500/20">
              <span className="text-lg mr-1.5">🇮🇳</span>
              <span className="text-xs font-semibold bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent">
                Made in India
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-secondary text-sm">Secure & Private</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-secondary text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer