import jsPDF from 'jspdf';
import { sanitizeText } from '@/utils/inputSanitizer';
import { generatePublicMissingUrl, generateQRCodeUrl } from '@/services/pdfService';
export interface ClientPDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  blob?: Blob; // Alias for compatibility
  fileName?: string;
  error?: string;
  type?: string;
}

// Data normalization helper to unify snake_case and camelCase coming from various sources
function normalizePetData(raw: any): any {
  const pet = raw || {};
  const normalized: any = {
    // Basic identity
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    weight: pet.weight,
    gender: pet.gender || pet.sex,
    color: pet.color,

    // Photos
    photoUrl: pet.photoUrl || pet.photo_url || pet.photo || pet.photos?.[0]?.url,
    fullBodyPhotoUrl: pet.fullBodyPhotoUrl || pet.full_body_photo_url,
    gallery_photos: (pet.gallery_photos || pet.galleryPhotos || []).map((p: any) => ({
      url: p.url || p.photo_url || p.src,
      caption: p.caption || p.alt || '',
    })),

    // Identifiers
    microchipId: pet.microchipId || pet.microchip_id,
    petport_id: pet.petport_id || pet.petportId || pet.petportID,
    height: pet.height,
    registrationNumber: pet.registrationNumber || pet.registration_number,

    // Location
    county: pet.county,
    state: pet.state,

    // Bio / notes
    bio: pet.bio,
    notes: pet.notes,

    // Medical
    medicalAlert: pet.medicalAlert ?? pet.medical_alert ?? false,
    medical_alert: pet.medical_alert ?? pet.medicalAlert ?? false, // keep snake for templates using it
    medicalConditions: pet.medicalConditions || pet.medical_conditions,
    medical_conditions: pet.medical_conditions || pet.medicalConditions,
    medications: Array.isArray(pet.medications) ? pet.medications : (pet.medications ? [pet.medications] : []),
    last_vaccination: pet.last_vaccination,
    medical_emergency_document: pet.medical_emergency_document,

    // Care instructions (both nested and flat for compatibility)
    careInstructions: {
      feedingSchedule: pet.careInstructions?.feedingSchedule || pet.feeding_schedule,
      morningRoutine: pet.careInstructions?.morningRoutine || pet.morning_routine,
      eveningRoutine: pet.careInstructions?.eveningRoutine || pet.evening_routine,
      allergies: pet.careInstructions?.allergies || pet.allergies,
      medications: pet.careInstructions?.medications || (Array.isArray(pet.medications) ? pet.medications.join(', ') : pet.medications),
      specialNeeds: pet.careInstructions?.specialNeeds,
      exerciseRequirements: pet.careInstructions?.exerciseRequirements,
      behavioralNotes: pet.careInstructions?.behavioralNotes || pet.behavioral_notes,
      favoriteActivities: pet.careInstructions?.favoriteActivities || pet.favorite_activities,
    },
    feeding_schedule: pet.feeding_schedule || pet.careInstructions?.feedingSchedule,
    morning_routine: pet.morning_routine || pet.careInstructions?.morningRoutine,
    evening_routine: pet.evening_routine || pet.careInstructions?.eveningRoutine,
    allergies: pet.allergies || pet.careInstructions?.allergies,
    behavioral_notes: pet.behavioral_notes || pet.careInstructions?.behavioralNotes,
    favorite_activities: pet.favorite_activities || pet.careInstructions?.favoriteActivities,

    // Contacts (both camel and snake)
    emergencyContact: pet.emergencyContact || pet.emergency_contact || pet.contacts?.emergency_contact,
    secondEmergencyContact: pet.secondEmergencyContact || pet.second_emergency_contact || pet.contacts?.second_emergency_contact,
    vetContact: pet.vetContact || pet.vet_contact || pet.contacts?.vet_contact,
    petCaretaker: pet.petCaretaker || pet.pet_caretaker || pet.contacts?.pet_caretaker,
    emergency_contact: pet.emergency_contact || pet.emergencyContact,
    second_emergency_contact: pet.second_emergency_contact || pet.secondEmergencyContact,
    vet_contact: pet.vet_contact || pet.vetContact,
    pet_caretaker: pet.pet_caretaker || pet.petCaretaker,

    // Lost pet data
    is_missing: pet.is_missing ?? pet.lost_pet_data?.is_missing ?? false,
    last_seen_location: pet.last_seen_location || pet.lost_pet_data?.last_seen_location,
    last_seen_date: pet.last_seen_date || pet.lost_pet_data?.last_seen_date,
    last_seen_time: pet.last_seen_time || pet.lost_pet_data?.last_seen_time,
    distinctive_features: pet.distinctive_features || pet.lost_pet_data?.distinctive_features,
    finder_instructions: pet.finder_instructions || pet.lost_pet_data?.finder_instructions,
    reward_amount: pet.reward_amount || pet.lost_pet_data?.reward_amount,
    contact_priority: pet.contact_priority || pet.lost_pet_data?.contact_priority,
    emergency_notes: pet.emergency_notes || pet.lost_pet_data?.emergency_notes,

    // Professional / credentials
    support_animal_status: pet.support_animal_status || pet.professional_data?.support_animal_status,
    badges: pet.badges || pet.professional_data?.badges || [],

    // Collections
    documents: pet.documents || [],
    training: pet.training || [],
    certifications: pet.certifications || [],
    reviews: pet.reviews || pet.professional_reviews || [],
    experiences: pet.experiences || [],
    achievements: pet.achievements || [],
    travel_locations: pet.travel_locations || [],
  };

  return normalized;
}

// Page management system
class PDFPageManager {
  private doc: jsPDF;
  private currentY: number = 25;
  private currentX: number = 15;
  private pageHeight: number = 280;
  private pageWidth: number = 200;
  private leftMargin: number = 15;
  private rightMargin: number = 15;
  private topMargin: number = 20;
  private bottomMargin: number = 20;

  constructor(doc: jsPDF) {
    this.doc = doc;
    this.pageHeight = doc.internal.pageSize.height - this.topMargin - this.bottomMargin;
    this.pageWidth = doc.internal.pageSize.width - this.leftMargin - this.rightMargin;
    this.currentX = this.leftMargin;
  }

  getCurrentY(): number {
    return this.currentY;
  }

  getCurrentX(): number {
    return this.currentX;
  }

  getX(): number {
    return this.currentX;
  }

  setX(x: number): void {
    this.currentX = x;
  }

  addY(amount: number): void {
    this.currentY += amount;
  }

  checkPageSpace(contentHeight: number, forceNewPage: boolean = false): void {
    if (forceNewPage || (this.currentY + contentHeight) > this.pageHeight) {
      this.doc.addPage();
      this.currentY = this.topMargin;
      this.currentX = this.leftMargin;
    }
  }

  getContentWidth(): number {
    return this.pageWidth;
  }

  getLeftMargin(): number {
    return this.leftMargin;
  }

  setY(y: number): void {
    this.currentY = y;
  }
}

// Image utilities
const loadImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load image:', error);
    throw error;
  }
};

const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = base64;
  });
};

