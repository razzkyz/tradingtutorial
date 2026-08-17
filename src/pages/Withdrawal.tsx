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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
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
    
    // Cleanup
    return () => {
      // Cancel any pending requests
    }
  }, [user?.id]) // Only depend on user.id

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
        return
      }

      // Show confirmation modal instead of submitting directly
      setShowConfirmModal(true)
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
        setError('Failed to validate withdrawal request')
      }
    }
  }

  const handleConfirmWithdrawal = async () => {
    if (!user) return

    setSubmitting(true)

    try {
      const parsedData = withdrawalSchema.parse({
        amount: parseFloat(formData.amount),
        wallet_address: formData.wallet_address,
        network: formData.network,
      })

      // Create withdrawal request
      await createWithdrawal(user.id, parsedData)

      setSuccess(true)
      setShowForm(false)
      setShowConfirmModal(false)
      setFormData({ amount: '', wallet_address: '', network: '' })

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('Failed to submit withdrawal request')
      setShowConfirmModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState />
  if (error && !showForm) return <ErrorState message={error} />

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      <div className="max-w-xl mx-auto">
        {success && (
          <div className="mb-6 p-4 bg-green/20 border border-green/50 rounded-xl text-green-200 text-center">
            ✅ Withdrawal request submitted successfully! Status: Pending
          </div>
        )}

        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] overflow-hidden hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
          {!showForm ? (
            <>
              {/* Wallet Illustration Section */}
              <div className="p-8 text-center">
                {/* Wallet Image */}
                <div className="relative inline-block mb-6">
                  <img 
                    src="/images/dompet.png" 
                    alt="Wallet" 
                    className="w-64 h-auto mx-auto object-contain drop-shadow-2xl"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      // Fallback to jpeg if png not found
                      const imgElement = e.currentTarget
                      if (imgElement.src.includes('dompet.png')) {
                        imgElement.src = '/images/dompet.jpeg'
                      } else {
                        imgElement.style.display = 'none'
                        const fallback = document.getElementById('wallet-fallback')
                        if (fallback) {
                          fallback.style.display = 'block'
                        }
                      }
                    }}
                  />
                  
                  {/* Fallback SVG Wallet (hidden by default) */}
                  <div id="wallet-fallback" className="hidden" style={{ display: 'none' }}>
                    {/* Sparkle Left */}
                    <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                      <svg className="w-8 h-8 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>

                    {/* Main Wallet */}
                    <div className="relative">
                      {/* Money Bills - Green */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 z-10">
                        <div className="flex gap-1">
                          <div className="w-20 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-xl rotate-[-8deg] border-2 border-green-600"></div>
                          <div className="w-20 h-14 bg-gradient-to-br from-green-300 to-emerald-400 rounded-lg shadow-xl rotate-[5deg] border-2 border-green-500"></div>
                        </div>
                      </div>

                      {/* Wallet Body - Brown/Orange */}
                      <div className="relative w-52 h-32 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 rounded-2xl shadow-2xl overflow-hidden mt-6">
                        {/* Wallet Stitching Lines */}
                        <div className="absolute bottom-4 left-4 right-4 border-t-2 border-dashed border-orange-400/40"></div>
                        <div className="absolute bottom-7 left-4 right-4 border-t-2 border-dashed border-orange-400/40"></div>
                        
                        {/* Card Holder - Blue */}
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-16 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-full"></div>
                        </div>

                        {/* User Name on Wallet */}
                        <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                          <p className="text-white font-bold text-base drop-shadow-lg">
                            {userName || 'User'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sparkle Right */}
                    <div className="absolute -right-8 bottom-8">
                      <svg className="w-10 h-10 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="mb-8 mt-12">
                  <p className="text-white text-4xl font-bold">
                    USDT {availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Withdrawal Button */}
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full max-w-md mx-auto block bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-600 hover:from-cyan-500 hover:via-teal-400 hover:to-cyan-500 text-white font-bold text-lg py-4 px-6 rounded-lg transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] uppercase tracking-wide"
                >
                  Withdrawal
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Withdrawal Form */}
              <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 p-6 border-b border-cyan-500/30">
                <h1 className="text-2xl font-bold text-white">Withdrawal Request</h1>
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
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Withdrawal'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/95 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.6)] rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Withdrawal</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Amount:</span>
                  <span className="text-white font-bold">USDT {formData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Network:</span>
                  <span className="text-white font-bold">{formData.network}</span>
                </div>
                <div className="bg-cyan/10 rounded-lg p-3 mt-4">
                  <p className="text-text-secondary text-sm">Wallet Address:</p>
                  <p className="text-white text-xs font-mono break-all mt-1">{formData.wallet_address}</p>
                </div>
              </div>

              <p className="text-text-secondary text-sm mb-6">
                Are you sure you want to proceed with this withdrawal? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-text-muted/20 hover:bg-text-muted/30 text-text-primary font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmWithdrawal}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
