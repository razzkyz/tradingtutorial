import { useState } from 'react'

interface BinanceTradingProps {
  compact?: boolean
}

export default function BinanceTrading({ compact = false }: BinanceTradingProps) {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleTrade = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter valid quantity')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Simulate network request for mock trading
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockOrderId = Math.floor(Math.random() * 1000000000)
      setMessage(`✅ ${side} order placed successfully! Order ID: ${mockOrderId}`)
      setQuantity('')
    } catch (err: any) {
      setError(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={compact ? '' : 'bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] p-4 sm:p-6 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300'}>
      {!compact && <h3 className="text-xl font-bold text-white mb-4">Quick Trade</h3>}

      {/* Buy/Sell Buttons - Horizontal */}
      <div className={`flex gap-2 ${compact ? 'mb-2' : 'mb-3'}`}>
        <button
          onClick={() => setSide('BUY')}
          className={`flex-1 ${compact ? 'py-2 text-xs' : 'py-3 text-sm'} rounded font-bold transition-all ${
            side === 'BUY'
              ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          BUY
        </button>
        <button
          onClick={() => setSide('SELL')}
          className={`flex-1 ${compact ? 'py-2 text-xs' : 'py-3 text-sm'} rounded font-bold transition-all ${
            side === 'SELL'
              ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          SELL
        </button>
      </div>

      {/* Quantity Input */}
      <div className={compact ? 'mb-2' : 'mb-2'}>
        <label className={`block text-gray-300 ${compact ? 'text-xs' : 'text-sm'} mb-1`}>Quantity</label>
        <input
          type="number"
          step="0.00001"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0.001"
          className={`w-full ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} bg-gray-900/80 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30`}
          disabled={loading}
        />
      </div>

      {/* Messages */}
      {error && (
        <div className={`${compact ? 'mb-2 p-1.5' : 'mb-2 p-1.5'} bg-red-500/20 border border-red-500/50 rounded text-red-200 ${compact ? 'text-xs' : 'text-sm'}`}>
          {error}
        </div>
      )}
      {message && (
        <div className={`${compact ? 'mb-2 p-1.5' : 'mb-2 p-1.5'} bg-emerald-500/20 border border-emerald-500/50 rounded text-emerald-200 ${compact ? 'text-xs' : 'text-sm'}`}>
          ✓ Order placed
        </div>
      )}

      {/* Trade Button */}
      <button
        onClick={handleTrade}
        disabled={loading}
        className={`w-full ${compact ? 'py-2 text-xs' : 'py-3 text-sm'} rounded font-bold transition-all ${
          side === 'BUY'
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
            : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? '...' : `${side}`}
      </button>
    </div>
  )
}
