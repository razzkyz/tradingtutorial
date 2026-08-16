import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Search, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import LoadingState from '../../components/LoadingState'

interface Customer {
  user_id: string
  full_name: string
  email: string
  phone_number: string | null
  country: string | null
  investment_amount: number
  total_balance: number
  trading_status: string
  created_at: string
}

export default function ManageCustomers() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [balanceType, setBalanceType] = useState('balance_1')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    checkAdminAndLoadCustomers()
  }, [user, authLoading])

  const checkAdminAndLoadCustomers = async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    // If no user after auth loaded, redirect to login
    if (!user) {
      navigate('/login')
      return
    }

    try {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single() as any

      if (profile?.role !== 'admin') {
        navigate('/dashboard')
        return
      }

      await loadCustomers()
    } catch (error) {
      console.error('Error checking admin:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      // Get all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false }) as any

      if (!profiles) return

      // Get balances and trading status for each user
      const customersData = await Promise.all(
        profiles.map(async (profile: any) => {
          const [balances, tradingAccess] = await Promise.all([
            supabase
              .from('balances')
              .select('amount')
              .eq('user_id', profile.user_id),
            supabase
              .from('trading_access')
              .select('status')
              .eq('user_id', profile.user_id)
              .single(),
          ])

          const totalBalance = balances.data?.reduce((sum: number, b: any) => sum + b.amount, 0) || 0
          const tradingStatus = (tradingAccess.data as any)?.status || 'inactive'

          return {
            user_id: profile.user_id,
            full_name: profile.full_name,
            email: profile.email,
            phone_number: profile.phone_number,
            country: profile.country,
            investment_amount: profile.investment_amount,
            total_balance: totalBalance,
            trading_status: tradingStatus,
            created_at: profile.created_at,
          }
        })
      )

      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const toggleTradingStatus = async (customer: Customer) => {
    setUpdating(true)
    try {
      const newStatus = customer.trading_status === 'active' ? 'inactive' : 'active'

      const result = await (supabase
        .from('trading_access') as any)
        .update({ status: newStatus })
        .eq('user_id', customer.user_id)

      if (result.error) throw result.error

      // Reload customers
      await loadCustomers()
      alert(`Trading status changed to ${newStatus} for ${customer.full_name}`)
    } catch (error) {
      console.error('Error toggling trading status:', error)
      alert('Failed to update trading status')
    } finally {
      setUpdating(false)
    }
  }

  const openBalanceModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setBalanceAmount('')
    setBalanceType('balance_1')
    setShowBalanceModal(true)
  }

  const handleAddBalance = async () => {
    if (!selectedCustomer || !balanceAmount) return

    setUpdating(true)
    try {
      const amount = parseFloat(balanceAmount)
      if (amount <= 0) {
        alert('Amount must be greater than 0')
        return
      }

      // Get current balance
      const { data: currentBalance } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', selectedCustomer.user_id)
        .eq('balance_type', balanceType)
        .single()

      const newAmount = (currentBalance as any)?.amount + amount || amount

      // Update balance
      const result = await (supabase
        .from('balances') as any)
        .update({ amount: newAmount })
        .eq('user_id', selectedCustomer.user_id)
        .eq('balance_type', balanceType)

      if (result.error) throw result.error

      setShowBalanceModal(false)
      await loadCustomers()
      alert(`Added ${amount} USDT to ${balanceType} for ${selectedCustomer.full_name}`)
    } catch (error) {
      console.error('Error adding balance:', error)
      alert('Failed to add balance')
    } finally {
      setUpdating(false)
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || loading) return <LoadingState />

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Admin Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Manage Customers</h1>
            <p className="text-text-secondary">View and manage customer accounts</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="pl-10 pr-4 py-2 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all w-full sm:w-64"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-gradient-to-br from-deep-navy/95 to-dark-teal/95 rounded-2xl border border-cyan/20 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-card-gradient border-b border-cyan/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Total Balance
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Trading Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-text-muted/10">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">
                      {searchQuery ? 'No customers found' : 'No customers yet'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.user_id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-text-primary font-medium">{customer.full_name}</p>
                          <p className="text-text-secondary text-sm">{customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-text-primary">{customer.phone_number || '-'}</p>
                          <p className="text-text-secondary">{customer.country || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-text-primary font-bold text-lg">
                          USDT {customer.total_balance.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            customer.trading_status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {customer.trading_status === 'active' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {customer.trading_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleTradingStatus(customer)}
                            disabled={updating}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                              customer.trading_status === 'active'
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                            title={customer.trading_status === 'active' ? 'Deactivate Trading' : 'Activate Trading'}
                          >
                            {customer.trading_status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => openBalanceModal(customer)}
                            disabled={updating}
                            className="px-3 py-2 bg-cyan/20 text-cyan hover:bg-cyan/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                            title="Add Balance"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Balance Modal */}
        {showBalanceModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-deep-navy to-dark-teal rounded-2xl border border-cyan/30 shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Add Balance for {selectedCustomer.full_name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Balance Type</label>
                  <select
                    value={balanceType}
                    onChange={(e) => setBalanceType(e.target.value)}
                    className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
                    disabled={updating}
                  >
                    <option value="balance_1">Balance 1</option>
                    <option value="balance_2">Balance 2</option>
                    <option value="balance_3">Balance 3</option>
                    <option value="balance_4">Balance 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">Amount (USDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
                    disabled={updating}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowBalanceModal(false)}
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-text-muted/20 hover:bg-text-muted/30 text-text-primary font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBalance}
                    disabled={updating || !balanceAmount}
                    className="flex-1 px-4 py-3 bg-button-gradient hover:opacity-90 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Adding...' : 'Add Balance'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
