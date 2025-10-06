import { Button } from '../ui/button'
import { Crown, TrendingUp, Clock, Shield, CheckCircle, Play } from 'lucide-react'

const ToolsGrid = ({ tools, selectedTool, onToolSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
      {tools.map((tool) => (
        <div
          key={tool.id}
          onClick={() => onToolSelect(tool)}
          className={`group relative bg-grey-900 rounded-2xl sm:rounded-3xl border-2 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl mobile-touch-target ${
            selectedTool?.id === tool.id
              ? 'border-purple-500 shadow-2xl shadow-purple-500/20'
              : 'border-grey-800 hover:border-border'
          }`}
        >
          {/* Pro Badge - Mobile Optimized */}
          <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full flex items-center">
            <Crown className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            PRO
          </div>

          {/* Popularity Badge - Mobile Optimized */}
          <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full flex items-center">
            <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            {tool.popularity}%
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Icon - Mobile Optimized */}
            <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${tool.iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <tool.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
            </div>

            {/* Content - Mobile Optimized */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground flex-1 line-clamp-2">{tool.title}</h3>
                <span className="text-xs bg-elevated text-muted-foreground px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap flex-shrink-0">
                  {tool.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{tool.description}</p>
              
              {/* Features - Mobile Optimized */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-secondary mb-3 sm:mb-4">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{tool.processingTime}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span className="hidden sm:inline">Enterprise</span>
                  <span className="sm:hidden">Pro</span>
                </div>
              </div>

              {/* Pro Features List - Mobile Optimized */}
              <div className="space-y-1 mb-3 sm:mb-4">
                {tool.features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-start text-xs text-secondary">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button - Mobile Optimized */}
            <Button 
              className={`w-full bg-gradient-to-r ${tool.color} text-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm h-9 sm:h-10 mobile-touch-target`}
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Select Tool
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ToolsGrid