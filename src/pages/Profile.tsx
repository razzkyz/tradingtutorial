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
    <div className="min-h-[calc(100vh-64px)] px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-teal-900 backdrop-blur-sm rounded-3xl border border-teal-700/40 shadow-2xl overflow-hidden p-6">
          
          {/* Header with underline */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white inline-block border-b-4 border-white pb-1">
              My Profile
            </h1>
          </div>

          {/* Avatar */}
          <div className="flex justify-start mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-5xl">
                  👤
                </div>
              )}
            </div>
          </div>

          {/* Profile Info - List Style */}
          <div className="space-y-3 mb-6">
            <p className="text-white text-base">
              <span className="font-medium">Full Name :</span> {profile.full_name}
            </p>
            <p className="text-white text-base">
              <span className="font-medium">Address :</span> {profile.address || 'Not provided'}
            </p>
            <p className="text-white text-base">
              <span className="font-medium">Phone Number :</span> {profile.phone_number || 'Not provided'}
            </p>
            <p className="text-white text-base">
              <span className="font-medium">Email :</span> {profile.email}
            </p>
            <p className="text-white text-base">
              <span className="font-medium">Country :</span> {profile.country || 'Not provided'}
            </p>
          </div>

          {/* Investment Amount with Wallet Icon */}
          <div className="bg-white/95 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            {/* Left: Wallet Icon */}
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-4 rounded-xl">
              <Wallet className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>

            {/* Right: Investment Amount */}
            <div className="flex-1 ml-5">
              <p className="text-gray-700 text-sm font-semibold mb-1 uppercase tracking-wide">
                Investment Amount
              </p>
              <div className="bg-gradient-to-br from-teal-900 to-teal-800 px-6 py-3 rounded-xl">
                <p className="text-white text-2xl font-bold">
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
