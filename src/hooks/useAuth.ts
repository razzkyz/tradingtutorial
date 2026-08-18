import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    // Initialize authentication
    const initAuth = async () => {
      try {
        // Get initial session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes (login, logout, token refresh, session expiry)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)

      if (!mounted) return

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          setUser(session?.user ?? null)
          setLoading(false)
          break

        case 'SIGNED_OUT':
          // Clear user state immediately
          setUser(null)
          setLoading(false)
          // Redirect to login
          navigate('/login', { replace: true })
          break

        case 'TOKEN_REFRESHED':
          // Update user with refreshed session
          setUser(session?.user ?? null)
          setLoading(false)
          break

        case 'USER_UPDATED':
          setUser(session?.user ?? null)
          setLoading(false)
          break

        default:
          // For any other event, update user state
          setUser(session?.user ?? null)
          setLoading(false)
      }
    })

    // Periodic session validation (every 30 seconds)
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          // Session is invalid, clear user and redirect
          if (mounted) {
            setUser(null)
            setLoading(false)
            navigate('/login', { replace: true })
          }
        }
      } catch (error) {
        console.error('Session validation error:', error)
      }
    }

    // Validate session every 30 seconds to detect logout from other devices
    const validationInterval = setInterval(validateSession, 30000)

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearInterval(validationInterval)
    }
  }, [navigate])

  return { user, loading }
}