// Content rendering functions
const addTitle = (doc: jsPDF, pageManager: PDFPageManager, text: string, color: string = '#dc2626', fontSize: number = 20): void => {
  pageManager.checkPageSpace(15);
  doc.setFontSize(fontSize);
  doc.setTextColor(color);
  doc.setFont('helvetica', 'bold');
  
  const textWidth = doc.getTextWidth(text);
  const x = (doc.internal.pageSize.width - textWidth) / 2;
  doc.text(text, x, pageManager.getCurrentY());
  pageManager.addY(fontSize / 2);
};

const addSubtitle = (doc: jsPDF, pageManager: PDFPageManager, text: string, color: string = '#374151', fontSize: number = 14): void => {
  pageManager.checkPageSpace(10);
  doc.setFontSize(fontSize);
  doc.setTextColor(color);
  doc.setFont('helvetica', 'bold');
  doc.text(text, pageManager.getX(), pageManager.getCurrentY());
  pageManager.addY(fontSize / 2 + 5);
};

const addText = (doc: jsPDF, pageManager: PDFPageManager, text: string, color: string = '#000000', fontSize: number = 10): void => {
  pageManager.checkPageSpace(8);
  doc.setFontSize(fontSize);
  doc.setTextColor(color);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(sanitizeText(text), pageManager.getContentWidth());
  doc.text(lines, pageManager.getCurrentX(), pageManager.getCurrentY());
  pageManager.addY(lines.length * (fontSize / 2) + 2);
};

const addContactCard = (doc: jsPDF, pageManager: PDFPageManager, title: string, content: string, borderColor: string = '#dc2626'): void => {
  const cardHeight = 25;
  pageManager.checkPageSpace(cardHeight);
  
  const x = pageManager.getLeftMargin();
  const y = pageManager.getCurrentY() - 5;
  const width = pageManager.getContentWidth();
  
  // Draw border
  doc.setDrawColor(borderColor);
  doc.setLineWidth(0.5);
  doc.rect(x, y, width, cardHeight);
  
  // Add title
  doc.setFontSize(10);
  doc.setTextColor(borderColor);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x + 3, pageManager.getCurrentY() + 3);
  
  // Add content
  pageManager.addY(8);
  doc.setFontSize(9);
  doc.setTextColor('#000000');
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(sanitizeText(content), width - 6);
  doc.text(lines, x + 3, pageManager.getCurrentY());
  
  pageManager.addY(Math.max(cardHeight - 8, lines.length * 4) + 5);
};

const addImage = async (doc: jsPDF, pageManager: PDFPageManager, imageUrl: string, maxWidth: number = 80, maxHeight: number = 60, customX?: number): Promise<void> => {
  try {
    pageManager.checkPageSpace(maxHeight + 10);
    
    const base64 = await loadImageAsBase64(imageUrl);
    const dimensions = await getImageDimensions(base64);
    
    // Calculate scaled dimensions
    const aspectRatio = dimensions.width / dimensions.height;
    let width = Math.min(maxWidth, dimensions.width);
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    const x = customX !== undefined ? customX : pageManager.getLeftMargin() + (pageManager.getContentWidth() - width) / 2;
    doc.addImage(base64, 'JPEG', x, pageManager.getCurrentY(), width, height);
    pageManager.addY(height + 10);
  } catch (error) {
    console.error('Failed to add image:', error);
    // Skip image if loading fails
  }
};

const addSection = (doc: jsPDF, pageManager: PDFPageManager, title: string, content: () => void): void => {
  pageManager.checkPageSpace(20);
  addSubtitle(doc, pageManager, title);
  content();
  pageManager.addY(10);
};

// Compact section with tighter spacing for lost pet flyer
const addCompactSection = (doc: jsPDF, pageManager: PDFPageManager, title: string, content: () => void): void => {
  pageManager.checkPageSpace(16);
  addSubtitle(doc, pageManager, title);
  content();
  pageManager.addY(6);
};

// Footer renderer pinned near the bottom of the page (centered)
const addFooterBottom = (doc: jsPDF, pageManager: PDFPageManager, lines: string[]): void => {
  const bottomY = doc.internal.pageSize.height - 8; // 8mm from bottom edge
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#6b7280');
  lines.forEach((t, idx) => {
    const textWidth = doc.getTextWidth(t);
    const x = (doc.internal.pageSize.width - textWidth) / 2;
    // Stack multiple lines upward (4mm line height)
    doc.text(t, x, bottomY - ((lines.length - 1 - idx) * 4));
  });
};
// PDF generation functions by type
const generateEmergencyPDF = async (doc: jsPDF, pageManager: PDFPageManager, petData: any): Promise<void> => {
  const safeText = (text: string) => sanitizeText(text || '');
  
  // Header
  addTitle(doc, pageManager, 'EMERGENCY PROFILE', '#dc2626', 18);
  addTitle(doc, pageManager, safeText(petData.name), '#dc2626', 16);
  pageManager.addY(10);
  
  // Pet photo
  if (petData.photoUrl) {
    await addImage(doc, pageManager, petData.photoUrl, 60, 60);
  }
  
  // Critical medical information
  const medications = petData.medications || [];
  const allergies = petData.careInstructions?.allergies || '';
  const medicalAlert = petData.medicalAlert || false;
  
  if (medicalAlert || medications.length > 0 || allergies) {
    addSection(doc, pageManager, 'CRITICAL MEDICAL INFO', () => {
      if (medicalAlert) {
        addText(doc, pageManager, 'MEDICAL ALERT ACTIVE', '#dc2626', 12);
        if (petData.medicalConditions) {
          addText(doc, pageManager, `Conditions: ${safeText(petData.medicalConditions)}`, '#dc2626', 10);
        }
      }
      if (medications.length > 0) {
        addText(doc, pageManager, `Medications: ${medications.join(', ')}`, '#000000', 10);
      }
      if (allergies) {
        addText(doc, pageManager, `Allergies: ${allergies}`, '#000000', 10);
      }
    });
  }
  
  // Pet information
  addSection(doc, pageManager, 'PET INFORMATION', () => {
    addText(doc, pageManager, `Species: ${safeText(petData.species)}`);
    addText(doc, pageManager, `Breed: ${safeText(petData.breed)}`);
    addText(doc, pageManager, `Age: ${safeText(petData.age)}`);
    addText(doc, pageManager, `Weight: ${safeText(petData.weight)}`);
    if (petData.height) addText(doc, pageManager, `Height: ${safeText(petData.height)}`);
    addText(doc, pageManager, `Gender: ${safeText(petData.gender)}`);
    if (petData.color) addText(doc, pageManager, `Color: ${safeText(petData.color)}`);
    if (petData.microchipId) addText(doc, pageManager, `Microchip: ${safeText(petData.microchipId)}`);
    if (petData.registrationNumber) addText(doc, pageManager, `Registration: ${safeText(petData.registrationNumber)}`);
  });
  
  // Emergency contacts
  addSubtitle(doc, pageManager, 'EMERGENCY CONTACTS', '#1d4ed8');
  
  if (petData.emergencyContact) {
    addContactCard(doc, pageManager, 'PRIMARY EMERGENCY CONTACT', petData.emergencyContact, '#dc2626');
  }
  
  if (petData.secondEmergencyContact) {
    addContactCard(doc, pageManager, 'SECONDARY EMERGENCY CONTACT', petData.secondEmergencyContact, '#f59e0b');
  }
  
  if (petData.vetContact) {
    addContactCard(doc, pageManager, 'VETERINARIAN', petData.vetContact, '#059669');
  }
  
  if (petData.petCaretaker) {
    addContactCard(doc, pageManager, 'PET CARETAKER', petData.petCaretaker, '#7c3aed');
  }
  
  // Additional information
  if (petData.bio) {
    addSection(doc, pageManager, 'IMPORTANT NOTES', () => {
      addText(doc, pageManager, petData.bio);
    });
  }
  
  // Footer
  pageManager.addY(20);
  addText(doc, pageManager, 'Generated from PetPort Digital Pet Passport', '#6b7280', 8);
  addText(doc, pageManager, `Pet ID: ${safeText(petData.id)} | Generated: ${new Date().toLocaleDateString()}`, '#6b7280', 8);
};

