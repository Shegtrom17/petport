import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { getOrderedContacts, handlePhoneCall, ContactInfo } from "@/utils/contactUtils";

interface ContactsDisplayProps {
  petId: string;
  hideHeader?: boolean;
  fallbackPetData?: any;
}

export const ContactsDisplay = ({ petId, hideHeader = false, fallbackPetData }: ContactsDisplayProps) => {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!petId) return;
      
      try {
        const contactsData = await getOrderedContacts(petId, fallbackPetData);
        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [petId, fallbackPetData]);

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


  return (
    <div>
      {!hideHeader && (
        <SectionHeader
          title="Contact Information"
        />
      )}
      
      <div className={`space-y-4 ${hideHeader ? '' : 'mt-6'}`}>
        {contacts.map((contact, index) => {
          const isEmergency = contact.type.includes('emergency');
          const labelColor = isEmergency ? 'text-red-600' : 'text-[#5691af]';
          
          return (
            <div key={`${contact.type}-${index}`} className="border rounded-lg p-4 bg-transparent">
              {!contact.isEmpty && contact.phone ? (
                <a 
                  href={`tel:${contact.phone.replace(/\D/g, '')}`}
                  className="block w-full"
                  aria-label={`Call ${contact.name}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${labelColor} hover:opacity-80`}>
                        {contact.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">{contact.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <p className={`text-sm ${labelColor} hover:underline`}>
                      {contact.phone}
                    </p>
                    <span className="text-xs text-muted-foreground">• Tap to call</span>
                  </div>
                </a>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${labelColor}`}>
                        {contact.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">{contact.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};