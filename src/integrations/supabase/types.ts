export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string | null
          id: string
          pet_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          pet_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          pet_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          emergency_contact: string | null
          id: string
          pet_caretaker: string | null
          pet_id: string
          second_emergency_contact: string | null
          updated_at: string
          vet_contact: string | null
        }
        Insert: {
          created_at?: string
          emergency_contact?: string | null
          id?: string
          pet_caretaker?: string | null
          pet_id: string
          second_emergency_contact?: string | null
          updated_at?: string
          vet_contact?: string | null
        }
        Update: {
          created_at?: string
          emergency_contact?: string | null
          id?: string
          pet_caretaker?: string | null
          pet_id?: string
          second_emergency_contact?: string | null
          updated_at?: string
          vet_contact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_url: string
          id: string
          name: string
          pet_id: string
          size: string | null
          type: string
          upload_date: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          name: string
          pet_id: string
          size?: string | null
          type: string
          upload_date: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          name?: string
          pet_id?: string
          size?: string | null
          type?: string
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          activity: string
          contact: string | null
          created_at: string
          description: string | null
          id: string
          pet_id: string
        }
        Insert: {
          activity: string
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          pet_id: string
        }
        Update: {
          activity?: string
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          pet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          pet_id: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          pet_id: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          pet_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      medical: {
        Row: {
          created_at: string
          id: string
          last_vaccination: string | null
          medical_alert: boolean
          medical_conditions: string | null
          medical_emergency_document: string | null
          medications: string[] | null
          pet_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_vaccination?: string | null
          medical_alert?: boolean
          medical_conditions?: string | null
          medical_emergency_document?: string | null
          medications?: string[] | null
          pet_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_vaccination?: string | null
          medical_alert?: boolean
          medical_conditions?: string | null
          medical_emergency_document?: string | null
          medications?: string[] | null
          pet_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_photos: {
        Row: {
          created_at: string
          full_body_photo_url: string | null
          id: string
          pet_id: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_body_photo_url?: string | null
          id?: string
          pet_id: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_body_photo_url?: string | null
          id?: string
          pet_id?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_photos_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age: string | null
          bio: string | null
          breed: string | null
          created_at: string
          id: string
          microchip_id: string | null
          name: string
          notes: string | null
          pet_pass_id: string | null
          species: string | null
          updated_at: string
          user_id: string
          weight: string | null
        }
        Insert: {
          age?: string | null
          bio?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          microchip_id?: string | null
          name: string
          notes?: string | null
          pet_pass_id?: string | null
          species?: string | null
          updated_at?: string
          user_id: string
          weight?: string | null
        }
        Update: {
          age?: string | null
          bio?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          microchip_id?: string | null
          name?: string
          notes?: string | null
          pet_pass_id?: string | null
          species?: string | null
          updated_at?: string
          user_id?: string
          weight?: string | null
        }
        Relationships: []
      }
      professional_data: {
        Row: {
          badges: string[] | null
          created_at: string
          id: string
          pet_id: string
          support_animal_status: string | null
          updated_at: string
        }
        Insert: {
          badges?: string[] | null
          created_at?: string
          id?: string
          pet_id: string
          support_animal_status?: string | null
          updated_at?: string
        }
        Update: {
          badges?: string[] | null
          created_at?: string
          id?: string
          pet_id?: string
          support_animal_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_data_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          date: string | null
          id: string
          location: string | null
          pet_id: string
          rating: number
          reviewer_contact: string | null
          reviewer_name: string
          text: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          location?: string | null
          pet_id: string
          rating: number
          reviewer_contact?: string | null
          reviewer_name: string
          text?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          location?: string | null
          pet_id?: string
          rating?: number
          reviewer_contact?: string | null
          reviewer_name?: string
          text?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      training: {
        Row: {
          completed: string | null
          course: string
          created_at: string
          facility: string | null
          id: string
          pet_id: string
          phone: string | null
        }
        Insert: {
          completed?: string | null
          course: string
          created_at?: string
          facility?: string | null
          id?: string
          pet_id: string
          phone?: string | null
        }
        Update: {
          completed?: string | null
          course?: string
          created_at?: string
          facility?: string | null
          id?: string
          pet_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_locations: {
        Row: {
          code: string | null
          created_at: string
          date_visited: string | null
          id: string
          name: string
          notes: string | null
          pet_id: string
          photo_url: string | null
          type: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          date_visited?: string | null
          id?: string
          name: string
          notes?: string | null
          pet_id: string
          photo_url?: string | null
          type: string
        }
        Update: {
          code?: string | null
          created_at?: string
          date_visited?: string | null
          id?: string
          name?: string
          notes?: string | null
          pet_id?: string
          photo_url?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_locations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_document_upload: {
        Args: {
          _pet_id: string
          _name: string
          _type: string
          _file_url: string
          _size?: string
        }
        Returns: string
      }
      handle_gallery_photo_upload: {
        Args: { _pet_id: string; _url: string; _caption?: string }
        Returns: string
      }
      handle_photo_upload: {
        Args: {
          _pet_id: string
          _photo_url?: string
          _full_body_photo_url?: string
        }
        Returns: string
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
    Enums: {},
  },
} as const
