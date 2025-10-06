import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Mail, MessageSquare, Send, CheckCircle, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/contact/submit', formData)
      
      if (response.success) {
        setIsSubmitted(true)
        toast.success('Message sent successfully! We\'ll get back to you soon.')
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })

        // Reset success message after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error(error.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-page py-8 sm:py-12 px-3 sm:px-4 md:px-6 lg:px-8 mobile-spacing-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Get in Touch
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-400 flex-shrink-0" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                  For general inquiries and support
                </p>
                <a 
                  href="mailto:support@robotpdf.com" 
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm sm:text-base break-all"
                >
                  support@robotpdf.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-400 flex-shrink-0" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                  Available Monday - Friday
                </p>
                <p className="text-foreground font-medium text-sm sm:text-base">9:00 AM - 6:00 PM EST</p>
              </CardContent>
            </Card>

            

            
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Send us a Message</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {isSubmitted ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-900 rounded-full mb-3 sm:mb-4">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground px-4">
                      Thank you for contacting us. We'll respond to your message soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="name" className="text-xs sm:text-sm">
                          Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="bg-elevated border-border text-sm sm:text-base py-2 sm:py-3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-elevated border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="What is this regarding?"
                        value={formData.subject}
                        onChange={handleChange}
                        className="bg-elevated border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Message <span className="text-red-400">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="bg-elevated border-border resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <p className="text-xs text-muted-foreground">
                        <span className="text-red-400">*</span> Required fields
                      </p>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-blue w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mt-6 sm:mt-8">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">
                    How quickly will I receive a response?
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    We typically respond to all inquiries within 24 hours during business days.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Do you offer technical support?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! All paid plans include email support. Premium and Enterprise plans also include priority phone support.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Can I schedule a demo?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! Mention "demo request" in your message and we'll arrange a personalized demonstration.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
