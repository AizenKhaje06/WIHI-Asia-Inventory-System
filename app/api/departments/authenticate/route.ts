import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

    // NEW: Search for any agent in the department with matching password
    // This allows multiple agents per department with their own passwords
    
    // First, try exact username match (for main accounts like "Facebook", "TikTok")
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

    // If exact match found and password matches, use it
    if (exactUser && exactUser.password === password) {
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

    // If no exact match or password doesn't match, search for agents in that department
    // Format: "Department-AgentName" where assigned_channel = Department
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

    // Find agent with matching password
    const matchingAgent = agents.find(agent => agent.password === password)

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
    console.log('[Department Auth] Returning data:', {
      id: matchingAgent.id,
      name: matchingAgent.username,
      display_name: matchingAgent.display_name,
      assigned_channel: matchingAgent.assigned_channel
    })
    
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
