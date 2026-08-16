import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getBalances, calculateTotalBalance } from '../services/balanceService'
import BalanceCard from '../components/BalanceCard'
import LoadingState from '../components/LoadingState'
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

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  const totalBalance = calculateTotalBalance(balances)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-deep-navy/90 to-dark-teal/90 backdrop-blur-sm rounded-2xl border border-cyan/20 shadow-2xl overflow-hidden">
        {/* Total Balance */}
        <div className="p-8 text-center border-b border-cyan/30">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-button-gradient rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-text-primary text-3xl font-bold mb-2">
            USDT {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-text-secondary">Total Available Balance</p>
        </div>

        {/* Balance Cards Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {balances.map((balance, index) => (
              <BalanceCard
                key={balance.id}
                title={`Balance ${index + 1}`}
                amount={balance.amount}
                type={index === 0 ? 'highlight' : 'default'}
              />
            ))}
          </div>

          {/* Trading Access Button */}
          <button className="w-full bg-button-gradient hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-cyan/50 text-lg">
            TRADING ACCESS
          </button>

          <div className="mt-6 p-4 bg-cyan/10 border border-cyan/30 rounded-xl">
            <p className="text-text-secondary text-sm text-center">
              💡 Trading access button is for demonstration purposes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
