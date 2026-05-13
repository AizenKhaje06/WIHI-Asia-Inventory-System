import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Fetch all operations users (departments and agents)
    const { data: allUsers, error } = await supabase
      .from('users')
      .select('id, username, display_name, assigned_channel')
      .eq('role', 'operations')
      .order('assigned_channel')

    if (error) {
      console.error("[Departments List] Error:", error)
      return NextResponse.json(
        { error: "Failed to fetch departments" },
        { status: 500 }
      )
    }

    // Group by assigned_channel to get unique departments only
    // This ensures we only show department names, not individual agents
    const uniqueDepartments = new Map<string, any>()
    
    allUsers?.forEach(user => {
      const channel = user.assigned_channel
      if (channel && !uniqueDepartments.has(channel)) {
        // Use the first user of each department as the representative
        uniqueDepartments.set(channel, {
          id: user.id,
          name: channel, // Use channel name as the department name
          display_name: channel, // Display the channel name
          assigned_channel: channel,
          icon_path: getIconPath(channel)
        })
      }
    })

    const departments = Array.from(uniqueDepartments.values())

    console.log('[Departments List] Returning unique departments:', departments.map(d => d.name))

    return NextResponse.json({
      departments
    })

  } catch (error) {
    console.error("[Departments List] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    )
  }
}

function getIconPath(channel: string): string {
  const channelLower = channel.toLowerCase()
  if (channelLower.includes('facebook')) return '/facebook.png'
  if (channelLower.includes('tiktok')) return '/tiktok.png'
  if (channelLower.includes('lazada')) return '/Lazada.png'
  if (channelLower.includes('shopee')) return '/Shopee.png'
  if (channelLower.includes('physical')) return '/Physical Store.png'
  return '/placeholder.svg'
}
