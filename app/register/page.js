"use client"
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '../utils/supabase'
import bcrypt from 'bcryptjs'
import { Eye, EyeOff, User } from 'lucide-react'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate inputs
      if (!username.trim() || !password.trim()) {
        throw new Error('Please fill in all fields')
      }

      if (password.length < 4) {
        throw new Error('Password must be at least 4 characters')
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('login')
        .select('username')
        // .eq('username', username)
        .single()

      if (existingUser) {
        throw new Error('Username already exists')
      }

      // Insert new user into Supabase
      const { data, error } = await supabase
        .from('login')
        .insert([
          { 
            username: username,
            password: hashedPassword,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) throw error

      toast.success('Registration successful!')
      router.push('/login')
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
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-dark mb-1">
                Username
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 right-3  flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-4 pr-3 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
                  placeholder="Choose a username"
                />
              </div>
            </div>

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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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