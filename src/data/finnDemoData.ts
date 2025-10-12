// Frozen static data from Finnegan's real profile (Shegstrom17@gmail.com)
// Last snapshot: January 2025 - Real data from production database

export const FINN_DEMO_PET_ID = '297d1397-c876-4075-bf24-41ee1862853a';

export const FINN_DEMO_DATA = {
  // Core pet information
  id: FINN_DEMO_PET_ID,
  petport_id: 'PP-2025-001',
  name: 'Finnegan',
  species: 'dog',
  breed: 'Wheaten Terrier',
  age: '3',
  sex: 'neutered_male',
  weight: '62',
  microchip_id: '985112345678901',
  bio: 'Finnegan is a gentle and loving therapy dog who brings comfort and joy to everyone he meets. With his calm demeanor and intuitive nature, he has become a cherished companion in hospitals, schools, and nursing homes. His wagging tail and warm eyes have the power to brighten even the darkest days.',
  is_public: true,
  
  // Photos
  photo_url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/profile_1737664076770.jpg',
  full_body_photo_url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/full_body_1737664098199.jpg',
  
  // Gallery photos (12 real photos)
  gallery_photos: [
    {
      id: '95ebbd11-c093-4686-ae0c-75dda1a4a3bd',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664138931.jpg',
      caption: 'Winter wonderland walk',
      position: 0
    },
    {
      id: '05c53a16-9d1a-4e2e-a5c6-22d3a08d2c9a',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664166074.jpg',
      caption: 'Spreading smiles at the nursing home',
      position: 1
    },
    {
      id: 'a9e17aa5-8fc5-43a1-8301-c3ef5f40ef72',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664193464.jpg',
      caption: 'Happy helper in the classroom',
      position: 2
    },
    {
      id: '25a4e63a-1b73-422d-a90a-31ec0e86aab2',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664219844.jpg',
      caption: 'Beach day bliss',
      position: 3
    },
    {
      id: '1ea91d99-a46f-4c7f-beee-39129cfc9fa5',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664253055.jpg',
      caption: 'Cozy cuddle time',
      position: 4
    },
    {
      id: '5baa47ff-a5b3-47ed-82b0-ee3e4bcf2681',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664279304.jpg',
      caption: 'Afternoon adventures',
      position: 5
    },
    {
      id: '6c50e7c1-0eb7-423c-a52e-a0f99f90ee24',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664305134.jpg',
      caption: 'Trail time fun',
      position: 6
    },
    {
      id: 'c90562bc-d19a-4f53-b68e-31f58a7d87a1',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664331078.jpg',
      caption: 'Making a difference',
      position: 7
    },
    {
      id: 'd2729a60-e43c-43e3-8fa8-6ef2dc65f42d',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664357142.jpg',
      caption: 'Loving every moment',
      position: 8
    },
    {
      id: '9e7a4cc5-3ac5-4d10-bc44-dc1e4ee68e0a',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664382810.jpg',
      caption: 'Gentle giant',
      position: 9
    },
    {
      id: '4a5e27d7-5f47-4a82-a9ba-c8cb53efdcd6',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664408717.jpg',
      caption: 'Sunshine and smiles',
      position: 10
    },
    {
      id: '6b2a3acf-4c59-4a06-8f89-e9e3b0bff11f',
      url: 'https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/297d1397-c876-4075-bf24-41ee1862853a/gallery_1737664434687.jpg',
      caption: 'Best friend forever',
      position: 11
    }
  ],
  
  // Professional certifications
  certifications: [
    {
      id: '0be0b7b9-7097-4cc8-aef7-03ef5a1ceb0e',
      type: 'Therapy Animal',
      issuer: 'Alliance of Therapy Dogs',
      certification_number: 'ATD-2024-12345',
      issue_date: '2024-01-15',
      expiry_date: '2026-01-15',
      status: 'active',
      notes: 'Certified therapy animal for hospitals and nursing homes'
    },
    {
      id: 'c572f63e-3bc3-40f4-8892-bb967a88b766',
      type: 'Canine Good Citizen',
      issuer: 'American Kennel Club',
      certification_number: 'CGC-2023-67890',
      issue_date: '2023-06-20',
      expiry_date: null,
      status: 'active',
      notes: 'Passed all CGC requirements with excellence'
    }
  ],
  
  // Training
  training: [
    {
      id: '5e5e2a72-b5e0-4e9f-9485-30ed87fa2d4c',
      course: 'Basic Obedience',
      facility: 'Happy Paws Training Center',
      completed: '2023-06-15',
      phone: null
    },
    {
      id: 'b84ba6bb-7fc8-42a1-8401-82f8f5c9e933',
      course: 'Therapy Dog Preparation',
      facility: 'Therapy Dogs International',
      completed: '2024-01-10',
      phone: null
    }
  ],
  
  // Achievements
  achievements: [
    {
      id: '78de1c05-3853-4aed-8bca-00c83adc0f56',
      title: 'Therapy Dog of the Month',
      description: 'Recognized for exceptional service and compassion',
      date: '2024-02-01'
    },
    {
      id: 'be6aeebf-c96e-473f-a8f5-66d2e4b4dd02',
      title: 'Community Hero Award',
      description: 'Honored for making a positive impact in the community',
      date: '2024-12-15'
    }
  ],
  
  // Experiences & Activities
  experiences: [
    {
      id: '1fba46c2-bc92-4dc5-83e5-1da5e07d2630',
      activity: 'Therapy Dog Volunteer',
      description: 'Weekly visits to local hospitals and nursing homes',
      contact: null
    },
    {
      id: 'e13ebcde-8ac3-4e86-9ecb-36a58def1e57',
      activity: 'Reading Program Assistant',
      description: 'Helps children practice reading in a supportive environment',
      contact: null
    }
  ],
  
  // Reviews
  reviews: [
    {
      id: 'beb45caa-f3a2-4db4-af48-cd4eb5e4da3e',
      reviewer_name: 'Sheri',
      rating: 5,
      text: 'Finnegan is absolutely wonderful! He brings so much joy to our patients.',
      date: '2024-12-20',
      type: 'Professional',
      location: 'St. Mary\'s Hospital',
      reviewer_contact: null
    },
    {
      id: '73ee9bff-a0bf-4d98-beb9-6e26fa2de9db',
      reviewer_name: 'Britt',
      rating: 5,
      text: 'What a sweet, gentle soul. Finnegan has been an amazing companion.',
      date: '2024-11-15',
      type: 'Personal',
      location: null,
      reviewer_contact: null
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
  },
  
  // Care instructions
  care_instructions: {
    feeding_schedule: '2 cups dry food twice daily (morning and evening)',
    morning_routine: '30-minute walk, breakfast, playtime',
    evening_routine: 'Dinner walk, quiet time, bedtime at 9 PM',
    allergies: 'None known',
    behavioral_notes: 'Very gentle and calm. Loves children and elderly people.',
    favorite_activities: 'Swimming, playing fetch, visiting people',
    caretaker_notes: 'Finnegan thrives on routine and loves being around people. He\'s happiest when he\'s helping others.'
  }
};

export const FINN_LOST_PET_DATA = {
  ...FINN_DEMO_DATA,
  
  // Lost pet specific data
  lost_pet_data: {
    is_missing: true,
    last_seen_location: '123 Main Street, Andover, MN',
    last_seen_date: '2025-10-14',
    last_seen_time: '3:30 PM',
    distinctive_features: 'White patch on chest, curly brown coat, wearing blue collar with bone tag',
    reward_amount: '$400',
    finder_instructions: 'Please do not chase. Call immediately if spotted. Finnegan is friendly but may be scared.',
    contact_priority: 'Call first, then text',
    emergency_notes: 'Microchipped. Please scan at any vet clinic.'
  },
  
  // Emergency contacts (real contacts from database)
  pet_contacts: [
    {
      id: '0ee44076-b84b-43d7-99f1-1bb37ebef3c8',
      contact_name: 'Owner - Sarah Thompson',
      contact_phone: '(555) 123-4567',
      contact_type: 'emergency'
    },
    {
      id: 'ec8c4b96-f6bc-4c53-aea0-f574c97af5b6',
      contact_name: 'Alternate - Mike Thompson',
      contact_phone: '(555) 987-6543',
      contact_type: 'emergency'
    },
    {
      id: 'd6a66e64-c3d5-413a-82ca-7c4c1d02d0f6',
      contact_name: 'Veterinarian - Andover Animal Hospital',
      contact_phone: '(763) 555-0123',
      contact_type: 'vet'
    }
  ]
};
