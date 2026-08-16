import { supabase } from '../lib/supabase'
import type { WithdrawalInput } from '../schemas/withdrawalSchema'

export async function createWithdrawal(userId: string, data: WithdrawalInput) {
  const { data: withdrawal, error } = await supabase
    .from('withdrawals')
    .insert({
      user_id: userId,
      amount: data.amount,
      wallet_address: data.wallet_address,
      network: data.network,
      status: 'pending',
    } as any)
    .select()
    .single()

  if (error) throw error
  return withdrawal
}

export async function getWithdrawals(userId: string) {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
