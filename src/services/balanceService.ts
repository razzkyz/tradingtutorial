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

export async function deductBalance(userId: string, amountToDeduct: number) {
  // Get all user balances ordered by created_at or balance_type so it's consistent
  const { data: balances, error } = await (supabase
    .from('balances')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true }) as any)

  if (error) throw error
  if (!balances || balances.length === 0) throw new Error('No balances found')

  let remainingToDeduct = amountToDeduct

  for (const balance of balances as Array<{ id: string; amount: number }>) {
    if (remainingToDeduct <= 0) break

    const deductAmount = Math.min(balance.amount, remainingToDeduct)
    const newAmount = balance.amount - deductAmount

    const { error: updateError } = await (supabase.from('balances') as any)
      .update({ amount: newAmount })
      .eq('id', balance.id)

    if (updateError) throw updateError

    remainingToDeduct -= deductAmount
  }

  if (remainingToDeduct > 0) {
    throw new Error('Insufficient total balance')
  }

  return true
}
