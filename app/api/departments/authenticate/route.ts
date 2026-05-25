import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyPassword } from "@/lib/password-hash"

export async function POST(request: Request) {
  try {
    const { department, password } = await request.json()

    console.log('[Department Auth] Request:', { department, passwordLength: password?.length })

    if (!department || !password) {
      return NextResponse.json(
        { error: "Department and password are required" },
        { status: 400 }
      )
    }

    // First, try exact username match
    const { data: exactUser, error: exactError } = await supabase
      .from('users')
      .select('*')
      .eq('username', department)
      .eq('role', 'operations')
      .single()

    console.log('[Department Auth] Exact match query:', { 
      found: !!exactUser, 
      error: exactError?.message,
      username: exactUser?.username
    })

    // If exact match found, verify password with bcrypt
    if (exactUser) {
      const passwordMatch = await verifyPassword(password, exactUser.password)
      if (passwordMatch) {
        console.log('[Department Auth] Exact match successful')
        return NextResponse.json({
          success: true,
          department: {
            id: exactUser.id,
            name: exactUser.username,
            display_name: exactUser.display_name,
            assigned_channel: exactUser.assigned_channel
          }
        })
      }
    }

    // Search for agents in that department by assigned_channel
    console.log('[Department Auth] Searching for agents in department:', department)
    
    const { data: agents, error: agentsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'operations')
      .eq('assigned_channel', department)

    console.log('[Department Auth] Agents found:', { 
      count: agents?.length,
      error: agentsError?.message,
      agents: agents?.map(a => ({ username: a.username, hasPassword: !!a.password }))
    })

    if (agentsError || !agents || agents.length === 0) {
      console.log('[Department Auth] No agents found in department')
      return NextResponse.json(
        { error: "Invalid department or password" },
        { status: 401 }
      )
    }

    // Find agent with matching password using bcrypt
    let matchingAgent = null
    for (const agent of agents) {
      const passwordMatch = await verifyPassword(password, agent.password)
      if (passwordMatch) {
        matchingAgent = agent
        break
      }
    }

    console.log('[Department Auth] Password match search:', {
      foundMatch: !!matchingAgent,
      matchedAgent: matchingAgent?.username
    })

    if (!matchingAgent) {
      console.log('[Department Auth] No agent with matching password')
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    // Authentication successful
    console.log('[Department Auth] Authentication successful:', matchingAgent.username)
    
    return NextResponse.json({
      success: true,
      department: {
        id: matchingAgent.id,
        name: matchingAgent.username,
        display_name: matchingAgent.display_name,
        assigned_channel: matchingAgent.assigned_channel
      }
    })

  } catch (error) {
    console.error("[Department Auth] Error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}
