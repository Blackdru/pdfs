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
  Palette,
  TrendingUp,
  Globe,
  Clock
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
      description: 'Combine multiple PDFs seamlessly with intelligent page ordering',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400'
    },
    {
      icon: Scissors,
      title: 'Precision Split',
      description: 'Extract specific pages or split by size with surgical precision',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400'
    },
    {
      icon: Archive,
      title: 'Ultra Compress',
      description: 'Reduce file sizes by up to 90% without quality loss',
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400'
    },
    {
      icon: Brain,
      title: 'AI-Enhanced OCR',
      description: 'Extract text from scanned PDFs with 99% accuracy',
      color: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-400'
    },
    {
      icon: MessageSquare,
      title: 'Chat with PDF',
      description: 'Ask questions and get instant answers from your documents',
      color: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400'
    },
    {
      icon: Sparkles,
      title: 'Smart Summary',
      description: 'Generate intelligent summaries in seconds with AI',
      color: 'from-pink-500 to-rose-500',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-400'
    }
  ]

  const benefits = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process documents 10x faster with optimized algorithms',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'End-to-end encryption and automatic file deletion',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      icon: Globe,
      title: '100+ Languages',
      description: 'Support for all major languages with AI translation',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access your tools anytime, anywhere, on any device',
      gradient: 'from-purple-400 to-pink-500'
    }
  ]

  const stats = [
    { number: '10M+', label: 'Documents Processed', icon: FileText, color: 'text-blue-400' },
    { number: '500K+', label: 'Happy Users', icon: Users, color: 'text-emerald-400' },
    { number: '99.9%', label: 'Uptime', icon: TrendingUp, color: 'text-purple-400' },
    { number: '4.9/5', label: 'User Rating', icon: Star, color: 'text-orange-400' }
  ]

  return (
    <div className="min-h-screen bg-page">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className={`text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm mb-8">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">AI-Powered PDF Suite</span>
              <ChevronRight className="h-4 w-4 text-blue-400" />
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="text-white">Transform PDFs with</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                AI Intelligence
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              The most powerful PDF toolkit powered by artificial intelligence. 
              Merge, split, compress, and chat with your documents in seconds.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {user ? (
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="group relative px-8 py-6 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 hover:-translate-y-1"
                >
                  <Rocket className="inline-block mr-2 h-5 w-5" />
                  Go to Dashboard
                  <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/register')} 
                    className="group relative px-8 py-6 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 hover:-translate-y-1"
                  >
                    <Play className="inline-block mr-2 h-5 w-5" />
                    Start Free
                    <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={() => navigate('/login')}
                    className="px-8 py-6 text-lg font-semibold rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm mb-6">
              <Layers className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Professional-grade PDF tools powered by cutting-edge AI technology
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group relative p-8 rounded-3xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.iconBg} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm mb-6">
              <Award className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-200">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Built for Performance
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Experience the perfect blend of speed, security, and intelligence
            </p>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className={`text-center group ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${benefit.gradient} mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  <benefit.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-sm mb-6">
              <Zap className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-200">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Three Steps to Success
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Transform your documents in just three simple steps
            </p>
          </div>
          
          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Upload,
                title: 'Upload Files',
                description: 'Drag and drop your PDFs or select them from your device',
                gradient: 'from-blue-500 to-cyan-500',
                number: '01'
              },
              {
                icon: Palette,
                title: 'Choose Tool',
                description: 'Select from our suite of powerful AI-powered tools',
                gradient: 'from-purple-500 to-pink-500',
                number: '02'
              },
              {
                icon: Download,
                title: 'Download Result',
                description: 'Get your processed files instantly with perfect quality',
                gradient: 'from-emerald-500 to-teal-500',
                number: '03'
              }
            ].map((step, index) => (
              <div 
                key={index}
                className={`relative text-center ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-slate-700 to-transparent"></div>
                )}
                
                {/* Step Number */}
                <div className={`relative inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br ${step.gradient} mb-6 shadow-2xl`}>
                  <span className="text-5xl font-bold text-white">{step.number}</span>
                  <step.icon className="absolute bottom-4 right-4 h-8 w-8 text-white/50" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Final CTA */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className={`${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-1000`}>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-slate-300 mb-12 leading-relaxed">
              Join thousands of users who trust RobotPDF for their document processing needs.
              Start your free journey today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="group px-10 py-7 text-xl font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/60 transition-all duration-300 hover:-translate-y-1"
                >
                  <Rocket className="inline-block mr-2 h-6 w-6" />
                  Launch Dashboard
                  <ArrowRight className="inline-block ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/register')} 
                    className="group px-10 py-7 text-xl font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/60 transition-all duration-300 hover:-translate-y-1"
                  >
                    <Play className="inline-block mr-2 h-6 w-6" />
                    Start Free
                    <ArrowRight className="inline-block ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={() => navigate('/pricing')}
                    className="px-10 py-7 text-xl font-semibold rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
                  >
                    View Pricing
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ModernHome
