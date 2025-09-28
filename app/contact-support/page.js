"use client"
import Link from 'next/link'
import { Phone, Mail, MapPin, User, ArrowLeft, Heart } from 'lucide-react'

export default function ContactSupport() {
  const handleCall = () => {
    window.open('tel:+919136263344')
  }

  const handleEmail = () => {
    window.open('mailto:info@hopeanimalcare.in')
  }

  return (
    <div className="min-h-screen bg-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/forgotPassword" 
            className="inline-flex items-center text-primary hover:text-dark transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Forgot Password
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-dark mb-4">Contact Support</h1>
          <p className="text-lg text-primary max-w-2xl mx-auto">
            Need help with your account? Contact our support specialist directly for assistance.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-light-accent">
          {/* Support Person Card */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-dark mb-2">Nisha Pawar</h2>
            <p className="text-primary text-lg mb-1">Support Specialist</p>
            <p className="text-gray-600">Hope Animal Care</p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Phone */}
            <div 
              className="flex items-center p-6 bg-white border border-light-accent rounded-lg hover:bg-light  transition-colors group"
            //   onClick={handleCall}
            >
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                <Phone className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Call directly</p>
                <p className="text-xl font-semibold text-dark">+91 9136263344</p>
                <p className="text-sm text-primary">Available during business hours</p>
              </div>
            </div>

            {/* Email */}
            <div 
              className="flex items-center p-6 bg-white border border-light-accent rounded-lg hover:bg-light  transition-colors group"
            //   onClick={handleEmail}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                <Mail className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Send email</p>
                <p className="text-xl font-semibold text-dark">info@hopeanimalcare.in</p>
                <p className="text-sm text-primary">We respond within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Organization Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-semibold text-dark">Hope Animal Care</h3>
            </div>
            <p className="text-gray-600 text-center">
              Dedicated to animal welfare and providing compassionate care for all animals in need.
            </p>
          </div>

          {/* Business Hours */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-dark mb-4 text-center text-lg">Business Hours</h4>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between items-center">
                <span>Monday - Friday:</span>
                <span className="font-medium bg-white px-3 py-1 rounded-lg">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Saturday:</span>
                <span className="font-medium bg-white px-3 py-1 rounded-lg">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sunday:</span>
                <span className="font-medium bg-white px-3 py-1 rounded-lg">Emergency Only</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <h4 className="font-semibold text-dark mb-3 text-center">How to Get Help</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Call or email Nisha Pawar directly for account recovery assistance</p>
              <p>• Have your username or email ready for faster service</p>
              <p>• Describe your issue clearly when you contact</p>
              <p>• Response time is typically within a few hours during business hours</p>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Still need help?{' '}
            <Link 
              href="/forgotPassword" 
              className="text-primary hover:text-dark font-medium transition-colors"
            >
              Try forgot password again
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}