import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/channels
 * Get list of available sales channels
 * 
 * Requirements: 1.1
 */
export const GET = async (request: NextRequest) => {
  try {
    const channels = [
      { id: 'warehouse-admin', name: 'Warehouse Admin', label: 'Warehouse Admin (Physical Store)' },
      { id: 'tiktok', name: 'TikTok', label: 'TikTok' },
      { id: 'shopee', name: 'Shopee', label: 'Shopee' },
      { id: 'facebook', name: 'Facebook', label: 'Facebook' },
      { id: 'lazada', name: 'Lazada', label: 'Lazada' }
    ]

    return NextResponse.json({
      success: true,
      channels: channels
    }, { status: 200 })

  } catch (error) {
    console.error('[Get Channels] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}
