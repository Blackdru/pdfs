import { RefreshCw, CreditCard, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

const CancellationRefunds = () => {
  return (
    <div className="min-h-screen bg-grey-950 py-12">
      <div className="layout-dark-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-grey-200 mb-4">Cancellation & Refunds</h1>
            <p className="text-grey-400 text-lg">
              Understand our cancellation and refund policies for PDFPet subscriptions.
            </p>
            <p className="text-grey-500 text-sm mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <Card className="bg-grey-900 border-grey-800 p-8">
              <div className="flex items-center mb-6">
                <Calendar className="h-6 w-6 text-blue-400 mr-3" />
                <h2 className="text-2xl font-semibold text-grey-200">Subscription Cancellation</h2>
              </div>
              <div className="space-y-4 text-grey-400">
                <p>
                  You can cancel your PDFPet subscription at any time through your account settings or by contacting our support team.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-grey-800 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      <h3 className="font-semibold text-grey-200">What Happens When You Cancel</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>• Your subscription remains active until the end of the current billing period</li>
                      <li>• You retain access to all premium features until expiration</li>
                      <li>• No further charges will be made to your payment method</li>
                      <li>• Your account automatically downgrades to the free plan</li>
                      <li>• All your data and files remain accessible</li>
                    </ul>
                  </div>
                  <div className="bg-grey-800 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                      <h3 className="font-semibold text-grey-200">Important Notes</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>• Cancellation takes effect at the end of your billing cycle</li>
                      <li>• You can reactivate your subscription at any time</li>
                      <li>• Free plan limitations will apply after cancellation</li>
                      <li>• Premium features become unavailable after expiration</li>
                      <li>• No partial refunds for unused time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-grey-900 border-grey-800 p-8">
              <div className="flex items-center mb-6">
                <CreditCard className="h-6 w-6 text-green-400 mr-3" />
                <h2 className="text-2xl font-semibold text-grey-200">Refund Policy</h2>
              </div>
              <div className="space-y-6 text-grey-400">
                <p>
                  We want you to be completely satisfied with PDFPet. Our refund policy is designed to be fair and transparent.
                </p>
                
                <div className="grid gap-6">
                  <div className="bg-green-950 border border-green-800 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                      <h3 className="text-xl font-semibold text-green-200">Eligible for Refund</h3>
                    </div>
                    <ul className="space-y-3 text-green-100">
                      <li className="flex items-start">
                        <Badge variant="outline" className="border-green-600 text-green-400 mr-3 mt-0.5">7 Days</Badge>
                        <div>
                          <strong>New Subscriptions:</strong> Full refund within 7 days of initial purchase if you're not satisfied with the service.
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Badge variant="outline" className="border-green-600 text-green-400 mr-3 mt-0.5">24 Hours</Badge>
                        <div>
                          <strong>Technical Issues:</strong> Full refund if our service is unavailable for more than 24 consecutive hours.
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Badge variant="outline" className="border-green-600 text-green-400 mr-3 mt-0.5">Always</Badge>
                        <div>
                          <strong>Billing Errors:</strong> Immediate refund for any incorrect charges or duplicate payments.
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-950 border border-red-800 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <XCircle className="h-6 w-6 text-red-400 mr-3" />
                      <h3 className="text-xl font-semibold text-red-200">Not Eligible for Refund</h3>
                    </div>
                    <ul className="space-y-2 text-red-100">
                      <li>• Subscriptions cancelled after the 7-day trial period</li>
                      <li>• Partial refunds for unused subscription time</li>
                      <li>• Refunds due to change of mind after 7 days</li>
                      <li>• Account suspensions due to terms of service violations</li>
                      <li>• Refunds for free plan limitations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-grey-900 border-grey-800 p-8">
              <div className="flex items-center mb-6">
                <RefreshCw className="h-6 w-6 text-purple-400 mr-3" />
                <h2 className="text-2xl font-semibold text-grey-200">How to Request a Refund</h2>
              </div>
              <div className="space-y-4 text-grey-400">
                <p>
                  To request a refund, please follow these steps:
                </p>
                <div className="bg-grey-800 p-6 rounded-lg">
                  <ol className="space-y-4">
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-4 mt-0.5">1</span>
                      <div>
                        <strong className="text-grey-200">Contact Support:</strong> Email us at{' '}
                        <a href="mailto:refunds@pdfpet.com" className="text-blue-400 hover:text-blue-300">
                          refunds@pdfpet.com
                        </a>{' '}
                        with your refund request.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-4 mt-0.5">2</span>
                      <div>
                        <strong className="text-grey-200">Provide Information:</strong> Include your account email, subscription details, and reason for the refund request.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-4 mt-0.5">3</span>
                      <div>
                        <strong className="text-grey-200">Review Process:</strong> We'll review your request within 2-3 business days and respond with our decision.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-4 mt-0.5">4</span>
                      <div>
                        <strong className="text-grey-200">Processing:</strong> Approved refunds are processed within 5-7 business days to your original payment method.
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </Card>

            <Card className="bg-grey-900 border-grey-800 p-8">
              <div className="flex items-center mb-6">
                <AlertCircle className="h-6 w-6 text-orange-400 mr-3" />
                <h2 className="text-2xl font-semibold text-grey-200">Special Circumstances</h2>
              </div>
              <div className="space-y-4 text-grey-400">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-grey-200 mb-3">Annual Subscriptions</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• 14-day refund window instead of 7 days</li>
                      <li>• Pro-rated refunds for technical issues</li>
                      <li>• No partial refunds after 14 days</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-grey-200 mb-3">Enterprise Plans</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Custom refund terms in contract</li>
                      <li>• Dedicated account manager assistance</li>
                      <li>• Flexible cancellation options</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-grey-900 border-grey-800 p-8">
              <h2 className="text-2xl font-semibold text-grey-200 mb-6">Contact Us</h2>
              <div className="text-grey-400">
                <p className="mb-4">
                  Have questions about cancellations or refunds? We're here to help:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-grey-200 mb-2">Refund Requests</h3>
                    <p>Email: <a href="mailto:refunds@pdfpet.com" className="text-blue-400 hover:text-blue-300">refunds@pdfpet.com</a></p>
                    <p className="text-sm text-grey-500 mt-1">Response time: 2-3 business days</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-grey-200 mb-2">General Support</h3>
                    <p>Email: <a href="mailto:support@pdfpet.com" className="text-blue-400 hover:text-blue-300">support@pdfpet.com</a></p>
                    <p className="text-sm text-grey-500 mt-1">Response time: 24 hours</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CancellationRefunds