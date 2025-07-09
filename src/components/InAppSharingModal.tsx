
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Send, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InAppSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
}

interface PetPassUser {
  id: string;
  email: string;
  full_name: string | null;
}

export const InAppSharingModal = ({ isOpen, onClose, petId, petName }: InAppSharingModalProps) => {
  const [users, setUsers] = useState<PetPassUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Note: In a real app, you'd want to limit this query and add pagination
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .limit(50);

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load PetPass members.",
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSendShares = async () => {
    if (selectedUsers.size === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one member to share with.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Fetch the current user info
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated.");
      }

      // For now, we'll use a simple approach and insert directly into a temporary table
      // This will be replaced once the pet_shares table is properly created
      const shareRecords = Array.from(selectedUsers).map(userId => ({
        pet_id: petId,
        shared_with_user_id: userId,
        shared_by_user_id: user.id,
        created_at: new Date().toISOString()
      }));

      // Temporary workaround: use any type cast to bypass TypeScript checking
      const { error } = await (supabase as any)
        .from('pet_shares')
        .insert(shareRecords);

      if (error) {
        console.error('Error creating shares:', error);
        toast({
          title: "Error",
          description: "Failed to share pet profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile Shared Successfully",
        description: `${petName}'s profile has been shared with ${selectedUsers.size} member${selectedUsers.size === 1 ? '' : 's'}.`,
      });

      setSelectedUsers(new Set());
      onClose();
    } catch (error) {
      console.error('Error sharing profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to share pet profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Share {petName}'s Profile with PetPass Members</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.size > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Members ({selectedUsers.size})</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedUsers).map(userId => {
                  const user = users.find(u => u.id === userId);
                  return user ? (
                    <Badge key={userId} variant="secondary" className="bg-blue-100 text-blue-800">
                      {user.full_name || user.email}
                      <button
                        onClick={() => toggleUser(userId)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* User List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading PetPass members...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No members found matching your search.' : 'No PetPass members found.'}
              </div>
            ) : (
              filteredUsers.map(user => (
                <Card 
                  key={user.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedUsers.has(user.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleUser(user.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{user.full_name || 'PetPass Member'}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      {selectedUsers.has(user.id) && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendShares} 
            disabled={selectedUsers.size === 0 || isSending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sharing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Share with {selectedUsers.size} member{selectedUsers.size === 1 ? '' : 's'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
