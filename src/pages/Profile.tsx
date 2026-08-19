import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../services/profileService'
import { getBalances } from '../services/balanceService'
import { supabase } from '../lib/supabase'
import { Wallet } from 'lucide-react'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import Footer from '../components/Footer'

interface ProfileData {
  full_name: string
  address: string | null
  phone_number: string | null
  email: string
  country: string | null
  avatar_url: string | null
  investment_amount: number
}

interface Balance {
  id: string
  balance_type: string
  currency: string
  amount: number
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [balance1, setBalance1] = useState(0)

  useEffect(() => {
    if (!user) return

    loadProfile()

    // Subscribe to real-time changes in balances
    const balanceSubscription = supabase
      .channel('profile_balance_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'balances',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Balance changed in Profile:', payload)
          // Reload profile data when balance changes
          loadProfile()
        }
      )
      .subscribe()
    
    // Cleanup
    return () => {
      balanceSubscription.unsubscribe()
    }
  }, [user?.id])

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      const [data, balances] = await Promise.all([
        getProfile(user.id),
        getBalances(user.id),
      ])
      setProfile(data)
      
      // Get only balance_1
      const balance1Data = (balances as Balance[]).find(b => b.balance_type === 'balance_1')
      setBalance1(balance1Data?.amount || 0)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!profile) return <ErrorState message="Profile not found" />

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex-1 px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] overflow-hidden p-6 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white inline-block border-b-4 border-cyan-400 pb-1">
              My Profile
            </h1>
          </div>

          {/* Avatar - View Only */}
          <div className="flex justify-start mb-6">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-500/50">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center">
                  <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info - View Only */}
          <div className="space-y-3 mb-6">
            <p className="text-cyan-100 text-base">
              <span className="font-medium text-cyan-300">Full Name :</span> {profile.full_name}
            </p>
            <p className="text-cyan-100 text-base">
              <span className="font-medium text-cyan-300">Address :</span> {profile.address || 'Not provided'}
            </p>
            <p className="text-cyan-100 text-base">
              <span className="font-medium text-cyan-300">Phone Number :</span> {profile.phone_number || 'Not provided'}
            </p>
            <p className="text-cyan-100 text-base">
              <span className="font-medium text-cyan-300">Email :</span> {profile.email}
            </p>
            <p className="text-cyan-100 text-base">
              <span className="font-medium text-cyan-300">Country :</span> {profile.country || 'Not provided'}
            </p>
          </div>

          {/* Investment Amount Card - Taller with higher text */}
          <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/50 rounded-2xl p-4 py-10 sm:p-6 sm:py-12 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] transition-all duration-300">
            
            {/* Horizontal Row: Wallet aligned with blue box */}
            <div className="flex items-end gap-4 min-[375px]:gap-5 min-[414px]:gap-6 sm:gap-8 md:gap-12">
              {/* Wallet Icon - Aligned with blue box bottom */}
              <div className="flex-shrink-0 ml-2 sm:ml-8 mb-2 sm:mb-3">
                <Wallet className="w-12 h-12 min-[375px]:w-13 min-[375px]:h-13 min-[414px]:w-14 min-[414px]:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 text-white" strokeWidth={1.5} />
              </div>

              {/* Right Side: Title + Blue Box */}
              <div className="flex flex-col items-stretch gap-3 sm:gap-4 flex-1 min-w-0 max-w-md mr-2 sm:mr-0">
                {/* Title - Same size, higher position with more gap */}
                <h3 className="text-white text-sm min-[375px]:text-base min-[414px]:text-lg sm:text-xl md:text-2xl font-medium tracking-wide uppercase text-center whitespace-nowrap truncate">
                  Investment Amount
                </h3>
                
                {/* Value Box - Balance 1 only */}
                <div className="w-full bg-gradient-to-br from-cyan-600 to-blue-700 border border-cyan-400/60 rounded-lg px-2 sm:px-6 md:px-8 py-4 min-[375px]:py-5 min-[414px]:py-6 sm:py-7 md:py-8 shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center">
                  <p className="text-white text-xs min-[375px]:text-sm min-[414px]:text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-center truncate">
                    {balance1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
      
    <Footer />
    </div>
  )
}
