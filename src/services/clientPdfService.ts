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
  }

  getCurrentY(): number {
    return this.currentY;
  }

  addY(amount: number): void {
    this.currentY += amount;
  }

  checkPageSpace(contentHeight: number, forceNewPage: boolean = false): void {
    if (forceNewPage || (this.currentY + contentHeight) > this.pageHeight) {
      this.doc.addPage();
      this.currentY = this.topMargin;
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
  doc.text(text, pageManager.getLeftMargin(), pageManager.getCurrentY());
  pageManager.addY(fontSize / 2 + 5);
};

const addText = (doc: jsPDF, pageManager: PDFPageManager, text: string, color: string = '#000000', fontSize: number = 10): void => {
  pageManager.checkPageSpace(8);
  doc.setFontSize(fontSize);
  doc.setTextColor(color);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(sanitizeText(text), pageManager.getContentWidth());
  doc.text(lines, pageManager.getLeftMargin(), pageManager.getCurrentY());
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

const addImage = async (doc: jsPDF, pageManager: PDFPageManager, imageUrl: string, maxWidth: number = 80, maxHeight: number = 60): Promise<void> => {
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
    
    const x = pageManager.getLeftMargin() + (pageManager.getContentWidth() - width) / 2;
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
  
  // Header
  addTitle(doc, pageManager, 'MISSING PET ALERT', '#dc2626', 20);
  addTitle(doc, pageManager, safeText(petData.name), '#dc2626', 18);
  pageManager.addY(15);
  
  // Pet photo
  if (petData.photoUrl) {
    await addImage(doc, pageManager, petData.photoUrl, 100, 100);
  }
  
  // Pet information
  addSection(doc, pageManager, 'PET INFORMATION', () => {
    addText(doc, pageManager, `Name: ${safeText(petData.name)}`);
    addText(doc, pageManager, `Breed: ${safeText(petData.breed)}`);
    addText(doc, pageManager, `Age: ${safeText(petData.age)}`);
    addText(doc, pageManager, `Weight: ${safeText(petData.weight)}`);
    addText(doc, pageManager, `Color: ${safeText(petData.color)}`);
    addText(doc, pageManager, `Gender: ${safeText(petData.gender)}`);
    if (petData.microchip_id) addText(doc, pageManager, `Microchip: ${safeText(petData.microchip_id)}`);
  });
  
  // Emergency contact
  const emergencyContacts = petData.emergency_contacts || [];
  const primaryContact = emergencyContacts[0] || {};
  
  addSection(doc, pageManager, 'EMERGENCY CONTACT', () => {
    addText(doc, pageManager, `Owner: ${safeText(primaryContact.name || 'Contact via PetPort')}`);
    if (primaryContact.phone) addText(doc, pageManager, `Phone: ${safeText(primaryContact.phone)}`);
    if (primaryContact.email) addText(doc, pageManager, `Email: ${safeText(primaryContact.email)}`);
    addText(doc, pageManager, `PetPort ID: ${safeText(petData.id)}`);
  });
  
  // Description
  if (petData.bio) {
    addSection(doc, pageManager, 'DESCRIPTION', () => {
      addText(doc, pageManager, petData.bio);
    });
  }
  
  // Reward section
  pageManager.addY(20);
  addTitle(doc, pageManager, 'REWARD OFFERED', '#dc2626', 16);
  addText(doc, pageManager, 'Please contact immediately if found!', '#000000', 12);
  pageManager.addY(10);
  addText(doc, pageManager, 'Generated from PetPort Digital Pet Passport', '#6b7280', 8);
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

// Generate full profile PDF (NO emergency contacts)
const generateFullPDF = async (doc: jsPDF, pageManager: PDFPageManager, petData: any): Promise<void> => {
  const safeText = (text: string) => sanitizeText(text || '');
  
  // Header
  addTitle(doc, pageManager, 'COMPLETE PET PROFILE', '#1e40af', 18);
  addTitle(doc, pageManager, safeText(petData.name), '#1e40af', 16);
  pageManager.addY(15);
  
  // Pet photo
  if (petData.photoUrl) {
    await addImage(doc, pageManager, petData.photoUrl, 80, 80);
  }
  
  // Basic information
  addSection(doc, pageManager, 'PET INFORMATION', () => {
    addText(doc, pageManager, `Species: ${safeText(petData.species)}`);
    addText(doc, pageManager, `Breed: ${safeText(petData.breed)}`);
    addText(doc, pageManager, `Age: ${safeText(petData.age)}`);
    addText(doc, pageManager, `Weight: ${safeText(petData.weight)}`);
    addText(doc, pageManager, `Gender: ${safeText(petData.gender)}`);
    if (petData.color) addText(doc, pageManager, `Color: ${safeText(petData.color)}`);
    if (petData.microchipId) addText(doc, pageManager, `Microchip: ${safeText(petData.microchipId)}`);
  });
  
  // Bio
  if (petData.bio) {
    addSection(doc, pageManager, 'BIOGRAPHY', () => {
      addText(doc, pageManager, petData.bio);
    });
  }

  // Additional characteristics
  if (petData.distinctiveFeatures) {
    addSection(doc, pageManager, 'DISTINCTIVE FEATURES', () => {
      addText(doc, pageManager, petData.distinctiveFeatures);
    });
  }

  // Travel history
  if (petData.travelHistory && petData.travelHistory.length > 0) {
    addSection(doc, pageManager, 'TRAVEL HISTORY', () => {
      petData.travelHistory.forEach((trip: any, index: number) => {
        addText(doc, pageManager, `${index + 1}. ${safeText(trip.location)} (${safeText(trip.date)})`);
        if (trip.notes) addText(doc, pageManager, `   Notes: ${safeText(trip.notes)}`);
      });
    });
  }

  // Certifications
  if (petData.certifications && petData.certifications.length > 0) {
    addSection(doc, pageManager, 'CERTIFICATIONS', () => {
      petData.certifications.forEach((cert: any) => {
        addText(doc, pageManager, `• ${safeText(cert.name)} - ${safeText(cert.issuer)}`);
        if (cert.expiryDate) addText(doc, pageManager, `  Expires: ${safeText(cert.expiryDate)}`);
      });
    });
  }
  
  // Gallery photos
  const galleryPhotos = petData.gallery_photos || [];
  if (galleryPhotos.length > 0) {
    pageManager.checkPageSpace(50, true); // Force new page for gallery
    addSubtitle(doc, pageManager, 'PHOTO GALLERY', '#1e40af');
    
    for (const photo of galleryPhotos.slice(0, 6)) { // Limit to 6 photos
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
      await addImage(doc, pageManager, petData.gallery_photos[0], 60, 60);
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
