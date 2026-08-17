import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Key, Save, Trash2, AlertCircle } from 'lucide-react'
import Toast from '../components/Toast'

export default function Settings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasKeys, setHasKeys] = useState(false)
  const [formData, setFormData] = useState({
    api_key: '',
    api_secret: '',
    testnet: true
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

  useEffect(() => {
    loadApiKeys()
  }, [user?.id])

  const loadApiKeys = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_binance_keys')
        .select('api_key, testnet')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setHasKeys(true)
        setFormData({
          api_key: (data as any).api_key,
          api_secret: '••••••••••••••••', // Masked for security
          testnet: (data as any).testnet
        })
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading API keys:', error)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    if (!formData.api_key || !formData.api_secret) {
      setToast({ message: 'Please enter both API Key and API Secret', type: 'warning' })
      return
    }

    // Don't update if secret is masked
    if (formData.api_secret === '••••••••••••••••') {
      setToast({ message: 'Please enter your API Secret (not masked)', type: 'warning' })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_binance_keys')
        .upsert({
          user_id: user.id,
          api_key: formData.api_key,
          api_secret: formData.api_secret,
          testnet: formData.testnet
        } as any)

      if (error) throw error

      setHasKeys(true)
      setToast({ message: 'Binance API keys saved successfully', type: 'success' })
      
      // Mask secret after save
      setFormData(prev => ({ ...prev, api_secret: '••••••••••••••••' }))
    } catch (error) {
      console.error('Error saving API keys:', error)
      setToast({ message: 'Failed to save API keys', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !hasKeys) return

    if (!confirm('Are you sure you want to delete your Binance API keys? This will disable live trading.')) {
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_binance_keys')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setHasKeys(false)
      setFormData({
        api_key: '',
        api_secret: '',
        testnet: true
      })
      setToast({ message: 'Binance API keys deleted successfully', type: 'success' })
    } catch (error) {
      console.error('Error deleting API keys:', error)
      setToast({ message: 'Failed to delete API keys', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-cyan-200 mb-8">Manage your Binance API keys for live trading</p>

        {/* Binance API Keys Card */}
        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] overflow-hidden hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
          <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 p-6 border-b border-cyan-500/30">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Binance API Keys</h2>
                <p className="text-cyan-200 text-sm mt-1">
                  Connect your Binance account to enable live trading
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Security Warning */}
            <div className="bg-yellow-900/20 border-2 border-yellow-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-100">
                <p className="font-semibold mb-1">Security Notice:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-200">
                  <li>Your API keys are stored securely and never exposed</li>
                  <li>Only enable <strong>Spot & Margin Trading</strong> permission</li>
                  <li><strong>DO NOT</strong> enable Withdrawal permission</li>
                  <li>Use Testnet first before real trading</li>
                </ul>
              </div>
            </div>

            {/* Environment Toggle */}
            <div>
              <label className="block text-text-secondary text-sm mb-2">Environment</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.testnet}
                    onChange={() => setFormData({ ...formData, testnet: true })}
                    className="mr-2"
                  />
                  <span className="text-white">Testnet (Fake Money)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.testnet}
                    onChange={() => setFormData({ ...formData, testnet: false })}
                    className="mr-2"
                  />
                  <span className="text-white">Mainnet (Real Money)</span>
                </label>
              </div>
              {formData.testnet && (
                <p className="text-cyan-300 text-xs mt-2">
                  Get testnet keys at: <a href="https://testnet.binance.vision/" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-200">testnet.binance.vision</a>
                </p>
              )}
              {!formData.testnet && (
                <p className="text-red-300 text-xs mt-2">
                  ⚠️ Real money trading! Be careful and start with small amounts.
                </p>
              )}
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-text-secondary text-sm mb-2">API Key</label>
              <input
                type="text"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="Enter your Binance API Key"
                className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all font-mono text-sm"
                disabled={saving}
              />
            </div>

            {/* API Secret Input */}
            <div>
              <label className="block text-text-secondary text-sm mb-2">API Secret</label>
              <input
                type="password"
                value={formData.api_secret}
                onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                placeholder="Enter your Binance API Secret"
                className="w-full px-4 py-3 bg-deep-navy/50 border border-text-muted/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all font-mono text-sm"
                disabled={saving}
              />
              {hasKeys && formData.api_secret === '••••••••••••••••' && (
                <p className="text-text-muted text-xs mt-2">
                  Leave masked to keep current secret, or enter new secret to update
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving || !formData.api_key}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : hasKeys ? 'Update Keys' : 'Save Keys'}
              </button>

              {hasKeys && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-all border border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>

            {/* How to get API keys */}
            <div className="mt-6 pt-6 border-t border-text-muted/20">
              <h3 className="text-white font-semibold mb-2">How to get Binance API Keys:</h3>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary text-sm">
                <li>Go to <a href="https://www.binance.com/en/my/settings/api-management" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Binance API Management</a></li>
                <li>Create a new API Key</li>
                <li>Enable only <strong>Spot & Margin Trading</strong> permission</li>
                <li>Do NOT enable Withdrawal permission</li>
                <li>Copy API Key and Secret (save it somewhere safe!)</li>
                <li>Paste here and click Save</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
