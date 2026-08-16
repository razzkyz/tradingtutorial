import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../services/profileService'
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-deep-navy/90 to-dark-teal/90 backdrop-blur-sm rounded-2xl border border-cyan/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-card-gradient p-6 border-b border-cyan/30">
          <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
        </div>

        {/* Avatar */}
        <div className="p-8 flex justify-center">
          <div className="w-32 h-32 rounded-full bg-button-gradient flex items-center justify-center text-5xl shadow-xl">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              '👤'
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-text-secondary text-sm mb-2">Full Name</label>
            <p className="text-text-primary text-lg font-medium">{profile.full_name}</p>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Address</label>
            <p className="text-text-primary text-lg">{profile.address || 'Not provided'}</p>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Phone Number</label>
            <p className="text-text-primary text-lg">{profile.phone_number || 'Not provided'}</p>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Email</label>
            <p className="text-text-primary text-lg">{profile.email}</p>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Country</label>
            <p className="text-text-primary text-lg">{profile.country || 'Not provided'}</p>
          </div>

          <div className="bg-card-gradient p-6 rounded-xl border border-cyan/30">
            <label className="block text-text-secondary text-sm mb-2">Investment Amount</label>
            <p className="text-text-primary text-2xl font-bold">
              USDT {profile.investment_amount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
