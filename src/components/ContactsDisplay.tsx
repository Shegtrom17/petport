import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

interface Contact {
  id: string;
  contact_name: string;
  contact_phone: string;
  contact_type: string;
}

interface ContactsDisplayProps {
  petId: string;
}

const contactTypeLabels = {
  emergency: "Emergency Contact",
  emergency_secondary: "Secondary Emergency Contact", 
  veterinary: "Veterinary Contact",
  caretaker: "Pet Caretaker",
  general: "General Contact"
};

export const ContactsDisplay = ({ petId }: ContactsDisplayProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!petId) return;
      
      try {
        const { data, error } = await supabase
          .from('pet_contacts')
          .select('*')
          .eq('pet_id', petId)
          .order('contact_type');
          
        if (!error && data) {
          setContacts(data);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [petId]);

  const formatPhoneForTel = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;
  };

  const handlePhoneCall = (phone: string) => {
    const telLink = formatPhoneForTel(phone);
    window.location.href = `tel:${telLink}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8">
        <SectionHeader
          overline="Emergency"
          title="No Contacts Available"
        />
        <p className="text-muted-foreground mt-2">Contact information has not been provided for this pet.</p>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        overline="Emergency"
        title="Contact Information"
      />
      <p className="text-muted-foreground mb-4">Tap any number to call</p>
      
      <div className="space-y-4 mt-6">
        {contacts.map((contact) => {
          const isEmergency = contact.contact_type.includes('emergency');
          const labelColor = isEmergency ? 'text-red-600' : 'text-[#5691af]';
          
          return (
            <div key={contact.id} className="border rounded-lg p-4 bg-transparent">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className={`font-medium ${labelColor}`}>
                    {contactTypeLabels[contact.contact_type as keyof typeof contactTypeLabels] || contact.contact_type}
                  </h4>
                  <p className="text-sm text-muted-foreground">{contact.contact_name}</p>
                </div>
              </div>
              
              {contact.contact_phone && (
                <p 
                  className={`text-sm mt-2 ${labelColor} cursor-pointer hover:underline`}
                  onClick={() => handlePhoneCall(contact.contact_phone)}
                >
                  {contact.contact_phone}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};