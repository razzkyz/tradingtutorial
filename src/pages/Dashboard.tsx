import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getBalances, calculateTotalBalance } from '../services/balanceService'
import { getProfile } from '../services/profileService'
import { supabase } from '../lib/supabase'
import { Wallet } from 'lucide-react'
import ErrorState from '../components/ErrorState'

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
  const isActive = tradingStatus === 'active'

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6">
      <div className="max-w-2xl mx-auto">
        
        {/* User Profile Card */}
        <div className="bg-gradient-to-br from-deep-navy/95 to-dark-teal/95 backdrop-blur-sm rounded-3xl border border-cyan/20 shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center overflow-hidden shadow-xl flex-shrink-0">
                {loading ? (
                  <div className="w-full h-full bg-text-muted/20 animate-pulse"></div>
                ) : profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <div>
                <p className="text-text-secondary text-sm mb-1">Name :</p>
                {loading ? (
                  <div className="h-7 w-32 bg-text-muted/20 rounded animate-pulse"></div>
                ) : (
                  <p className="text-text-primary text-xl font-bold">
                    {profile?.full_name || 'User'}
                  </p>
                )}
              </div>
            </div>

            {/* Balance Badge */}
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 px-6 py-4 rounded-2xl shadow-xl">
              <div className="flex items-center space-x-3">
                <Wallet className="w-8 h-8 text-white" strokeWidth={2.5} />
                <div>
                  <p className="text-white text-xs font-semibold mb-0.5 uppercase tracking-wide">Balance</p>
                  {loading ? (
                    <div className="h-6 w-24 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-white text-xl font-bold leading-none">
                      USDT {totalBalance.toFixed(0)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Balance & Trading Status Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Left Column - Balance 1 & 2 */}
          <div className="space-y-4">
            {/* Balance 1 */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Balance 1</label>
              <div className="bg-transparent border-2 border-emerald-500/60 rounded-2xl px-4 py-3.5">
                {loading ? (
                  <div className="h-6 w-20 bg-text-muted/20 rounded animate-pulse"></div>
                ) : (
                  <p className="text-white text-lg font-bold">
                    USDT {balances.find(b => b.balance_type === 'balance_1')?.amount.toFixed(0) || 0}
                  </p>
                )}
              </div>
            </div>

            {/* Balance 2 */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Balance 2</label>
              <div className="bg-transparent border-2 border-emerald-500/60 rounded-2xl px-4 py-3.5">
                {loading ? (
                  <div className="h-6 w-16 bg-text-muted/20 rounded animate-pulse"></div>
                ) : (
                  <p className="text-white text-lg font-bold">
                    USDT...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Trading Status */}
          <div>
            <div className={`h-full flex flex-col items-center justify-center border-4 rounded-2xl px-4 py-6 ${
              isActive 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-emerald-500/80 bg-transparent'
            }`}>
              {loading ? (
                <>
                  <div className="h-4 w-16 bg-text-muted/20 rounded animate-pulse mb-2"></div>
                  <div className="h-6 w-20 bg-text-muted/20 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <p className={`text-base font-semibold mb-1 ${
                    isActive ? 'text-green-400' : 'text-white'
                  }`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </p>
                  <p className={`text-xl font-bold uppercase leading-none ${
                    isActive ? 'text-green-400' : 'text-white'
                  }`}>
                    TRADING
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
