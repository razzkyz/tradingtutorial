import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import { Clock, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Transaction {
  id: string
  type: 'withdrawal'
  amount: number
  wallet_address: string
  network: string
  status: 'processing' | 'completed' | 'failed'
  created_at: string
}

export default function Riwayat() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Format date to Indonesia Jakarta timezone
  const formatDateIndonesia = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta',
      hour12: false
    })
  }

  useEffect(() => {
    if (!user) return
    loadTransactionHistory()

    // Subscribe to real-time changes in withdrawals
    const withdrawalSubscription = supabase
      .channel('withdrawal_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'withdrawals',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Withdrawal changed:', payload)
          // Reload transaction history when any change occurs
          loadTransactionHistory()
        }
      )
      .subscribe()

    return () => {
      withdrawalSubscription.unsubscribe()
    }
  }, [user?.id])

  const loadTransactionHistory = async () => {
    if (!user) return
    try {
      setLoading(true)
      setError('')

      // Load real withdrawal data from database
      const { data: withdrawals, error: dbError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (dbError) throw dbError

      const formattedTransactions: Transaction[] = (withdrawals || []).map((w: any) => ({
        id: w.id,
        type: 'withdrawal',
        amount: w.amount,
        wallet_address: w.wallet_address,
        network: w.network,
        status: w.status === 'pending' ? 'processing' : w.status === 'approved' ? 'completed' : w.status === 'rejected' ? 'failed' : w.status,
        created_at: w.created_at
      }))

      setTransactions(formattedTransactions)
    } catch (err) {
      console.error('Error loading transaction history:', err)
      setError('Failed to load transaction history')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8 bg-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/withdrawal')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Withdrawal</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center border border-cyan-500/30">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TRANSACTION HISTORY</h1>
              <p className="text-gray-400 text-sm mt-0.5">View all your withdrawal transactions</p>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        {transactions.length === 0 ? (
          <div className="bg-black/80 backdrop-blur-xl rounded-xl border border-gray-800 p-8 text-center">
            <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Transaction History</h3>
            <p className="text-gray-400 text-sm mb-6">You haven't made any withdrawal transactions yet</p>
            <button
              onClick={() => navigate('/withdrawal')}
              className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-lg text-sm"
            >
              Make a Withdrawal
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-black/80 backdrop-blur-xl border border-gray-800 rounded p-2.5 hover:border-cyan-500/30 transition-all"
              >
                {/* TRANSACTION HISTORY Header */}
                <h2 className="text-white font-bold text-sm mb-2 tracking-wider">TRANSACTION HISTORY</h2>
                
                {/* Transaction Header - Very Compact */}
                <div className="mb-1.5">
                  <h3 className="text-white font-medium text-xs mb-0.5">
                    Withdrawal : {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                  </h3>
                  <p className="text-gray-400 text-[10px] mb-1.5">{formatDateIndonesia(tx.created_at)}</p>
                  
                  {/* STATUS - Very Compact */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-white font-medium text-[10px]">STATUS :</span>
                    {tx.status === 'processing' && (
                      <span className="px-2 py-0.5 bg-green-500 text-white font-medium text-[9px] rounded">
                        Processing
                      </span>
                    )}
                    {tx.status === 'completed' && (
                      <span className="px-2 py-0.5 bg-emerald-500 text-white font-medium text-[9px] rounded">
                        Completed
                      </span>
                    )}
                    {tx.status === 'failed' && (
                      <span className="px-2 py-0.5 bg-red-500 text-white font-medium text-[9px] rounded">
                        Failed
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Message (if processing) - Very Compact */}
                {tx.status === 'processing' && (
                  <div className="bg-gray-900/50 border border-gray-700 rounded p-2 mb-1.5">
                    <h4 className="text-white font-medium text-[10px] text-center mb-0.5">NOTIFICATIONS</h4>
                    <p className="text-gray-300 text-center text-[9px] leading-tight">
                      Your transaction is being processed.
                      <br />
                      Please wait for 5 minutes.
                    </p>
                  </div>
                )}

                {/* Transaction Details - Very Compact */}
                <div className="grid grid-cols-2 gap-2 bg-gray-900/30 rounded p-2 border border-gray-800">
                  <div>
                    <p className="text-gray-500 text-[9px] mb-0.5 font-medium">Network</p>
                    <p className="text-white font-medium text-[10px]">{tx.network}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[9px] mb-0.5 font-medium">Destination Address</p>
                    <p className="text-white font-mono text-[9px] break-all">{tx.wallet_address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
