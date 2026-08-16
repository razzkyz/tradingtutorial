import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { TrendingUp, Mail, Lock, LogIn } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check user role from database
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single() as any

        // Redirect based on role
        if (profile?.role === 'admin') {
          window.location.href = '/admin/dashboard'
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (err: unknown) {
      setError('Invalid email or password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-overlay flex items-center justify-center px-4 py-8">
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

              <div className="bg-gradient-to-br from-deep-navy/95 to-dark-teal/95 backdrop-blur-sm rounded-2xl border border-teal-700/30 shadow-xl p-8 animate-scale-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-sm mb-1">Total Users</p>
                    <p className="text-text-primary text-3xl font-bold">10,000+</p>
                  </div>
                  <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-4 rounded-xl">
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

            <div className="bg-gradient-to-br from-deep-navy/95 to-dark-teal/95 backdrop-blur-sm rounded-3xl border border-teal-700/30 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-900/50 to-teal-800/50 p-6 lg:p-8 text-center border-b border-teal-700/30">
                <h3 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
                  Welcome Back!
                </h3>
                <p className="text-text-secondary">Sign in to your account to continue</p>
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
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field pl-12"
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
