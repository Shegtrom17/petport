import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, FileText, Building, Hash, Edit, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CertificationSectionProps {
  petData: {
    id: string;
    certificationData?: {
      type?: string;
      status?: string;
      issuer?: string;
      certification_number?: string;
      issue_date?: string;
      expiry_date?: string;
      notes?: string;
    };
  };
  onUpdate?: () => void;
}

export const CertificationSection = ({ petData, onUpdate }: CertificationSectionProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: petData.certificationData?.type || '',
    status: petData.certificationData?.status || 'active',
    issuer: petData.certificationData?.issuer || '',
    certification_number: petData.certificationData?.certification_number || '',
    issue_date: petData.certificationData?.issue_date || '',
    expiry_date: petData.certificationData?.expiry_date || '',
    notes: petData.certificationData?.notes || ''
  });

  const handleSave = () => {
    // In a real implementation, this would save to Supabase
    console.log("Saving certification data:", formData);
    setIsEditModalOpen(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'expired': return 'bg-red-100 text-red-800 border-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const certificationTypes = [
    'Service Animal',
    'Therapy Animal', 
    'Emotional Support Animal',
    'Psychiatric Service Animal',
    'Guide Dog',
    'Hearing Dog',
    'Mobility Service Dog',
    'Medical Alert Dog',
    'Seizure Response Dog',
    'Other Certification'
  ];

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span>Professional Certifications</span>
          </div>
          <Button 
            onClick={() => setIsEditModalOpen(true)} 
            variant="outline" 
            size="sm"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {petData.certificationData?.type ? (
          <div className="space-y-6">
            {/* Main Certification Display */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-purple-800 mb-2">
                    {petData.certificationData.type}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(petData.certificationData.status || 'active')} font-semibold`}
                  >
                    {(petData.certificationData.status || 'active').toUpperCase()}
                  </Badge>
                </div>
                <Shield className="w-12 h-12 text-purple-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {petData.certificationData.issuer && (
                  <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg">
                    <Building className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Issuing Organization</p>
                      <p className="text-purple-700">{petData.certificationData.issuer}</p>
                    </div>
                  </div>
                )}

                {petData.certificationData.certification_number && (
                  <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg">
                    <Hash className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Certification Number</p>
                      <p className="text-purple-700 font-mono">{petData.certificationData.certification_number}</p>
                    </div>
                  </div>
                )}

                {petData.certificationData.issue_date && (
                  <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Issue Date</p>
                      <p className="text-purple-700">{formatDate(petData.certificationData.issue_date)}</p>
                    </div>
                  </div>
                )}

                {petData.certificationData.expiry_date && (
                  <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Expiry Date</p>
                      <p className="text-purple-700">{formatDate(petData.certificationData.expiry_date)}</p>
                    </div>
                  </div>
                )}
              </div>

              {petData.certificationData.notes && (
                <div className="mt-4 p-3 bg-white/80 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900 mb-1">Additional Notes</p>
                      <p className="text-purple-700 text-sm leading-relaxed">{petData.certificationData.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Certifications Added</h3>
            <p className="text-gray-500 mb-4">
              Add professional certifications to showcase your pet's qualifications and training.
            </p>
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </div>
        )}
      </CardContent>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Professional Certification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Certification Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select certification type" />
                </SelectTrigger>
                <SelectContent>
                  {certificationTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issuer">Issuing Organization</Label>
              <Input
                id="issuer"
                value={formData.issuer}
                onChange={(e) => setFormData({...formData, issuer: e.target.value})}
                placeholder="e.g., International Association of Assistance Dog Partners"
              />
            </div>

            <div>
              <Label htmlFor="certification_number">Certification Number</Label>
              <Input
                id="certification_number"
                value={formData.certification_number}
                onChange={(e) => setFormData({...formData, certification_number: e.target.value})}
                placeholder="e.g., SA-2024-001234"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional information about the certification..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Certification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};