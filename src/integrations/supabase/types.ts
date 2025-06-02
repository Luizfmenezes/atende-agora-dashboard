export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      atendimentos: {
        Row: {
          atendido: boolean
          atendido_em: string | null
          cargo: string
          horario: string
          id: number
          matricula: string
          motivo: string
          nome: string
          setor_id: number
          usuario_id: number | null
        }
        Insert: {
          atendido?: boolean
          atendido_em?: string | null
          cargo: string
          horario?: string
          id?: number
          matricula: string
          motivo: string
          nome: string
          setor_id: number
          usuario_id?: number | null
        }
        Update: {
          atendido?: boolean
          atendido_em?: string | null
          cargo?: string
          horario?: string
          id?: number
          matricula?: string
          motivo?: string
          nome?: string
          setor_id?: number
          usuario_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          cargo: string
          id: number
          matricula: string
          nome: string
        }
        Insert: {
          cargo: string
          id?: number
          matricula: string
          nome: string
        }
        Update: {
          cargo?: string
          id?: number
          matricula?: string
          nome?: string
        }
        Relationships: []
      }
      permissoes: {
        Row: {
          can_create: boolean
          delete: boolean
          edit: boolean
          usuario_id: number
          view: boolean
        }
        Insert: {
          can_create?: boolean
          delete?: boolean
          edit?: boolean
          usuario_id: number
          view?: boolean
        }
        Update: {
          can_create?: boolean
          delete?: boolean
          edit?: boolean
          usuario_id?: number
          view?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          codigo: number
          id: number
          nome: string
        }
        Insert: {
          codigo: number
          id?: number
          nome: string
        }
        Update: {
          codigo?: number
          id?: number
          nome?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string | null
          id: number
          password: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          password: string
          role: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: number
          password?: string
          role?: string
          username?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
