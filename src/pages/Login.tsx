import { useState, FormEvent, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

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
      <div className="min-h-screen bg-black flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/images/loginbg.jpg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-300">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center relative"
      style={{ backgroundImage: 'url(/images/loginbg.jpg)' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glass Morphism Card with Green Tint */}
        <div className="bg-gradient-to-b from-green-900/40 to-green-950/60 backdrop-blur-xl rounded-3xl border border-green-500/30 shadow-[0_0_80px_rgba(34,197,94,0.3)] overflow-hidden">
          
          {/* Header with Title and Logo */}
          <div className="p-8 pb-6 text-center">
            <p className="text-gray-300 text-base font-semibold tracking-widest uppercase mb-3">
              WELCOME TO THE DASHBOARD
            </p>
            <h1 className="text-white text-3xl font-bold tracking-wide mb-8">
              STRATEGIC CRYPTO INVESTMENT
            </h1>
            
            {/* Bull Logo with Arrow - Larger Size */}
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/images/loginlogo.png" 
                alt="Bull" 
                className="h-48 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  // Fallback SVG Bull with Arrow
                  const fallback = document.getElementById('bull-fallback')
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              {/* Fallback Bull Icon - Larger */}
              <div id="bull-fallback" className="hidden flex-col items-center justify-center" style={{ display: 'none' }}>
                <div className="relative">
                  {/* Simple Bull Shape */}
                  <svg className="w-32 h-32 text-green-500" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M30,70 Q20,60 25,50 L30,55 L35,45 Q40,40 50,40 Q60,40 65,45 L70,55 L75,50 Q80,60 70,70 Q65,75 50,75 Q35,75 30,70Z"/>
                    <circle cx="40" cy="52" r="3" fill="white"/>
                    <circle cx="60" cy="52" r="3" fill="white"/>
                  </svg>
                  {/* Up Arrow */}
                  <svg className="w-20 h-20 text-green-400 absolute -top-6 -right-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4L20 12L17 12L17 20L7 20L7 12L4 12L12 4Z"/>
                  </svg>
                </div>
                <span className="text-green-400 text-3xl font-bold mt-3">BUY</span>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8 pt-2">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center space-x-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all"
                    placeholder="Email Address"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all"
                    placeholder="Password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-400 transition-colors"
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

              {/* Login Button with Center Gradient */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-800 via-green-500 to-green-800 hover:from-green-700 hover:via-green-400 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] flex items-center justify-center space-x-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed border border-green-400/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
