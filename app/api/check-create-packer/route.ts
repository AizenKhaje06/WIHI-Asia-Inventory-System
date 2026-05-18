import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    const bcrypt = require('bcryptjs')
    
    // First, check if packer1 exists (without .single())
    const { data: existingPackers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', 'packer1')
    
    console.log('[Check Packer] Existing packers:', existingPackers)
    console.log('[Check Packer] Check error:', checkError)
    
    if (checkError) {
      return NextResponse.json({
        success: false,
        error: checkError.message
      }, { status: 500 })
    }
    
    // If multiple packer1 accounts exist, delete all
    if (existingPackers && existingPackers.length > 1) {
      console.log('[Check Packer] Multiple packer1 accounts found, deleting all...')
      const { error: deleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('username', 'packer1')
      
      if (deleteError) {
        return NextResponse.json({
          success: false,
          error: `Failed to delete duplicates: ${deleteError.message}`
        }, { status: 500 })
      }
    }
    
    // If packer1 exists (single), update password
    if (existingPackers && existingPackers.length === 1) {
      console.log('[Check Packer] Single packer1 found, updating password...')
      const hashedPassword = await bcrypt.hash('pack789', 10)
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ password: hashedPassword })
        .eq('username', 'packer1')
      
      if (updateError) {
        return NextResponse.json({
          success: false,
          error: `Failed to update password: ${updateError.message}`
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Packer1 password updated successfully',
        action: 'updated'
      })
    }
    
    // If no packer1 exists, create new one
    console.log('[Check Packer] No packer1 found, creating new account...')
    const hashedPassword = await bcrypt.hash('pack789', 10)
    
    const { data: newPacker, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        username: 'packer1',
        password: hashedPassword,
        role: 'packer',
        display_name: 'Packer 1',
        email: 'packer1@example.com'
      })
      .select()
      .single()
    
    if (insertError) {
      return NextResponse.json({
        success: false,
        error: `Failed to create account: ${insertError.message}`
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Packer1 account created successfully',
      action: 'created',
      account: {
        username: newPacker.username,
        role: newPacker.role,
        displayName: newPacker.display_name
      }
    })
  } catch (error: any) {
    console.error('[Check Packer] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check/create packer account'
    }, { status: 500 })
  }
}
