export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      quiz_results: {
        Row: {
          answers: Json | null
          created_at: string
          id: string
          level: string
          score: number
          total: number
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          id?: string
          level: string
          score: number
          total: number
        }
        Update: {
          answers?: Json | null
          created_at?: string
          id?: string
          level?: string
          score?: number
          total?: number
        }
        Relationships: []
      }
      report_submissions: {
        Row: {
          contact: string
          created_at: string
          description: string
          evidence_path: string | null
          id: string
          name: string
        }
        Insert: {
          contact: string
          created_at?: string
          description: string
          evidence_path?: string | null
          id?: string
          name: string
        }
        Update: {
          contact?: string
          created_at?: string
          description?: string
          evidence_path?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          contact_info: string
          created_at: string
          description: string
          evidence_url: string | null
          full_name: string
          id: string
        }
        Insert: {
          contact_info: string
          created_at?: string
          description: string
          evidence_url?: string | null
          full_name: string
          id?: string
        }
        Update: {
          contact_info?: string
          created_at?: string
          description?: string
          evidence_url?: string | null
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          name: string
          rating: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          name: string
          rating: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          name?: string
          rating?: number
        }
        Relationships: []
      }
      threat_regions: {
        Row: {
          area: string
          code: string
          latitude: number | null
          longitude: number | null
          name: string
          sort_order: number
        }
        Insert: {
          area: string
          code: string
          latitude?: number | null
          longitude?: number | null
          name: string
          sort_order?: number
        }
        Update: {
          area?: string
          code?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      threat_reports: {
        Row: {
          category: string
          channel: string
          created_at: string
          danger_score: number | null
          danger_total: number
          description: string
          id: string
          is_hidden: boolean
          region_code: string
          title: string
          vote_count: number
        }
        Insert: {
          category: string
          channel: string
          created_at?: string
          danger_score?: never
          danger_total?: number
          description: string
          id?: string
          is_hidden?: boolean
          region_code: string
          title: string
          vote_count?: number
        }
        Update: {
          category?: string
          channel?: string
          created_at?: string
          danger_score?: never
          danger_total?: number
          description?: string
          id?: string
          is_hidden?: boolean
          region_code?: string
          title?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "threat_reports_region_code_fkey"
            columns: ["region_code"]
            isOneToOne: false
            referencedRelation: "threat_regions"
            referencedColumns: ["code"]
          },
        ]
      }
      threat_votes: {
        Row: {
          created_at: string
          danger_score: number
          id: string
          is_reporter: boolean
          threat_id: string
          voter_token: string
        }
        Insert: {
          created_at?: string
          danger_score: number
          id?: string
          is_reporter?: boolean
          threat_id: string
          voter_token: string
        }
        Update: {
          created_at?: string
          danger_score?: number
          id?: string
          is_reporter?: boolean
          threat_id?: string
          voter_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "threat_votes_threat_id_fkey"
            columns: ["threat_id"]
            isOneToOne: false
            referencedRelation: "threat_reports"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      review_stats: {
        Row: {
          average: number | null
          last_review_at: string | null
          star_1: number | null
          star_2: number | null
          star_3: number | null
          star_4: number | null
          star_5: number | null
          total: number | null
        }
        Relationships: []
      }
      threat_category_stats: {
        Row: {
          avg_danger: number | null
          category: string | null
          last_reported_at: string | null
          report_count: number | null
          reports_last_7d: number | null
        }
        Relationships: []
      }
      threat_region_stats: {
        Row: {
          area: string | null
          avg_danger: number | null
          last_reported_at: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          region_code: string | null
          report_count: number | null
          reports_last_7d: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      contains_personal_info: { Args: { p_text: string }; Returns: boolean }
      submit_threat_report: {
        Args: {
          p_category: string
          p_channel: string
          p_danger_score: number
          p_description: string
          p_region_code: string
          p_title: string
          p_voter_token: string
        }
        Returns: string
      }
      vote_threat: {
        Args: {
          p_danger_score: number
          p_threat_id: string
          p_voter_token: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
