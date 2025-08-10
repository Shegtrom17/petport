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
      care_instructions: {
        Row: {
          allergies: string | null
          behavioral_notes: string | null
          created_at: string
          evening_routine: string | null
          favorite_activities: string | null
          feeding_schedule: string | null
          id: string
          morning_routine: string | null
          pet_id: string
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          behavioral_notes?: string | null
          created_at?: string
          evening_routine?: string | null
          favorite_activities?: string | null
          feeding_schedule?: string | null
          id?: string
          morning_routine?: string | null
          pet_id: string
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          behavioral_notes?: string | null
          created_at?: string
          evening_routine?: string | null
          favorite_activities?: string | null
          feeding_schedule?: string | null
          id?: string
          morning_routine?: string | null
          pet_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_instructions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          certification_number: string | null
          created_at: string
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          notes: string | null
          pet_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          certification_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          notes?: string | null
          pet_id: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          certification_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          notes?: string | null
          pet_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
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
            isOneToOne: true
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
      issues: {
        Row: {
          browser_info: Json | null
          created_at: string
          current_page: string | null
          description: string
          email: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          browser_info?: Json | null
          created_at?: string
          current_page?: string | null
          description: string
          email: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          browser_info?: Json | null
          created_at?: string
          current_page?: string | null
          description?: string
          email?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lost_pet_data: {
        Row: {
          contact_priority: string | null
          created_at: string
          distinctive_features: string | null
          emergency_notes: string | null
          finder_instructions: string | null
          id: string
          is_missing: boolean
          last_seen_date: string | null
          last_seen_location: string | null
          last_seen_time: string | null
          pet_id: string
          reward_amount: string | null
          updated_at: string
        }
        Insert: {
          contact_priority?: string | null
          created_at?: string
          distinctive_features?: string | null
          emergency_notes?: string | null
          finder_instructions?: string | null
          id?: string
          is_missing?: boolean
          last_seen_date?: string | null
          last_seen_location?: string | null
          last_seen_time?: string | null
          pet_id: string
          reward_amount?: string | null
          updated_at?: string
        }
        Update: {
          contact_priority?: string | null
          created_at?: string
          distinctive_features?: string | null
          emergency_notes?: string | null
          finder_instructions?: string | null
          id?: string
          is_missing?: boolean
          last_seen_date?: string | null
          last_seen_location?: string | null
          last_seen_time?: string | null
          pet_id?: string
          reward_amount?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      map_pins: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number
          longitude: number
          pet_id: string
          title: string | null
          travel_location_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          pet_id: string
          title?: string | null
          travel_location_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          pet_id?: string
          title?: string | null
          travel_location_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "map_pins_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_pins_travel_location_id_fkey"
            columns: ["travel_location_id"]
            isOneToOne: false
            referencedRelation: "travel_locations"
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
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          product_type: string | null
          quantity: number | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          product_type?: string | null
          quantity?: number | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          product_type?: string | null
          quantity?: number | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_verified: boolean
          name: string
          owner_id: string
          phone: string | null
          type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean
          name: string
          owner_id: string
          phone?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean
          name?: string
          owner_id?: string
          phone?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
          adoption_instructions: string | null
          adoption_status: string | null
          age: string | null
          bio: string | null
          breed: string | null
          county: string | null
          created_at: string
          custom_logo_url: string | null
          id: string
          is_public: boolean
          microchip_id: string | null
          name: string
          notes: string | null
          organization_email: string | null
          organization_name: string | null
          organization_phone: string | null
          organization_website: string | null
          petport_id: string | null
          sex: string | null
          species: string | null
          state: string | null
          updated_at: string
          user_id: string
          weight: string | null
        }
        Insert: {
          adoption_instructions?: string | null
          adoption_status?: string | null
          age?: string | null
          bio?: string | null
          breed?: string | null
          county?: string | null
          created_at?: string
          custom_logo_url?: string | null
          id?: string
          is_public?: boolean
          microchip_id?: string | null
          name: string
          notes?: string | null
          organization_email?: string | null
          organization_name?: string | null
          organization_phone?: string | null
          organization_website?: string | null
          petport_id?: string | null
          sex?: string | null
          species?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          weight?: string | null
        }
        Update: {
          adoption_instructions?: string | null
          adoption_status?: string | null
          age?: string | null
          bio?: string | null
          breed?: string | null
          county?: string | null
          created_at?: string
          custom_logo_url?: string | null
          id?: string
          is_public?: boolean
          microchip_id?: string | null
          name?: string
          notes?: string | null
          organization_email?: string | null
          organization_name?: string | null
          organization_phone?: string | null
          organization_website?: string | null
          petport_id?: string | null
          sex?: string | null
          species?: string | null
          state?: string | null
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
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          account_type?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          account_type?: string | null
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
      subscribers: {
        Row: {
          additional_pets: number
          additional_pets_purchased: number | null
          created_at: string
          email: string
          id: string
          pet_limit: number
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_pets?: number
          additional_pets_purchased?: number | null
          created_at?: string
          email: string
          id?: string
          pet_limit?: number
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_pets?: number
          additional_pets_purchased?: number | null
          created_at?: string
          email?: string
          id?: string
          pet_limit?: number
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      transfer_requests: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          from_user_id: string
          id: string
          organization_id: string | null
          pet_id: string
          status: string
          to_email: string
          to_user_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          from_user_id: string
          id?: string
          organization_id?: string | null
          pet_id: string
          status?: string
          to_email: string
          to_user_id?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          from_user_id?: string
          id?: string
          organization_id?: string | null
          pet_id?: string
          status?: string
          to_email?: string
          to_user_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      can_user_add_pet: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      generate_petport_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_pet_limit: {
        Args: { user_uuid: string }
        Returns: number
      }
      handle_care_instructions_upsert: {
        Args: {
          _pet_id: string
          _feeding_schedule?: string
          _morning_routine?: string
          _evening_routine?: string
          _allergies?: string
          _behavioral_notes?: string
          _favorite_activities?: string
        }
        Returns: string
      }
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
      handle_lost_pet_data_upsert: {
        Args: {
          _pet_id: string
          _is_missing?: boolean
          _last_seen_location?: string
          _last_seen_date?: string
          _last_seen_time?: string
          _distinctive_features?: string
          _reward_amount?: string
          _finder_instructions?: string
          _contact_priority?: string
          _emergency_notes?: string
        }
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
      is_org_admin: {
        Args: { _user_id: string; _org_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _user_id: string; _org_id: string }
        Returns: boolean
      }
      is_pet_missing: {
        Args: { pet_uuid: string }
        Returns: boolean
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
