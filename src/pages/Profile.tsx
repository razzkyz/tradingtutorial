import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../services/profileService'
import { Wallet } from 'lucide-react'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

interface ProfileData {
  full_name: string
  address: string | null
  phone_number: string | null
  email: string
  country: string | null
  avatar_url: string | null
  investment_amount: number
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      const data = await getProfile(user.id)
      setProfile(data)
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
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      <div className="max-w-xl mx-auto">
        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] overflow-hidden p-6 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
          
          {/* Header with underline */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white inline-block border-b-4 border-cyan-400 pb-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              My Profile
            </h1>
          </div>

          {/* Avatar */}
          <div className="flex justify-start mb-6">
            <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.6)] border-2 border-cyan-500/50 hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] transition-all duration-300">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center">
                  <svg className="w-14 h-14 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info - List Style */}
          <div className="space-y-3 mb-6">
            <p className="text-cyan-100 text-base drop-shadow-[0_0_5px_rgba(6,182,212,0.3)]">
              <span className="font-medium text-cyan-300">Full Name :</span> {profile.full_name}
            </p>
            <p className="text-cyan-100 text-base drop-shadow-[0_0_5px_rgba(6,182,212,0.3)]">
              <span className="font-medium text-cyan-300">Address :</span> {profile.address || 'Not provided'}
            </p>
            <p className="text-cyan-100 text-base drop-shadow-[0_0_5px_rgba(6,182,212,0.3)]">
              <span className="font-medium text-cyan-300">Phone Number :</span> {profile.phone_number || 'Not provided'}
            </p>
            <p className="text-cyan-100 text-base drop-shadow-[0_0_5px_rgba(6,182,212,0.3)]">
              <span className="font-medium text-cyan-300">Email :</span> {profile.email}
            </p>
            <p className="text-cyan-100 text-base drop-shadow-[0_0_5px_rgba(6,182,212,0.3)]">
              <span className="font-medium text-cyan-300">Country :</span> {profile.country || 'Not provided'}
            </p>
          </div>

          {/* Investment Amount with Wallet Icon */}
          <div className="bg-black/95 border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg p-5 flex items-center justify-between hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
            {/* Left: Wallet Icon */}
            <div className="bg-gradient-to-br from-cyan-600 to-teal-600 p-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Wallet className="w-12 h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" strokeWidth={2.5} />
            </div>

            {/* Right: Investment Amount */}
            <div className="flex-1 ml-5">
              <p className="text-cyan-300 text-sm font-semibold mb-1 uppercase tracking-wide drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                Investment Amount
              </p>
              <div className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 border border-cyan-500/30 px-6 py-3 rounded-xl">
                <p className="text-white text-2xl font-bold drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                  USDT {profile.investment_amount.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
