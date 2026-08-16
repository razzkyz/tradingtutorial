interface BalanceCardProps {
  title: string
  amount: number
  type?: 'default' | 'highlight'
}

export default function BalanceCard({ title, amount, type = 'default' }: BalanceCardProps) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        type === 'highlight'
          ? 'bg-gradient-to-r from-teal-900/50 to-teal-800/50 border-teal-700/30 shadow-lg'
          : 'bg-dark-teal/40 border-teal-700/30'
      } transition-all hover:scale-105 hover:shadow-xl`}
    >
      <p className="text-text-secondary text-sm mb-2">{title}</p>
      <p className="text-text-primary text-xl font-bold">
        USDT {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  )
}
