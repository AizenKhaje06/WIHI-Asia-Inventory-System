import { NextResponse } from 'next/server'

// Simple health check endpoint - no authentication required
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  })
}
