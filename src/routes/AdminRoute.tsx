import { Navigate } from 'react-router-dom'
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

  useEffect(() => {
    checkAdminRole()
  }, [user])

  const checkAdminRole = async () => {
    if (authLoading) return

    if (!user) {
      setIsAdmin(false)
      setChecking(false)
      return
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single() as any

      setIsAdmin(profile?.role === 'admin')
    } catch (error) {
      console.error('Error checking admin role:', error)
      setIsAdmin(false)
    } finally {
      setChecking(false)
    }
  }

  // Still loading
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-cyan-300">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Not logged in
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
