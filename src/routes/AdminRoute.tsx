import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const checkAdminRole = async () => {
      // If still loading auth, wait
      if (authLoading) return

      // If no user, mark as not admin and stop checking
      if (!user) {
        if (mounted) {
          setIsAdmin(false)
          setChecking(false)
        }
        return
      }

      try {
        // Verify session is still valid
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          // Session invalid, sign out and redirect
          await supabase.auth.signOut()
          if (mounted) {
            setIsAdmin(false)
            setChecking(false)
          }
          navigate('/login', { replace: true })
          return
        }

        // Check user role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single() as any

        if (profileError) {
          console.error('Error checking admin role:', profileError)
          if (mounted) {
            setIsAdmin(false)
            setChecking(false)
          }
          return
        }

        if (mounted) {
          setIsAdmin(profile?.role === 'admin')
          setChecking(false)
        }
      } catch (error) {
        console.error('Error in admin role check:', error)
        if (mounted) {
          setIsAdmin(false)
          setChecking(false)
        }
      }
    }

    checkAdminRole()

    return () => {
      mounted = false
    }
  }, [user, authLoading, navigate])

  // Still loading authentication or checking role
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-cyan-300">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Not admin - redirect to user dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  // Is admin - allow access
  return <>{children}</>
}
