import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  console.log('=== TEST STATUS API ===')
  console.log('Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('Using key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON')
  
  // Test 1: Get specific cancelled transaction
  const { data: data1, error: error1 } = await supabaseAdmin
    .from('transactions')
    .select('id, item_name, status, cancellation_reason, cancelled_by')
    .eq('id', 'TXN-1771559485886')
    .single()

  console.log('Test 1 - Specific transaction:')
  console.log(JSON.stringify(data1, null, 2))

  // Test 2: Get all cancelled transactions
  const { data: data2, error: error2 } = await supabaseAdmin
    .from('transactions')
    .select('id, item_name, status')
    .eq('status', 'cancelled')

  console.log('Test 2 - All cancelled transactions:')
  console.log(JSON.stringify(data2, null, 2))

  // Test 3: Get first 5 transactions
  const { data: data3, error: error3 } = await supabaseAdmin
    .from('transactions')
    .select('id, item_name, status')
    .limit(5)

  console.log('Test 3 - First 5 transactions:')
  console.log(JSON.stringify(data3, null, 2))

  return NextResponse.json({
    test1: { data: data1, error: error1 },
    test2: { data: data2, error: error2, count: data2?.length },
    test3: { data: data3, error: error3 },
    usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  })
}