const generateLostPetPDF = async (doc: jsPDF, pageManager: PDFPageManager, petData: any): Promise<void> => {
  const safeText = (text: string) => sanitizeText(text || '');
  
  console.log('generateLostPetPDF - Pet data received:', {
    name: petData.name,
    emergencyContact: petData.emergencyContact,
    emergencyContact2: petData.second_emergency_contact,
    lastSeenLocation: petData.last_seen_location,
    distinctiveFeatures: petData.distinctive_features,
    keys: Object.keys(petData)
  });
  
  // Red banner across the top
  doc.setFillColor(220, 38, 38); // Red color (#dc2626)
  doc.rect(0, 0, 210, 25, 'F'); // Full width red banner
  
  // White text on red banner
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const bannerText = 'MISSING PET ALERT';
  const textWidth = doc.getTextWidth(bannerText);
  doc.text(bannerText, (210 - textWidth) / 2, 18); // Centered text
  
  // Reset text color and move cursor below banner
  doc.setTextColor(0, 0, 0);
  pageManager.setY(35);
  
  // Pet name in large red text
addTitle(doc, pageManager, safeText(petData.name), '#dc2626', 20);
pageManager.addY(6);
  
  // Create two columns: left for photo, right for info
  const leftColumnX = 20;
  const rightColumnX = 110;
  const currentY = pageManager.getCurrentY();
  
  // Smaller pet photo (60x60) on the left
  if (petData.photoUrl) {
    await addImage(doc, pageManager, petData.photoUrl, 60, 60, leftColumnX);
  }
  
  // Pet information on the right side
  pageManager.setY(currentY);
  const originalX = pageManager.getX();
  pageManager.setX(rightColumnX);
  
  addSection(doc, pageManager, 'PET DETAILS', () => {
    addText(doc, pageManager, `Name: ${safeText(petData.name)}`, '#000000', 11);
    addText(doc, pageManager, `Breed: ${safeText(petData.breed)}`, '#000000', 11);
    addText(doc, pageManager, `Age: ${safeText(petData.age)}`, '#000000', 11);
    addText(doc, pageManager, `Weight: ${safeText(petData.weight)}`, '#000000', 11);
    if (petData.height) addText(doc, pageManager, `Height: ${safeText(petData.height)}`, '#000000', 11);
    if (petData.species) addText(doc, pageManager, `Color: ${safeText(petData.species)}`, '#000000', 11);
    if (petData.microchipId) addText(doc, pageManager, `Microchip: ${safeText(petData.microchipId)}`, '#000000', 11);
    if (petData.registrationNumber) addText(doc, pageManager, `Registration: ${safeText(petData.registrationNumber)}`, '#000000', 11);
  });
  
  // Reset X position and move below both columns
  pageManager.setX(originalX);
  pageManager.setY(Math.max(currentY + 70, pageManager.getCurrentY()));
  
  // Emergency contact information - compact format
  pageManager.addY(4);
  addCompactSection(doc, pageManager, 'EMERGENCY CONTACT', () => {
    // Try different possible property names for emergency contacts
    const primaryContact = petData.emergencyContact || petData.emergency_contact || petData.emergency_contacts?.[0];
    const secondaryContact = petData.secondEmergencyContact || petData.second_emergency_contact || petData.emergency_contacts?.[1];
    const vetContact = petData.vetContact || petData.vet_contact;
    
    // Combine all contacts into compact lines
    if (primaryContact && secondaryContact) {
      addText(doc, pageManager, `Primary: ${safeText(primaryContact)} | Secondary: ${safeText(secondaryContact)}`, '#000000', 12);
    } else if (primaryContact) {
      addText(doc, pageManager, `Primary: ${safeText(primaryContact)}`, '#000000', 12);
    } else if (secondaryContact) {
      addText(doc, pageManager, `Contact: ${safeText(secondaryContact)}`, '#000000', 12);
    }
    if (vetContact) {
      addText(doc, pageManager, `Vet: ${safeText(vetContact)}`, '#000000', 12);
    }
    addText(doc, pageManager, `PetPort ID: ${safeText(petData.id)}`, '#000000', 11);
  });
  
  // Last seen information (if available from lost pet data)
  if (petData.last_seen_location || petData.last_seen_date) {
    pageManager.addY(4);
    addCompactSection(doc, pageManager, 'LAST SEEN', () => {
      let lastSeenText = '';
      if (petData.last_seen_location) {
        lastSeenText += `Location: ${safeText(petData.last_seen_location)}`;
      }
      if (petData.last_seen_date) {
        const dateStr = petData.last_seen_date instanceof Date 
          ? petData.last_seen_date.toLocaleDateString()
          : new Date(petData.last_seen_date).toLocaleDateString();
        lastSeenText += lastSeenText ? ` | Date: ${dateStr}` : `Date: ${dateStr}`;
      }
      if (petData.last_seen_time) {
        lastSeenText += lastSeenText ? ` | Time: ${safeText(petData.last_seen_time)}` : `Time: ${safeText(petData.last_seen_time)}`;
      }
      addText(doc, pageManager, lastSeenText, '#000000', 12);
    });
  }
  
  // Special markings/description
  if (petData.bio || petData.distinctive_features) {
    pageManager.addY(4);
    addCompactSection(doc, pageManager, 'DISTINCTIVE FEATURES', () => {
      if (petData.distinctive_features) {
        addText(doc, pageManager, safeText(petData.distinctive_features), '#000000', 12);
      } else if (petData.bio) {
        addText(doc, pageManager, safeText(petData.bio), '#000000', 12);
      }
    });
  }
  
  // Medical alerts
  if (petData.medicalAlert && petData.medicalConditions) {
    pageManager.addY(4);
    addCompactSection(doc, pageManager, 'MEDICAL ALERT', () => {
      addText(doc, pageManager, safeText(petData.medicalConditions), '#dc2626', 12);
      if (petData.medications && petData.medications.length > 0) {
        addText(doc, pageManager, `Medications: ${petData.medications.join(', ')}`, '#000000', 11);
      }
    });
  }
  
  // Additional Photos Section - Horizontal layout with up to 3 photos
  const additionalPhotos = [];
  
  // Add full body photo if available
  if (petData.fullBodyPhotoUrl) {
    additionalPhotos.push({ url: petData.fullBodyPhotoUrl, caption: 'Full Body Photo' });
  }
  
  // Add gallery photos (up to 2 more)
  if (petData.gallery_photos && petData.gallery_photos.length > 0) {
    const galleryCount = Math.min(2, petData.gallery_photos.length);
    for (let i = 0; i < galleryCount; i++) {
      additionalPhotos.push({
        url: petData.gallery_photos[i].url,
        caption: petData.gallery_photos[i].caption || `Photo ${i + 1}`
      });
    }
  }
  
  if (additionalPhotos.length > 0) {
    pageManager.addY(4);
    addText(doc, pageManager, 'IDENTIFICATION PHOTOS', '#dc2626', 12);
    pageManager.addY(3);
    
    const startY = pageManager.getCurrentY();
    const photoSize = 35;
    const spacing = 50; // Photo width + margin
    const startX = 20;
    
    // Limit to 2 additional photos for compact design
    for (let i = 0; i < additionalPhotos.length && i < 2; i++) {
      const photoX = startX + (i * spacing);
      
      // Draw photo without advancing Y cursor
      try {
        const base64 = await loadImageAsBase64(additionalPhotos[i].url);
        doc.addImage(base64, 'JPEG', photoX, startY, photoSize, photoSize);
      } catch (error) {
        console.error('Error adding image:', error);
      }
      
      // Add caption below photo
      const captionY = startY + photoSize + 3;
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128); // Gray color
      const caption = additionalPhotos[i].caption.substring(0, 12); // Limit caption length
      doc.text(caption, photoX, captionY);
    }
    
    // Move cursor below the photos
    pageManager.setY(startY + photoSize + 12);
    doc.setTextColor(0, 0, 0); // Reset text color
  }
  
  // Combined Finder Instructions section
  pageManager.addY(4);
  addCompactSection(doc, pageManager, 'FINDER INSTRUCTIONS', () => {
    // Add custom instructions if available
    if (petData.finder_instructions) {
      addText(doc, pageManager, safeText(petData.finder_instructions), '#000000', 12);
      pageManager.addY(2);
    }
    // Standard instructions
    addText(doc, pageManager, '1. Approach calmly and speak softly', '#000000', 11);
    addText(doc, pageManager, '2. Check for identification tags or collar', '#000000', 11);
    addText(doc, pageManager, '3. Contact numbers listed above immediately', '#000000', 11);
    addText(doc, pageManager, '4. Keep pet safe and contained if possible', '#000000', 11);
    addText(doc, pageManager, '5. Pet may be scared and not respond to name', '#000000', 11);
  });

