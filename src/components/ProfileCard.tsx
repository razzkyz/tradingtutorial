interface ProfileCardProps {
  label: string
  value: string
  highlight?: boolean
}

export default function ProfileCard({ label, value, highlight = false }: ProfileCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        highlight
          ? 'bg-gradient-to-r from-teal-900/50 to-teal-800/50 border-teal-700/30'
          : 'bg-dark-teal/40 border-teal-700/30'
      }`}
    >
      <p className="text-text-secondary text-sm mb-1">{label}</p>
      <p className="text-text-primary text-lg font-medium">{value}</p>
    </div>
  )
}
