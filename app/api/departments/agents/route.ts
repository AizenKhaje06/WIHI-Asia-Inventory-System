import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/departments/agents
 * Fetch all operations agents (individual accounts)
 * Used by LoginForm to populate agent dropdown
 */
export async function GET() {
  try {
    // Fetch all operations users (agents)
    const { data: agents, error } = await supabase
      .from('users')
      .select('id, username, display_name, assigned_channel')
      .eq('role', 'operations')
      .order('assigned_channel')
      .order('username')

    if (error) {
      console.error("[Agents List] Error:", error)
      return NextResponse.json(
        { error: "Failed to fetch agents" },
        { status: 500 }
      )
    }

    // Map agents with icon paths
    const agentsWithIcons = agents?.map(agent => ({
      id: agent.id,
      username: agent.username,
      displayName: agent.display_name,
      assignedChannel: agent.assigned_channel,
      iconPath: getIconPath(agent.assigned_channel)
    })) || []

    console.log('[Agents List] Returning agents:', agentsWithIcons.length)

    return NextResponse.json({
      success: true,
      agents: agentsWithIcons
    })

  } catch (error) {
    console.error("[Agents List] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    )
  }
}

function getIconPath(channel: string | null): string {
  if (!channel) return '/placeholder.svg'
  
  const channelLower = channel.toLowerCase()
  if (channelLower.includes('facebook')) return '/facebook.png'
  if (channelLower.includes('tiktok')) return '/tiktok.png'
  if (channelLower.includes('lazada')) return '/Lazada.png'
  if (channelLower.includes('shopee')) return '/Shopee.png'
  if (channelLower.includes('physical')) return '/Physical Store.png'
  return '/placeholder.svg'
}
