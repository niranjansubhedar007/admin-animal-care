"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../utils/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, User } from 'lucide-react';
import bcrypt from 'bcryptjs';
const Login = () => {
 const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (!username.trim() || !password.trim()) {
    toast.error('Please enter both username and password');
    setLoading(false);
    return;
  }

  try {
    const { data: users, error: fetchError } = await supabase
      .from('login')
      .select('*')
      .eq('username', username);

    if (fetchError) {
      throw fetchError;
    }

    // Check if any users were found
    if (!users || users.length === 0) {
      toast.error('Invalid username or password');
      setLoading(false);
      return;
    }

    const user = users.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0];

    // Additional check for user existence
    if (!user) {
      toast.error('Invalid username or password');
      setLoading(false);
      return;
    }

    // Check if user has a password
    if (!user.password) {
      toast.error('Invalid user account');
      setLoading(false);
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      toast.error('Invalid username or password');
      setLoading(false);
      return;
    }

    // Store authentication token
    localStorage.setItem('authToken', user.id);
    
    // Replace current history entry with dashboard
    toast.success('Login successful!');
    router.push('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    toast.error(err.message || 'Login failed');
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-light flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-dark)',
            color: 'var(--color-light)',
          },
        }}
      />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md ">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary shadow-md flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold text-dark">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-primary">
          Sign in to access your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md m-3">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10 border border-light-accent">
          <form className="space-y-6" onSubmit={handleLogin}>
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
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-1">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg border border-light-accent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center"
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

            <div className="flex items-center justify-end">
         
              <div className="text-sm">
                <Link href="/forgotPassword" className="font-medium text-primary hover:text-dark transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-light bg-primary hover:bg-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent transition-colors duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-light-accent"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-primary">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="w-full flex justify-center py-2.5 px-4 border border-light-accent rounded-lg shadow-sm text-sm font-medium text-dark bg-white hover:bg-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-150 ease-in-out"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;