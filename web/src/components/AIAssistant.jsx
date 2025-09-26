import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { aiChatService } from '../lib/aiChatService'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import toast from 'react-hot-toast'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  FileText,
  Brain,
  Zap,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react'

const AIAssistant = ({ fileId, fileName, onClose, isMinimized, onToggleMinimize }) => {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [aiAvailable, setAiAvailable] = useState(true)
  const messagesEndRef = useRef(null)

  // Check if user has access to AI features
  const hasAIAccess = subscription?.plan !== 'free' && subscription?.plan !== null

  useEffect(() => {
    if (fileId && hasAIAccess) {
      // Clear previous messages when fileId changes
      setMessages([])
      setSessionId(null)
      setIsInitialized(false)
      initializeChat()
    }
  }, [fileId, hasAIAccess])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeChat = async () => {
    try {
      setIsLoading(true)
      
      // Check AI availability first
      const availability = await aiChatService.checkAIAvailability()
      setAiAvailable(availability.available)
      
      if (!availability.available) {
        setMessages([{
          role: 'assistant',
          content: 'AI features are currently unavailable, but I can still help you with basic questions about your document.',
          timestamp: new Date().toISOString(),
          fallback: true
        }])
        setIsInitialized(true)
        return
      }

      // Initialize AI chat
      const result = await aiChatService.initializeChat(fileId)
      
      if (result.success) {
        setIsInitialized(true)
        setMessages([{
          role: 'assistant',
          content: `Hello! I'm ready to help you with "${fileName}". I've processed ${result.chunks || 0} text chunks from your document. What would you like to know?`,
          timestamp: new Date().toISOString()
        }])
        toast.success('AI chat initialized successfully!')
      }
    } catch (error) {
      console.error('Failed to initialize AI chat:', error)
      setAiAvailable(false)
      setMessages([{
        role: 'assistant',
        content: 'I encountered an issue initializing AI chat, but I can still help you with basic questions about your document.',
        timestamp: new Date().toISOString(),
        fallback: true
      }])
      setIsInitialized(true)
      toast.error('AI chat initialization failed, using fallback mode')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const result = await aiChatService.sendMessage(fileId, userMessage.content, sessionId)
      
      if (result.sessionId && !sessionId) {
        setSessionId(result.sessionId)
      }

      const assistantMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        fallback: result.fallback || false
      }

      setMessages(prev => [...prev, assistantMessage])

      if (result.fallback) {
        toast.error('AI response failed, using fallback')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your message. Please try again or contact support if the issue persists.',
        timestamp: new Date().toISOString(),
        error: true
      }

      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!hasAIAccess) {
    return (
      <Card className="bg-grey-900 border-grey-800 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-grey-200 mb-2">
            AI Chat - Premium Feature
          </h3>
          <p className="text-grey-400 mb-4">
            Upgrade to Pro or Premium to chat with your documents using AI.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </Card>
    )
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="bg-grey-900 border-grey-800 flex flex-col h-96 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-grey-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-grey-200">AI Assistant</h3>
            <p className="text-xs text-grey-400 truncate max-w-32">{fileName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {aiAvailable ? (
            <Badge variant="outline" className="border-green-600 text-green-400">
              <Zap className="h-3 w-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="border-yellow-600 text-yellow-400">
              <AlertCircle className="h-3 w-3 mr-1" />
              Fallback
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
            className="text-grey-400 hover:text-grey-200"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-grey-400 hover:text-grey-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isInitialized ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
              <p className="text-grey-400">Initializing AI chat...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.error
                      ? 'bg-red-900 text-red-200 border border-red-800'
                      : message.fallback
                      ? 'bg-yellow-900 text-yellow-200 border border-yellow-800'
                      : 'bg-grey-800 text-grey-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 mt-1">
                        {message.error ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : message.fallback ? (
                          <Brain className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-grey-800 text-grey-200 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-grey-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-grey-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-grey-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-grey-800">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your document..."
            disabled={isLoading || !isInitialized}
            className="flex-1 bg-grey-800 border-grey-700 text-grey-200 placeholder-grey-400"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim() || !isInitialized}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-grey-500">
          <span>Press Enter to send</span>
          {sessionId && (
            <span className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              Session active
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export default AIAssistant