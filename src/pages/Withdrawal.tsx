import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getBalances, calculateTotalBalance } from '../services/balanceService'
import { createWithdrawal } from '../services/withdrawalService'
import { withdrawalSchema } from '../schemas/withdrawalSchema'

import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import { Wallet, AlertCircle, CheckCircle2, ShieldCheck, Activity } from 'lucide-react'

export default function Withdrawal() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [showInitialConfirmModal, setShowInitialConfirmModal] = useState(false)
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [availableBalance, setAvailableBalance] = useState(0)

  const [formData, setFormData] = useState({
    amount: '',
    wallet_address: '',
    network: 'TRC20',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return

    loadData()

    // Subscribe to real-time changes in balances
    const balanceSubscription = supabase
      .channel('balance_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'balances',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Balance changed:', payload)
          // Reload balance when any change occurs
          loadData()
        }
      )
      .subscribe()

    return () => {
      balanceSubscription.unsubscribe()
    }
  }, [user?.id])

  const loadData = async () => {
    if (!user) return
    try {
      setLoading(true)
      setError('')
      const balances = await getBalances(user.id)
      const total = calculateTotalBalance(balances)
      setAvailableBalance(total)
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

  const handleWithdrawClick = () => {
    setShowInitialConfirmModal(true)
  }

  const handleConfirmProceed = () => {
    setShowInitialConfirmModal(false)
    setShowForm(true)
  }

  const handleWithdrawAll = () => {
    setFormData(prev => ({
      ...prev,
      amount: availableBalance.toString()
    }))
    setFormErrors(prev => ({ ...prev, amount: '' }))
  }

  const handleUseDemoWallet = () => {
    setFormData(prev => ({
      ...prev,
      wallet_address: 'TRXDEMO0001'
    }))
    setFormErrors(prev => ({ ...prev, wallet_address: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    setFormErrors({})
    setError('')

    try {
      const parsedData = withdrawalSchema.parse({
        amount: parseFloat(formData.amount),
        wallet_address: formData.wallet_address,
        network: formData.network,
      })

      if (parsedData.amount > availableBalance) {
        setFormErrors({ amount: 'Amount exceeds available balance' })
        return
      }

      setShowFinalConfirmModal(true)
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

      await createWithdrawal(user.id, parsedData)

      setSuccess(true)
      setShowForm(false)
      setShowFinalConfirmModal(false)
      setFormData({ amount: '', wallet_address: '', network: 'TRC20' })
      setAvailableBalance(prev => prev - parsedData.amount)
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('Failed to submit withdrawal request')
      setShowFinalConfirmModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState />
  if (error && !showForm) return <ErrorState message={error} />

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-4 bg-black">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Form and History Container */}
        <div className="w-full max-w-md">
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-center flex items-center justify-center gap-3 animate-fade-in shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-6 h-6" /> 
              <span className="font-semibold text-lg">Withdrawal request submitted successfully!</span>
            </div>
          )}

          <div className="bg-black/80 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden transition-all duration-500 hover:border-cyan-400/50 hover:shadow-[0_0_60px_rgba(6,182,212,0.25)] relative animate-fade-in">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-cyan-500/10 blur-[100px] pointer-events-none"></div>

          {!showForm ? (
            <>
              {/* Wallet Illustration Section */}
              <div className="p-4 md:p-8 text-center relative z-10">
                <div className="relative inline-block mb-4 group">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-400/30 transition-all duration-500"></div>
                  <img 
                    src="/images/dompet.png" 
                    alt="Wallet" 
                    className="relative w-20 md:w-32 h-auto mx-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const imgElement = e.currentTarget
                      if (imgElement.src.includes('dompet.png')) {
                        imgElement.src = '/images/dompet.jpeg'
                      } else {
                        imgElement.style.display = 'none'
                        const fallback = document.getElementById('wallet-fallback')
                        if (fallback) fallback.style.display = 'block'
                      }
                    }}
                  />
                  
                  {/* Fallback SVG Wallet */}
                  <div id="wallet-fallback" className="hidden relative" style={{ display: 'none' }}>
                    <div className="w-16 h-12 bg-gradient-to-br from-cyan-700 to-cyan-900 rounded-xl shadow-2xl mx-auto flex items-center justify-center border-2 border-cyan-600/50">
                      <Wallet className="w-6 h-6 text-cyan-200" />
                    </div>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="mb-8 animate-slide-up">
                  <p className="text-gray-400 text-xs font-medium tracking-wider uppercase mb-3">Available Balance to Withdraw</p>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-4xl md:text-5xl text-white font-black tracking-tight animate-pulse-slow">
                      {availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-lg md:text-2xl text-cyan-400 font-bold mb-1">USDT</span>
                  </div>
                </div>

                {/* Balance is 0 alert */}
                {availableBalance <= 0 && (
                  <div className="mb-6 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/40 rounded-xl px-5 py-4 animate-fade-in">
                    <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-300 font-semibold">Saldo tidak cukup</p>
                      <p className="text-yellow-500 text-sm mt-0.5">Harap isi saldo terlebih dahulu sebelum melakukan penarikan.</p>
                    </div>
                  </div>
                )}

                {/* Withdrawal Button */}
                <button
                  onClick={availableBalance <= 0 ? undefined : handleWithdrawClick}
                  disabled={availableBalance <= 0}
                  className="w-full max-w-md mx-auto flex items-center justify-center bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-600 hover:from-cyan-500 hover:via-teal-400 hover:to-cyan-500 text-white font-bold text-xl py-5 px-8 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] hover:scale-105 uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
                >
                  Withdraw
                </button>

              </div>
            </>
          ) : (
            <>
              {/* Withdrawal Form */}
              <div className="bg-gray-900/50 p-6 md:p-8 border-b border-gray-800 flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-wide">USDT Withdrawal</h1>
                  <p className="text-gray-400 text-sm mt-1">TRC20 Network Only</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 relative z-10">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Amount Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label htmlFor="amount" className="block text-gray-300 font-medium">
                      Withdrawal Amount
                    </label>
                    <span className="text-sm text-gray-400">
                      Available: <span className="text-cyan-400 font-semibold">USDT {availableBalance.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">USDT</span>
                    </div>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full pl-16 pr-28 py-4 bg-black/50 border border-gray-700 rounded-xl text-white font-bold text-lg placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all group-hover:border-gray-600"
                      placeholder="0.00"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={handleWithdrawAll}
                      disabled={submitting || availableBalance <= 0}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 text-sm font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      MAX
                    </button>
                  </div>
                  {formErrors.amount && (
                    <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{formErrors.amount}</p>
                  )}
                </div>

                {/* Wallet Input */}
                <div className="space-y-3">
                  <label htmlFor="wallet_address" className="block text-gray-300 font-medium">
                    Destination Address (TRC20)
                  </label>
                  <div className="relative group">
                    <input
                      id="wallet_address"
                      name="wallet_address"
                      type="text"
                      value={formData.wallet_address}
                      onChange={handleInputChange}
                      className="w-full px-4 pr-36 py-4 bg-black/50 border border-gray-700 rounded-xl text-white font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all group-hover:border-gray-600"
                      placeholder="Enter TRC20 wallet address"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={handleUseDemoWallet}
                      disabled={submitting}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" /> Use Demo
                    </button>
                  </div>
                  {formErrors.wallet_address && (
                    <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{formErrors.wallet_address}</p>
                  )}
                </div>

                <div className="p-4 bg-cyan-900/20 border border-cyan-800/50 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold mb-1">Network Security</p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Please ensure your destination wallet supports the <strong>TRON (TRC20)</strong> network. Sending funds to an unsupported network will result in permanent loss.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setFormData({ amount: '', wallet_address: '', network: 'TRC20' })
                      setFormErrors({})
                      setError('')
                    }}
                    disabled={submitting}
                    className="w-full sm:w-1/3 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-2/3 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
                      </span>
                    ) : (
                      'Confirm & Proceed'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Transaction History Section - Outside Card */}
        {!showForm && (
          <div className="mt-8">
            <h2 className="text-white font-bold text-xl mb-6 tracking-wider">TRANSACTION HISTORY</h2>
            
            <div className="flex items-center justify-between gap-4">
              <p className="text-white text-base leading-relaxed" style={{ maxWidth: '280px' }}>
                To view your transaction history, please click the "View History" button here.
              </p>
              
              <button
                onClick={() => navigate('/riwayat')}
                className="bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-600 hover:from-cyan-500 hover:via-teal-400 hover:to-cyan-500 text-white font-bold text-lg px-10 py-3 rounded-2xl border-2 border-cyan-500/30 hover:border-cyan-400/50 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] whitespace-nowrap flex-shrink-0"
              >
                Click Here
              </button>
            </div>
          </div>
        )}
        </div> {/* Close Form and History Container */}

        {/* How to Withdraw Section */}
        {!showForm && (
          <div className="w-full mt-12 md:mt-16 animate-fade-in">
            <h2 className="text-white font-bold text-xl md:text-2xl mb-8 tracking-wider text-center md:text-left">HOW TO WITHDRAW</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Step 1 */}
              <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-5 md:p-8 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 transform hover:-translate-y-1">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 font-bold text-xs md:text-sm rounded-full mb-3">STEP 1</span>
                  <h3 className="text-white font-bold text-lg md:text-xl">Click Withdraw</h3>
                </div>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  Click the "Withdraw" button above to start the withdrawal process.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-5 md:p-8 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 transform hover:-translate-y-1">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 font-bold text-xs md:text-sm rounded-full mb-3">STEP 2</span>
                  <h3 className="text-white font-bold text-lg md:text-xl">Enter Details</h3>
                </div>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  Fill in the amount (USDT) and your TRC20 wallet address.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-5 md:p-8 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 transform hover:-translate-y-1">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 font-bold text-xs md:text-sm rounded-full mb-3">STEP 3</span>
                  <h3 className="text-white font-bold text-lg md:text-xl">Wait Process</h3>
                </div>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  Confirm your withdrawal. Processing time: 5-10 minutes.
                </p>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-2xl p-6 md:p-8 hover:border-yellow-500/40 transition-colors">
              <h4 className="text-yellow-400 font-bold text-base md:text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                IMPORTANT NOTES
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-gray-300 text-sm md:text-base leading-relaxed">
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2"></div><p>Only TRC20 network is supported</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2"></div><p>Double-check your wallet address before confirming</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2"></div><p>Minimum withdrawal: 10 USDT</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2"></div><p>Contact support if withdrawal takes longer than expected</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Initial Confirmation Modal */}
        {showInitialConfirmModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl max-w-md w-full p-8 animate-scale-in">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4">Secure Withdrawal</h3>
              <p className="text-gray-400 text-center mb-8">
                You are about to initiate a USDT (TRC20) withdrawal. Please ensure you have a valid destination wallet address ready.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowInitialConfirmModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmProceed}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Final Confirmation Modal */}
        {showFinalConfirmModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl max-w-md w-full p-8 animate-scale-in">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Confirm Transfer</h3>
              
              <div className="bg-black/50 rounded-xl p-5 mb-6 space-y-4 border border-gray-800">
                <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                  <span className="text-gray-400">Total Amount</span>
                  <span className="text-xl text-cyan-400 font-bold">USDT {formData.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white font-semibold bg-gray-800 px-3 py-1 rounded-md">TRC20 (TRON)</span>
                </div>
                <div className="pt-2">
                  <p className="text-gray-400 text-sm mb-2">Destination Wallet:</p>
                  <p className="text-white font-mono bg-gray-800 p-3 rounded-lg text-sm break-all border border-gray-700">
                    {formData.wallet_address}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowFinalConfirmModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmWithdrawal}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirm Transfer'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