// Compact reward section
pageManager.addY(4);
// Render "REWARD OFFERED" and the amount on the same line
const rewardLabel = 'REWARD OFFERED';
const baseX = pageManager.getX();
const baseY = pageManager.getCurrentY();
doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor('#dc2626');
doc.text(rewardLabel, baseX, baseY);
let lineAdvance = 8;
if (petData.reward_amount) {
  const labelWidth = doc.getTextWidth(rewardLabel) + 3; // small gap
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor('#000000');
  doc.text(`${safeText(petData.reward_amount)}`, baseX + labelWidth, baseY);
}
pageManager.addY(lineAdvance);
addText(doc, pageManager, 'PLEASE CONTACT IMMEDIATELY IF FOUND!', '#dc2626', 12);
pageManager.addY(6);

// QR code linking to live missing pet page
try {
  const publicUrl = generatePublicMissingUrl(petData.id);
  const qrUrl = generateQRCodeUrl(publicUrl, 240);
  const base64 = await loadImageAsBase64(qrUrl);
  const qrSize = 36; // mm (reduced to fit within 2 pages)
  const x = (210 - qrSize) / 2;
  const y = pageManager.getCurrentY();
  doc.addImage(base64, 'PNG', x, y, qrSize, qrSize);
  pageManager.setY(y + qrSize + 4);
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  const label = 'Scan for live updates and contact info';
  const labelWidth = doc.getTextWidth(label);
  doc.text(label, (210 - labelWidth) / 2, pageManager.getCurrentY());
  pageManager.addY(4);
} catch (e) {
  console.warn('QR generation failed:', e);
}

// Footer pinned to bottom of the last page
addFooterBottom(doc, pageManager, [
  'Generated by Petport.app',
  `Generated: ${new Date().toLocaleDateString()}`,
]);
};

const generateGalleryPDF = async (doc: jsPDF, pageManager: PDFPageManager, petData: any): Promise<void> => {
  const safeText = (text: string) => sanitizeText(text || '');
  
  // Header
  addTitle(doc, pageManager, 'PetPort Photo Gallery', '#1e40af', 18);
  addTitle(doc, pageManager, safeText(petData.name), '#1e40af', 16);
  pageManager.addY(15);
  
  // Gallery photos
  const galleryPhotos = petData.gallery_photos || [];
  
  if (galleryPhotos.length > 0) {
    const photoSize = 55;
    const spacing = 60; // 55 photo width + 5 margin
    const startX = 20;
    const photosPerRow = 3;
    
    for (let i = 0; i < galleryPhotos.length; i += photosPerRow) {
      const startY = pageManager.getCurrentY();
      const rowPhotos = galleryPhotos.slice(i, i + photosPerRow);
      
      // Place photos horizontally in the same row
      for (let j = 0; j < rowPhotos.length; j++) {
        const photoX = startX + (j * spacing);
        
        // Draw photo without advancing Y cursor
        try {
          const base64 = await loadImageAsBase64(rowPhotos[j].url);
          doc.addImage(base64, 'JPEG', photoX, startY, photoSize, photoSize);
        } catch (error) {
          console.error('Error adding image:', error);
        }
        
        // Add caption below photo
        if (rowPhotos[j].caption) {
          const captionY = startY + photoSize + 5;
          doc.text(rowPhotos[j].caption, photoX, captionY, { maxWidth: photoSize });
        }
      }
      
      // Advance Y position for next row
      pageManager.addY(photoSize + 20); // Photo height + space for caption and row spacing
    }
  } else {
    addText(doc, pageManager, 'No photos available', '#6b7280');
  }
  
  // Footer
  pageManager.addY(20);
  addText(doc, pageManager, 'Generated from PetPort Digital Pet Passport', '#6b7280', 8);
};

