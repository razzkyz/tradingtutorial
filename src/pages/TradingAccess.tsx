import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getBalances, calculateTotalBalance } from '../services/balanceService'
import { Wallet } from 'lucide-react'
import { SkeletonBalanceCard } from '../components/Skeleton'
import ErrorState from '../components/ErrorState'

interface Balance {
  id: string
  balance_type: string
  amount: number
}

export default function TradingAccess() {
  const { user } = useAuth()
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    loadBalances()
    
    // Cleanup
    return () => {
      // Cancel any pending requests
    }
  }, [user?.id]) // Only depend on user.id

  const loadBalances = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      const data = await getBalances(user.id)
      setBalances(data)
    } catch (err) {
      console.error('Error loading balances:', err)
      setError('Failed to load balances')
    } finally {
      setLoading(false)
    }
  }

  if (error) return <ErrorState message={error} />

  const totalBalance = calculateTotalBalance(balances)

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      <div className="max-w-2xl mx-auto">
        {/* Main Card Container */}
        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] p-6 md:p-8 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
          
          {/* Icon & Total Balance - Top Right */}
          <div className="mb-8">
            <div className="flex justify-end">
              {loading ? (
                <div className="flex flex-col items-end">
                  <div className="w-24 h-24 bg-text-muted/20 rounded-2xl animate-pulse mb-3"></div>
                  <div className="h-10 w-40 bg-text-muted/20 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  {/* Wallet Icon - no glow */}
                  <div className="bg-gradient-to-br from-cyan-600 to-teal-600 p-6 rounded-lg mb-3">
                    <Wallet className="w-16 h-16 text-white" strokeWidth={2} />
                  </div>
                  {/* Total Balance */}
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    USDT {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </h2>
                </div>
              )}
            </div>
          </div>

          {/* Balance Cards Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {loading ? (
              <>
                <SkeletonBalanceCard />
                <SkeletonBalanceCard />
                <SkeletonBalanceCard />
                <SkeletonBalanceCard />
              </>
            ) : (
              balances.map((balance, index) => (
                <div
                  key={balance.id}
                  className="bg-black/95 border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-lg p-4 animate-scale-in hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:border-cyan-400/60 transition-all duration-300"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <p className="text-cyan-300 text-sm font-medium mb-1">
                    Balance {index + 1}
                  </p>
                  <p className="text-white text-xl font-bold">
                    USDT {balance.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Trading Access Button */}
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 hover:from-cyan-500 hover:via-teal-500 hover:to-cyan-500 text-white font-bold text-lg py-4 px-6 rounded-lg transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            Trading Access
          </button>

        </div>
      </div>
    </div>
  )
}
