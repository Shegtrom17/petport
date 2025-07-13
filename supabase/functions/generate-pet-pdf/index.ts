import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ComprehensivePetData {
  id: string;
  name: string;
  breed: string;
  species: string;
  age: string;
  weight: string;
  microchip_id: string;
  pet_pass_id: string;
  bio: string;
  notes: string;
  state: string;
  county: string;
  photo_url: string;
  full_body_photo_url: string;
  vet_contact: string;
  emergency_contact: string;
  second_emergency_contact: string;
  pet_caretaker: string;
  medical_alert: boolean;
  medical_conditions: string;
  medications: string[];
  last_vaccination: string;
  medical_emergency_document: string;
  care_instructions: {
    feeding_schedule: string;
    morning_routine: string;
    evening_routine: string;
    allergies: string;
    behavioral_notes: string;
    favorite_activities: string;
  };
  badges: string[];
  support_animal_status: string;
  experiences: Array<{ activity: string; contact: string; description: string; }>;
  achievements: Array<{ title: string; description: string; }>;
  training: Array<{ course: string; facility: string; phone: string; completed: string; }>;
  reviews: Array<{ reviewer_name: string; reviewer_contact: string; rating: number; text: string; date: string; location: string; type: string; }>;
  travel_locations: Array<{ name: string; type: string; code: string; date_visited: string; photo_url: string; notes: string; }>;
  gallery_photos: Array<{ url: string; caption: string; }>;
  documents: Array<{ name: string; type: string; file_url: string; size: string; upload_date: string; }>;
}

