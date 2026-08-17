import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { ArrowLeft } from 'lucide-react'
import LoadingState from '../../components/LoadingState'

export default function AddCustomer() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    address: '',
    country: '',
    investment_amount: '100',
  })

  useEffect(() => {
    checkAdmin()
  }, [user?.id, authLoading]) // Only depend on user.id and authLoading

  const checkAdmin = async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    // If no user after auth loaded, redirect to login
    if (!user) {
      navigate('/login')
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
        navigate('/dashboard')
        return
      }

      setIsAdmin(true)
    } catch (error) {
      console.error('Error checking admin:', error)
      navigate('/dashboard')
    } finally {
      setChecking(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // 2. Create profile
      const { error: profileError } = await supabase.from('profiles').insert([{
        user_id: authData.user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number || null,
        address: formData.address || null,
        country: formData.country || null,
        investment_amount: parseFloat(formData.investment_amount),
        role: 'user',
      }] as any)

      if (profileError) throw profileError

      // 3. Create default balances
      const balances = [
        { user_id: authData.user.id, balance_type: 'balance_1', amount: 200 },
        { user_id: authData.user.id, balance_type: 'balance_2', amount: 400 },
        { user_id: authData.user.id, balance_type: 'balance_3', amount: 500 },
        { user_id: authData.user.id, balance_type: 'balance_4', amount: 700 },
      ]

      const { error: balancesError } = await supabase.from('balances').insert(balances as any)
      if (balancesError) throw balancesError

      // 4. Create trading access
      const { error: tradingError } = await supabase.from('trading_access').insert([{
        user_id: authData.user.id,
        status: 'inactive',
      }] as any)

      if (tradingError) throw tradingError

      setSuccess(true)
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone_number: '',
        address: '',
        country: '',
        investment_amount: '100',
      })

      setTimeout(() => {
        navigate('/admin/customers')
      }, 2000)
    } catch (err: any) {
      console.error('Error adding customer:', err)
      setError(err.message || 'Failed to add customer')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || checking) return <LoadingState />
  if (!isAdmin) return null

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Admin Dashboard
        </button>

        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] overflow-hidden hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
          <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 p-6 border-b border-cyan-500/30">
            <h1 className="text-2xl font-bold text-white">Add New Customer</h1>
            <p className="text-cyan-200 text-sm mt-1">Create a new customer account</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green/20 border border-green/50 rounded-lg text-green-200 text-sm">
                ✅ Customer added successfully! Redirecting...
              </div>
            )}

            <div>
              <label htmlFor="full_name" className="block text-text-secondary text-sm mb-2">
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                placeholder="Enter full name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-text-secondary text-sm mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                placeholder="customer@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-text-secondary text-sm mb-2">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                placeholder="Min 6 characters"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-text-secondary text-sm mb-2">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                placeholder="+1 234 567 8900"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-text-secondary text-sm mb-2">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                placeholder="123 Main St, City"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-text-secondary text-sm mb-2">
                Country
              </label>
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                placeholder="United States"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="investment_amount" className="block text-text-secondary text-sm mb-2">
                Initial Investment Amount (USDT) *
              </label>
              <input
                id="investment_amount"
                name="investment_amount"
                type="number"
                step="0.01"
                value={formData.investment_amount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                placeholder="100.00"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Customer...' : 'Create Customer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