// Generate comprehensive profile PDF
const generateFullPDF = async (doc: jsPDF, pageManager: PDFPageManager, petData: any): Promise<void> => {
  const safeText = (text: string) => sanitizeText(text || '');
  
  // Header
  addTitle(doc, pageManager, 'COMPLETE PET PROFILE', '#1e40af', 18);
  addTitle(doc, pageManager, safeText(petData.name), '#1e40af', 16);
  pageManager.addY(15);
  
  // Emergency Summary Section (for quick reference)
  addSection(doc, pageManager, 'EMERGENCY SUMMARY', () => {
    if (petData.emergency_contact) {
      addText(doc, pageManager, `Emergency Contact: ${safeText(petData.emergency_contact)}`, '#dc2626', 12);
    }
    if (petData.vet_contact) {
      addText(doc, pageManager, `Veterinarian: ${safeText(petData.vet_contact)}`, '#dc2626', 12);
    }
    if (petData.medical_alert) {
      addText(doc, pageManager, 'MEDICAL ALERT - See medical section for details', '#dc2626', 12);
    }
    if (petData.medications && petData.medications.length > 0) {
      addText(doc, pageManager, `Current Medications: ${petData.medications.join(', ')}`, '#dc2626', 10);
    }
  });
  
  // Pet photo
  if (petData.photoUrl) {
    await addImage(doc, pageManager, petData.photoUrl, 80, 80);
  }
  
  // Basic Pet Information
  addSection(doc, pageManager, 'PET INFORMATION', () => {
    addText(doc, pageManager, `Species: ${safeText(petData.species)}`);
    addText(doc, pageManager, `Breed: ${safeText(petData.breed)}`);
    addText(doc, pageManager, `Age: ${safeText(petData.age)}`);
    addText(doc, pageManager, `Weight: ${safeText(petData.weight)}`);
    if (petData.height) addText(doc, pageManager, `Height: ${safeText(petData.height)}`);
    addText(doc, pageManager, `Gender: ${safeText(petData.gender)}`);
    if (petData.color) addText(doc, pageManager, `Color: ${safeText(petData.color)}`);
    if (petData.microchipId) addText(doc, pageManager, `Microchip: ${safeText(petData.microchipId)}`);
    if (petData.registrationNumber) addText(doc, pageManager, `Registration: ${safeText(petData.registrationNumber)}`);
    if (petData.petport_id) addText(doc, pageManager, `PetPort ID: ${safeText(petData.petport_id)}`);
    if (petData.county) addText(doc, pageManager, `Location: ${safeText(petData.county)}, ${safeText(petData.state)}`);
  });
  
  // Biography
  if (petData.bio) {
    addSection(doc, pageManager, 'BIOGRAPHY', () => {
      addText(doc, pageManager, petData.bio);
    });
  }

  // Medical & Health Information
  addSection(doc, pageManager, 'MEDICAL & HEALTH INFORMATION', () => {
    if (petData.medical_alert) {
      addText(doc, pageManager, 'MEDICAL ALERT', '#dc2626', 12);
    }
    if (petData.medical_conditions) {
      addText(doc, pageManager, `Medical Conditions: ${safeText(petData.medical_conditions)}`);
    }
    if (petData.medications && petData.medications.length > 0) {
      addText(doc, pageManager, `Current Medications: ${petData.medications.join(', ')}`);
    }
    if (petData.last_vaccination) {
      addText(doc, pageManager, `Last Vaccination: ${safeText(petData.last_vaccination)}`);
    }
    if (petData.allergies) {
      addText(doc, pageManager, `Allergies: ${safeText(petData.allergies)}`);
    }
    if (petData.medical_emergency_document) {
      addText(doc, pageManager, `Emergency Medical Document: ${safeText(petData.medical_emergency_document)}`);
    }
  });

  // Care Instructions
  if (petData.feeding_schedule || petData.morning_routine || petData.evening_routine || petData.behavioral_notes || petData.favorite_activities) {
    addSection(doc, pageManager, 'CARE INSTRUCTIONS', () => {
      if (petData.feeding_schedule) {
        addText(doc, pageManager, `Feeding Schedule: ${safeText(petData.feeding_schedule)}`);
      }
      if (petData.morning_routine) {
        addText(doc, pageManager, `Morning Routine: ${safeText(petData.morning_routine)}`);
      }
      if (petData.evening_routine) {
        addText(doc, pageManager, `Evening Routine: ${safeText(petData.evening_routine)}`);
      }
      if (petData.behavioral_notes) {
        addText(doc, pageManager, `Behavioral Notes: ${safeText(petData.behavioral_notes)}`);
      }
      if (petData.favorite_activities) {
        addText(doc, pageManager, `Favorite Activities: ${safeText(petData.favorite_activities)}`);
      }
    });
  }

  // Contact Information
  addSection(doc, pageManager, 'CONTACT INFORMATION', () => {
    if (petData.emergency_contact) {
      addText(doc, pageManager, `Primary Emergency Contact: ${safeText(petData.emergency_contact)}`);
    }
    if (petData.second_emergency_contact) {
      addText(doc, pageManager, `Secondary Emergency Contact: ${safeText(petData.second_emergency_contact)}`);
    }
    if (petData.vet_contact) {
      addText(doc, pageManager, `Veterinarian: ${safeText(petData.vet_contact)}`);
    }
    if (petData.pet_caretaker) {
      addText(doc, pageManager, `Pet Caretaker: ${safeText(petData.pet_caretaker)}`);
    }
  });

  // Professional Status & Support Animal Information
  if (petData.support_animal_status || (petData.badges && petData.badges.length > 0)) {
    addSection(doc, pageManager, 'PROFESSIONAL STATUS', () => {
      if (petData.support_animal_status) {
        addText(doc, pageManager, `Support Animal Status: ${safeText(petData.support_animal_status)}`);
      }
      if (petData.badges && petData.badges.length > 0) {
        addText(doc, pageManager, `Professional Badges: ${petData.badges.join(', ')}`);
      }
    });
  }

  // Training & Education
  if (petData.training && petData.training.length > 0) {
    addSection(doc, pageManager, 'TRAINING & EDUCATION', () => {
      petData.training.forEach((training: any, index: number) => {
        addText(doc, pageManager, `${index + 1}. ${safeText(training.course)}`);
        if (training.facility) addText(doc, pageManager, `   Facility: ${safeText(training.facility)}`);
        if (training.completed) addText(doc, pageManager, `   Completed: ${safeText(training.completed)}`);
        if (training.phone) addText(doc, pageManager, `   Contact: ${safeText(training.phone)}`);
      });
    });
  }

  // Certifications
  if (petData.certifications && petData.certifications.length > 0) {
    addSection(doc, pageManager, 'CERTIFICATIONS', () => {
      petData.certifications.forEach((cert: any) => {
        addText(doc, pageManager, `• ${safeText(cert.type)} - ${safeText(cert.issuer)}`);
        if (cert.certification_number) addText(doc, pageManager, `  Number: ${safeText(cert.certification_number)}`);
        if (cert.issue_date) addText(doc, pageManager, `  Issued: ${safeText(cert.issue_date)}`);
        if (cert.expiry_date) addText(doc, pageManager, `  Expires: ${safeText(cert.expiry_date)}`);
        addText(doc, pageManager, `  Status: ${safeText(cert.status)}`);
        if (cert.notes) addText(doc, pageManager, `  Notes: ${safeText(cert.notes)}`);
      });
    });
  }

  // Professional References & Reviews
  if (petData.reviews && petData.reviews.length > 0) {
    addSection(doc, pageManager, 'PROFESSIONAL REFERENCES & REVIEWS', () => {
      const averageRating = petData.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / petData.reviews.length;
      addText(doc, pageManager, `Overall Rating: ${averageRating.toFixed(1)}/5 stars (${petData.reviews.length} reviews)`);
      pageManager.addY(3);

      petData.reviews.forEach((review: any, index: number) => {
        addText(doc, pageManager, `Review ${index + 1}: ${review.rating}/5 stars`);
        addText(doc, pageManager, `Reviewer: ${safeText(review.reviewer_name || 'Anonymous')}`);
        if (review.reviewer_contact) {
          addText(doc, pageManager, `Contact: ${safeText(review.reviewer_contact)}`);
        }
        if (review.text) {
          addText(doc, pageManager, `"${safeText(review.text)}"`);
        }
        if (review.date) {
          addText(doc, pageManager, `Date: ${safeText(review.date)}`);
        }
        if (review.location) {
          addText(doc, pageManager, `Location: ${safeText(review.location)}`);
        }
        if (review.type) {
          addText(doc, pageManager, `Service Type: ${safeText(review.type)}`);
        }
        pageManager.addY(5);
      });
    });
  }

  // Professional Experiences
  if (petData.experiences && petData.experiences.length > 0) {
    addSection(doc, pageManager, 'PROFESSIONAL EXPERIENCE', () => {
      petData.experiences.forEach((experience: any, index: number) => {
        addText(doc, pageManager, `${index + 1}. ${safeText(experience.activity)}`);
        if (experience.description) addText(doc, pageManager, `   Description: ${safeText(experience.description)}`);
        if (experience.contact) addText(doc, pageManager, `   Contact: ${safeText(experience.contact)}`);
      });
    });
  }

  // Achievements
  if (petData.achievements && petData.achievements.length > 0) {
    addSection(doc, pageManager, 'ACHIEVEMENTS', () => {
      petData.achievements.forEach((achievement: any, index: number) => {
        addText(doc, pageManager, `${index + 1}. ${safeText(achievement.title)}`);
        if (achievement.description) addText(doc, pageManager, `   ${safeText(achievement.description)}`);
      });
    });
  }

  // Travel History & Locations
  if (petData.travel_locations && petData.travel_locations.length > 0) {
    addSection(doc, pageManager, 'TRAVEL HISTORY', () => {
      petData.travel_locations.forEach((location: any, index: number) => {
        addText(doc, pageManager, `${index + 1}. ${safeText(location.name)} (${safeText(location.type)})`);
        if (location.date_visited) addText(doc, pageManager, `   Date Visited: ${safeText(location.date_visited)}`);
        if (location.code) addText(doc, pageManager, `   Location Code: ${safeText(location.code)}`);
        if (location.notes) addText(doc, pageManager, `   Notes: ${safeText(location.notes)}`);
      });
    });
  }

  // Documents Reference
  if (petData.documents && petData.documents.length > 0) {
    addSection(doc, pageManager, 'DOCUMENTS ON FILE', () => {
      addText(doc, pageManager, `Total Documents: ${petData.documents.length}`);
    petData.documents.forEach((document: any, index: number) => {
      addText(doc, pageManager, `${index + 1}. ${safeText(document.name)} (${safeText(document.type)})`);
      if (document.upload_date) addText(doc, pageManager, `   Uploaded: ${safeText(document.upload_date)}`);
      if (document.size) addText(doc, pageManager, `   Size: ${safeText(document.size)}`);
    });
    });
  }

  // Distinctive Features
  if (petData.distinctive_features) {
    addSection(doc, pageManager, 'DISTINCTIVE FEATURES', () => {
      addText(doc, pageManager, petData.distinctive_features);
    });
  }

  // Notes
  if (petData.notes) {
    addSection(doc, pageManager, 'ADDITIONAL NOTES', () => {
      addText(doc, pageManager, petData.notes);
    });
  }
  
  // Photo Gallery
  const galleryPhotos = petData.gallery_photos || [];
  if (galleryPhotos.length > 0) {
    pageManager.checkPageSpace(50, true); // Force new page for gallery
    addSubtitle(doc, pageManager, 'PHOTO GALLERY', '#1e40af');
    
    const photosToShow = galleryPhotos.slice(0, 8); // Show up to 8 photos
    const photoSize = 55;
    const spacing = 60; // 55 photo width + 5 margin
    const startX = 20;
    const photosPerRow = 3;
    
    for (let i = 0; i < photosToShow.length; i += photosPerRow) {
      const startY = pageManager.getCurrentY();
      const rowPhotos = photosToShow.slice(i, i + photosPerRow);
      
      // Place photos horizontally in the same row
      for (let j = 0; j < rowPhotos.length; j++) {
        const photoX = startX + (j * spacing);
        
        // Draw photo without advancing Y cursor
        try {
          const base64 = await loadImageAsBase64(rowPhotos[j].url);
          doc.addImage(base64, 'JPEG', photoX, startY, photoSize, photoSize);
        } catch (error) {
          console.error('Error adding image:', error);
        }
        
        // Add caption below photo
        if (rowPhotos[j].caption) {
          const captionY = startY + photoSize + 5;
          doc.text(rowPhotos[j].caption, photoX, captionY, { maxWidth: photoSize });
        }
      }
      
      // Advance Y position for next row
      pageManager.addY(photoSize + 20); // Photo height + space for caption and row spacing
    }
  }
  
  // Footer
  pageManager.addY(20);
  addText(doc, pageManager, 'Generated from PetPort Digital Pet Passport', '#6b7280', 8);
  addText(doc, pageManager, `Pet ID: ${safeText(petData.id)} | Generated: ${new Date().toLocaleDateString()}`, '#6b7280', 8);
};

