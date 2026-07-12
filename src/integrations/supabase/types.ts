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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          candidate_id: string
          cover_note: string | null
          created_at: string
          id: string
          job_id: string
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          challenge_id: string | null
          created_at: string
          description: string | null
          id: string
          owner_id: string
          role: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          owner_id: string
          role?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          challenge_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          role?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_attempts: {
        Row: {
          candidate_id: string
          challenge_id: string
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          challenge_id: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          challenge_id?: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_attempts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          context: string | null
          created_at: string
          deliverables: string | null
          difficulty: string | null
          duration_hours: number | null
          evaluation_criteria: string | null
          evidence_dimensions: string[] | null
          id: string
          industry: string | null
          owner_id: string
          role: string | null
          status: string
          task: string | null
          title: string
          updated_at: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          deliverables?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          evaluation_criteria?: string | null
          evidence_dimensions?: string[] | null
          id?: string
          industry?: string | null
          owner_id: string
          role?: string | null
          status?: string
          task?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          context?: string | null
          created_at?: string
          deliverables?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          evaluation_criteria?: string | null
          evidence_dimensions?: string[] | null
          id?: string
          industry?: string | null
          owner_id?: string
          role?: string | null
          status?: string
          task?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          company: string
          created_at: string
          email: string
          first_name: string
          hires_per_year: string | null
          id: string
          last_name: string
          message: string | null
          team_size: string | null
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          first_name: string
          hires_per_year?: string | null
          id?: string
          last_name: string
          message?: string | null
          team_size?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          first_name?: string
          hires_per_year?: string | null
          id?: string
          last_name?: string
          message?: string | null
          team_size?: string | null
        }
        Relationships: []
      }
      email_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          payload: Json
          status: string
          subject: string
          template: string
          to_addr: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          status?: string
          subject: string
          template: string
          to_addr: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          status?: string
          subject?: string
          template?: string
          to_addr?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          owner_id: string
          remote: boolean
          requirements: string | null
          salary_range: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          owner_id: string
          remote?: boolean
          requirements?: string | null
          salary_range?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          owner_id?: string
          remote?: boolean
          requirements?: string | null
          salary_range?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partnership_requests: {
        Row: {
          contact_name: string
          country: string | null
          created_at: string
          email: string
          id: string
          kind: string
          message: string | null
          organization: string
          role_title: string | null
          status: string
          students_or_hires: string | null
          updated_at: string
        }
        Insert: {
          contact_name: string
          country?: string | null
          created_at?: string
          email: string
          id?: string
          kind: string
          message?: string | null
          organization: string
          role_title?: string | null
          status?: string
          students_or_hires?: string | null
          updated_at?: string
        }
        Update: {
          contact_name?: string
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          kind?: string
          message?: string | null
          organization?: string
          role_title?: string | null
          status?: string
          students_or_hires?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability: string | null
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          completion_pct: number
          created_at: string
          education: Json
          email: string
          experience: Json
          full_name: string | null
          headline: string | null
          id: string
          is_public: boolean
          links: Json
          location: string | null
          preferred_roles: string[]
          role: Database["public"]["Enums"]["app_role"]
          skills: string[]
          updated_at: string
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          completion_pct?: number
          created_at?: string
          education?: Json
          email: string
          experience?: Json
          full_name?: string | null
          headline?: string | null
          id: string
          is_public?: boolean
          links?: Json
          location?: string | null
          preferred_roles?: string[]
          role?: Database["public"]["Enums"]["app_role"]
          skills?: string[]
          updated_at?: string
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          completion_pct?: number
          created_at?: string
          education?: Json
          email?: string
          experience?: Json
          full_name?: string | null
          headline?: string | null
          id?: string
          is_public?: boolean
          links?: Json
          location?: string | null
          preferred_roles?: string[]
          role?: Database["public"]["Enums"]["app_role"]
          skills?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          campaign_id: string | null
          candidate_id: string
          challenge_id: string
          content: string | null
          created_at: string
          feedback: string | null
          file_url: string | null
          id: string
          score: number | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          candidate_id: string
          challenge_id: string
          content?: string | null
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          id?: string
          score?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          candidate_id?: string
          challenge_id?: string
          content?: string | null
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          id?: string
          score?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "candidate" | "company" | "university"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "candidate", "company", "university"],
    },
  },
} as const
