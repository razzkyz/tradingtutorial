import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getBalances, calculateTotalBalance } from '../services/balanceService'
import { getProfile } from '../services/profileService'
import { supabase } from '../lib/supabase'
import BalanceCard from '../components/BalanceCard'
import TradingStatus from '../components/TradingStatus'
import ErrorState from '../components/ErrorState'
import { SkeletonCard, SkeletonBalanceCard, SkeletonQuickAction } from '../components/Skeleton'

interface Balance {
  id: string
  balance_type: string
  amount: number
}

interface Profile {
  full_name: string
  avatar_url: string | null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [balances, setBalances] = useState<Balance[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tradingStatus, setTradingStatus] = useState('inactive')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      const [balancesData, profileData, tradingData] = await Promise.all([
        getBalances(user.id),
        getProfile(user.id),
        supabase
          .from('trading_access')
          .select('status')
          .eq('user_id', user.id)
          .single(),
      ])

      setBalances(balancesData)
      setProfile(profileData)
      
      const tradingResult = tradingData as any
      setTradingStatus(tradingResult.data?.status || 'inactive')
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (error) return <ErrorState message={error} />

  const totalBalance = calculateTotalBalance(balances)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          Welcome back, {loading ? (
            <span className="inline-block w-32 h-8 bg-text-muted/20 rounded animate-pulse"></span>
          ) : (
            <span className="text-cyan">{profile?.full_name || 'User'}!</span>
          )}
        </h2>
        <p className="text-text-secondary">Here's your trading overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Total Balance Card */}
            <div className="card-premium p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-text-secondary text-sm mb-1">Total Balance</p>
                  <p className="text-text-primary text-3xl font-bold">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-text-muted text-xs mt-1">USDT</p>
                </div>
                <div className="bg-button-gradient p-4 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="card-premium p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-button-gradient flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-secondary text-sm mb-1">Account</p>
                  <p className="text-text-primary text-lg font-bold truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-text-muted text-xs">Premium Member</p>
                </div>
              </div>
            </div>

            {/* Trading Status Card */}
            <div className="card-premium p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-2">Trading Status</p>
                  <TradingStatus status={tradingStatus} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Balance Cards Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
          <span className="mr-2">💼</span>
          Your Balances
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <SkeletonBalanceCard />
              <SkeletonBalanceCard />
              <SkeletonBalanceCard />
              <SkeletonBalanceCard />
            </>
          ) : (
            balances.map((balance, index) => (
              <div key={balance.id} className="animate-scale-in" style={{ animationDelay: `${0.1 * index}s` }}>
                <BalanceCard
                  title={`Balance ${index + 1}`}
                  amount={balance.amount}
                  type={index === 0 ? 'highlight' : 'default'}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-premium p-6">
        <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            <>
              <SkeletonQuickAction />
              <SkeletonQuickAction />
              <SkeletonQuickAction />
              <SkeletonQuickAction />
            </>
          ) : (
            <>
              <Link
                to="/trading-access"
                className="flex flex-col items-center justify-center p-4 bg-dark-teal/40 hover:bg-card-gradient rounded-xl border border-text-muted/20 hover:border-cyan/30 transition-all group"
              >
                <div className="bg-button-gradient p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-text-primary">Trading</span>
              </Link>

              <Link
                to="/withdrawal"
                className="flex flex-col items-center justify-center p-4 bg-dark-teal/40 hover:bg-card-gradient rounded-xl border border-text-muted/20 hover:border-cyan/30 transition-all group"
              >
                <div className="bg-button-gradient p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-text-primary">Withdraw</span>
              </Link>

              <Link
                to="/market-global"
                className="flex flex-col items-center justify-center p-4 bg-dark-teal/40 hover:bg-card-gradient rounded-xl border border-text-muted/20 hover:border-cyan/30 transition-all group"
              >
                <div className="bg-button-gradient p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-text-primary">Markets</span>
              </Link>

              <Link
                to="/profile"
                className="flex flex-col items-center justify-center p-4 bg-dark-teal/40 hover:bg-card-gradient rounded-xl border border-text-muted/20 hover:border-cyan/30 transition-all group"
              >
                <div className="bg-button-gradient p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-text-primary">Profile</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
