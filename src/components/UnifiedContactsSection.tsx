import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  contact_name: string;
  contact_phone: string;
  contact_type: string;
}

interface UnifiedContactsSectionProps {
  petId: string;
  isOwner: boolean;
}

// Helper function to extract phone number and create tel link
const extractPhoneNumber = (contactString: string) => {
  if (!contactString) return null;
  const phoneMatch = contactString.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) {
    return phoneMatch[0].replace(/[^\d]/g, '');
  }
  return null;
};

const formatPhoneForTel = (phone: string) => {
  return `+1${phone}`;
};

export const UnifiedContactsSection = ({ petId, isOwner }: UnifiedContactsSectionProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', type: 'general' });
  const { toast } = useToast();

  const contactTypeLabels = {
    emergency: 'Emergency Contact',
    veterinary: 'Veterinarian',
    caretaker: 'Pet Caretaker',
    general: 'General Contact'
  };

  const contactTypeColors: Record<string, string> = {
    emergency: 'bg-red-50 border-red-200 text-red-800',
    veterinary: 'bg-blue-50 border-blue-200 text-blue-800',
    caretaker: 'bg-green-50 border-green-200 text-green-800',
    general: 'bg-gray-50 border-gray-200 text-gray-800'
  };

  useEffect(() => {
    fetchContacts();
  }, [petId]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_contacts')
        .select('*')
        .eq('pet_id', petId)
        .order('contact_type', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setAddingNew(true);
    setEditForm({ name: '', phone: '', type: 'general' });
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setEditForm({ 
      name: contact.contact_name, 
      phone: contact.contact_phone, 
      type: contact.contact_type 
    });
  };

  const handleSave = async () => {
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      toast({
        title: "Error",
        description: "Name and phone are required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (addingNew) {
        const { error } = await supabase
          .from('pet_contacts')
          .insert({
            pet_id: petId,
            contact_name: editForm.name.trim(),
            contact_phone: editForm.phone.trim(),
            contact_type: editForm.type
          });

        if (error) throw error;
        
        toast({
          title: "Contact Added",
          description: "New contact has been added successfully"
        });
      } else {
        const { error } = await supabase
          .from('pet_contacts')
          .update({
            contact_name: editForm.name.trim(),
            contact_phone: editForm.phone.trim(),
            contact_type: editForm.type
          })
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: "Contact Updated",
          description: "Contact has been updated successfully"
        });
      }

      await fetchContacts();
      setAddingNew(false);
      setEditingId(null);
      setEditForm({ name: '', phone: '', type: 'general' });
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "Failed to save contact",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setAddingNew(false);
    setEditingId(null);
    setEditForm({ name: '', phone: '', type: 'general' });
  };

  const handleDelete = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('pet_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      
      await fetchContacts();
      toast({
        title: "Contact Deleted",
        description: "Contact has been removed"
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Loading contacts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contacts
          </div>
          {isOwner && (
            <Button onClick={handleAdd} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add new contact form */}
          {addingNew && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="new-name">Contact Name</Label>
                  <Input
                    id="new-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Dr. Smith, Susan, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="new-phone">Phone Number</Label>
                  <Input
                    id="new-phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="new-type">Contact Type</Label>
                  <Select value={editForm.type} onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency Contact</SelectItem>
                      <SelectItem value="veterinary">Veterinarian</SelectItem>
                      <SelectItem value="caretaker">Pet Caretaker</SelectItem>
                      <SelectItem value="general">General Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button onClick={handleCancel} size="sm" variant="outline">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing contacts */}
          {contacts.map((contact) => (
            <div key={contact.id} className={`border rounded-lg p-4 ${contactTypeColors[contact.contact_type as keyof typeof contactTypeColors]}`}>
              {editingId === contact.id ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor={`edit-name-${contact.id}`}>Contact Name</Label>
                      <Input
                        id={`edit-name-${contact.id}`}
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-phone-${contact.id}`}>Phone Number</Label>
                      <Input
                        id={`edit-phone-${contact.id}`}
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-type-${contact.id}`}>Contact Type</Label>
                      <Select value={editForm.type} onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emergency">Emergency Contact</SelectItem>
                          <SelectItem value="veterinary">Veterinarian</SelectItem>
                          <SelectItem value="caretaker">Pet Caretaker</SelectItem>
                          <SelectItem value="general">General Contact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} size="sm" variant="outline">
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{contactTypeLabels[contact.contact_type as keyof typeof contactTypeLabels]}</h4>
                      <p className="font-medium">{contact.contact_name}</p>
                    </div>
                    {isOwner && (
                      <div className="flex gap-1">
                        <Button onClick={() => handleEdit(contact)} size="sm" variant="ghost">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDelete(contact.id)} size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {(() => {
                    const phoneNumber = extractPhoneNumber(contact.contact_phone);
                    return phoneNumber ? (
                      <div>
                        <a 
                          href={`tel:${formatPhoneForTel(phoneNumber)}`}
                          className="text-lg font-medium hover:underline cursor-pointer"
                          aria-label={`Call ${contact.contact_name}`}
                        >
                          {contact.contact_phone}
                        </a>
                        <p className="text-xs mt-1 opacity-75">Tap to call</p>
                      </div>
                    ) : (
                      <p className="text-lg font-medium">{contact.contact_phone}</p>
                    );
                  })()}
                </>
              )}
            </div>
          ))}

          {contacts.length === 0 && !addingNew && (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No contacts added yet</p>
              {isOwner && (
                <Button onClick={handleAdd} className="mt-2" variant="outline">
                  Add Your First Contact
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