/**
 * Generate a pet resume PDF with professional credentials and references
 */
const generateResumePDF = async (doc: jsPDF, pageManager: PDFPageManager, petData: any): Promise<void> => {
  const safeText = (text: string) => sanitizeText(text || '');
  
  // Header with pet name and title
  addTitle(doc, pageManager, `${safeText(petData.name)} - Professional Resume`, '#1e40af', 18);
  pageManager.addY(10);

  // Pet Basic Information
  addSubtitle(doc, pageManager, 'Pet Information');
  addText(doc, pageManager, `Name: ${safeText(petData.name)}`);
  addText(doc, pageManager, `Breed: ${safeText(petData.breed)}`);
  addText(doc, pageManager, `Age: ${safeText(petData.age)}`);
  if (petData.weight) {
    addText(doc, pageManager, `Weight: ${safeText(petData.weight)} lbs`);
  }
  if (petData.height) {
    addText(doc, pageManager, `Height: ${safeText(petData.height)}`);
  }
  if (petData.registrationNumber) {
    addText(doc, pageManager, `Registration: ${safeText(petData.registrationNumber)}`);
  }
  pageManager.addY(10);

  // Add pet photos if available
  if (petData.photoUrl) {
    try {
      await addImage(doc, pageManager, petData.photoUrl, 60, 60);
      pageManager.addY(10);
    } catch (error) {
      console.error('Error loading pet photo:', error);
    }
  }

  // Add first gallery photo if available
  if (petData.gallery_photos && petData.gallery_photos.length > 0) {
    try {
      await addImage(doc, pageManager, petData.gallery_photos[0].url, 60, 60);
      pageManager.addY(10);
    } catch (error) {
      console.error('Error loading gallery photo:', error);
    }
  }

  // Reviews Section
  if (petData.reviews && petData.reviews.length > 0) {
    addSection(doc, pageManager, 'Professional References & Reviews', () => {
      const averageRating = petData.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / petData.reviews.length;
      addText(doc, pageManager, `Overall Rating: ${averageRating.toFixed(1)}/5 stars (${petData.reviews.length} reviews)`);
      pageManager.addY(5);

      petData.reviews.forEach((review: any, index: number) => {
        addText(doc, pageManager, `Review ${index + 1}:`);
        addText(doc, pageManager, `Reviewer: ${safeText(review.reviewer_name || 'Anonymous')}`);
        if (review.reviewer_contact) {
          addText(doc, pageManager, `Contact: ${safeText(review.reviewer_contact)}`);
        }
        addText(doc, pageManager, `Rating: ${review.rating}/5 stars`);
        if (review.review_text) {
          addText(doc, pageManager, `Review: ${safeText(review.review_text)}`);
        }
        if (review.review_date) {
          addText(doc, pageManager, `Date: ${new Date(review.review_date).toLocaleDateString()}`);
        }
        if (review.location) {
          addText(doc, pageManager, `Location: ${safeText(review.location)}`);
        }
        if (review.review_type) {
          addText(doc, pageManager, `Type: ${safeText(review.review_type)}`);
        }
        pageManager.addY(8);
      });
    });
  }

  // Experiences Section
  if (petData.experiences && petData.experiences.length > 0) {
    addSection(doc, pageManager, 'Professional Experience', () => {
      petData.experiences.forEach((experience: any, index: number) => {
        addText(doc, pageManager, `Experience ${index + 1}:`);
        addText(doc, pageManager, `Activity: ${safeText(experience.activity)}`);
        if (experience.contact) {
          addText(doc, pageManager, `Contact: ${safeText(experience.contact)}`);
        }
        if (experience.description) {
          addText(doc, pageManager, `Description: ${safeText(experience.description)}`);
        }
        pageManager.addY(8);
      });
    });
  }

  // Achievements Section
  if (petData.achievements && petData.achievements.length > 0) {
    addSection(doc, pageManager, 'Achievements & Awards', () => {
      petData.achievements.forEach((achievement: any, index: number) => {
        addText(doc, pageManager, `Achievement ${index + 1}:`);
        addText(doc, pageManager, `Title: ${safeText(achievement.title)}`);
        if (achievement.description) {
          addText(doc, pageManager, `Description: ${safeText(achievement.description)}`);
        }
        pageManager.addY(8);
      });
    });
  }

  // Training Section
  if (petData.training && petData.training.length > 0) {
    addSection(doc, pageManager, 'Training & Education', () => {
      petData.training.forEach((training: any, index: number) => {
        addText(doc, pageManager, `Training ${index + 1}:`);
        addText(doc, pageManager, `Course: ${safeText(training.course)}`);
        if (training.facility) {
          addText(doc, pageManager, `Facility: ${safeText(training.facility)}`);
        }
        if (training.phone) {
          addText(doc, pageManager, `Contact: ${safeText(training.phone)}`);
        }
        if (training.completed) {
          addText(doc, pageManager, `Completed: ${safeText(training.completed)}`);
        }
        pageManager.addY(8);
      });
    });
  }

  // Certifications Section (if available)
  if (petData.certifications && petData.certifications.length > 0) {
    addSection(doc, pageManager, 'Professional Certifications', () => {
      petData.certifications.forEach((cert: any, index: number) => {
        addText(doc, pageManager, `Certification ${index + 1}:`);
        addText(doc, pageManager, `Type: ${safeText(cert.type)}`);
        addText(doc, pageManager, `Issuer: ${safeText(cert.issuer)}`);
        addText(doc, pageManager, `Status: ${safeText(cert.status)}`);
        if (cert.certification_number) {
          addText(doc, pageManager, `Number: ${safeText(cert.certification_number)}`);
        }
        if (cert.issue_date) {
          addText(doc, pageManager, `Issued: ${new Date(cert.issue_date).toLocaleDateString()}`);
        }
        if (cert.expiry_date) {
          addText(doc, pageManager, `Expires: ${new Date(cert.expiry_date).toLocaleDateString()}`);
        }
        if (cert.notes) {
          addText(doc, pageManager, `Notes: ${safeText(cert.notes)}`);
        }
        pageManager.addY(8);
      });
    });
  }

  // Travel Experience Section
  if (petData.travel_locations && petData.travel_locations.length > 0) {
    addSection(doc, pageManager, 'Travel Experience', () => {
      // Group travel by type for better presentation
      const states = petData.travel_locations.filter((loc: any) => loc.type === 'state');
      const countries = petData.travel_locations.filter((loc: any) => loc.type === 'country');
      const cities = petData.travel_locations.filter((loc: any) => loc.type === 'city');
      
      if (states.length > 0) {
        addText(doc, pageManager, 'States Visited:', '#374151', 10);
        states.forEach((location: any) => {
          const dateText = location.date_visited ? ` - Visited: ${new Date(location.date_visited).toLocaleDateString()}` : '';
          addText(doc, pageManager, `${safeText(location.name)}${dateText}`);
        });
        pageManager.addY(5);
      }
      
      if (countries.length > 0) {
        addText(doc, pageManager, 'Countries Visited:', '#374151', 10);
        countries.forEach((location: any) => {
          const dateText = location.date_visited ? ` - Visited: ${new Date(location.date_visited).toLocaleDateString()}` : '';
          addText(doc, pageManager, `${safeText(location.name)}${dateText}`);
        });
        pageManager.addY(5);
      }
      
      if (cities.length > 0) {
        addText(doc, pageManager, 'Cities Visited:', '#374151', 10);
        cities.forEach((location: any) => {
          const dateText = location.date_visited ? ` - Visited: ${new Date(location.date_visited).toLocaleDateString()}` : '';
          addText(doc, pageManager, `${safeText(location.name)}${dateText}`);
        });
        pageManager.addY(5);
      }
    });
  }

  // Contact Information
  addSection(doc, pageManager, 'Contact Information', () => {
    if (petData.vetContact) {
      addText(doc, pageManager, `Veterinarian: ${safeText(petData.vetContact)}`);
    }
    if (petData.emergencyContact) {
      addText(doc, pageManager, `Emergency Contact: ${safeText(petData.emergencyContact)}`);
    }
    if (petData.secondEmergencyContact) {
      addText(doc, pageManager, `Secondary Contact: ${safeText(petData.secondEmergencyContact)}`);
    }
    if (petData.petCaretaker) {
      addText(doc, pageManager, `Caretaker: ${safeText(petData.petCaretaker)}`);
    }
  });

  // Footer
  pageManager.addY(20);
  addText(doc, pageManager, 'Generated from PetPort Digital Pet Passport', '#6b7280', 8);
  addText(doc, pageManager, `Pet ID: ${safeText(petData.id)} | Generated: ${new Date().toLocaleDateString()}`, '#6b7280', 8);
};

