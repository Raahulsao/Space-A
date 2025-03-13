export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string
          username: string
          gender: 'Male' | 'Female'
          branch: string
          email: string
          created_at: string
          last_seen: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          full_name: string
          username: string
          gender: 'Male' | 'Female'
          branch: string
          email: string
          created_at?: string
          last_seen?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          username?: string
          gender?: 'Male' | 'Female'
          branch?: string
          email?: string
          created_at?: string
          last_seen?: string | null
          avatar_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}