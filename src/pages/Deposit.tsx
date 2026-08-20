import { useState, useEffect } from 'react'
import { ArrowLeft, Copy, CheckCircle2, Wallet, Loader2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Deposit() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [copiedWallet, setCopiedWallet] = useState(false)
  const [copiedNetwork, setCopiedNetwork] = useState(false)
  const [loading, setLoading] = useState(true)

  // Wallet addresses fetched from this user's profile (set by admin)
  const [depositWallet, setDepositWallet] = useState<string | null>(null)
  const [networkAddress, setNetworkAddress] = useState<string | null>(null)

  useEffect(() => {
    if (user) fetchSettings()
  }, [user])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('deposit_wallet, deposit_network')
        .eq('user_id', user!.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      setDepositWallet((data as any)?.deposit_wallet ?? null)
      setNetworkAddress((data as any)?.deposit_network ?? null)
    } catch (err) {
      console.error('Error fetching deposit settings:', err)
      setDepositWallet(null)
      setNetworkAddress(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyWallet = async () => {
    if (!depositWallet) return
    try {
      await navigator.clipboard.writeText(depositWallet)
      setCopiedWallet(true)
      setTimeout(() => setCopiedWallet(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyNetwork = async () => {
    if (!networkAddress) return
    try {
      await navigator.clipboard.writeText(networkAddress)
      setCopiedNetwork(true)
      setTimeout(() => setCopiedNetwork(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          {/* Main Card */}
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden transition-all duration-500 hover:border-cyan-400/50 hover:shadow-[0_0_60px_rgba(6,182,212,0.25)] relative">

            {/* Subtle Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-cyan-500/10 blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <div className="bg-gray-900/50 p-6 md:p-8 border-b border-gray-800 flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 flex-shrink-0">
                <Wallet className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">DEPOSIT TO ACCOUNT</h1>
                <p className="text-gray-400 text-sm mt-1">The wallet and network address will be provided by the Admin. Please copy them below to make your deposit.</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 space-y-8 relative z-10">

              {/* Currencies (Static Cards) */}
              <div className="flex gap-3">
                <div className="flex-1 bg-cyan-600 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] text-center">
                  USDT
                </div>
                <div className="flex-1 bg-gray-800 text-white font-bold py-3 px-6 rounded-xl text-center">
                  BTC
                </div>
              </div>

              {/* Not Assigned Banner */}
              {(!depositWallet || !networkAddress) && (
                <div className="bg-gradient-to-r from-orange-900/30 to-red-900/20 border border-orange-600/40 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-200 text-sm leading-relaxed">
                    Your deposit address has not been assigned yet. Please contact the Admin to get your personal deposit wallet address.
                  </p>
                </div>
              )}

              {/* Wallet Address Input with Copy */}
              <div className="space-y-3">
                <label className="block text-gray-300 font-medium text-sm">
                  Wallet Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={depositWallet ?? ''}
                    readOnly
                    placeholder="Waiting for admin assignment..."
                    className="w-full px-4 py-4 pr-24 bg-black/50 border border-gray-700 rounded-xl text-white font-mono text-sm placeholder-gray-500 focus:outline-none cursor-default"
                  />
                  {depositWallet && (
                    <button
                      onClick={handleCopyWallet}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                      {copiedWallet ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Network Address with Copy */}
              <div className="space-y-3">
                <label className="block text-gray-300 font-medium text-sm">
                  Network Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={networkAddress ?? ''}
                    readOnly
                    placeholder="Waiting for admin assignment..."
                    className="w-full px-4 py-4 pr-24 bg-black/50 border border-gray-700 rounded-xl text-white font-semibold text-sm uppercase placeholder-gray-500 focus:outline-none cursor-default"
                  />
                  {networkAddress && (
                    <button
                      onClick={handleCopyNetwork}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                      {copiedNetwork ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/20 border border-yellow-500/60 rounded-xl p-5 shadow-[0_0_20px_rgba(234,179,8,0.25)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:border-yellow-400/80 transition-all duration-300">
                <p className="text-yellow-200 text-sm leading-relaxed font-medium">
                  Please contact the Admin if you need assistance or have any questions.
                </p>
              </div>


            </div>

          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
