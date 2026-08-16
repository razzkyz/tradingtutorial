import { supabase } from '../lib/supabase'

export async function getBalances(userId: string) {
  const { data, error } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', userId)
    .order('balance_type')

  if (error) throw error
  return data
}

export function calculateTotalBalance(balances: Array<{ amount: number }>) {
  return balances.reduce((total, balance) => total + balance.amount, 0)
}

export function groupBalancesByCurrency(balances: Array<{ balance_type: string; currency: string; amount: number }>) {
  const grouped: Record<string, Record<string, number>> = {}
  
  balances.forEach(balance => {
    const currency = balance.currency || 'USDT'
    if (!grouped[balance.balance_type]) {
      grouped[balance.balance_type] = {}
    }
    grouped[balance.balance_type][currency] = balance.amount
  })
  
  return grouped
}

export function calculateTotalByCurrency(balances: Array<{ currency: string; amount: number }>) {
  const totals: Record<string, number> = {}
  
  balances.forEach(balance => {
    const currency = balance.currency || 'USDT'
    if (!totals[currency]) {
      totals[currency] = 0
    }
    totals[currency] += balance.amount
  })
  
  return totals
}