// Generate care instructions PDF (ONLY care-related content)
const generateCarePDF = async (doc: jsPDF, pageManager: PDFPageManager, petData: any): Promise<void> => {
  const safeText = (text: string) => sanitizeText(text || '');
  
  // Header
  addTitle(doc, pageManager, 'CARE INSTRUCTIONS', '#059669', 18);
  addTitle(doc, pageManager, safeText(petData.name), '#059669', 16);
  pageManager.addY(15);
  
  // Pet photo
  if (petData.photoUrl) {
    await addImage(doc, pageManager, petData.photoUrl, 60, 60);
  }
  
  // Basic pet info for context
  addSection(doc, pageManager, 'PET INFORMATION', () => {
    addText(doc, pageManager, `Species: ${safeText(petData.species)}`);
    addText(doc, pageManager, `Breed: ${safeText(petData.breed)}`);
    addText(doc, pageManager, `Age: ${safeText(petData.age)}`);
    addText(doc, pageManager, `Weight: ${safeText(petData.weight)}`);
    if (petData.height) addText(doc, pageManager, `Height: ${safeText(petData.height)}`);
    if (petData.registrationNumber) addText(doc, pageManager, `Registration: ${safeText(petData.registrationNumber)}`);
  });
  
  // Care instructions
  if (petData.careInstructions) {
    if (petData.careInstructions.feedingSchedule) {
      addSection(doc, pageManager, 'FEEDING SCHEDULE', () => {
        addText(doc, pageManager, petData.careInstructions.feedingSchedule);
      });
    }
    
    if (petData.careInstructions.morningRoutine) {
      addSection(doc, pageManager, 'MORNING ROUTINE', () => {
        addText(doc, pageManager, petData.careInstructions.morningRoutine);
      });
    }
    
    if (petData.careInstructions.eveningRoutine) {
      addSection(doc, pageManager, 'EVENING ROUTINE', () => {
        addText(doc, pageManager, petData.careInstructions.eveningRoutine);
      });
    }
    
    if (petData.careInstructions.allergies) {
      addSection(doc, pageManager, 'ALLERGIES & RESTRICTIONS', () => {
        addText(doc, pageManager, petData.careInstructions.allergies);
      });
    }
    
    if (petData.careInstructions.medications) {
      addSection(doc, pageManager, 'MEDICATIONS', () => {
        addText(doc, pageManager, petData.careInstructions.medications);
      });
    }
    
    if (petData.careInstructions.specialNeeds) {
      addSection(doc, pageManager, 'SPECIAL NEEDS', () => {
        addText(doc, pageManager, petData.careInstructions.specialNeeds);
      });
    }
    
    if (petData.careInstructions.exerciseRequirements) {
      addSection(doc, pageManager, 'EXERCISE REQUIREMENTS', () => {
        addText(doc, pageManager, petData.careInstructions.exerciseRequirements);
      });
    }
  }
  
  // Footer
  pageManager.addY(20);
  addText(doc, pageManager, 'Generated from PetPort Digital Pet Passport', '#6b7280', 8);
  addText(doc, pageManager, `Pet ID: ${safeText(petData.id)} | Generated: ${new Date().toLocaleDateString()}`, '#6b7280', 8);
};

