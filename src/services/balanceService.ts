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
