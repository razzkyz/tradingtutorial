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
  }, [user])

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
    <div className="min-h-[calc(100vh-64px)] px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Main Card Container */}
        <div className="bg-gradient-to-br from-deep-navy/95 to-dark-teal/95 backdrop-blur-sm rounded-3xl border border-cyan/20 shadow-2xl p-6 md:p-8">
          
          {/* Icon & Total Balance - Top Right */}
          <div className="mb-8">
            <div className="flex justify-end">
              {loading ? (
                <div className="flex flex-col items-end">
                  <div className="w-20 h-20 bg-text-muted/20 rounded-2xl animate-pulse mb-3"></div>
                  <div className="h-10 w-40 bg-text-muted/20 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  {/* Wallet Icon */}
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-5 rounded-2xl shadow-xl mb-3">
                    <Wallet className="w-10 h-10 text-deep-navy" strokeWidth={2} />
                  </div>
                  {/* Total Balance */}
                  <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
                    USDT {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-4 shadow-lg animate-scale-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <p className="text-deep-navy text-sm font-medium mb-1">
                    Balance {index + 1}
                  </p>
                  <p className="text-deep-navy text-xl font-bold">
                    USDT {balance.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Trading Access Button */}
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal via-cyan to-emerald hover:from-emerald hover:via-cyan hover:to-teal text-deep-navy font-bold text-lg py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            Trading Access
          </button>

        </div>
      </div>
    </div>
  )
}