export async function generateClientPetPDF(
  petData: any,
  type: 'emergency' | 'full' | 'lost_pet' | 'care' | 'gallery' | 'resume' = 'emergency'
): Promise<ClientPDFGenerationResult> {
  try {
    console.log('📋 Starting client PDF generation with jsPDF...', { type, petId: petData?.id });
    
    if (!petData) {
      throw new Error('Pet data is required for PDF generation');
    }

    // Create PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageManager = new PDFPageManager(doc);

    // Normalize pet data (handles camelCase/snake_case and nested tables)
    const normalizedPet = normalizePetData(petData);

    // Generate content based on type (normalize common synonyms)
    const t = (type || 'emergency').toString().toLowerCase();
    let normalizedType: 'emergency' | 'full' | 'lost_pet' | 'care' | 'gallery' | 'resume';
    switch (t) {
      case 'complete':
      case 'full_profile':
      case 'profile':
      case 'complete_profile':
        normalizedType = 'full';
        break;
      case 'lost':
      case 'lost-pet':
      case 'missing':
        normalizedType = 'lost_pet';
        break;
      case 'emergency':
      case 'full':
      case 'lost_pet':
      case 'care':
      case 'gallery':
      case 'resume':
        normalizedType = t as typeof normalizedType;
        break;
      default:
        normalizedType = 'emergency';
    }

    switch (normalizedType) {
      case 'emergency':
        await generateEmergencyPDF(doc, pageManager, normalizedPet);
        break;
      case 'lost_pet':
        await generateLostPetPDF(doc, pageManager, normalizedPet);
        break;
      case 'gallery':
        await generateGalleryPDF(doc, pageManager, normalizedPet);
        break;
      case 'full':
        await generateFullPDF(doc, pageManager, normalizedPet);
        break;
      case 'care':
        await generateCarePDF(doc, pageManager, normalizedPet);
        break;
      case 'resume':
        await generateResumePDF(doc, pageManager, normalizedPet);
        break;
      default:
        await generateEmergencyPDF(doc, pageManager, normalizedPet);
    }

    // Generate blob
    const pdfBlob = doc.output('blob');
    
    console.log('✅ Client PDF generated successfully with jsPDF', { 
      type, 
      fileSize: `${(pdfBlob.size / 1024).toFixed(1)}KB`,
      pages: doc.getNumberOfPages()
    });

    return {
      success: true,
      pdfBlob,
      blob: pdfBlob, // Alias for compatibility
      fileName: `${(normalizedPet.name || 'pet')}_${normalizedType}_profile.pdf`,
      type
    };

  } catch (error) {
    console.error('❌ Client PDF generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      type
    };
  }
}

// Legacy functions for compatibility - redirect to client-side generation
export async function generatePetPDF(petId: string, type: 'emergency' | 'full' | 'lost_pet' | 'care' | 'gallery' | 'resume' = 'emergency'): Promise<ClientPDFGenerationResult> {
  // This would need to fetch pet data from Supabase first
  // For now, return an error asking to use the new client-side method directly
  return {
    success: false,
    error: 'Please use generateClientPetPDF with pet data directly'
  };
}

// Keep other utility functions
export async function downloadPDFBlob(blob: Blob, filename: string): Promise<void> {
  try {
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF');
  }
}

export async function viewPDFBlob(blob: Blob, filename: string): Promise<void> {
  try {
    const viewUrl = window.URL.createObjectURL(blob);
    const newWindow = window.open();
    if (newWindow) {
      newWindow.location.href = viewUrl;
    } else {
      const a = document.createElement('a');
      a.href = viewUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    
    setTimeout(() => {
      window.URL.revokeObjectURL(viewUrl);
    }, 1000);
  } catch (error) {
    console.error('Error viewing PDF:', error);
    throw new Error('Failed to view PDF');
  }
}
