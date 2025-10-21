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
      campaigns: {
        Row: {
          clicks_count: number | null
          created_at: string | null
          created_by: string | null
          discount_code_id: string | null
          id: string
          opens_count: number | null
          postmark_template_alias: string | null
          postmark_template_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject_line: string
          target_segment: string | null
          title: string
          total_recipients: number | null
          unsubscribes_count: number | null
          updated_at: string | null
        }
        Insert: {
          clicks_count?: number | null
          created_at?: string | null
          created_by?: string | null
          discount_code_id?: string | null
          id?: string
          opens_count?: number | null
          postmark_template_alias?: string | null
          postmark_template_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject_line: string
          target_segment?: string | null
          title: string
          total_recipients?: number | null
          unsubscribes_count?: number | null
          updated_at?: string | null
        }
        Update: {
          clicks_count?: number | null
          created_at?: string | null
          created_by?: string | null
          discount_code_id?: string | null
          id?: string
          opens_count?: number | null
          postmark_template_alias?: string | null
          postmark_template_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject_line?: string
          target_segment?: string | null
          title?: string
          total_recipients?: number | null
          unsubscribes_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      care_instructions: {
        Row: {
          allergies: string | null
          behavioral_notes: string | null
          caretaker_notes: string | null
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
          caretaker_notes?: string | null
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
          caretaker_notes?: string | null
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
        Relationships: [
          {
            foreignKeyName: "certifications_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          message: string
          page_type: string
          pet_id: string
          sender_email: string
          sender_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          message: string
          page_type: string
          pet_id: string
          sender_email: string
          sender_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          message?: string
          page_type?: string
          pet_id?: string
          sender_email?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_pet_id_fkey"
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
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          campaign_id: string | null
          discount_code_id: string | null
          id: string
          redeemed_at: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          discount_code_id?: string | null
          id?: string
          redeemed_at?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          discount_code_id?: string | null
          id?: string
          redeemed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          campaign_id: string | null
          code: string
          created_at: string | null
          created_by: string | null
          current_redemptions: number | null
          discount_type: string | null
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_redemptions: number | null
        }
        Insert: {
          campaign_id?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_redemptions?: number | null
          discount_type?: string | null
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
        }
        Update: {
          campaign_id?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_redemptions?: number | null
          discount_type?: string | null
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
        }
        Relationships: []
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
      email_preferences: {
        Row: {
          created_at: string | null
          email: string
          unsubscribe_reason: string | null
          unsubscribed_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          unsubscribe_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          unsubscribe_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          position: number | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          pet_id: string
          position?: number | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          pet_id?: string
          position?: number | null
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
      pet_contacts: {
        Row: {
          contact_name: string
          contact_phone: string
          contact_type: string
          created_at: string
          id: string
          pet_id: string
          updated_at: string
        }
        Insert: {
          contact_name: string
          contact_phone: string
          contact_type?: string
          created_at?: string
          id?: string
          pet_id: string
          updated_at?: string
        }
        Update: {
          contact_name?: string
          contact_phone?: string
          contact_type?: string
          created_at?: string
          id?: string
          pet_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_contacts_pet_id_fkey"
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
      pet_sightings: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          is_visible: boolean
          pet_id: string
          reported_at: string
          sighting_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          is_visible?: boolean
          pet_id: string
          reported_at?: string
          sighting_text: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          is_visible?: boolean
          pet_id?: string
          reported_at?: string
          sighting_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_sightings_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
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
          height: string | null
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
          registration_number: string | null
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
          height?: string | null
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
          registration_number?: string | null
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
          height?: string | null
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
          registration_number?: string | null
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
      referrals: {
        Row: {
          approved_at: string | null
          commission_amount: number
          commission_status: string
          created_at: string
          id: string
          paid_at: string | null
          referral_code: string
          referral_type: string | null
          referred_plan_interval: string | null
          referred_user_id: string | null
          referrer_user_id: string
          trial_completed_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          commission_amount?: number
          commission_status?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_code: string
          referral_type?: string | null
          referred_plan_interval?: string | null
          referred_user_id?: string | null
          referrer_user_id: string
          trial_completed_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          commission_amount?: number
          commission_status?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_code?: string
          referral_type?: string | null
          referred_plan_interval?: string | null
          referred_user_id?: string | null
          referrer_user_id?: string
          trial_completed_at?: string | null
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
      settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: boolean
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: boolean
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: boolean
        }
        Relationships: []
      }
      subscriber_tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          tag_name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          tag_name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          tag_name?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          additional_pets: number
          additional_pets_purchased: number | null
          canceled_at: string | null
          created_at: string
          email: string
          grace_period_end: string | null
          id: string
          payment_failed_at: string | null
          pet_limit: number
          plan_interval: string | null
          reactivated_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          suspended_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_pets?: number
          additional_pets_purchased?: number | null
          canceled_at?: string | null
          created_at?: string
          email: string
          grace_period_end?: string | null
          id?: string
          payment_failed_at?: string | null
          pet_limit?: number
          plan_interval?: string | null
          reactivated_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          suspended_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_pets?: number
          additional_pets_purchased?: number | null
          canceled_at?: string | null
          created_at?: string
          email?: string
          grace_period_end?: string | null
          id?: string
          payment_failed_at?: string | null
          pet_limit?: number
          plan_interval?: string | null
          reactivated_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          suspended_at?: string | null
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
      user_payouts: {
        Row: {
          created_at: string
          id: string
          last_earnings_reset: string | null
          onboarding_status: string
          stripe_connect_id: string | null
          updated_at: string
          user_id: string
          yearly_earnings: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_earnings_reset?: string | null
          onboarding_status?: string
          stripe_connect_id?: string | null
          updated_at?: string
          user_id: string
          yearly_earnings?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_earnings_reset?: string | null
          onboarding_status?: string
          stripe_connect_id?: string | null
          updated_at?: string
          user_id?: string
          yearly_earnings?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tags: {
        Row: {
          applied_at: string | null
          id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          id?: string
          tag_id: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "subscriber_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          processed_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          processed_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          processed_at?: string
        }
        Relationships: []
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
      create_user_referral: {
        Args: { _user_id: string }
        Returns: string
      }
      generate_petport_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_pet_limit: {
        Args: { user_uuid: string }
        Returns: number
      }
      handle_care_instructions_upsert: {
        Args: {
          _allergies?: string
          _behavioral_notes?: string
          _caretaker_notes?: string
          _evening_routine?: string
          _favorite_activities?: string
          _feeding_schedule?: string
          _morning_routine?: string
          _pet_id: string
        }
        Returns: string
      }
      handle_document_upload: {
        Args: {
          _file_url: string
          _name: string
          _pet_id: string
          _size?: string
          _type: string
        }
        Returns: string
      }
      handle_gallery_photo_upload: {
        Args: { _caption?: string; _pet_id: string; _url: string }
        Returns: string
      }
      handle_lost_pet_data_upsert: {
        Args: {
          _contact_priority?: string
          _distinctive_features?: string
          _emergency_notes?: string
          _finder_instructions?: string
          _is_missing?: boolean
          _last_seen_date?: string
          _last_seen_location?: string
          _last_seen_time?: string
          _pet_id: string
          _reward_amount?: string
        }
        Returns: string
      }
      handle_photo_upload: {
        Args: {
          _full_body_photo_url?: string
          _pet_id: string
          _photo_url?: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_pet_missing: {
        Args: { pet_uuid: string }
        Returns: boolean
      }
      is_user_subscription_active: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      process_webhook_event: {
        Args: { _event_type: string; _stripe_event_id: string }
        Returns: boolean
      }
      update_subscriber_status: {
        Args: {
          _canceled_at?: string
          _grace_period_end?: string
          _payment_failed_at?: string
          _reactivated_at?: string
          _status: Database["public"]["Enums"]["subscription_status"]
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      subscription_status:
        | "active"
        | "grace"
        | "suspended"
        | "canceled"
        | "inactive"
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
      app_role: ["admin", "user"],
      subscription_status: [
        "active",
        "grace",
        "suspended",
        "canceled",
        "inactive",
      ],
    },
  },
} as const
