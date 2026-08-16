import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getBalances, calculateTotalBalance } from '../services/balanceService'
import { createWithdrawal } from '../services/withdrawalService'
import { withdrawalSchema } from '../schemas/withdrawalSchema'
import { getProfile } from '../services/profileService'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function Withdrawal() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [availableBalance, setAvailableBalance] = useState(0)
  const [userName, setUserName] = useState('')

  const [formData, setFormData] = useState({
    amount: '',
    wallet_address: '',
    network: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return

    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      const [balances, profile] = await Promise.all([
        getBalances(user.id),
        getProfile(user.id),
      ])

      const total = calculateTotalBalance(balances)
      setAvailableBalance(total)
      
      const profileData = profile as any
      if (profileData?.full_name) {
        setUserName(profileData.full_name)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    setFormErrors({})
    setError('')
    setSubmitting(true)

    try {
      // Validate input
      const parsedData = withdrawalSchema.parse({
        amount: parseFloat(formData.amount),
        wallet_address: formData.wallet_address,
        network: formData.network,
      })

      // Check if amount exceeds available balance
      if (parsedData.amount > availableBalance) {
        setFormErrors({ amount: 'Amount exceeds available balance' })
        setSubmitting(false)
        return
      }

      // Create withdrawal request
      await createWithdrawal(user.id, parsedData)

      setSuccess(true)
      setShowForm(false)
      setFormData({ amount: '', wallet_address: '', network: '' })

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errors' in err) {
        const zodErrors = err as { errors: Array<{ path: string[]; message: string }> }
        const errors: Record<string, string> = {}
        zodErrors.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0]] = error.message
          }
        })
        setFormErrors(errors)
      } else {
        setError('Failed to submit withdrawal request')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState />
  if (error && !showForm) return <ErrorState message={error} />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {success && (
        <div className="mb-6 p-4 bg-green/20 border border-green/50 rounded-xl text-green-200 text-center">
          ✅ Withdrawal request submitted successfully! Status: Pending
        </div>
      )}

      <div className="bg-gradient-to-br from-deep-navy/90 to-dark-teal/90 backdrop-blur-sm rounded-2xl border border-cyan/20 shadow-2xl overflow-hidden">
        {!showForm ? (
          <>
            {/* Wallet Illustration */}
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-emerald to-green rounded-3xl mb-6 shadow-xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-text-primary mb-2">{userName}</h2>
              <p className="text-text-secondary mb-8">Available Balance</p>

              <div className="bg-card-gradient px-8 py-6 rounded-xl border border-cyan/30 inline-block mb-8">
                <p className="text-text-primary text-4xl font-bold">
                  USDT {availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="w-full max-w-md mx-auto block bg-button-gradient hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-cyan/50 text-lg"
              >
                Withdrawal
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Withdrawal Form */}
            <div className="bg-card-gradient p-6 border-b border-cyan/30">
              <h1 className="text-2xl font-bold text-text-primary">Withdrawal Request</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="amount" className="block text-text-secondary text-sm mb-2">
                  Amount (USDT) *
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                  placeholder="Enter amount"
                  required
                  disabled={submitting}
                />
                {formErrors.amount && (
                  <p className="mt-2 text-red-400 text-sm">{formErrors.amount}</p>
                )}
                <p className="mt-2 text-text-muted text-sm">
                  Available: USDT {availableBalance.toFixed(2)}
                </p>
              </div>

              <div>
                <label htmlFor="wallet_address" className="block text-text-secondary text-sm mb-2">
                  Wallet Address *
                </label>
                <input
                  id="wallet_address"
                  name="wallet_address"
                  type="text"
                  value={formData.wallet_address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                  placeholder="Enter wallet address"
                  required
                  disabled={submitting}
                />
                {formErrors.wallet_address && (
                  <p className="mt-2 text-red-400 text-sm">{formErrors.wallet_address}</p>
                )}
              </div>

              <div>
                <label htmlFor="network" className="block text-text-secondary text-sm mb-2">
                  Network *
                </label>
                <select
                  id="network"
                  name="network"
                  value={formData.network}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                  required
                  disabled={submitting}
                >
                  <option value="">Select network</option>
                  <option value="TRC20">TRC20</option>
                  <option value="ERC20">ERC20</option>
                  <option value="BEP20">BEP20</option>
                </select>
                {formErrors.network && (
                  <p className="mt-2 text-red-400 text-sm">{formErrors.network}</p>
                )}
              </div>

              <div className="p-4 bg-cyan/10 border border-cyan/30 rounded-xl">
                <p className="text-text-secondary text-sm">
                  ⚠️ This is a demo withdrawal request. No real transactions will be processed.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ amount: '', wallet_address: '', network: '' })
                    setFormErrors({})
                    setError('')
                  }}
                  disabled={submitting}
                  className="flex-1 bg-text-muted/20 hover:bg-text-muted/30 text-text-primary font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-button-gradient hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Withdrawal'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
