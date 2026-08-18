import { supabase } from '../lib/supabase'
import type { WithdrawalInput } from '../schemas/withdrawalSchema'
import { deductBalance } from './balanceService'

export async function createWithdrawal(userId: string, data: WithdrawalInput) {
  // Get current time in Indonesia Jakarta timezone
  const now = new Date()
  const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  
  const { data: withdrawal, error } = await supabase
    .from('withdrawals')
    .insert({
      user_id: userId,
      amount: data.amount,
      wallet_address: data.wallet_address,
      network: data.network,
      status: 'pending',
      created_at: jakartaTime.toISOString()
    } as any)
    .select()
    .single()

  if (error) throw error

  // Immediately deduct the balance globally so it is reflected everywhere
  await deductBalance(userId, data.amount)

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
