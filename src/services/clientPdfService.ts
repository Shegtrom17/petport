import jsPDF from 'jspdf';
import { sanitizeText } from '@/utils/inputSanitizer';

export interface ClientPDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  blob?: Blob; // Alias for compatibility
  fileName?: string;
  error?: string;
  type?: string;
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
    addText(doc, pageManager, `Gender: ${safeText(petData.gender)}`);
    if (petData.color) addText(doc, pageManager, `Color: ${safeText(petData.color)}`);
    if (petData.microchipId) addText(doc, pageManager, `Microchip: ${safeText(petData.microchipId)}`);
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
  pageManager.addY(10);
  
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
    addText(doc, pageManager, `Name: ${safeText(petData.name)}`);
    addText(doc, pageManager, `Breed: ${safeText(petData.breed)}`);
    addText(doc, pageManager, `Age: ${safeText(petData.age)}`);
    addText(doc, pageManager, `Weight: ${safeText(petData.weight)}`);
    if (petData.species) addText(doc, pageManager, `Color: ${safeText(petData.species)}`);
    if (petData.microchip_id) addText(doc, pageManager, `Microchip: ${safeText(petData.microchip_id)}`);
  });
  
  // Reset X position and move below both columns
  pageManager.setX(originalX);
  pageManager.setY(Math.max(currentY + 70, pageManager.getCurrentY()));
  
  // Emergency contact information
  addSection(doc, pageManager, 'EMERGENCY CONTACT', () => {
    // Try different possible property names for emergency contacts
    const primaryContact = petData.emergencyContact || petData.emergency_contact || petData.emergency_contacts?.[0];
    const secondaryContact = petData.secondEmergencyContact || petData.second_emergency_contact || petData.emergency_contacts?.[1];
    const vetContact = petData.vetContact || petData.vet_contact;
    
    if (primaryContact) {
      addText(doc, pageManager, `Primary: ${safeText(primaryContact)}`);
    }
    if (secondaryContact) {
      addText(doc, pageManager, `Secondary: ${safeText(secondaryContact)}`);
    }
    if (vetContact) {
      addText(doc, pageManager, `Veterinarian: ${safeText(vetContact)}`);
    }
    addText(doc, pageManager, `PetPort ID: ${safeText(petData.id)}`);
  });
  
  // Last seen information (if available from lost pet data)
  if (petData.last_seen_location || petData.last_seen_date) {
    addSection(doc, pageManager, 'LAST SEEN', () => {
      if (petData.last_seen_location) {
        addText(doc, pageManager, `Location: ${safeText(petData.last_seen_location)}`);
      }
      if (petData.last_seen_date) {
        const dateStr = petData.last_seen_date instanceof Date 
          ? petData.last_seen_date.toLocaleDateString()
          : new Date(petData.last_seen_date).toLocaleDateString();
        addText(doc, pageManager, `Date: ${dateStr}`);
      }
      if (petData.last_seen_time) {
        addText(doc, pageManager, `Time: ${safeText(petData.last_seen_time)}`);
      }
    });
  }
  
  // Special markings/description
  if (petData.bio || petData.distinctive_features) {
    addSection(doc, pageManager, 'DISTINCTIVE FEATURES', () => {
      if (petData.distinctive_features) {
        addText(doc, pageManager, safeText(petData.distinctive_features));
      } else if (petData.bio) {
        addText(doc, pageManager, safeText(petData.bio));
      }
    });
  }
  
  // Medical alerts
  if (petData.medicalAlert && petData.medicalConditions) {
    addSection(doc, pageManager, 'MEDICAL ALERT', () => {
      addText(doc, pageManager, safeText(petData.medicalConditions), '#dc2626');
      if (petData.medications && petData.medications.length > 0) {
        addText(doc, pageManager, `Medications: ${petData.medications.join(', ')}`);
      }
    });
  }
  
  // Add second photo if available (smaller)
  if (petData.gallery_photos && petData.gallery_photos.length > 0) {
    pageManager.addY(10);
    addText(doc, pageManager, 'Additional Photo:', '#000000', 10);
    pageManager.addY(5);
    await addImage(doc, pageManager, petData.gallery_photos[0].url, 50, 50);
    if (petData.gallery_photos[0].caption) {
      addText(doc, pageManager, petData.gallery_photos[0].caption, '#6b7280', 9);
    }
  }
  
  // Reward section
  pageManager.addY(15);
  addTitle(doc, pageManager, 'REWARD OFFERED', '#dc2626', 16);
  if (petData.reward_amount) {
    addText(doc, pageManager, `Reward: ${safeText(petData.reward_amount)}`, '#000000', 14);
  }
  addText(doc, pageManager, 'PLEASE CONTACT IMMEDIATELY IF FOUND!', '#dc2626', 12);
  pageManager.addY(10);
  
  // Footer
  addText(doc, pageManager, 'Generated from PetPort Digital Pet Passport', '#6b7280', 8);
  addText(doc, pageManager, `Generated: ${new Date().toLocaleDateString()}`, '#6b7280', 8);
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
    for (const photo of galleryPhotos) {
      await addImage(doc, pageManager, photo.url, 120, 120);
      if (photo.caption) {
        addText(doc, pageManager, photo.caption, '#6b7280', 9);
      }
      pageManager.addY(10);
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
    addText(doc, pageManager, `Gender: ${safeText(petData.gender)}`);
    if (petData.color) addText(doc, pageManager, `Color: ${safeText(petData.color)}`);
    if (petData.microchipId) addText(doc, pageManager, `Microchip: ${safeText(petData.microchipId)}`);
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
      petData.documents.forEach((doc: any, index: number) => {
        addText(doc, pageManager, `${index + 1}. ${safeText(doc.name)} (${safeText(doc.type)})`);
        if (doc.upload_date) addText(doc, pageManager, `   Uploaded: ${safeText(doc.upload_date)}`);
        if (doc.size) addText(doc, pageManager, `   Size: ${safeText(doc.size)}`);
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
    
    for (const photo of galleryPhotos.slice(0, 8)) { // Show up to 8 photos
      await addImage(doc, pageManager, photo.url, 80, 60);
      if (photo.caption) {
        addText(doc, pageManager, photo.caption, '#6b7280', 9);
      }
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

    // Generate content based on type
    switch (type) {
      case 'emergency':
        await generateEmergencyPDF(doc, pageManager, petData);
        break;
      case 'lost_pet':
        await generateLostPetPDF(doc, pageManager, petData);
        break;
      case 'gallery':
        await generateGalleryPDF(doc, pageManager, petData);
        break;
      case 'full':
        await generateFullPDF(doc, pageManager, petData);
        break;
      case 'care':
        await generateCarePDF(doc, pageManager, petData);
        break;
      case 'resume':
        await generateResumePDF(doc, pageManager, petData);
        break;
      default:
        await generateEmergencyPDF(doc, pageManager, petData);
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
      fileName: `${petData.name || 'pet'}_${type}_profile.pdf`,
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
