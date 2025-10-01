import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { 
  FileText, 
  GitMerge, 
  Scissors, 
  Archive, 
  Image, 
  Zap,
  Shield,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Download,
  Upload,
  Eye,
  Lock,
  Rocket,
  Play,
  ChevronRight,
  Brain,
  MessageSquare,
  Layers,
  Award,
  Heart,
  Palette
} from 'lucide-react'

const ModernHome = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: GitMerge,
      title: 'Smart PDF Merge',
      description: 'Intelligently combine multiple PDFs with AI-powered organization',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900',
      hoverBg: 'group-hover:bg-blue-800',
      gradient: 'bg-gradient-blue'
    },
    {
      icon: Scissors,
      title: 'Precision Split',
      description: 'Extract pages with surgical precision using advanced algorithms',
      color: 'text-green-400',
      bgColor: 'bg-green-900',
      hoverBg: 'group-hover:bg-green-800',
      gradient: 'bg-gradient-green'
    },
    {
      icon: Archive,
      title: 'Ultra Compress',
      description: 'Reduce file sizes by up to 90% while preserving quality',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900',
      hoverBg: 'group-hover:bg-purple-800',
      gradient: 'bg-gradient-purple'
    },
    {
      icon: Image,
      title: 'Image Magic',
      description: 'Transform any image format into beautiful PDFs instantly',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900',
      hoverBg: 'group-hover:bg-orange-800',
      gradient: 'bg-gradient-orange'
    },
    {
      icon: Eye,
      title: 'Preview Pro',
      description: 'Advanced PDF viewer with annotation and markup tools',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900',
      hoverBg: 'group-hover:bg-blue-800',
      gradient: 'bg-gradient-blue'
    },
    {
      icon: Lock,
      title: 'Fort Knox Security',
      description: 'Military-grade encryption and password protection',
      color: 'text-grey-400',
      bgColor: 'bg-grey-700',
      hoverBg: 'group-hover:bg-grey-600',
      gradient: 'bg-gradient-accent'
    }
  ]

  const benefits = [
    {
      icon: Rocket,
      title: 'Lightning Speed',
      description: 'Process documents 10x faster than traditional tools',
      color: 'text-blue-400',
      bgGradient: 'bg-gradient-blue'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your files are encrypted and auto-deleted after processing',
      color: 'text-green-400',
      bgGradient: 'bg-gradient-green'
    },
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Advanced AI for smart document processing and analysis',
      color: 'text-purple-400',
      bgGradient: 'bg-gradient-purple'
    },
    {
      icon: MessageSquare,
      title: 'Chat with PDFs',
      description: 'Ask questions and get instant answers from your documents',
      color: 'text-orange-400',
      bgGradient: 'bg-gradient-orange'
    }
  ]

  const stats = [
    { number: '5M+', label: 'Documents Processed', icon: FileText },
    { number: '100K+', label: 'Happy Users', icon: Users },
    { number: '99.99%', label: 'Uptime', icon: Zap },
    { number: '24/7', label: 'AI Support', icon: Brain }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      company: 'TechCorp',
      content: 'This tool has revolutionized how our team handles documents. The AI features are incredible!',
      avatar: '👩‍💼'
    },
    {
      name: 'Marcus Johnson',
      role: 'Freelance Designer',
      company: 'Independent',
      content: 'The quality and speed are unmatched. I can process hundreds of files in minutes.',
      avatar: '👨‍🎨'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Legal Assistant',
      company: 'Law Firm',
      content: 'Security and reliability are paramount for us. This platform delivers on both fronts.',
      avatar: '👩‍⚖️'
    }
  ]

  return (
    <div className="min-h-screen bg-page relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-900 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-900 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-950 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-950 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-elevated rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="layout-dark-section relative">
        <div className="layout-dark-container">
          <div className={`text-center max-w-6xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center px-8 py-4 glass-card-dark text-card-foreground rounded-full text-sm font-semibold mb-12 border border-border">
              <Sparkles className="h-5 w-5 mr-3 text-blue-400" />
              ✨ Next-Generation AI-Powered PDF Suite
              <ChevronRight className="h-4 w-4 ml-2" />
            </div>
            
            <h1 className="heading-dark-1 mb-8 leading-tight">
              Transform Documents with
              <span className="block mt-4 text-gradient-hero animate-pulse-glow">
                Intelligent Precision
              </span>
            </h1>
            
            <p className="body-dark-large text-card-foreground mb-16 max-w-4xl mx-auto leading-relaxed">
              Experience the future of document processing with our revolutionary AI-powered platform. 
              Merge, split, compress, and transform your PDFs with unprecedented speed, intelligence, and beauty.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              {user ? (
                <Button 
                  onClick={() => navigate('/register')} 
                  className="btn-blue text-xl px-12 py-6 h-auto font-semibold"
                >
                  <Rocket className="mr-3 h-6 w-6" />
                  Start for Free
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/register')} 
                    className="btn-blue text-xl px-12 py-6 h-auto font-semibold"
                  >
                    <Play className="mr-3 h-6 w-6" />
                    Start Free Journey
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                  <Button 
                    onClick={() => navigate('/login')}
                    className="btn-dark-glass text-xl px-12 py-6 h-auto font-semibold"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="layout-dark-section bg-surface">
        <div className="layout-dark-container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-blue text-white rounded-full text-sm font-semibold mb-8">
              <Layers className="h-5 w-5 mr-2" />
              Powerful Features
            </div>
            <h2 className="heading-dark-2 mb-6">Revolutionary PDF Tools</h2>
            <p className="body-dark-large text-card-foreground max-w-3xl mx-auto">
              Discover a complete suite of intelligent tools designed to make document processing effortless and enjoyable
            </p>
          </div>
          
          <div className="grid-dark-responsive">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={`dark-card-hover p-8 group relative overflow-hidden ${
                  isVisible ? 'animate-slide-up-fade' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150" 
                     style={{ background: feature.gradient }}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start space-x-6">
                    <div className={`p-5 rounded-3xl ${feature.bgColor} ${feature.hoverBg} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="heading-dark-4 mb-3 group-hover:text-foreground transition-colors">{feature.title}</h3>
                      <p className="body-dark text-muted-foreground group-hover:text-card-foreground transition-colors leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="layout-dark-section bg-elevated relative">
        <div className="layout-dark-container relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-green text-white rounded-full text-sm font-semibold mb-8">
              <Award className="h-5 w-5 mr-2" />
              Why Choose Us
            </div>
            <h2 className="heading-dark-2 mb-6">Built for Excellence</h2>
            <p className="body-dark-large text-card-foreground max-w-3xl mx-auto">
              Experience the perfect blend of cutting-edge technology and intuitive design
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.title}
                className={`text-center group ${
                  isVisible ? 'animate-scale-fade' : ''
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative mb-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${benefit.bgGradient} rounded-3xl shadow-xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <benefit.icon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="heading-dark-4 mb-4 group-hover:text-foreground transition-colors">{benefit.title}</h3>
                <p className="body-dark text-muted-foreground group-hover:text-card-foreground transition-colors">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* How It Works Section */}
      <section className="layout-dark-section bg-surface">
        <div className="layout-dark-container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-purple text-white rounded-full text-sm font-semibold mb-8">
              <Zap className="h-5 w-5 mr-2" />
              Simple Process
            </div>
            <h2 className="heading-dark-2 mb-6">Three Steps to Magic</h2>
            <p className="body-dark-large text-card-foreground max-w-3xl mx-auto">
              Transform your documents in just three simple steps with our intuitive interface
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Upload,
                title: 'Upload & Drop',
                description: 'Drag and drop your files or select them from your device. We support all major formats.',
                color: 'bg-gradient-blue',
                delay: '100ms'
              },
              {
                icon: Palette,
                title: 'Choose & Customize',
                description: 'Select your desired tool and customize settings with our intelligent recommendations.',
                color: 'bg-gradient-green',
                delay: '300ms'
              },
              {
                icon: Download,
                title: 'Download & Enjoy',
                description: 'Get your perfectly processed files instantly with our lightning-fast processing engine.',
                color: 'bg-gradient-purple',
                delay: '500ms'
              }
            ].map((step, index) => (
              <div 
                key={index}
                className={`text-center relative group ${
                  isVisible ? 'animate-slide-up-fade' : ''
                }`}
                style={{ animationDelay: step.delay }}
              >
                <div className="relative mb-8">
                  <div className={`relative inline-flex items-center justify-center w-24 h-24 ${step.color} text-white rounded-3xl text-2xl font-bold shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {index + 1}
                    <step.icon className="absolute inset-0 m-auto h-10 w-10 opacity-30" />
                  </div>
                </div>
                
                <h3 className="heading-dark-4 mb-4 group-hover:text-foreground transition-colors">{step.title}</h3>
                <p className="body-dark text-muted-foreground group-hover:text-card-foreground transition-colors leading-relaxed">{step.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full z-10">
                    <div className="flex items-center justify-center">
                      
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="layout-dark-section bg-surface relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-80 h-80 bg-blue-950 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-green-950 rounded-full blur-3xl"></div>
        </div>
        
        <div className="layout-dark-container relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-purple text-white rounded-full text-sm font-semibold mb-8">
              <Star className="h-5 w-5 mr-2" />
              Transparent Pricing
            </div>
            <h2 className="heading-dark-2 mb-6">Choose Your Perfect Plan</h2>
            <p className="body-dark-large text-card-foreground max-w-3xl mx-auto">
              Start free and scale as you grow. All plans include our core features with no hidden fees or surprises.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className={`dark-card-hover p-10 text-center relative ${
              isVisible ? 'animate-scale-fade' : ''
            }`} style={{ animationDelay: '100ms' }}>
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-3xl mb-6">
                  <Star className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="heading-dark-3 mb-3">Starter</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-card-foreground">$0</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
                <p className="text-muted-foreground">Perfect for getting started</p>
              </div>
              
              <div className="space-y-4 mb-10">
                {[
                  '10 files per month',
                  '10MB max file size',
                  '100MB storage',
                  'Basic PDF tools',
                  '5 OCR pages/month'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-card-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => navigate('/register')} 
                className="btn-dark-outline w-full text-lg py-4"
              >
                Start Free
              </Button>
            </div>

            {/* Pro Plan */}
            <div className={`dark-card-hover p-10 text-center relative border-2 border-blue-800 ${
              isVisible ? 'animate-scale-fade' : ''
            }`} style={{ animationDelay: '300ms' }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-blue text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </span>
              </div>
              
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-blue rounded-3xl mb-6">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="heading-dark-3 mb-3">Professional</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-card-foreground">$1</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
                <p className="text-muted-foreground">For power users and professionals</p>
              </div>
              
              <div className="space-y-4 mb-10">
                {[
                  '500 files per month',
                  '50MB max file size',
                  '2GB storage',
                  'Advanced PDF tools',
                  '200 OCR pages/month',
                  '1,000 AI messages/month',
                  'Batch processing (20 files)'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-card-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => navigate('/upgrade')} 
                className="btn-blue w-full text-lg py-4"
              >
                Start Pro Trial
              </Button>
            </div>

            {/* Premium Plan */}
            <div className={`dark-card-hover p-10 text-center relative ${
              isVisible ? 'animate-scale-fade' : ''
            }`} style={{ animationDelay: '500ms' }}>
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-green rounded-3xl mb-6">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h3 className="heading-dark-3 mb-3">Enterprise</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-card-foreground">$10</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
                <p className="text-muted-foreground">For teams and enterprises</p>
              </div>
              
              <div className="space-y-4 mb-10">
                {[
                  'Unlimited files',
                  '200MB max file size',
                  '20GB storage',
                  'All PDF tools + AI features',
                  'Unlimited OCR',
                  'Unlimited AI messages',
                  'Priority support'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-card-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => navigate('/upgrade')} 
                className="btn-green w-full text-lg py-4"
              >
                Go Enterprise
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Button 
              onClick={() => navigate('/upgrade')}
              className="btn-dark-glass text-card-foreground hover:text-card-foreground"
            >
              View detailed comparison →
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="layout-dark-section bg-gradient-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-40 h-40 bg-accent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-56 h-56 bg-elevated rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="layout-dark-container text-center relative">
          <div className={`max-w-4xl mx-auto ${isVisible ? 'animate-scale-fade' : ''}`}>
            <h2 className="heading-dark-2 mb-8 text-white">
              Ready to Transform Your Workflow?
            </h2>
            <p className="body-dark-large mb-12 text-card-foreground leading-relaxed">
              Join millions of users who have revolutionized their document processing. 
              Start your free journey today and experience the magic of intelligent PDF tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              {user ? (
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="bg-white text-grey-900 hover:bg-grey-100 text-xl px-12 py-6 h-auto font-semibold rounded-2xl shadow-2xl transition-all duration-300"
                >
                  <Rocket className="mr-3 h-6 w-6" />
                  Launch Dashboard
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/register')} 
                    className="bg-white text-grey-900 hover:bg-grey-100 text-xl px-12 py-6 h-auto font-semibold rounded-2xl shadow-2xl transition-all duration-300"
                  >
                    <Play className="mr-3 h-6 w-6" />
                    Start Free Journey
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                  <Button 
                    onClick={() => navigate('/login')}
                    className="btn-dark-glass text-white border-border hover:bg-accent text-xl px-12 py-6 h-auto font-semibold"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-card-foreground">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Free forever plan
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Bank-level security
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                24/7 AI support
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default ModernHome