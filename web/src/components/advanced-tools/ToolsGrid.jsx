import { Button } from '../ui/button'
import { Crown, TrendingUp, Clock, Shield, CheckCircle, Play } from 'lucide-react'

const ToolsGrid = ({ tools, selectedTool, onToolSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
      {tools.map((tool) => (
        <div
          key={tool.id}
          onClick={() => onToolSelect(tool)}
          className={`group relative bg-grey-900 rounded-3xl border-2 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl ${
            selectedTool?.id === tool.id
              ? 'border-purple-500 shadow-2xl shadow-purple-500/20'
              : 'border-grey-800 hover:border-border'
          }`}
        >
          {/* Pro Badge */}
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
            <Crown className="h-3 w-3 mr-1" />
            PRO
          </div>

          {/* Popularity Badge */}
          <div className="absolute -top-3 -left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {tool.popularity}%
          </div>

          <div className="p-8">
            {/* Icon */}
            <div className={`w-16 h-16 ${tool.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <tool.icon className="h-8 w-8 text-white" />
            </div>

            {/* Content */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-foreground">{tool.title}</h3>
                <span className="text-xs bg-elevated text-muted-foreground px-2 py-1 rounded-full">
                  {tool.category}
                </span>
              </div>
              <p className="text-muted-foreground mb-4">{tool.description}</p>
              
              {/* Features */}
              <div className="flex items-center justify-between text-sm text-secondary mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {tool.processingTime}
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Enterprise
                </div>
              </div>

              {/* Pro Features List */}
              <div className="space-y-1 mb-4">
                {tool.features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-center text-xs text-secondary">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className={`w-full bg-gradient-to-r ${tool.color} text-white hover:shadow-lg transition-all duration-300`}
            >
              <Play className="h-4 w-4 mr-2" />
              Select Tool
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ToolsGrid