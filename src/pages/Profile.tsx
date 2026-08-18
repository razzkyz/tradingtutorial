import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../services/profileService'
import { supabase } from '../lib/supabase'
import { Wallet, Edit2, Save, X, Camera } from 'lucide-react'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import Toast from '../components/Toast'

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
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<ProfileData | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

  useEffect(() => {
    if (!user) return

    loadProfile()
    
    // Cleanup
    return () => {
      // Cancel any pending requests
    }
  }, [user?.id]) // Only depend on user.id

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      const data = await getProfile(user.id)
      setProfile(data)
      setFormData(data)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setFormData(profile)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData(profile)
  }

  const handleSave = async () => {
    if (!user || !formData) return

    try {
      setSaving(true)
      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          full_name: formData.full_name,
          address: formData.address,
          phone_number: formData.phone_number,
          country: formData.country,
        })
        .eq('user_id', user.id)

      if (error) throw error

      setProfile(formData)
      setIsEditing(false)
      setToast({ message: 'Profile updated successfully', type: 'success' })
    } catch (err) {
      console.error('Error updating profile:', err)
      setToast({ message: 'Failed to update profile', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file', type: 'warning' })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: 'Image size must be less than 2MB', type: 'warning' })
      return
    }

    try {
      setUploading(true)

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`])
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await (supabase
        .from('profiles') as any)
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
      setFormData(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
      setToast({ message: 'Avatar updated successfully', type: 'success' })
    } catch (err) {
      console.error('Error uploading avatar:', err)
      setToast({ message: 'Failed to upload avatar', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!profile || !formData) return <ErrorState message="Profile not found" />

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-xl mx-auto">
        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] overflow-hidden p-6 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
          
          {/* Header with Edit Icon */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white inline-block border-b-4 border-cyan-400 pb-1">
              My Profile
            </h1>
            
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                title="Edit Profile"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] disabled:opacity-50"
                  title="Save"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] disabled:opacity-50"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Avatar - Always Clickable */}
          <div className="flex justify-start mb-6">
            <div className="relative group">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-500/50 transition-all duration-300 group-hover:border-cyan-400">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt={formData.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center">
                    <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>
              </div>
              
              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Upload Avatar"
              />
            </div>
          </div>

          {/* Profile Info - Editable or View */}
          <div className="space-y-3 mb-6">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-cyan-300 text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-cyan-300 text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-cyan-300 text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-cyan-300 text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-cyan-300 text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                    disabled={saving}
                  />
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Investment Amount Card - With Glow Effect */}
          <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/50 rounded-2xl p-4 py-8 sm:p-6 sm:py-10 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] transition-all duration-300">
            
            {/* Horizontal Row: Wallet left, content with spacing */}
            <div className="flex items-center gap-6 min-[375px]:gap-8 min-[414px]:gap-10 sm:gap-12 md:gap-16">
              {/* Wallet Icon - Left positioned */}
              <div className="flex-shrink-0 ml-4 sm:ml-8">
                <Wallet className="w-10 h-10 min-[375px]:w-10 min-[375px]:h-10 min-[414px]:w-11 min-[414px]:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" strokeWidth={1.5} />
              </div>

              {/* Right Side: Title + Blue Box - Same width, aligned */}
              <div className="flex flex-col items-stretch gap-1.5 sm:gap-2 flex-1 max-w-md">
                {/* Title - Same width as box below, single line */}
                <h3 className="text-white text-[11px] min-[375px]:text-xs min-[414px]:text-sm sm:text-base md:text-lg font-medium tracking-wide uppercase text-center whitespace-nowrap">
                  Investment Amount
                </h3>
                
                {/* Value Box - Wider landscape, taller */}
                <div className="w-full bg-gradient-to-br from-cyan-600 to-blue-700 border border-cyan-400/60 rounded-lg px-8 min-[375px]:px-10 min-[414px]:px-12 sm:px-16 md:px-20 lg:px-24 py-4 min-[375px]:py-5 min-[414px]:py-6 sm:py-7 md:py-8 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                  <p className="text-white text-xs min-[375px]:text-sm min-[414px]:text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-center whitespace-nowrap">
                    {profile.investment_amount.toFixed(0)} USDT
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
