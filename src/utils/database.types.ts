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
      tickets: {
        Row: {
          id: string
          title: string
          description: string
          status: 'pending' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: 'pending' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'pending' | 'completed'
          created_at?: string
        }
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          content?: string
          created_at?: string
        }
      }
      admin_notes: {
        Row: {
          id: string
          title: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_at?: string
        }
      }
      useful_links: {
        Row: {
          id: string
          title: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          created_at?: string
        }
      }
      faq_items: {
        Row: {
          id: string
          question: string
          answer: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          order?: number
          created_at?: string
        }
      }
      printers: {
        Row: {
          id: string
          model: string
          location: string
          toner_model: string
          cartridge_model: string
          last_toner_change: string
          created_at: string
        }
        Insert: {
          id?: string
          model: string
          location: string
          toner_model: string
          cartridge_model: string
          last_toner_change?: string
          created_at?: string
        }
        Update: {
          id?: string
          model?: string
          location?: string
          toner_model?: string
          cartridge_model?: string
          last_toner_change?: string
          created_at?: string
        }
      }
    }
  }
}