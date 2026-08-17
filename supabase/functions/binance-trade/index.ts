import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Binance API helper
async function binanceRequest(
  apiKey: string,
  apiSecret: string,
  method: string,
  endpoint: string,
  params: Record<string, any> = {}
) {
  const timestamp = Date.now()
  const queryString = new URLSearchParams({
    ...params,
    timestamp: timestamp.toString(),
  }).toString()

  // Create signature
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(queryString)
  )
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const url = `https://api.binance.com${endpoint}?${queryString}&signature=${signatureHex}`

  const response = await fetch(url, {
    method,
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/json',
    },
  })

  return await response.json()
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user's Binance API keys from database
    const { data: apiKeys, error: keysError } = await supabaseClient
      .from('user_binance_keys')
      .select('api_key, api_secret')
      .eq('user_id', user.id)
      .single()

    if (keysError || !apiKeys) {
      throw new Error('Binance API keys not found. Please add your keys in settings.')
    }

    // Parse request body
    const { action, symbol, side, quantity, type = 'MARKET' } = await req.json()

    let result

    if (action === 'place_order') {
      // Place order on Binance
      result = await binanceRequest(
        apiKeys.api_key,
        apiKeys.api_secret,
        'POST',
        '/api/v3/order',
        {
          symbol: symbol.replace('/', ''), // BTCUSDT
          side, // BUY or SELL
          type, // MARKET or LIMIT
          quantity,
        }
      )

      // Log trade to database
      await supabaseClient.from('trades').insert({
        user_id: user.id,
        symbol,
        side,
        quantity,
        type,
        status: result.status,
        order_id: result.orderId,
        executed_qty: result.executedQty,
        price: result.price || result.fills?.[0]?.price,
      })
    } else if (action === 'get_balance') {
      // Get account balance
      result = await binanceRequest(
        apiKeys.api_key,
        apiKeys.api_secret,
        'GET',
        '/api/v3/account'
      )
    } else if (action === 'get_orders') {
      // Get open orders
      result = await binanceRequest(
        apiKeys.api_key,
        apiKeys.api_secret,
        'GET',
        '/api/v3/openOrders',
        { symbol: symbol?.replace('/', '') }
      )
    } else {
      throw new Error('Invalid action')
    }

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
