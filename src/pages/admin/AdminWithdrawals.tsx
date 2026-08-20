import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Search, Download, Clock, CheckCircle2, XCircle, Wallet, User, Calendar, Filter, MessageSquare, Save, X } from 'lucide-react'
import LoadingState from '../../components/LoadingState'

interface WithdrawalRecord {
  id: string
  user_id: string
  amount: number
  wallet_address: string
  network: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  admin_message?: string
  profiles?: {
    full_name: string
    email: string
  }
}

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,         color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  approved: { label: 'Approved', icon: CheckCircle2,   color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  rejected: { label: 'Rejected', icon: XCircle,        color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30' },
}

export default function AdminWithdrawals() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editMessageText, setEditMessageText] = useState('')
  const [savingMessageId, setSavingMessageId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) checkAdminAndLoad()
  }, [user?.id, authLoading])

  const checkAdminAndLoad = async () => {
    if (!user) { window.location.href = '/login'; return }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single() as any

      if (profile?.role !== 'admin') { window.location.href = '/dashboard'; return }

      setIsAdmin(true)
      await loadWithdrawals()
    } catch (error) {
      console.error('Error checking admin:', error)
      window.location.href = '/dashboard'
    } finally {
      setLoading(false)
    }
  }

  const loadWithdrawals = async () => {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        profiles!withdrawals_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false }) as any

    if (!error && data) {
      setWithdrawals(data)
    } else {
      // Fallback: load withdrawals without join, then load profiles separately
      const { data: wds } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false }) as any

      if (wds) {
        const userIds = [...new Set(wds.map((w: any) => w.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds) as any

        const profileMap: Record<string, any> = {}
        profiles?.forEach((p: any) => { profileMap[p.user_id] = p })

        setWithdrawals(wds.map((w: any) => ({
          ...w,
          profiles: profileMap[w.user_id],
        })))
      }
    }
  }

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id)
    try {
      // Get withdrawal details
      const withdrawal = withdrawals.find(w => w.id === id)
      if (!withdrawal) {
        console.error('Withdrawal not found')
        return
      }

      // Update withdrawal status
      await (supabase.from('withdrawals') as any).update({ status }).eq('id', id)

      // If rejected, return the amount back to user's balance
      if (status === 'rejected') {
        // Get current balance_1 (main balance)
        const { data: currentBalance } = await supabase
          .from('balances')
          .select('amount')
          .eq('user_id', withdrawal.user_id)
          .eq('balance_type', 'balance_1')
          .single()

        if (currentBalance) {
          // Add withdrawal amount back to balance
          const newAmount = (currentBalance as any).amount + withdrawal.amount

          await (supabase
            .from('balances') as any)
            .update({ amount: newAmount })
            .eq('user_id', withdrawal.user_id)
            .eq('balance_type', 'balance_1')

          console.log(`Returned ${withdrawal.amount} USDT to user ${withdrawal.profiles?.full_name || withdrawal.user_id}`)
        }
      }

      setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status } : w))
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleEditMessage = (id: string, currentMessage?: string) => {
    setEditingMessageId(id)
    setEditMessageText(currentMessage || 'Your transaction is being processed. Please wait for 5 minutes.')
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditMessageText('')
  }

  const handleSaveMessage = async (id: string) => {
    setSavingMessageId(id)
    try {
      await (supabase.from('withdrawals') as any)
        .update({ admin_message: editMessageText })
        .eq('id', id)

      setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, admin_message: editMessageText } : w))
      setEditingMessageId(null)
      setEditMessageText('')
    } catch (err) {
      console.error('Failed to update message:', err)
    } finally {
      setSavingMessageId(null)
    }
  }

  const exportCSV = () => {
    const header = ['Date', 'Name', 'Email', 'Amount (USDT)', 'Wallet', 'Network', 'Status']
    const rows = filtered.map(w => [
      new Date(w.created_at).toLocaleString('id-ID'),
      w.profiles?.full_name || '-',
      w.profiles?.email || '-',
      w.amount.toFixed(2),
      w.wallet_address,
      w.network,
      w.status,
    ])
    
    // Add empty row
    rows.push([])
    
    // Add total row (only pending + approved)
    const totalPendingApproved = filtered
      .filter(w => w.status === 'pending' || w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0)
    
    rows.push(['', '', 'TOTAL (Pending + Approved):', totalPendingApproved.toFixed(2), '', '', ''])
    
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `withdrawals_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = withdrawals.filter(w => {
    const matchStatus = filterStatus === 'all' || w.status === filterStatus
    const q = searchQuery.toLowerCase()
    const matchSearch = !q ||
      w.profiles?.full_name?.toLowerCase().includes(q) ||
      w.profiles?.email?.toLowerCase().includes(q) ||
      w.wallet_address.toLowerCase().includes(q) ||
      w.amount.toString().includes(q)
    return matchStatus && matchSearch
  })

  // Only count pending and approved (exclude rejected)
  const totalAmount = filtered
    .filter(w => w.status === 'pending' || w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0)

  if (authLoading || loading) return <LoadingState />
  if (!isAdmin) return null

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Withdrawal Transactions</h1>
            <p className="text-gray-400 mt-1">Monitor and manage all user withdrawal requests</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => {
            const count = status === 'all' ? withdrawals.length : withdrawals.filter(w => w.status === status).length
            const cfg = status !== 'all' ? STATUS_CONFIG[status] : null
            const Icon = cfg?.icon || Wallet
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  filterStatus === status
                    ? 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${cfg ? cfg.color : 'text-cyan-400'}`} />
                  <span className={`text-xs font-medium capitalize ${cfg ? cfg.color : 'text-cyan-400'}`}>
                    {status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-gray-500 text-xs mt-1">transactions</p>
              </button>
            )
          })}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or wallet..."
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 px-4 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 text-sm">
            <Filter className="w-4 h-4" />
            <span>{filtered.length} results</span>
          </div>
        </div>

        {/* Total Amount Banner */}
        <div className="flex items-center gap-3 p-4 mb-6 bg-gray-900/60 border border-gray-800 rounded-xl">
          <Wallet className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <span className="text-gray-400 text-sm">Total amount in current view:</span>
          <span className="text-cyan-400 font-bold text-lg ml-auto">
            USDT {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Table */}
        <div className="bg-black/80 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-900/60 border-b border-gray-800">
            <div className="col-span-2 text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> User
            </div>
            <div className="col-span-1 text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" /> Amount
            </div>
            <div className="col-span-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Wallet Address
            </div>
            <div className="col-span-1 text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Network
            </div>
            <div className="col-span-1 text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Date
            </div>
            <div className="col-span-3 text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Admin Message
            </div>
            <div className="col-span-2 text-gray-400 text-xs font-semibold uppercase tracking-wider text-right">
              Status / Action
            </div>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Wallet className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">No withdrawal transactions found</p>
            </div>
          ) : (
            filtered.map((w, i) => {
              const cfg = STATUS_CONFIG[w.status]
              const Icon = cfg.icon
              return (
                <div
                  key={w.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-900 hover:bg-gray-900/30 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-900/10'}`}
                >
                  {/* User */}
                  <div className="col-span-2 flex flex-col justify-center min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {w.profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-gray-500 text-xs truncate">{w.profiles?.email || w.user_id}</p>
                  </div>

                  {/* Amount */}
                  <div className="col-span-1 flex flex-col justify-center">
                    <p className="text-white font-bold text-base">
                      {w.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-gray-500 text-xs">USDT</p>
                  </div>

                  {/* Wallet Address */}
                  <div className="col-span-2 flex items-center min-w-0">
                    <span className="text-gray-300 font-mono text-xs truncate bg-gray-900 px-2 py-1 rounded-md border border-gray-800 block w-full">
                      {w.wallet_address}
                    </span>
                  </div>

                  {/* Network */}
                  <div className="col-span-1 flex items-center">
                    <span className="text-xs font-semibold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20 uppercase">
                      {w.network || 'N/A'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-1 flex flex-col justify-center">
                    <p className="text-gray-400 text-xs">
                      {new Date(w.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {new Date(w.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Admin Message */}
                  <div className="col-span-3 flex flex-col justify-center min-w-0">
                    {editingMessageId === w.id ? (
                      <div className="flex flex-col gap-1">
                        <textarea
                          value={editMessageText}
                          onChange={(e) => setEditMessageText(e.target.value)}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs resize-none focus:outline-none focus:border-cyan-500"
                          rows={2}
                          placeholder="Enter admin message..."
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSaveMessage(w.id)}
                            disabled={savingMessageId === w.id}
                            className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs rounded transition-all disabled:opacity-40"
                          >
                            {savingMessageId === w.id ? (
                              <div className="w-3 h-3 border border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-all"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleEditMessage(w.id, w.admin_message)}
                        className="cursor-pointer group"
                      >
                        <p className="text-gray-300 text-xs leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
                          {w.admin_message || 'Your transaction is being processed. Please wait for 5 minutes.'}
                        </p>
                        <p className="text-gray-600 text-xs mt-0.5 group-hover:text-cyan-500 transition-colors">
                          Click to edit
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {w.status === 'pending' ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStatusUpdate(w.id, 'approved')}
                          disabled={updatingId === w.id}
                          className="px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg transition-all disabled:opacity-40 flex items-center gap-1"
                        >
                          {updatingId === w.id ? (
                            <div className="w-3 h-3 border border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(w.id, 'rejected')}
                          disabled={updatingId === w.id}
                          className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg transition-all disabled:opacity-40 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
