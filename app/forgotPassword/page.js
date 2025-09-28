"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Phone, Key } from 'lucide-react'
import bcrypt from 'bcryptjs'
import Link from 'next/link'

export default function ForgotPassword() {
  const [emailOrMobile, setEmailOrMobile] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: verify user, 2: reset password
  const [userId, setUserId] = useState(null)
  const router = useRouter()

  const verifyUser = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!emailOrMobile.trim()) {
        throw new Error('Please enter your email or mobile number')
      }

      // Check if input is email or mobile number
      const isEmail = emailOrMobile.includes('@')
      const cleanMobile = emailOrMobile.replace(/\D/g, '')

      let query = supabase
        .from('login')
        .select('*')

      if (isEmail) {
        query = query.eq('email', emailOrMobile)
      } else {
        query = query.eq('mobile_number', cleanMobile)
      }

      const { data: user, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('No account found with this email or mobile number')
        }
        throw error
      }

      if (!user) {
        throw new Error('No account found with this email or mobile number')
      }

      // Store user ID for password update
      setUserId(user.id)
      setStep(2)
      toast.success('Identity verified successfully')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Check for empty fields first
      if (!newPassword.trim() || !confirmPassword.trim()) {
        throw new Error('Please fill in all fields')
      }

      // 2. Check password length separately
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      // 3. Only check for password match if length is valid
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      // Update password in Supabase using the stored user ID
      const { error } = await supabase
        .from('login')
        .update({ password: hashedPassword })
        .eq('id', userId)

      if (error) throw error

      toast.success('Password updated successfully!')
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 1500)
      
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary shadow-md flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-light" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold text-dark">
          {step === 1 ? 'Reset Your Password' : 'Create New Password'}
        </h2>
        <p className="mt-2 text-center text-sm text-primary">
          {step === 1 
            ? 'Enter your email or mobile number to verify your identity'
            : 'Enter your new password below'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md m-3">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10 border border-light-accent">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={verifyUser}>
              <div>
                <label htmlFor="emailOrMobile" className="block text-sm font-medium text-dark mb-1">
                  Email or Mobile Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 right-3 pl-3 flex items-center pointer-events-none">
                    {emailOrMobile.includes('@') ? (
                      <Mail className="h-5 w-5 text-primary" />
                    ) : (
                      <Phone className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <input
                    id="emailOrMobile"
                    name="emailOrMobile"
                    type="text"
                    required
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
                    placeholder="Enter your email or mobile number"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the email or mobile number associated with your account
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-light bg-primary hover:bg-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent transition-colors duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : 'Verify Identity'}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={resetPassword}>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  Identity verified for: <strong>{emailOrMobile}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-dark mb-1">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out pr-10"
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-primary hover:text-dark transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-primary hover:text-dark transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark mb-1">
                  Confirm New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-primary hover:text-dark transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-primary hover:text-dark transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-light bg-primary hover:bg-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent transition-colors duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="text-sm font-medium text-primary hover:text-dark transition-colors"
            >
              Back to login
            </Link>
          </div>

          {step === 1 && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Don't remember your email or mobile?{' '}
                <Link 
                  href="/contact-support" 
                  className="text-primary hover:text-dark transition-colors"
                >
                  Contact support
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}