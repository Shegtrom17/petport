// Frozen static data from Finn's real profile (Shegstrom17 account)
// Last snapshot: January 2025

export const FINN_DEMO_PET_ID = 'cffb7d62-8210-4fa6-835a-bb29bc6ca6d5';

export const FINN_DEMO_DATA = {
  // Core pet information
  id: FINN_DEMO_PET_ID,
  petport_id: 'PP-2025-0FF72B79',
  name: 'Finn',
  species: 'dog',
  breed: 'Mixed Breed',
  age: '5',
  sex: 'neutered_male',
  weight: '50',
  microchip_id: '985112345678901',
  bio: 'Finn is a joyous dog who loves to jump and greet people and be part of every party.',
  is_public: true,
  
  // Photos
  photo_url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/finn-profile.jpg',
  full_body_photo_url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/finn-fullbody.jpg',
  
  // Gallery photos
  gallery_photos: [
    {
      id: '1',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/finn-gallery-1.jpg',
      caption: 'Finn at the beach',
      position: 0
    },
    {
      id: '2',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/finn-gallery-2.jpg',
      caption: 'Playing in the park',
      position: 1
    }
  ],
  
  // Professional certifications
  certifications: [
    {
      id: '1',
      type: 'Therapy Dog',
      issuer: 'Alliance of Therapy Dogs',
      certification_number: 'ATD-2023-5678',
      issue_date: '2023-03-15',
      expiry_date: '2025-03-15',
      status: 'active',
      notes: 'Certified therapy dog for hospital and school visits'
    },
    {
      id: '2',
      type: 'Canine Good Citizen',
      issuer: 'American Kennel Club',
      certification_number: 'CGC-2022-1234',
      issue_date: '2022-06-20',
      status: 'active',
      notes: 'Passed all 10 skills test items'
    }
  ],
  
  // Training
  training: [
    {
      id: '1',
      course: 'Advanced Obedience Training',
      facility: 'Pawsitive Dog Training Center',
      completed: '2022-08-15',
      phone: '(555) 123-4567'
    },
    {
      id: '2',
      course: 'Therapy Dog Preparation Course',
      facility: 'Therapy Dogs International',
      completed: '2023-02-28',
      phone: '(555) 987-6543'
    }
  ],
  
  // Achievements
  achievements: [
    {
      id: '1',
      title: 'Best Therapy Dog Award',
      description: 'Recognized for outstanding service at Children\'s Hospital',
      date: '2024-05-10'
    },
    {
      id: '2',
      title: 'Community Hero Award',
      description: 'Honored for bringing joy to over 500 patients',
      date: '2024-11-15'
    }
  ],
  
  // Experiences & Activities
  experiences: [
    {
      id: '1',
      activity: 'Therapy Dog Volunteer',
      description: 'Weekly visits to local hospital and nursing homes',
      contact: 'St. Mary\'s Hospital Volunteer Services'
    },
    {
      id: '2',
      activity: 'School Reading Program',
      description: 'Helps children practice reading in a supportive environment',
      contact: 'Lincoln Elementary School'
    }
  ],
  
  // Reviews
  reviews: [
    {
      id: '1',
      reviewer_name: 'Sarah Johnson',
      rating: 5,
      text: 'Finn is absolutely wonderful! He brings so much joy to our patients. His calm demeanor and gentle nature make him perfect for therapy work.',
      date: '2024-12-15',
      type: 'Professional',
      location: 'St. Mary\'s Hospital',
      reviewer_contact: 'sjohnson@stmarys.org'
    },
    {
      id: '2',
      reviewer_name: 'Michael Chen',
      rating: 5,
      text: 'Finn has been amazing with our students. The kids love reading to him, and we\'ve seen significant improvement in their confidence.',
      date: '2024-11-20',
      type: 'Professional',
      location: 'Lincoln Elementary School',
      reviewer_contact: 'mchen@lincolnelem.edu'
    },
    {
      id: '3',
      reviewer_name: 'Emily Rodriguez',
      rating: 5,
      text: 'What a fantastic dog! Finn is always so happy and energetic. He\'s been a wonderful companion and therapy partner.',
      date: '2024-10-05',
      type: 'Personal',
      reviewer_contact: 'emily.r@email.com'
    }
  ],
  
  // Professional data
  professional_data: {
    support_animal_status: 'therapy_dog',
    badges: ['therapy_certified', 'cgc_certified']
  },
  
  // Medical information
  medical: {
    medical_alert: false,
    medical_conditions: 'None',
    medications: [],
    last_vaccination: '2024-09-15'
  }
};

export const FINN_LOST_PET_DATA = {
  ...FINN_DEMO_DATA,
  
  // Lost pet specific data
  lost_pet_data: {
    is_missing: true,
    last_seen_location: '1234 Maple Street, near Riverside Park',
    last_seen_date: new Date().toISOString().split('T')[0],
    last_seen_time: '3:30 PM',
    distinctive_features: 'White patch on chest, slightly torn left ear, wearing blue collar with bone-shaped tag',
    reward_amount: '$500',
    finder_instructions: 'Please do not chase. Finn is friendly but may be scared. Call immediately if spotted. He responds to his name and loves treats.',
    contact_priority: 'Call first, then text',
    emergency_notes: 'Finn is microchipped. Please scan at any vet clinic. Owner is very worried and offering reward.'
  },
  
  // Emergency contacts
  pet_contacts: [
    {
      id: '1',
      contact_name: 'Owner - Sarah Thompson',
      contact_phone: '(555) 123-4567',
      contact_type: 'emergency'
    },
    {
      id: '2',
      contact_name: 'Secondary Contact - Mike Thompson',
      contact_phone: '(555) 987-6543',
      contact_type: 'emergency'
    },
    {
      id: '3',
      contact_name: 'Local Vet - Riverside Animal Hospital',
      contact_phone: '(555) 456-7890',
      contact_type: 'vet'
    }
  ]
};
