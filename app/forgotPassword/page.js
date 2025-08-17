"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Eye, EyeOff, User, Lock, Key } from 'lucide-react'
import bcrypt from 'bcryptjs'
import Link from 'next/link'
export default function ForgotPassword() {
  const [username, setUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: verify user, 2: reset password
  const router = useRouter()

  const verifyUser = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!username.trim() || !currentPassword.trim()) {
        throw new Error('Please fill in all fields')
      }

      // Fetch user from Supabase
      const { data: user, error } = await supabase
        .from('login')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      if (!user) throw new Error('User not found')

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password)
      if (!passwordMatch) throw new Error('Current password is incorrect')

      setStep(2)
      toast.success('Identity verified')
    } catch (err) {
      toast.error("User verification failed")
    } finally {
      setLoading(false)
    }
  }

const resetPassword = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Check for empty fields first
    if (!newPassword.trim() || !confirmPassword.trim()) {
      throw new Error('Please fill in all fields');
    }

    // 2. Check password length separately
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // 3. Only check for password match if length is valid
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in Supabase
    const { error } = await supabase
      .from('login')
      .update({ password: hashedPassword })
      .eq('username', username);

    if (error) throw error;

    toast.success('Password updated successfully!');
    router.push('/login');
  } catch (err) {
    // Show specific error message
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};

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
          {step === 1 ? 'Verify Your Identity' : 'Reset Your Password'}
        </h2>
        <p className="mt-2 text-center text-sm text-primary">
          {step === 1 
            ? 'Enter your username and current password'
            : 'Create a new password'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md m-3">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10 border border-light-accent">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={verifyUser}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-dark mb-1">
                  Username
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 right-3 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-dark mb-1">
                  Current Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                 
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
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
                  {loading ? 'Verifying...' : 'Verify Identity'}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={resetPassword}>
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
                  {loading ? 'Updating...' : 'Update Password'}
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
        </div>
      </div>
    </div>
  )
}