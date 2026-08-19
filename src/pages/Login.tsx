import { useState, FormEvent, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // User is already logged in, check their role and redirect
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single() as any

          if (profile?.role === 'admin') {
            navigate('/admin/dashboard', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkSession()
  }, [navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (!data.user) {
        throw new Error('Login failed - no user returned')
      }

      // Check user role from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single() as any

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        throw new Error('Failed to fetch user profile')
      }

      // Redirect based on role - use navigate instead of window.location
      if (profile?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid email or password.')
      setLoading(false)
    }
  }

  // Show loading while checking existing session
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-cyan-300">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding (Hidden on mobile) */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start">
                <img 
                  src="/images/logo.png" 
                  alt="Trading Tutorials" 
                  className="h-20 w-auto max-w-[280px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = document.getElementById('login-logo-fallback')
                    if (fallback) {
                      fallback.style.display = 'flex'
                    }
                  }}
                />
                <div className="hidden items-center space-x-4" id="login-logo-fallback" style={{ display: 'none' }}>
                  <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-4 rounded-2xl shadow-2xl">
                    <TrendingUp className="w-16 h-16 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-text-primary">Trading</h1>
                    <h2 className="text-3xl font-bold text-cyan">Tutorials</h2>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <p className="text-text-secondary text-lg">Secure Trading Platform</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <p className="text-text-secondary text-lg">Real-time Market Data</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <p className="text-text-secondary text-lg">Easy Withdrawals</p>
                </div>
              </div>

              <div className="bg-black/95 backdrop-blur-sm border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] rounded-lg p-8 animate-scale-in hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-300 text-sm mb-1">Total Users</p>
                    <p className="text-white text-3xl font-bold">10,000+</p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-600 to-teal-600 p-4 rounded-xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <img 
                src="/images/logo.png" 
                alt="Trading Tutorials" 
                className="h-16 w-auto max-w-[220px] mx-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = document.getElementById('mobile-logo-fallback')
                  if (fallback) {
                    fallback.style.display = 'inline-flex'
                  }
                }}
              />
              <div className="hidden items-center space-x-3 mb-2" id="mobile-logo-fallback" style={{ display: 'none' }}>
                <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-3 rounded-xl shadow-lg">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-text-primary">Trading</h1>
                  <h2 className="text-xl font-bold text-cyan">Tutorials</h2>
                </div>
              </div>
            </div>

            <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] overflow-hidden hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 p-6 lg:p-8 text-center border-b border-cyan-500/30">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Welcome Back!
                </h3>
                <p className="text-cyan-200">Sign in to your account to continue</p>
              </div>

              {/* Form */}
              <div className="p-6 lg:p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center space-x-2 animate-scale-in">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-text-muted" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field pl-12"
                        placeholder="Enter your email"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-text-muted" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field pl-12 pr-12"
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-cyan-400 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] flex items-center justify-center space-x-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-text-muted text-sm">
                    Demo Account: demo@tradingtutorials.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