function generateCareInstructionsPDF(petData: ComprehensivePetData): string {
  const isHorse = petData.species?.toLowerCase() === 'horse';
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PetPort - Care Instructions for ${petData.name}</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #16a34a; 
            padding-bottom: 15px; 
            margin-bottom: 25px;
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            padding: 20px;
            border-radius: 10px;
        }
        .pet-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #16a34a; 
            margin: 10px 0;
        }
        .pet-subtitle { 
            font-size: 18px; 
            color: #15803d; 
            margin: 5px 0;
        }
        .section { 
            margin-bottom: 25px; 
            border: 1px solid #bbf7d0; 
            padding: 20px; 
            border-radius: 8px;
            background: #f7fee7;
        }
        .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #16a34a; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #bbf7d0; 
            padding-bottom: 8px;
            display: flex;
            align-items: center;
        }
        .section-icon {
            margin-right: 10px;
            font-size: 20px;
        }
        .emergency { 
            background-color: #fef2f2; 
            border-color: #ef4444;
            border-width: 2px;
        }
        .emergency .section-title { 
            color: #ef4444;
        }
        .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px;
        }
        .field { 
            margin-bottom: 10px;
        }
        .field-label { 
            font-weight: bold; 
            color: #15803d;
            display: inline-block;
            min-width: 140px;
        }
        .field-value { 
            margin-left: 10px;
            color: #111827;
        }
        .schedule-item, .routine-item, .care-item {
            background-color: white;
            padding: 12px;
            border-radius: 6px;
            margin: 8px 0;
            border-left: 4px solid #16a34a;
        }
        .feeding-schedule {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .medical-notes {
            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
            border: 2px solid #ef4444;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .behavioral-notes {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #3b82f6;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 2px solid #bbf7d0;
            padding-top: 15px;
        }
        .qr-note {
            background: #f0fdf4;
            border: 1px solid #16a34a;
            padding: 10px;
            border-radius: 6px;
            font-size: 12px;
            text-align: center;
            margin: 20px 0;
            color: #15803d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌿 ${petData.name} Care Instructions</h1>
        <div class="pet-name">${petData.name}</div>
        <div class="pet-subtitle">Use this guide for daily care, travel, or vet visits</div>
        <div class="pet-subtitle">ID: ${petData.pet_pass_id} • ${petData.species ? petData.species.charAt(0).toUpperCase() + petData.species.slice(1) : ''} ${petData.breed ? '• ' + petData.breed : ''}</div>
    </div>

    <div class="qr-note">
        📱 Scan the QR code to view real-time updates to ${petData.name}'s care plan via PetPort
    </div>

    <div class="section emergency">
        <div class="section-title">
            <span class="section-icon">🚨</span>Emergency Contacts
        </div>
        <div class="field">
            <span class="field-label">Primary Emergency:</span>
            <span class="field-value">${petData.emergency_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Veterinarian:</span>
            <span class="field-value">${petData.vet_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Pet Caretaker:</span>
            <span class="field-value">${petData.pet_caretaker || 'Not provided'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">
            <span class="section-icon">☕</span>Feeding ${isHorse ? '& Turnout' : ''} Schedule
        </div>
        ${petData.care_instructions?.feeding_schedule ? `
        <div class="feeding-schedule">
            <h4>🕐 Custom Schedule</h4>
            <p>${petData.care_instructions.feeding_schedule}</p>
        </div>
        ` : `
        <div class="feeding-schedule">
            <h4>🕐 ${isHorse ? 'Standard Horse' : 'Standard'} Feeding Schedule</h4>
            ${isHorse ? `
            <div class="schedule-item">⏰ 6:00 AM - Morning hay (2 flakes timothy) • Check water buckets</div>
            <div class="schedule-item">⏰ 12:00 PM - Grain feed (2 lbs sweet feed) • Add supplements</div>
            <div class="schedule-item">⏰ 6:00 PM - Evening hay (2 flakes) • Turn out or bring in from pasture</div>
            ` : `
            <div class="schedule-item">⏰ 7:00 AM - Morning feed (2 cups dry food + supplements) • Mix with warm water if preferred</div>
            <div class="schedule-item">⏰ 12:00 PM - Light snack (Training treats only) • If active/training day</div>
            <div class="schedule-item">⏰ 6:00 PM - Evening feed (2 cups dry food) • Fresh water always available</div>
            `}
        </div>
        `}
    </div>

    ${petData.medications && petData.medications.length > 0 ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">💊</span>Medications & Health
        </div>
        <div class="medical-notes">
            <h4>⚠️ Current Medications</h4>
            ${petData.medications.map(med => `<div class="care-item">💊 ${med} - Administer as prescribed. Contact vet if missed doses or reactions occur.</div>`).join('')}
        </div>
        <div class="care-item">
            <h4>📋 Health Monitoring Checklist</h4>
            <ul>
                <li>• Monitor appetite and water intake daily</li>
                <li>• Watch for any behavioral changes</li>
                <li>• Check for signs of distress or discomfort</li>
                ${isHorse ? '<li>• Check hooves and legs for heat/swelling</li>' : ''}
                <li>• Contact vet immediately if concerns arise</li>
            </ul>
        </div>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">
            <span class="section-icon">🌙</span>Daily Routine & Preferences
        </div>
        <div class="grid">
            <div class="routine-item">
                <h4>🌅 Morning Routine</h4>
                ${petData.care_instructions?.morning_routine ? `
                <p>${petData.care_instructions.morning_routine}</p>
                ` : `
                <ul>
                    <li>• Wake up around 7:00 AM</li>
                    <li>• ${isHorse ? 'Check water buckets and hay' : 'Potty break immediately'}</li>
                    <li>• ${isHorse ? 'Quick health check' : 'Short walk before breakfast'}</li>
                    <li>• Feeding time</li>
                </ul>
                `}
            </div>
            <div class="routine-item">
                <h4>🌆 Evening Routine</h4>
                ${petData.care_instructions?.evening_routine ? `
                <p>${petData.care_instructions.evening_routine}</p>
                ` : `
                <ul>
                    <li>• Dinner around 6:00 PM</li>
                    <li>• ${isHorse ? 'Turn out or bring in from pasture' : 'Play time after dinner'}</li>
                    <li>• ${isHorse ? 'Final hay feeding' : 'Final potty break at 10 PM'}</li>
                    ${!isHorse ? '<li>• Bedtime routine - quiet time</li>' : ''}
                </ul>
                `}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">
            <span class="section-icon">⚠️</span>Important Notes & Preferences
        </div>
        <div class="medical-notes">
            <h4>🚨 Allergies & Sensitivities</h4>
            <p>${petData.care_instructions?.allergies || (isHorse 
                ? "Sensitive to alfalfa - stick to timothy hay only. No moldy or dusty feed."
                : "Sensitive to chicken - avoid all poultry-based treats and foods."
            )}</p>
        </div>
        <div class="behavioral-notes">
            <h4>🧠 Behavioral Notes</h4>
            <p>${petData.care_instructions?.behavioral_notes || (isHorse
                ? "Generally calm but can be anxious during storms. Provide extra hay for comfort."
                : "Friendly with other dogs but needs slow introductions. Afraid of thunderstorms - provide comfort."
            )}</p>
        </div>
        <div class="care-item">
            <h4>❤️ Favorite Activities</h4>
            <p>${petData.care_instructions?.favorite_activities || (isHorse
                ? "Enjoys trail rides and groundwork. Loves grooming sessions."
                : "Loves swimming, fetch, and puzzle toys. Great with children."
            )}</p>
        </div>
    </div>

    ${petData.bio ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">🌟</span>About ${petData.name}
        </div>
        <div class="care-item">
            <p>${petData.bio}</p>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>PetPort Care Instructions for ${petData.name}</strong></p>
        <p>Generated on ${new Date().toLocaleDateString()} • ID: ${petData.pet_pass_id}</p>
        <p>📱 For real-time updates, visit: PetPort.com</p>
        <p style="margin-top: 15px; font-style: italic;">
            "Caring for pets with love, precision, and peace of mind."
        </p>
    </div>
</body>
</html>
  `;
}

function generateFullPetProfilePDF(petData: ComprehensivePetData): string {
  const formatArray = (arr: any[], formatter: (item: any) => string) => {
    return arr && arr.length > 0 ? arr.map(formatter).join('') : '<p>No entries recorded.</p>';
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PetPort - Complete Profile for ${petData.name}</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 15px; 
            margin-bottom: 25px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
            border-radius: 10px;
        }
        .pet-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #2563eb; 
            margin: 10px 0;
        }
        .pet-subtitle { 
            font-size: 18px; 
            color: #64748b; 
            margin: 5px 0;
        }
        .section { 
            margin-bottom: 25px; 
            border: 1px solid #e2e8f0; 
            padding: 20px; 
            border-radius: 8px;
            background: #fafafa;
        }
        .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #2563eb; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #e2e8f0; 
            padding-bottom: 8px;
            display: flex;
            align-items: center;
        }
        .section-icon {
            margin-right: 10px;
            font-size: 20px;
        }
        .emergency { 
            background-color: #fef2f2; 
            border-color: #ef4444;
            border-width: 2px;
        }
        .emergency .section-title { 
            color: #ef4444;
        }
        .medical-alert { 
            background-color: #fef2f2; 
            border: 3px solid #ef4444; 
            color: #991b1b;
            font-weight: bold;
            text-align: center;
            padding: 15px;
            margin: 20px 0;
        }
        .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px;
        }
        .field { 
            margin-bottom: 10px;
        }
        .field-label { 
            font-weight: bold; 
            color: #374151;
            display: inline-block;
            min-width: 140px;
        }
        .field-value { 
            margin-left: 10px;
            color: #111827;
        }
        .photo-section {
            text-align: center;
            margin: 25px 0;
            background: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #e2e8f0;
        }
        .photo {
            max-width: 200px;
            max-height: 200px;
            border-radius: 10px;
            border: 2px solid #d1d5db;
            margin: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .medications, .badges-list, .review-item, .achievement-item, .training-item, .travel-item, .document-item {
            background-color: white;
            padding: 12px;
            border-radius: 6px;
            margin: 8px 0;
            border-left: 4px solid #2563eb;
        }
        .rating-stars {
            color: #fbbf24;
            font-size: 16px;
        }
        .photos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .gallery-photo {
            text-align: center;
            background: white;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .gallery-photo img {
            max-width: 160px;
            max-height: 160px;
            border-radius: 6px;
            border: 1px solid #d1d5db;
        }
        .gallery-caption {
            font-size: 12px;
            color: #6b7280;
            margin-top: 5px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 2px solid #e2e8f0;
            padding-top: 15px;
        }
        .bio-section {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border: 1px solid #bfdbfe;
        }
        .care-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐾 PetPort Complete Profile</h1>
        <div class="pet-name">${petData.name}</div>
        <div class="pet-subtitle">${petData.species ? petData.species.charAt(0).toUpperCase() + petData.species.slice(1) : ''} ${petData.breed ? '• ' + petData.breed : ''}</div>
        <div class="pet-subtitle">ID: ${petData.pet_pass_id} ${petData.microchip_id ? '• Microchip: ' + petData.microchip_id : ''}</div>
    </div>

    ${petData.photo_url || petData.full_body_photo_url ? `
    <div class="photo-section">
        <h3>📸 Photos</h3>
        ${petData.photo_url ? `<img src="${petData.photo_url}" alt="${petData.name}" class="photo" />` : ''}
        ${petData.full_body_photo_url ? `<img src="${petData.full_body_photo_url}" alt="${petData.name} full body" class="photo" />` : ''}
    </div>
    ` : ''}

    ${petData.bio ? `
    <div class="bio-section">
        <h3>🌟 About ${petData.name}</h3>
        <p>${petData.bio}</p>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">
            <span class="section-icon">📋</span>Basic Information
        </div>
        <div class="grid">
            <div class="field">
                <span class="field-label">Species:</span>
                <span class="field-value">${petData.species || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="field-label">Breed:</span>
                <span class="field-value">${petData.breed || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="field-label">Age:</span>
                <span class="field-value">${petData.age || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="field-label">Weight:</span>
                <span class="field-value">${petData.weight || 'Not specified'}</span>
            </div>
            ${petData.state ? `
            <div class="field">
                <span class="field-label">State:</span>
                <span class="field-value">${petData.state}</span>
            </div>
            ` : ''}
            ${petData.county ? `
            <div class="field">
                <span class="field-label">County:</span>
                <span class="field-value">${petData.county}</span>
            </div>
            ` : ''}
        </div>
        ${petData.notes ? `
        <div class="field">
            <span class="field-label">Notes:</span>
            <div class="field-value">${petData.notes}</div>
        </div>
        ` : ''}
    </div>

    ${petData.medical_alert ? `
    <div class="medical-alert">
        <div class="section-title">⚠️ MEDICAL ALERT</div>
        <div style="font-weight: bold; font-size: 18px;">${petData.medical_conditions}</div>
    </div>
    ` : ''}

    <div class="section emergency">
        <div class="section-title">
            <span class="section-icon">🚨</span>Emergency Contacts
        </div>
        <div class="field">
            <span class="field-label">Primary Emergency:</span>
            <span class="field-value">${petData.emergency_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Secondary Emergency:</span>
            <span class="field-value">${petData.second_emergency_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Veterinarian:</span>
            <span class="field-value">${petData.vet_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Pet Caretaker:</span>
            <span class="field-value">${petData.pet_caretaker || 'Not provided'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">
            <span class="section-icon">🏥</span>Medical Information
        </div>
        <div class="field">
            <span class="field-label">Last Vaccination:</span>
            <span class="field-value">${petData.last_vaccination || 'Not recorded'}</span>
        </div>
        ${petData.medications && petData.medications.length > 0 ? `
        <div class="field">
            <span class="field-label">Current Medications:</span>
            <div class="medications">
                ${petData.medications.map(med => `<div class="medication-item">💊 ${med}</div>`).join('')}
            </div>
        </div>
        ` : ''}
        ${petData.medical_emergency_document ? `
        <div class="field">
            <span class="field-label">Emergency Document:</span>
            <span class="field-value"><a href="${petData.medical_emergency_document}" target="_blank">View Document</a></span>
        </div>
        ` : ''}
    </div>

    ${petData.care_instructions ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">🏠</span>Care Instructions
        </div>
        <div class="care-grid">
            ${petData.care_instructions.feeding_schedule ? `
            <div class="field">
                <span class="field-label">Feeding Schedule:</span>
                <div class="field-value">${petData.care_instructions.feeding_schedule}</div>
            </div>
            ` : ''}
            ${petData.care_instructions.morning_routine ? `
            <div class="field">
                <span class="field-label">Morning Routine:</span>
                <div class="field-value">${petData.care_instructions.morning_routine}</div>
            </div>
            ` : ''}
            ${petData.care_instructions.evening_routine ? `
            <div class="field">
                <span class="field-label">Evening Routine:</span>
                <div class="field-value">${petData.care_instructions.evening_routine}</div>
            </div>
            ` : ''}
            ${petData.care_instructions.allergies ? `
            <div class="field">
                <span class="field-label">Allergies:</span>
                <div class="field-value">${petData.care_instructions.allergies}</div>
            </div>
            ` : ''}
            ${petData.care_instructions.behavioral_notes ? `
            <div class="field">
                <span class="field-label">Behavioral Notes:</span>
                <div class="field-value">${petData.care_instructions.behavioral_notes}</div>
            </div>
            ` : ''}
            ${petData.care_instructions.favorite_activities ? `
            <div class="field">
                <span class="field-label">Favorite Activities:</span>
                <div class="field-value">${petData.care_instructions.favorite_activities}</div>
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    ${petData.badges && petData.badges.length > 0 ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">🏆</span>Badges & Certifications
        </div>
        ${petData.badges.map(badge => `<div class="badges-list">🏅 ${badge}</div>`).join('')}
    </div>
    ` : ''}

    ${petData.support_animal_status ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">🦮</span>Support Animal Status
        </div>
        <div class="field-value">${petData.support_animal_status}</div>
    </div>
    ` : ''}

    ${petData.experiences && petData.experiences.length > 0 ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">🎯</span>Experience & Activities
        </div>
        ${formatArray(petData.experiences, exp => `
            <div class="review-item">
                <strong>🎪 ${exp.activity}</strong>
                ${exp.contact ? `<br>📞 Contact: ${exp.contact}` : ''}
                ${exp.description ? `<br>📝 ${exp.description}` : ''}
            </div>
        `)}
    </div>
    ` : ''}

    ${petData.achievements && petData.achievements.length > 0 ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">🏅</span>Achievements
        </div>
        ${formatArray(petData.achievements, achievement => `
            <div class="achievement-item">
                <strong>🏆 ${achievement.title}</strong>
                ${achievement.description ? `<br>📝 ${achievement.description}` : ''}
            </div>
        `)}
    </div>
    ` : ''}

    ${petData.training && petData.training.length > 0 ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">🎓</span>Training & Education
        </div>
        ${formatArray(petData.training, course => `
            <div class="training-item">
                <strong>📚 ${course.course}</strong>
                ${course.facility ? `<br>🏢 Facility: ${course.facility}` : ''}
                ${course.phone ? `<br>📞 Phone: ${course.phone}` : ''}
                ${course.completed ? `<br>✅ Completed: ${course.completed}` : ''}
            </div>
        `)}
    </div>
    ` : ''}

    ${petData.reviews && petData.reviews.length > 0 ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">⭐</span>Reviews & References
        </div>
        ${formatArray(petData.reviews, review => `
            <div class="review-item">
                <strong>👤 ${review.reviewer_name}</strong>
                <div class="rating-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                ${review.reviewer_contact ? `<br>📞 ${review.reviewer_contact}` : ''}
                ${review.text ? `<br>💬 "${review.text}"` : ''}
                ${review.date ? `<br>📅 ${review.date}` : ''}
                ${review.location ? `<br>📍 ${review.location}` : ''}
                ${review.type ? `<br>🏷️ Type: ${review.type}` : ''}
            </div>
        `)}
    </div>
    ` : ''}

    ${petData.travel_locations && petData.travel_locations.length > 0 ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">✈️</span>Travel History
        </div>
        ${formatArray(petData.travel_locations, location => `
            <div class="travel-item">
                <strong>📍 ${location.name}</strong>
                <br>🏷️ Type: ${location.type}
                ${location.code ? `<br>🔢 Code: ${location.code}` : ''}
                ${location.date_visited ? `<br>📅 Visited: ${location.date_visited}` : ''}
                ${location.notes ? `<br>📝 ${location.notes}` : ''}
            </div>
        `)}
    </div>
    ` : ''}

    ${petData.documents && petData.documents.length > 0 ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">📎</span>Documents
        </div>
        ${formatArray(petData.documents, doc => `
            <div class="document-item">
                <strong>📄 ${doc.name}</strong>
                <br>🏷️ Type: ${doc.type}
                ${doc.size ? `<br>📊 Size: ${doc.size}` : ''}
                <br>📅 Uploaded: ${new Date(doc.upload_date).toLocaleDateString()}
                <br><a href="${doc.file_url}" target="_blank">🔗 View Document</a>
            </div>
        `)}
    </div>
    ` : ''}

    ${petData.gallery_photos && petData.gallery_photos.length > 0 ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">📷</span>Photo Gallery
        </div>
        <div class="photos-grid">
            ${petData.gallery_photos.slice(0, 8).map(photo => `
                <div class="gallery-photo">
                    <img src="${photo.url}" alt="Gallery photo" />
                    ${photo.caption ? `<div class="gallery-caption">${photo.caption}</div>` : ''}
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <strong>🐾 PetPort Complete Profile</strong><br>
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
        This comprehensive document contains complete information for ${petData.name}'s care, emergencies, and activities.<br>
        <em>For updates or questions, please contact the pet owner.</em>
    </div>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { petId, type = 'emergency' } = await req.json();
    
    if (!petId) {
      return new Response(
        JSON.stringify({ error: 'Pet ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating PDF for pet:', petId, 'type:', type);

    // Fetch pet data with all related information
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (petError || !pet) {
      console.error('Error fetching pet:', petError);
      return new Response(
        JSON.stringify({ error: 'Pet not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch all related data
    const [
      contactsResponse,
      medicalResponse,
      photosResponse,
      professionalResponse,
      careInstructionsResponse,
      galleryResponse,
      experiencesResponse,
      achievementsResponse,
      trainingResponse,
      reviewsResponse,
      travelResponse,
      documentsResponse
    ] = await Promise.all([
      supabase.from('contacts').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('medical').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('pet_photos').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('professional_data').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('care_instructions').select('*').eq('pet_id', petId).maybeSingle(),
      supabase.from('gallery_photos').select('*').eq('pet_id', petId),
      supabase.from('experiences').select('*').eq('pet_id', petId),
      supabase.from('achievements').select('*').eq('pet_id', petId),
      supabase.from('training').select('*').eq('pet_id', petId),
      supabase.from('reviews').select('*').eq('pet_id', petId),
      supabase.from('travel_locations').select('*').eq('pet_id', petId),
      supabase.from('documents').select('*').eq('pet_id', petId)
    ]);

    // Combine data into comprehensive pet data object
    const comprehensivePetData: ComprehensivePetData = {
      id: pet.id,
      name: pet.name,
      breed: pet.breed || '',
      species: pet.species || '',
      age: pet.age || '',
      weight: pet.weight || '',
      microchip_id: pet.microchip_id || '',
      pet_pass_id: pet.pet_pass_id || '',
      bio: pet.bio || '',
      notes: pet.notes || '',
      state: pet.state || '',
      county: pet.county || '',
      photo_url: photosResponse.data?.photo_url || '',
      full_body_photo_url: photosResponse.data?.full_body_photo_url || '',
      vet_contact: contactsResponse.data?.vet_contact || '',
      emergency_contact: contactsResponse.data?.emergency_contact || '',
      second_emergency_contact: contactsResponse.data?.second_emergency_contact || '',
      pet_caretaker: contactsResponse.data?.pet_caretaker || '',
      medical_alert: medicalResponse.data?.medical_alert || false,
      medical_conditions: medicalResponse.data?.medical_conditions || '',
      medications: medicalResponse.data?.medications || [],
      last_vaccination: medicalResponse.data?.last_vaccination || '',
      medical_emergency_document: medicalResponse.data?.medical_emergency_document || '',
      care_instructions: careInstructionsResponse.data ? {
        feeding_schedule: careInstructionsResponse.data.feeding_schedule || '',
        morning_routine: careInstructionsResponse.data.morning_routine || '',
        evening_routine: careInstructionsResponse.data.evening_routine || '',
        allergies: careInstructionsResponse.data.allergies || '',
        behavioral_notes: careInstructionsResponse.data.behavioral_notes || '',
        favorite_activities: careInstructionsResponse.data.favorite_activities || ''
      } : null,
      badges: professionalResponse.data?.badges || [],
      support_animal_status: professionalResponse.data?.support_animal_status || '',
      experiences: experiencesResponse.data || [],
      achievements: achievementsResponse.data || [],
      training: trainingResponse.data || [],
      reviews: reviewsResponse.data || [],
      travel_locations: travelResponse.data || [],
      gallery_photos: galleryResponse.data || [],
      documents: documentsResponse.data || []
    };

    // Generate HTML content based on type
    let htmlContent: string;
    if (type === 'full') {
      htmlContent = generateFullPetProfilePDF(comprehensivePetData);
    } else if (type === 'care') {
      htmlContent = generateCareInstructionsPDF(comprehensivePetData);
    } else {
      htmlContent = generateEmergencyProfilePDF(comprehensivePetData);
    }

    // Store the HTML document
    const fileName = `${petId}/${type}-profile-${Date.now()}.html`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pet_pdfs')
      .upload(fileName, new Blob([htmlContent], { type: 'text/html' }), {
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pet_pdfs')
      .getPublicUrl(fileName);

    console.log('PDF generated successfully:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfUrl: publicUrl,
        fileName: fileName,
        type: type
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Emergency Profile PDF with improved structure
function generateEmergencyProfilePDF(petData: ComprehensivePetData): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PetPort - Emergency Profile for ${petData.name}</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #ef4444; 
            padding-bottom: 15px; 
            margin-bottom: 25px;
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            padding: 20px;
            border-radius: 10px;
        }
        .pet-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #ef4444; 
            margin: 10px 0;
        }
        .pet-subtitle { 
            font-size: 18px; 
            color: #991b1b; 
            margin: 5px 0;
        }
        .emergency-alert {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 3px solid #ef4444;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 25px 0;
            color: #991b1b;
        }
        .medical-conditions {
            background-color: #fef2f2; 
            border: 3px solid #ef4444; 
            color: #991b1b;
            font-weight: bold;
            text-align: center;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 18px;
        }
        .section { 
            margin-bottom: 25px; 
            border: 2px solid #e2e8f0; 
            padding: 20px; 
            border-radius: 8px;
            background: #fafafa;
        }
        .section.emergency { 
            background-color: #fef2f2; 
            border-color: #ef4444;
            border-width: 3px;
        }
        .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #2563eb; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #e2e8f0; 
            padding-bottom: 8px;
            display: flex;
            align-items: center;
        }
        .section.emergency .section-title { 
            color: #ef4444;
        }
        .section-icon {
            margin-right: 10px;
            font-size: 20px;
        }
        .field { 
            margin-bottom: 12px;
        }
        .field-label { 
            font-weight: bold; 
            color: #374151;
            display: inline-block;
            min-width: 140px;
        }
        .field-value { 
            margin-left: 10px;
            color: #111827;
        }
        .medications {
            background-color: #fef2f2;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border: 2px solid #ef4444;
        }
        .medication-item {
            padding: 5px 0;
            border-bottom: 1px solid #fee2e2;
            font-weight: bold;
            color: #991b1b;
        }
        .photo-section {
            text-align: center;
            margin: 25px 0;
            background: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #e2e8f0;
        }
        .photo {
            max-width: 200px;
            max-height: 200px;
            border-radius: 10px;
            border: 2px solid #d1d5db;
            margin: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 2px solid #e2e8f0;
            padding-top: 15px;
        }
        .qr-section {
            text-align: center;
            background: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #2563eb;
            margin: 25px 0;
        }
        .allergies-section {
            background-color: #fef7cd;
            border: 2px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚨 PetPort Emergency Profile</h1>
        <div class="pet-name">${petData.name}</div>
        <div class="pet-subtitle">${petData.species ? petData.species.charAt(0).toUpperCase() + petData.species.slice(1) : ''} ${petData.breed ? '• ' + petData.breed : ''}</div>
        <div class="pet-subtitle">ID: ${petData.pet_pass_id} ${petData.microchip_id ? '• Microchip: ' + petData.microchip_id : ''}</div>
    </div>

    ${petData.photo_url ? `
    <div class="photo-section">
        <h3>📸 Pet Photo</h3>
        <img src="${petData.photo_url}" alt="${petData.name}" class="photo" />
    </div>
    ` : ''}

    ${petData.medical_alert && petData.medical_conditions ? `
    <div class="medical-conditions">
        <div style="font-size: 24px; margin-bottom: 10px;">⚠️ MEDICAL ALERT</div>
        <div style="font-size: 20px; color: #dc2626;">${petData.medical_conditions}</div>
    </div>
    ` : ''}

    <div class="section emergency">
        <div class="section-title">
            <span class="section-icon">🚨</span>Emergency Contacts
        </div>
        <div class="field">
            <span class="field-label">Primary Emergency:</span>
            <span class="field-value">${petData.emergency_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Secondary Emergency:</span>
            <span class="field-value">${petData.second_emergency_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Veterinarian:</span>
            <span class="field-value">${petData.vet_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Pet Caretaker:</span>
            <span class="field-value">${petData.pet_caretaker || 'Not provided'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">
            <span class="section-icon">💊</span>Medical Information
        </div>
        ${petData.medications && petData.medications.length > 0 ? `
        <div class="medications">
            <h4 style="margin-top: 0; color: #991b1b;">Current Medications:</h4>
            ${petData.medications.map(med => `<div class="medication-item">💊 ${med}</div>`).join('')}
        </div>
        ` : ''}
        ${petData.care_instructions?.allergies ? `
        <div class="allergies-section">
            <h4 style="margin-top: 0; color: #92400e;">⚠️ Allergies & Sensitivities:</h4>
            <div style="font-weight: bold; color: #92400e;">${petData.care_instructions.allergies}</div>
        </div>
        ` : ''}
        <div class="field">
            <span class="field-label">Last Vaccination:</span>
            <span class="field-value">${petData.last_vaccination || 'Not recorded'}</span>
        </div>
    </div>

    ${petData.care_instructions ? `
    <div class="section">
        <div class="section-title">
            <span class="section-icon">📝</span>Essential Care Notes
        </div>
        ${petData.care_instructions.behavioral_notes ? `
        <div class="field">
            <span class="field-label">Behavioral Notes:</span>
            <div class="field-value">${petData.care_instructions.behavioral_notes}</div>
        </div>
        ` : ''}
        ${petData.care_instructions.feeding_schedule ? `
        <div class="field">
            <span class="field-label">Feeding Schedule:</span>
            <div class="field-value">${petData.care_instructions.feeding_schedule}</div>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <div class="qr-section">
        <h3>📱 Live Profile Access</h3>
        <p>Scan QR code or visit: <strong>${window.location.origin}/profile/${petData.id}</strong></p>
        <p><em>For most up-to-date information and full profile</em></p>
    </div>

    <div class="footer">
        <strong>🚨 PetPort Emergency Profile</strong><br>
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
        This document contains critical emergency information for ${petData.name}.<br>
        <em>In case of emergency, contact the numbers listed above immediately.</em>
    </div>
</body>
</html>
  `;
}

// Keep existing generatePetPDF function for backward compatibility
function generatePetPDF(petData: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PetPort - ${petData.name}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.4;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #2563eb; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
        }
        .pet-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2563eb; 
            margin: 5px 0;
        }
        .pet-id { 
            font-size: 14px; 
            color: #666; 
            margin: 5px 0;
        }
        .section { 
            margin-bottom: 20px; 
            border: 1px solid #ddd; 
            padding: 15px; 
            border-radius: 5px;
        }
        .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #2563eb; 
            margin-bottom: 10px; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 5px;
        }
        .emergency { 
            background-color: #fef2f2; 
            border-color: #ef4444;
        }
        .emergency .section-title { 
            color: #ef4444;
        }
        .medical-alert { 
            background-color: #fef2f2; 
            border: 2px solid #ef4444; 
            color: #991b1b;
        }
        .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 10px;
        }
        .field { 
            margin-bottom: 8px;
        }
        .field-label { 
            font-weight: bold; 
            color: #555;
        }
        .field-value { 
            margin-left: 10px;
        }
        .photo-section {
            text-align: center;
            margin: 20px 0;
        }
        .photo {
            max-width: 200px;
            max-height: 200px;
            border-radius: 10px;
            border: 2px solid #ddd;
            margin: 5px;
        }
        .medications {
            background-color: #f8fafc;
            padding: 10px;
            border-radius: 5px;
            margin-top: 5px;
        }
        .medication-item {
            padding: 3px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PetPort Emergency Passport</h1>
        <div class="pet-name">${petData.name}</div>
        <div class="pet-id">ID: ${petData.pet_pass_id}</div>
        <div class="pet-id">Microchip: ${petData.microchip_id}</div>
    </div>

    ${petData.photo_url ? `
    <div class="photo-section">
        <img src="${petData.photo_url}" alt="${petData.name}" class="photo" />
        ${petData.full_body_photo_url ? `<img src="${petData.full_body_photo_url}" alt="${petData.name} full body" class="photo" />` : ''}
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">Basic Information</div>
        <div class="grid">
            <div class="field">
                <span class="field-label">Species:</span>
                <span class="field-value">${petData.species || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="field-label">Breed:</span>
                <span class="field-value">${petData.breed || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="field-label">Age:</span>
                <span class="field-value">${petData.age || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="field-label">Weight:</span>
                <span class="field-value">${petData.weight || 'Not specified'}</span>
            </div>
            ${petData.state ? `
            <div class="field">
                <span class="field-label">State:</span>
                <span class="field-value">${petData.state}</span>
            </div>
            ` : ''}
            ${petData.county ? `
            <div class="field">
                <span class="field-label">County:</span>
                <span class="field-value">${petData.county}</span>
            </div>
            ` : ''}
        </div>
        ${petData.notes ? `
        <div class="field">
            <span class="field-label">Notes:</span>
            <div class="field-value">${petData.notes}</div>
        </div>
        ` : ''}
    </div>

    ${petData.medical_alert ? `
    <div class="section medical-alert">
        <div class="section-title">⚠️ MEDICAL ALERT</div>
        <div style="font-weight: bold; font-size: 16px;">${petData.medical_conditions}</div>
    </div>
    ` : ''}

    <div class="section emergency">
        <div class="section-title">Emergency Contacts</div>
        <div class="field">
            <span class="field-label">Primary Emergency:</span>
            <span class="field-value">${petData.emergency_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Secondary Emergency:</span>
            <span class="field-value">${petData.second_emergency_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Veterinarian:</span>
            <span class="field-value">${petData.vet_contact || 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="field-label">Pet Caretaker:</span>
            <span class="field-value">${petData.pet_caretaker || 'Not provided'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Medical Information</div>
        <div class="field">
            <span class="field-label">Last Vaccination:</span>
            <span class="field-value">${petData.last_vaccination || 'Not recorded'}</span>
        </div>
        ${petData.medications && petData.medications.length > 0 ? `
        <div class="field">
            <span class="field-label">Current Medications:</span>
            <div class="medications">
                ${petData.medications.map(med => `<div class="medication-item">${med}</div>`).join('')}
            </div>
        </div>
        ` : ''}
    </div>

    <div class="footer">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
        This document contains important information for ${petData.name}'s care and emergency situations.
    </div>
</body>
</html>
  `;
}
