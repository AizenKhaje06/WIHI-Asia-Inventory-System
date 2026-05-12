import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Fetch all operations users (departments)
    const { data: departments, error } = await supabase
      .from('users')
      .select('id, username, display_name, assigned_channel')
      .eq('role', 'operations')
      .order('username')

    if (error) {
      console.error("[Departments List] Error:", error)
      return NextResponse.json(
        { error: "Failed to fetch departments" },
        { status: 500 }
      )
    }

    // Map to include icon paths based on assigned_channel
    const departmentsWithIcons = (departments || []).map(dept => ({
      id: dept.id,
      name: dept.username,
      display_name: dept.display_name,
      assigned_channel: dept.assigned_channel,
      icon_path: getIconPath(dept.assigned_channel || dept.username)
    }))

    return NextResponse.json({
      departments: departmentsWithIcons
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
