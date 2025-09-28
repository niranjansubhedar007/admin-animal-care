"use client"
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '../utils/supabase'
import bcrypt from 'bcryptjs'
import { Eye, EyeOff, User, Mail, Phone } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const { username, email, mobileNumber, password, confirmPassword } = formData

    if (!username.trim() || !email.trim() || !mobileNumber.trim() || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    // Mobile number validation (basic - 10-15 digits)
    const mobileRegex = /^[0-9]{10,15}$/
    const cleanMobile = mobileNumber.replace(/\D/g, '')
    if (!mobileRegex.test(cleanMobile)) {
      toast.error('Please enter a valid mobile number (10-15 digits)')
      return false
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return false
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }

    return true
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Clean mobile number (remove any non-digit characters)
      const cleanMobileNumber = formData.mobileNumber.replace(/\D/g, '')

      // Check if username already exists
      const { data: existingUsername, error: usernameCheckError } = await supabase
        .from('login')
        .select('username')
        .eq('username', formData.username)
        .maybeSingle()

      if (usernameCheckError) throw usernameCheckError
      if (existingUsername) {
        throw new Error('Username already exists')
      }

      // Check if email already exists
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('login')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle()

      if (emailCheckError) throw emailCheckError
      if (existingEmail) {
        throw new Error('Email already registered')
      }

      // Check if mobile number already exists
      const { data: existingMobile, error: mobileCheckError } = await supabase
        .from('login')
        .select('mobile_number')
        .eq('mobile_number', cleanMobileNumber)
        .maybeSingle()

      if (mobileCheckError) throw mobileCheckError
      if (existingMobile) {
        throw new Error('Mobile number already registered')
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(formData.password, salt)

      // Insert new user into Supabase
      const { data, error } = await supabase
        .from('login')
        .insert([
          { 
            username: formData.username,
            email: formData.email,
            mobile_number: cleanMobileNumber,
            password: hashedPassword,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) throw error

      toast.success('Registration successful!')
      
      // Redirect to login after successful registration
      setTimeout(() => {
        router.push('/login')
      }, 1500)
      
    } catch (error) {
      toast.error(error.message)
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
            <svg className="w-8 h-8 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold text-dark">Create Account</h2>
        <p className="mt-2 text-center text-sm text-primary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium hover:text-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md m-3">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10 border border-light-accent">
          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-dark mb-1">
                Username
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full px-4 pr-10 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-1">
                Email Address
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-4 pr-10 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Mobile Number Field */}
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-dark mb-1">
                Mobile Number
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="block w-full px-4 pr-10 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
                  placeholder="Enter your mobile number"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-1">
                Password
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out pr-10"
                  placeholder="Create a password (min 8 characters)"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-primary hover:text-dark transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-primary hover:text-dark transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark mb-1">
                Confirm Password
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out pr-10"
                  placeholder="Confirm your password"
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
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}