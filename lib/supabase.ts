import { createClient } from '@supabase/supabase-js'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create Supabase client for client-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false, // We're using localStorage auth for now
    },
  }
)

// Create Supabase client for server-side operations (with service role)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Database types (matching your Supabase schema)
export interface Database {
  public: {
    Tables: {
      inventory: {
        Row: {
          id: string
          name: string
          category: string
          quantity: number
          total_cogs: number
          cost_price: number
          selling_price: number
          reorder_level: number
          storage_room: string
          last_updated: string
        }
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'last_updated'>
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          item_id: string
          item_name: string
          quantity: number
          cost_price: number
          selling_price: number
          total_cost: number
          profit: number
          timestamp: string
          department: string
          staff_name: string
          notes: string
          transaction_type: 'sale' | 'demo' | 'internal' | 'transfer'
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'timestamp'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      logs: {
        Row: {
          id: string
          operation: string
          item_id: string
          item_name: string
          details: string
          timestamp: string
        }
        Insert: Omit<Database['public']['Tables']['logs']['Row'], 'id' | 'timestamp'>
        Update: Partial<Database['public']['Tables']['logs']['Insert']>
      }
      restocks: {
        Row: {
          id: string
          item_id: string
          item_name: string
          quantity: number
          cost_price: number
          total_cost: number
          timestamp: string
          reason: string
        }
        Insert: Omit<Database['public']['Tables']['restocks']['Row'], 'id' | 'timestamp'>
        Update: Partial<Database['public']['Tables']['restocks']['Insert']>
      }
      storage_rooms: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['storage_rooms']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['storage_rooms']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      users: {
        Row: {
          id: string
          username: string
          password: string
          role: 'admin' | 'operations'
          display_name: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
    }
  }
}
