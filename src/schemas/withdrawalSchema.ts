import { z } from 'zod'

export const withdrawalSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .min(1, 'Minimum withdrawal is 1 USDT'),
  wallet_address: z
    .string()
    .min(10, 'Wallet address must be at least 10 characters')
    .max(500, 'Wallet address is too long'),
  network: z
    .string()
    .optional()
    .default('TRC20'),
})

export type WithdrawalInput = z.infer<typeof withdrawalSchema>
