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
          ? 'bg-card-gradient border-cyan/30'
          : 'bg-dark-teal/40 border-text-muted/20'
      }`}
    >
      <p className="text-text-secondary text-sm mb-1">{label}</p>
      <p className="text-text-primary text-lg font-medium">{value}</p>
    </div>
  )
}
