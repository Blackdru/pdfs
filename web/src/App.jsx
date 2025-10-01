import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'

// Pages
import Home from './pages/Home'
import ModernHome from './pages/ModernHome'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
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

// Components
import Navbar from './components/Navbar'
import ModernNavbar from './components/ModernNavbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

const AppContent = () => {
  const { theme } = useTheme()
  
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-background font-inter">
        <ModernNavbar />
        <main className="modern-scrollbar">
              <Routes>
                <Route path="/" element={<ModernHome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <ModernDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tools" 
                  element={
                    <ProtectedRoute>
                      <Tools />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/advanced-tools" 
                  element={
                    <ProtectedRoute>
                      <AdvancedTools />
                    </ProtectedRoute>
                  } 
                />
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
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
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
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App