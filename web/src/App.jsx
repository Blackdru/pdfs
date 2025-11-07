import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import ModernHome from './pages/ModernHome'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ModernDashboard from './pages/ModernDashboard'
import Tools from './pages/Tools'
import AdvancedTools from './pages/AdvancedTools'
import FileManagerPage from './pages/FileManager'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Billing from './pages/Billing'
import Upgrade from './pages/Upgrade'
import Pricing from './pages/Pricing'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import CancellationRefunds from './pages/CancellationRefunds'
import Contact from './pages/Contact'
import AIEnhancedOCR from './pages/AIEnhancedOCR'
import AIChatWithPDF from './pages/AIChatWithPDF'
import AISmartSummary from './pages/AISmartSummary'
import ResumeGenerator from './pages/ResumeGenerator'

// Components
import ModernNavbar from './components/ModernNavbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ScrollToTop from './components/ScrollToTop'

const AppContent = () => {
  const { theme } = useTheme()
  const location = useLocation()

  useEffect(() => {
    const routeMeta = {
      '/': {
        title: 'RobotPDF: AI PDF Tools — Merge, Split, OCR, Convert, Chat with PDFs',
        description: 'AI-powered PDF toolkit to merge, split, compress, convert, OCR, extract, summarize and chat with PDFs in seconds.'
      },
      '/pricing': {
        title: 'Pricing — RobotPDF',
        description: 'Choose a plan for AI PDF tools: merge, split, compress, convert, OCR, and chat with PDFs.'
      },
      '/contact': {
        title: 'Contact — RobotPDF',
        description: 'Get support for RobotPDF’s AI PDF tools.'
      },
      '/privacy-policy': {
        title: 'Privacy Policy — RobotPDF',
        description: 'Learn how RobotPDF handles your data securely.'
      },
      '/terms-conditions': {
        title: 'Terms & Conditions — RobotPDF',
        description: 'Read RobotPDF terms and conditions.'
      },
      '/cancellation-refunds': {
        title: 'Cancellation & Refunds — RobotPDF',
        description: 'RobotPDF subscription cancellation and refund policy.'
      },
      '/tools': {
        title: 'PDF Tools — Merge, Split, Compress, Convert | RobotPDF',
        description: 'Use professional PDF tools to merge, split, compress and convert documents. Some features may require sign in.'
      },
      '/advanced-tools': {
        title: 'Advanced AI PDF Tools — RobotPDF',
        description: 'Advanced AI features for PDFs like OCR, chat with PDF, and batch processing. Upgrade required to use Pro features.'
      },
      '/ai-enhanced-ocr-pdf': {
        title: 'AI-Enhanced OCR for PDF — Extract Text with 99% Accuracy | RobotPDF',
        description: 'Transform scanned PDFs into editable text with AI-powered OCR. 99% accuracy, 100+ languages, handles complex layouts and handwriting. Free to start.'
      },
      '/ai-chat-with-pdf': {
        title: 'AI Chat with PDF — Ask Questions, Get Instant Answers | RobotPDF',
        description: 'Chat with your PDF documents using AI. Ask questions in natural language and get accurate answers with citations. Perfect for research and analysis.'
      },
      '/ai-smart-summary': {
        title: 'AI Smart Summary — Summarize PDFs in Seconds | RobotPDF',
        description: 'Generate intelligent summaries of PDF documents instantly. Save 90% reading time with AI-powered summaries. Perfect for research papers and reports.'
      },
      '/resume-generator': {
        title: 'AI Resume Generator — Create Professional Resumes | RobotPDF',
        description: 'Generate ATS-optimized professional resumes with AI. Multiple templates, industry-specific content, and instant download. Free to start.'
      }
    }

    const path = location.pathname
    const meta = routeMeta[path] || routeMeta['/']
    document.title = meta.title

    // Description
    let desc = document.querySelector('meta[name="description"]')
    if (!desc) {
      desc = document.createElement('meta')
      desc.setAttribute('name', 'description')
      document.head.appendChild(desc)
    }
    desc.setAttribute('content', meta.description)

    // Robots based on route accessibility
    const protectedPaths = ['/login','/register','/forgot-password','/dashboard','/tools','/advanced-tools','/files','/profile','/billing','/upgrade','/admin']
    const robotsContent = protectedPaths.includes(path) ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.setAttribute('name', 'robots')
      document.head.appendChild(robots)
    }
    robots.setAttribute('content', robotsContent)

    // Canonical
    const site = (import.meta.env?.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '')
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', site + path + (path.endsWith('/') ? '' : '/'))

    // Open Graph
    const setOg = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', property)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }
    setOg('og:title', meta.title)
    setOg('og:description', meta.description)
    setOg('og:url', site + path + (path.endsWith('/') ? '' : '/'))
  }, [location.pathname])
  
  return (
    <div className="min-h-screen bg-background font-inter flex flex-col">
      <ScrollToTop />
      <ModernNavbar />
      <main className="modern-scrollbar flex-1">
        <Routes>
                <Route path="/" element={<ModernHome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <ModernDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/tools" element={<Tools />} />
                <Route path="/advanced-tools" element={<AdvancedTools />} />
                <Route 
                  path="/files" 
                  element={
                    <ProtectedRoute>
                      <FileManagerPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/billing" 
                  element={
                    <ProtectedRoute>
                      <Billing />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/upgrade" 
                  element={
                    <ProtectedRoute>
                      <Upgrade />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
                <Route path="/ai-enhanced-ocr-pdf" element={<AIEnhancedOCR />} />
                <Route path="/ai-chat-with-pdf" element={<AIChatWithPDF />} />
                <Route path="/ai-smart-summary" element={<AISmartSummary />} />
                <Route 
                  path="/resume-generator" 
                  element={
                    <ProtectedRoute>
                      <ResumeGenerator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  } 
                />
              </Routes>
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: theme === 'dark' ? {
            background: 'rgb(39 39 42)',
            color: 'rgb(245 245 247)',
            border: '1px solid rgb(63 63 70)',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.9), 0 4px 6px -2px rgb(0 0 0 / 0.9)',
          } : {
            background: 'rgb(255 255 255)',
            color: 'rgb(15 15 17)',
            border: '1px solid rgb(228 228 231)',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.1)',
          },
          success: {
            style: {
              background: 'rgb(22 163 74)',
              color: 'rgb(255 255 255)',
              border: '1px solid rgb(34 197 94)',
            },
            iconTheme: {
              primary: 'rgb(255 255 255)',
              secondary: 'rgb(22 163 74)',
            },
          },
          error: {
            style: {
              background: 'rgb(220 38 38)',
              color: 'rgb(255 255 255)',
              border: '1px solid rgb(239 68 68)',
            },
            iconTheme: {
              primary: 'rgb(255 255 255)',
              secondary: 'rgb(220 38 38)',
            },
          },
          loading: {
            style: {
              background: 'rgb(59 130 246)',
              color: 'rgb(255 255 255)',
              border: '1px solid rgb(96 165 250)',
            },
            iconTheme: {
              primary: 'rgb(255 255 255)',
              secondary: 'rgb(59 130 246)',
            },
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <AppContent />
            </Router>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App