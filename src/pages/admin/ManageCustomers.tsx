import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Search, CheckCircle, XCircle, DollarSign, Edit, Trash2 } from 'lucide-react'
import LoadingState from '../../components/LoadingState'
import Toast from '../../components/Toast'

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
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [balanceType, setBalanceType] = useState('balance_1')
  const [balanceCurrency, setBalanceCurrency] = useState('USDT')
  const [usdtRate, setUsdtRate] = useState(1)
  const [fetchingRate, setFetchingRate] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone_number: '',
    country: '',
    investment_amount: '0'
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

  useEffect(() => {
    checkAdminAndLoadCustomers()
  }, [user?.id, authLoading]) // Only depend on user.id and authLoading

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
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false }) as any

      // Debug: Log error if any
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      }

      if (!profiles) {
        console.warn('No profiles data returned')
        return
      }

      console.log('Fetched profiles:', profiles)

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
      setToast({ message: `Trading status changed to ${newStatus}`, type: 'success' })
    } catch (error) {
      console.error('Error toggling trading status:', error)
      setToast({ message: 'Failed to update trading status', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  const CURRENCIES = [
    { value: 'USDT', label: 'USDT (Tether)', symbol: 'USDT' },
    { value: 'BTC',  label: 'Bitcoin (BTC)', symbol: 'BTCUSDT' },
    { value: 'ETH',  label: 'Ethereum (ETH)', symbol: 'ETHUSDT' },
    { value: 'BNB',  label: 'BNB',            symbol: 'BNBUSDT' },
    { value: 'SOL',  label: 'Solana (SOL)',   symbol: 'SOLUSDT' },
    { value: 'XRP',  label: 'Ripple (XRP)',   symbol: 'XRPUSDT' },
  ]

  const fetchCryptoPrice = async (currency: string) => {
    if (currency === 'USDT') { setUsdtRate(1); return }
    const sym = CURRENCIES.find(c => c.value === currency)?.symbol
    if (!sym) return
    setFetchingRate(true)
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}`)
      const data = await res.json()
      setUsdtRate(parseFloat(data.price) || 1)
    } catch {
      setUsdtRate(1)
    } finally {
      setFetchingRate(false)
    }
  }

  const openBalanceModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setBalanceAmount('')
    setBalanceType('balance_1')
    setBalanceCurrency('USDT')
    setUsdtRate(1)
    setShowBalanceModal(true)
  }

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditForm({
      full_name: customer.full_name,
      phone_number: customer.phone_number || '',
      country: customer.country || '',
      investment_amount: customer.investment_amount.toString()
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDeleteModal(true)
  }

  const handleAddBalance = async () => {
    if (!selectedCustomer || !balanceAmount) return

    setUpdating(true)
    try {
      const rawAmount = parseFloat(balanceAmount)
      if (rawAmount <= 0) {
        setToast({ message: 'Amount must be greater than 0', type: 'warning' })
        setUpdating(false)
        return
      }

      // Convert to USDT
      const usdtAmount = balanceCurrency === 'USDT' ? rawAmount : rawAmount * usdtRate

      // Get current balance
      const { data: currentBalance } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', selectedCustomer.user_id)
        .eq('balance_type', balanceType)
        .single()

      const newAmount = ((currentBalance as any)?.amount || 0) + usdtAmount

      // Update balance
      const result = await (supabase
        .from('balances') as any)
        .update({ amount: newAmount })
        .eq('user_id', selectedCustomer.user_id)
        .eq('balance_type', balanceType)

      if (result.error) throw result.error

      setShowBalanceModal(false)
      await loadCustomers()
      const displayCrypto = balanceCurrency !== 'USDT' ? ` (${rawAmount} ${balanceCurrency} @ $${usdtRate.toLocaleString()})` : ''
      setToast({ message: `Added USDT ${usdtAmount.toFixed(2)}${displayCrypto} to ${selectedCustomer.full_name}`, type: 'success' })
    } catch (error) {
      console.error('Error adding balance:', error)
      setToast({ message: 'Failed to add balance', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  const handleEditCustomer = async () => {
    if (!selectedCustomer) return

    setUpdating(true)
    try {
      const result = await (supabase
        .from('profiles') as any)
        .update({
          full_name: editForm.full_name,
          phone_number: editForm.phone_number || null,
          country: editForm.country || null,
          investment_amount: parseFloat(editForm.investment_amount)
        })
        .eq('user_id', selectedCustomer.user_id)

      if (result.error) throw result.error

      setShowEditModal(false)
      await loadCustomers()
      setToast({ message: `Customer ${editForm.full_name} updated successfully`, type: 'success' })
    } catch (error) {
      console.error('Error updating customer:', error)
      setToast({ message: 'Failed to update customer', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return

    setUpdating(true)
    try {
      // Delete user from auth.users (cascade will delete related data)
      const { error } = await supabase.auth.admin.deleteUser(selectedCustomer.user_id)

      if (error) throw error

      setShowDeleteModal(false)
      await loadCustomers()
      setToast({ message: `Customer ${selectedCustomer.full_name} deleted successfully`, type: 'success' })
    } catch (error) {
      console.error('Error deleting customer:', error)
      setToast({ message: 'Failed to delete customer', type: 'error' })
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
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
            <h1 className="text-3xl font-bold text-white mb-2">Manage Customers</h1>
            <p className="text-cyan-200">View and manage customer accounts</p>
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
        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] overflow-hidden hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 border-b border-cyan-500/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Total Balance
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Trading Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-cyan-300 uppercase tracking-wider">
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
                          <p className="text-white font-medium">{customer.full_name}</p>
                          <p className="text-cyan-200 text-sm">{customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-white">{customer.phone_number || '-'}</p>
                          <p className="text-cyan-200">{customer.country || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-white font-bold text-lg">
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
                          <button
                            onClick={() => openEditModal(customer)}
                            disabled={updating}
                            className="px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                            title="Edit Customer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(customer)}
                            disabled={updating}
                            className="px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-950 border border-gray-800 shadow-2xl rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-1">
                Add Balance
              </h3>
              <p className="text-gray-400 text-sm mb-6">for <span className="text-cyan-400 font-semibold">{selectedCustomer.full_name}</span></p>

              <div className="space-y-4">
                {/* Balance Slot */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Balance Slot</label>
                  <select
                    value={balanceType}
                    onChange={(e) => setBalanceType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all"
                    disabled={updating}
                  >
                    <option value="balance_1">Balance 1</option>
                    <option value="balance_2">Balance 2</option>
                    <option value="balance_3">Balance 3</option>
                    <option value="balance_4">Balance 4</option>
                  </select>
                </div>

                {/* Currency Selector */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Currency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CURRENCIES.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        disabled={updating}
                        onClick={() => { setBalanceCurrency(c.value); fetchCryptoPrice(c.value) }}
                        className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition-all ${
                          balanceCurrency === c.value
                            ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-400'
                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}
                      >
                        {c.value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Amount in {balanceCurrency}</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      placeholder={`0.00 ${balanceCurrency}`}
                      className="w-full px-4 pr-16 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-all"
                      disabled={updating}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">{balanceCurrency}</span>
                  </div>
                </div>

                {/* Conversion Preview */}
                {balanceCurrency !== 'USDT' && (
                  <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl">
                    {fetchingRate ? (
                      <p className="text-gray-500 text-sm text-center">Fetching live price...</p>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Converts to USDT:</span>
                        <span className="text-emerald-400 font-bold text-lg">
                          ≈ {balanceAmount ? (parseFloat(balanceAmount || '0') * usdtRate).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0.00'} USDT
                        </span>
                      </div>
                    )}
                    <p className="text-gray-600 text-xs mt-1">1 {balanceCurrency} = ${usdtRate.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT (live)</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowBalanceModal(false)}
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-transparent border-2 border-gray-700 hover:border-gray-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBalance}
                    disabled={updating || !balanceAmount || fetchingRate}
                    className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Adding...' : 'Add Balance'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/95 border-2 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.6)] rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Edit Customer: {selectedCustomer.full_name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    disabled={updating}
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                    className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    disabled={updating}
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    disabled={updating}
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">Investment Amount (USDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.investment_amount}
                    onChange={(e) => setEditForm({ ...editForm, investment_amount: e.target.value })}
                    className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    disabled={updating}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-text-muted/20 hover:bg-text-muted/30 text-text-primary font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditCustomer}
                    disabled={updating || !editForm.full_name}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Customer Modal */}
        {showDeleteModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/95 border-2 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.6)] rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4">
                Delete Customer?
              </h3>

              <p className="text-white mb-2">
                Are you sure you want to delete <strong>{selectedCustomer.full_name}</strong>?
              </p>
              <p className="text-text-secondary text-sm mb-6">
                This will permanently delete:
              </p>
              <ul className="text-text-secondary text-sm mb-6 space-y-1 list-disc list-inside">
                <li>User account and profile</li>
                <li>All balances (USDT {selectedCustomer.total_balance.toFixed(2)})</li>
                <li>Trading access records</li>
                <li>Withdrawal history</li>
              </ul>
              <p className="text-red-400 text-sm font-semibold mb-6">
                ⚠️ This action cannot be undone!
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={updating}
                  className="flex-1 px-4 py-3 bg-text-muted/20 hover:bg-text-muted/30 text-text-primary font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCustomer}
                  disabled={updating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
