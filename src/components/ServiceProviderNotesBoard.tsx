import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Stethoscope, Eye, EyeOff, Trash2, Calendar, User, Briefcase, MessageSquare, Share2, Copy, Mail, Edit, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { generateClientPetPDF } from "@/services/clientPdfService";
import { AddServiceProviderNoteForm } from "./AddServiceProviderNoteForm";
import { Plus } from "lucide-react";

interface ServiceProviderNote {
  id: string;
  pet_id: string;
  provider_name: string;
  provider_email?: string;
  provider_phone?: string;
  provider_type: string;
  service_date: string;
  service_type: string;
  observations?: string;
  recommendations?: string;
  next_appointment_suggestion?: string;
  is_visible: boolean;
  created_at: string;
}

interface ServiceProviderNotesBoardProps {
  petId: string;
  petName: string;
  isPublicView?: boolean;
}

export const ServiceProviderNotesBoard = ({ petId, petName, isPublicView = false }: ServiceProviderNotesBoardProps) => {
  const [notes, setNotes] = useState<ServiceProviderNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ServiceProviderNote | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editServiceDate, setEditServiceDate] = useState<Date>();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/provider-notes/${petId}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share this link with your service provider",
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Service Note Request for ${petName}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd appreciate it if you could add a service note for ${petName} to help track their care and progress.\n\nPlease click this link to add your note:\n${shareUrl}\n\nThank you!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  useEffect(() => {
    fetchNotes();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('service-provider-notes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'service_provider_notes',
        filter: `pet_id=eq.${petId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotes(prev => [payload.new as ServiceProviderNote, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotes(prev => prev.map(n => 
            n.id === payload.new.id ? payload.new as ServiceProviderNote : n
          ));
        } else if (payload.eventType === 'DELETE') {
          setNotes(prev => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('service_provider_notes')
        .select('*')
        .eq('pet_id', petId)
        .order('service_date', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching service provider notes:', error);
      toast({
        title: "Error",
        description: "Failed to load service provider notes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async (noteId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('service_provider_notes')
        .update({ is_visible: !currentVisibility })
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: currentVisibility ? "Note hidden" : "Note visible",
        description: currentVisibility 
          ? "This note is now hidden from public view" 
          : "This note is now visible publicly"
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive"
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('service_provider_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: "Note deleted",
        description: "The service provider note has been removed"
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (note: ServiceProviderNote) => {
    setEditingNote(note);
    setEditFormData({
      provider_name: note.provider_name,
      provider_email: note.provider_email || "",
      provider_phone: note.provider_phone || "",
      provider_type: note.provider_type,
      service_type: note.service_type,
      observations: note.observations || "",
      recommendations: note.recommendations || "",
      next_appointment_suggestion: note.next_appointment_suggestion || ""
    });
    setEditServiceDate(new Date(note.service_date));
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingNote || !editServiceDate) return;

    try {
      const { error } = await supabase
        .from('service_provider_notes')
        .update({
          provider_name: editFormData.provider_name,
          provider_email: editFormData.provider_email || null,
          provider_phone: editFormData.provider_phone || null,
          provider_type: editFormData.provider_type,
          service_date: format(editServiceDate, 'yyyy-MM-dd'),
          service_type: editFormData.service_type,
          observations: editFormData.observations || null,
          recommendations: editFormData.recommendations || null,
          next_appointment_suggestion: editFormData.next_appointment_suggestion || null,
        })
        .eq('id', editingNote.id);

      if (error) throw error;

      toast({
        title: "Note updated",
        description: "The service provider note has been updated successfully"
      });
      setIsEditDialogOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Fetch pet data
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*, provider_notes:service_provider_notes(*)')
        .eq('id', petId)
        .single();

      if (petError) throw petError;

      // Add provider_notes to petData
      const enrichedPetData = {
        ...petData,
        provider_notes: notes // Use the already loaded notes
      };

      const result = await generateClientPetPDF(enrichedPetData, 'provider_notes');

      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName || `${petName}_service_provider_notes.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "PDF Downloaded",
          description: "Service provider notes PDF has been downloaded successfully"
        });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getProviderTypeColor = (type: string) => {
    switch (type) {
      case 'veterinarian': return 'bg-blue-100 text-blue-800';
      case 'farrier': return 'bg-amber-100 text-amber-800';
      case 'groomer': return 'bg-pink-100 text-pink-800';
      case 'trainer': return 'bg-green-100 text-green-800';
      case 'behaviorist': return 'bg-purple-100 text-purple-800';
      case 'chiropractor': return 'bg-teal-100 text-teal-800';
      case 'dentist': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading service provider notes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm service-provider-board">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-brand-primary" />
            <span>Service Provider Notes</span>
            <Badge variant="outline" className="ml-2">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </Badge>
          </div>
          
          {!isPublicView && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || notes.length === 0}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </Button>

              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Invite Provider
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share with Service Provider</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Share this link with your vet, trainer, farrier, or other service provider 
                    so they can add notes about {petName}.
                  </p>
                  
                  <div className="space-y-2">
                    <Label>Share Link</Label>
                    <div className="flex gap-2">
                      <Input value={shareUrl} readOnly className="flex-1" />
                      <Button onClick={copyShareLink} size="icon" variant="outline">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={shareViaEmail} variant="outline" className="flex-1 gap-2">
                      <Mail className="w-4 h-4" />
                      Email Link
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form Toggle - Owner Only */}
        {!isPublicView && !showAddForm && (
          <Button 
            onClick={() => setShowAddForm(true)}
            className="w-full gap-2"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            Add Owner Note
          </Button>
        )}

        {/* Add Note Form - Owner Only */}
        {!isPublicView && showAddForm && (
          <AddServiceProviderNoteForm
            petId={petId}
            petName={petName}
            onSuccess={() => {
              setShowAddForm(false);
              fetchNotes();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {(isPublicView ? notes.filter(n => n.is_visible) : notes).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No service provider notes yet</p>
            <p className="text-sm mt-1">Professional notes from vets, trainers, and other providers will appear here</p>
          </div>
        ) : (
          (isPublicView ? notes.filter(n => n.is_visible) : notes).map((note) => (
            <Card key={note.id} className={`${!note.is_visible ? 'bg-gray-50 border-gray-300' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!isPublicView && (
                          <Badge variant={note.is_visible ? "default" : "secondary"} className="text-xs">
                            {note.is_visible ? (
                              <><Eye className="w-3 h-3 mr-1" />Visible</>
                            ) : (
                              <><EyeOff className="w-3 h-3 mr-1" />Hidden</>
                            )}
                          </Badge>
                        )}
                        <Badge className={getProviderTypeColor(note.provider_type)}>
                          {note.provider_type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <User className="w-4 h-4" />
                          {note.provider_name}
                        </div>
                        {(note.provider_email || note.provider_phone) && (
                          <div className="text-xs text-gray-600">
                            {note.provider_email && <span>{note.provider_email}</span>}
                            {note.provider_email && note.provider_phone && <span> • </span>}
                            {note.provider_phone && <span>{note.provider_phone}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!isPublicView && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(note)}
                          className="h-8 px-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(note.id, note.is_visible)}
                          className="h-8 px-2"
                        >
                          {note.is_visible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Service Provider Note?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this note from {note.provider_name}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteNote(note.id)} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>

                  {/* Service Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(note.service_date), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{note.service_type}</span>
                    </div>
                  </div>

                  {/* Observations */}
                  {note.observations && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">Observations:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.observations}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {note.recommendations && (
                    <div className="space-y-1 bg-blue-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-blue-900">Recommendations:</p>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">{note.recommendations}</p>
                    </div>
                  )}

                  {/* Next Appointment */}
                  {note.next_appointment_suggestion && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Next appointment: </span>
                        <span>{note.next_appointment_suggestion}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service Provider Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_provider_name">Provider Name *</Label>
                <Input
                  id="edit_provider_name"
                  value={editFormData.provider_name || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, provider_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_provider_type">Provider Type *</Label>
                <Select
                  value={editFormData.provider_type || ""}
                  onValueChange={(value) => setEditFormData({ ...editFormData, provider_type: value })}
                >
                  <SelectTrigger id="edit_provider_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veterinarian">Veterinarian</SelectItem>
                    <SelectItem value="farrier">Farrier</SelectItem>
                    <SelectItem value="groomer">Groomer</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="behaviorist">Behaviorist</SelectItem>
                    <SelectItem value="chiropractor">Chiropractor</SelectItem>
                    <SelectItem value="dentist">Dentist</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_provider_email">Email</Label>
                <Input
                  id="edit_provider_email"
                  type="email"
                  value={editFormData.provider_email || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, provider_email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_provider_phone">Phone</Label>
                <Input
                  id="edit_provider_phone"
                  type="tel"
                  value={editFormData.provider_phone || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, provider_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_service_date">Service Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editServiceDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editServiceDate ? format(editServiceDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={editServiceDate}
                      onSelect={setEditServiceDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_service_type">Service Type *</Label>
                <Input
                  id="edit_service_type"
                  value={editFormData.service_type || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, service_type: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_observations">Observations/Notes</Label>
              <Textarea
                id="edit_observations"
                value={editFormData.observations || ""}
                onChange={(e) => setEditFormData({ ...editFormData, observations: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_recommendations">Recommendations</Label>
              <Textarea
                id="edit_recommendations"
                value={editFormData.recommendations || ""}
                onChange={(e) => setEditFormData({ ...editFormData, recommendations: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_next_appointment">Next Appointment Suggestion</Label>
              <Input
                id="edit_next_appointment"
                value={editFormData.next_appointment_suggestion || ""}
                onChange={(e) => setEditFormData({ ...editFormData, next_appointment_suggestion: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="azure" onClick={handleEditSubmit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};