import { supabase } from "@/integrations/supabase/client";

export interface ContactInfo {
  label: string;
  name: string;
  phone: string;
  type: string;
  isEmpty: boolean;
}

const contactTypeLabels = {
  emergency: "Emergency Contact",
  emergency_secondary: "Secondary Emergency Contact",
  veterinary: "Veterinary Contact",
  caretaker: "Pet Caretaker"
};

export const getOrderedContacts = async (petId: string, fallbackPetData?: any): Promise<ContactInfo[]> => {
  try {
    // Fetch from pet_contacts table
    const { data: contacts, error } = await supabase
      .from('pet_contacts')
      .select('*')
      .eq('pet_id', petId)
      .order('contact_type');

    if (error) {
      console.error('Error fetching contacts:', error);
    }

    // Create contact map for easy lookup
    const contactMap = new Map<string, any>();
    if (contacts && contacts.length > 0) {
      contacts.forEach(contact => {
        contactMap.set(contact.contact_type, contact);
      });
    }

    // Define the fixed order of contact types
    const orderedTypes = ['emergency', 'emergency_secondary', 'veterinary', 'caretaker'];
    
    const result: ContactInfo[] = orderedTypes.map(type => {
      const contact = contactMap.get(type);
      
      if (contact && contact.contact_name && contact.contact_phone) {
        return {
          label: contactTypeLabels[type as keyof typeof contactTypeLabels],
          name: contact.contact_name,
          phone: contact.contact_phone,
          type,
          isEmpty: false
        };
      }
      
      // Fallback to legacy data if available
      if (fallbackPetData) {
        let legacyName = '';
        let legacyPhone = '';
        
        switch (type) {
          case 'emergency':
            if (fallbackPetData.emergencyContact) {
              const parts = fallbackPetData.emergencyContact.split(' ');
              legacyPhone = extractPhoneFromString(fallbackPetData.emergencyContact);
              legacyName = fallbackPetData.emergencyContact.replace(legacyPhone, '').trim();
            }
            break;
          case 'emergency_secondary':
            if (fallbackPetData.secondEmergencyContact) {
              const parts = fallbackPetData.secondEmergencyContact.split(' ');
              legacyPhone = extractPhoneFromString(fallbackPetData.secondEmergencyContact);
              legacyName = fallbackPetData.secondEmergencyContact.replace(legacyPhone, '').trim();
            }
            break;
          case 'veterinary':
            if (fallbackPetData.vetContact) {
              if (fallbackPetData.vetContact.includes('(')) {
                legacyName = fallbackPetData.vetContact.split('(')[0].trim();
                legacyPhone = extractPhoneFromString(fallbackPetData.vetContact);
              } else {
                legacyName = fallbackPetData.vetContact;
              }
            }
            break;
          case 'caretaker':
            if (fallbackPetData.petCaretaker) {
              const parts = fallbackPetData.petCaretaker.split(' ');
              legacyPhone = extractPhoneFromString(fallbackPetData.petCaretaker);
              legacyName = fallbackPetData.petCaretaker.replace(legacyPhone, '').trim();
            }
            break;
        }
        
        if (legacyName || legacyPhone) {
          return {
            label: contactTypeLabels[type as keyof typeof contactTypeLabels],
            name: legacyName || 'Contact',
            phone: legacyPhone,
            type,
            isEmpty: false
          };
        }
      }
      
      // Return empty slot
      return {
        label: contactTypeLabels[type as keyof typeof contactTypeLabels],
        name: 'Not provided',
        phone: '',
        type,
        isEmpty: true
      };
    });

    return result;
  } catch (error) {
    console.error('Error in getOrderedContacts:', error);
    // Return empty slots on error
    return ['emergency', 'emergency_secondary', 'veterinary', 'caretaker'].map(type => ({
      label: contactTypeLabels[type as keyof typeof contactTypeLabels],
      name: 'Not provided',
      phone: '',
      type,
      isEmpty: true
    }));
  }
};

const extractPhoneFromString = (text: string): string => {
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return phoneMatch ? phoneMatch[0] : '';
};

export const formatPhoneForTel = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;
};

export const handlePhoneCall = (phone: string): void => {
  if (phone) {
    const telLink = formatPhoneForTel(phone);
    window.location.href = `tel:${telLink}`;
  }
};

// Legacy function exports for compatibility
export const extractPhoneNumber = (contactString: string): string | null => {
  if (!contactString) return null;
  
  // Extract phone number using regex - handles various formats
  const phoneMatch = contactString.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return phoneMatch ? phoneMatch[0].replace(/[^\d]/g, '') : null;
};