import { FormEvent } from 'react'

interface WithdrawalFormProps {
  amount: string
  walletAddress: string
  network: string
  onAmountChange: (value: string) => void
  onWalletChange: (value: string) => void
  onNetworkChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
  errors: Record<string, string>
  submitting: boolean
  availableBalance: number
}

export default function WithdrawalForm({
  amount,
  walletAddress,
  network,
  onAmountChange,
  onWalletChange,
  onNetworkChange,
  onSubmit,
  onCancel,
  errors,
  submitting,
  availableBalance,
}: WithdrawalFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="amount" className="block text-text-secondary text-sm mb-2">
          Amount (USDT) *
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
          placeholder="Enter amount"
          required
          disabled={submitting}
        />
        {errors.amount && <p className="mt-2 text-red-400 text-sm">{errors.amount}</p>}
        <p className="mt-2 text-text-muted text-sm">Available: USDT {availableBalance.toFixed(2)}</p>
      </div>

      <div>
        <label htmlFor="wallet_address" className="block text-text-secondary text-sm mb-2">
          Wallet Address *
        </label>
        <input
          id="wallet_address"
          type="text"
          value={walletAddress}
          onChange={(e) => onWalletChange(e.target.value)}
          className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
          placeholder="Enter wallet address"
          required
          disabled={submitting}
        />
        {errors.wallet_address && (
          <p className="mt-2 text-red-400 text-sm">{errors.wallet_address}</p>
        )}
      </div>

      <div>
        <label htmlFor="network" className="block text-text-secondary text-sm mb-2">
          Network *
        </label>
        <select
          id="network"
          value={network}
          onChange={(e) => onNetworkChange(e.target.value)}
          className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
          required
          disabled={submitting}
        >
          <option value="">Select network</option>
          <option value="TRC20">TRC20</option>
          <option value="ERC20">ERC20</option>
          <option value="BEP20">BEP20</option>
        </select>
        {errors.network && <p className="mt-2 text-red-400 text-sm">{errors.network}</p>}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 bg-text-muted/20 hover:bg-text-muted/30 text-text-primary font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Withdrawal'}
        </button>
      </div>
    </form>
  )
}
