import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { getOrderedContacts, handlePhoneCall, ContactInfo } from "@/utils/contactUtils";

interface ContactsDisplayProps {
  petId: string;
}

export const ContactsDisplay = ({ petId }: ContactsDisplayProps) => {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!petId) return;
      
      try {
        const contactsData = await getOrderedContacts(petId);
        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [petId]);

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
      <SectionHeader
        title="Contact Information"
      />
      
      <div className="space-y-4 mt-6">
        {contacts.map((contact, index) => {
          const isEmergency = contact.type.includes('emergency');
          const labelColor = isEmergency ? 'text-red-600' : 'text-[#5691af]';
          
          return (
            <div key={`${contact.type}-${index}`} className="border rounded-lg p-4 bg-transparent">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className={`font-medium ${labelColor}`}>
                    {contact.label}
                  </h4>
                  <p className="text-sm text-muted-foreground">{contact.name}</p>
                </div>
              </div>
              
              {!contact.isEmpty && contact.phone && (
                <p 
                  className={`text-sm mt-2 ${labelColor} cursor-pointer hover:underline`}
                  onClick={() => handlePhoneCall(contact.phone)}
                >
                  {contact.phone}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};