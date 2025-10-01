import { Link } from 'react-router-dom'
import { FileText, Heart, Shield, CreditCard, RefreshCw } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-grey-950 border-t border-grey-800 mt-auto">
      <div className="layout-dark-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-blue rounded-2xl blur-lg scale-110" />
                <div className="relative bg-gradient-blue p-3 rounded-2xl shadow-blue">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gradient-grey font-poppins">
                  PDFPet
                </span>
                <p className="text-sm text-grey-500 -mt-1">
                  ✨ AI-Powered Document Magic
                </p>
              </div>
            </div>
            <p className="text-grey-400 text-sm mb-4 max-w-md">
              Transform your PDF workflow with intelligent OCR, AI-powered summaries, 
              and advanced document processing tools. Built for professionals who demand excellence.
            </p>
            <div className="flex items-center text-grey-500 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" />
              <span>for document productivity</span>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-grey-200 font-semibold mb-4">Legal</h3>
            <div className="space-y-3">
              <Link 
                to="/privacy-policy" 
                className="flex items-center text-grey-400 hover:text-grey-200 transition-colors text-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Link>
              <Link 
                to="/terms-conditions" 
                className="flex items-center text-grey-400 hover:text-grey-200 transition-colors text-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Terms & Conditions
              </Link>
              <Link 
                to="/cancellation-refunds" 
                className="flex items-center text-grey-400 hover:text-grey-200 transition-colors text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Cancellation & Refunds
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-grey-200 font-semibold mb-4">Support</h3>
            <div className="space-y-3">
              <Link 
                to="/pricing" 
                className="flex items-center text-grey-400 hover:text-grey-200 transition-colors text-sm"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pricing
              </Link>
              <a 
                href="mailto:support@pdfpet.com" 
                className="flex items-center text-grey-400 hover:text-grey-200 transition-colors text-sm"
              >
                Contact Support
              </a>
              <Link 
                to="/help" 
                className="flex items-center text-grey-400 hover:text-grey-200 transition-colors text-sm"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-grey-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-grey-500 text-sm">
            © 2024 PDFPet. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-grey-500 text-sm">Secure & Private</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-grey-500 text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer