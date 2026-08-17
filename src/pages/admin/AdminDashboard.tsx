import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Users, UserPlus, Settings, FileText, TrendingUp } from 'lucide-react'
import LoadingState from '../../components/LoadingState'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    activeTraders: 0,
  })

  useEffect(() => {
    checkAdminAndLoadStats()
  }, [user?.id, authLoading]) // Only depend on user.id and authLoading

  const checkAdminAndLoadStats = async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    // If no user after auth loaded, redirect to login
    if (!user) {
      window.location.href = '/login'
      return
    }

    try {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single() as any

      if (profile?.role !== 'admin') {
        window.location.href = '/dashboard'
        return
      }

      setIsAdmin(true)

      // Load statistics
      const [usersCount, withdrawalsCount, pendingCount, activeCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('withdrawals').select('id', { count: 'exact', head: true }),
        supabase.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('trading_access').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ])

      setStats({
        totalUsers: usersCount.count || 0,
        totalWithdrawals: withdrawalsCount.count || 0,
        pendingWithdrawals: pendingCount.count || 0,
        activeTraders: activeCount.count || 0,
      })
    } catch (error) {
      console.error('Error checking admin:', error)
      window.location.href = '/dashboard'
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) return <LoadingState />
  if (!isAdmin) return null

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-cyan-200">Manage customers, settings, and view analytics</p>
        </div>

        {/* Statistics Cards - outer cards glow only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/95 backdrop-blur-sm border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg p-6 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-cyan-400" />
              <span className="text-cyan-300 text-sm">Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</p>
            <p className="text-cyan-200 text-sm">Customers</p>
          </div>

          <div className="bg-black/95 backdrop-blur-sm border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg p-6 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <span className="text-cyan-300 text-sm">Active</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.activeTraders}</p>
            <p className="text-cyan-200 text-sm">Active Traders</p>
          </div>

          <div className="bg-black/95 backdrop-blur-sm border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg p-6 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-yellow-400" />
              <span className="text-cyan-300 text-sm">Pending</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.pendingWithdrawals}</p>
            <p className="text-cyan-200 text-sm">Withdrawals</p>
          </div>

          <div className="bg-black/95 backdrop-blur-sm border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg p-6 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-purple-400" />
              <span className="text-cyan-300 text-sm">Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.totalWithdrawals}</p>
            <p className="text-cyan-200 text-sm">All Withdrawals</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Customer */}
          <button
            onClick={() => navigate('/admin/add-customer')}
            className="bg-black/95 backdrop-blur-sm border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg p-8 text-left hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] hover:border-cyan-400/70 transition-all duration-300 group"
          >
            <UserPlus className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Add Customer</h3>
            <p className="text-cyan-200 text-sm">Register new customer accounts</p>
          </button>

          {/* Manage Customers */}
          <button
            onClick={() => navigate('/admin/customers')}
            className="bg-black/95 backdrop-blur-sm border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg p-8 text-left hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] hover:border-emerald-400/70 transition-all duration-300 group"
          >
            <Users className="w-12 h-12 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Manage Customers</h3>
            <p className="text-cyan-200 text-sm">View and edit customer data</p>
          </button>

          {/* Website Settings */}
          <button
            onClick={() => navigate('/admin/settings')}
            className="bg-black/95 backdrop-blur-sm border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg p-8 text-left hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] hover:border-purple-400/70 transition-all duration-300 group"
          >
            <Settings className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Website Settings</h3>
            <p className="text-cyan-200 text-sm">Update logo, images, and content</p>
          </button>
        </div>
      </div>
    </div>
  )
}
