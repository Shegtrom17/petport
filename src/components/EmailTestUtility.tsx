import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEmailSharing } from '@/hooks/useEmailSharing';
import { Mail, Send } from 'lucide-react';

const EmailTestUtility = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [petName, setPetName] = useState('Buddy');
  const [emailType, setEmailType] = useState<'profile' | 'care' | 'credentials' | 'reviews' | 'missing_pet'>('profile');
  const [customMessage, setCustomMessage] = useState('');
  const [senderName, setSenderName] = useState('Test User');
  
  const { sendEmail, isLoading } = useEmailSharing();
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    if (!recipientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address",
        variant: "destructive"
      });
      return;
    }

    const testShareUrl = `https://petport.app/public/profile/test-pet-id`;
    
    const emailData = {
      type: emailType,
      recipientEmail,
      recipientName: recipientName || undefined,
      petName,
      petId: 'test-pet-id',
      shareUrl: testShareUrl,
      customMessage: customMessage || undefined,
      senderName: senderName || undefined,
      petPhoto: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&q=80'
    };

    try {
      const success = await sendEmail(emailData);
      if (success) {
        toast({
          title: "Test Email Sent! ✅",
          description: `Successfully sent ${emailType} email to ${recipientEmail}`,
        });
        
        // Clear form
        setRecipientEmail('');
        setRecipientName('');
        setCustomMessage('');
      } else {
        toast({
          title: "Email Test Failed",
          description: "Could not send test email. Check console for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Email test error:', error);
      toast({
        title: "Email Test Error",
        description: "An error occurred while sending the test email",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Test Utility
        </CardTitle>
        <CardDescription>
          Test your email configuration by sending sample emails using your verified domain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email *</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="test@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name</Label>
            <Input
              id="recipientName"
              placeholder="John Doe"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="petName">Pet Name</Label>
            <Input
              id="petName"
              placeholder="Buddy"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="senderName">Sender Name</Label>
            <Input
              id="senderName"
              placeholder="Test User"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailType">Email Type</Label>
          <Select value={emailType} onValueChange={(value: any) => setEmailType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select email type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile">Profile Share</SelectItem>
              <SelectItem value="care">Care Instructions</SelectItem>
              <SelectItem value="credentials">Credentials</SelectItem>
              <SelectItem value="reviews">Reviews</SelectItem>
              <SelectItem value="missing_pet">Missing Pet Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customMessage">Custom Message (Optional)</Label>
          <Textarea
            id="customMessage"
            placeholder="Add a personal message..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Test Details:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• From: PetPort &lt;noreply@petport.app&gt;</li>
            <li>• Subject: Based on email type and pet name</li>
            <li>• Includes sample pet photo and test share URL</li>
            <li>• Uses your verified petport.app domain</li>
          </ul>
        </div>

        <Button 
          onClick={handleSendTestEmail} 
          disabled={isLoading || !recipientEmail}
          className="w-full text-white"
        >
          {isLoading ? (
            <>Sending...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailTestUtility;