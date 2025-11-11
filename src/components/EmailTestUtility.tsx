import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEmailSharing } from '@/hooks/useEmailSharing';
import { Mail, Send, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EmailTestUtility = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [petName, setPetName] = useState('Buddy');
  const [emailType, setEmailType] = useState<'profile' | 'care' | 'credentials' | 'reviews' | 'missing_pet' | 'gift_notification' | 'gift_purchase_confirmation' | 'gift_activated' | 'gift_renewal_reminder' | 'gift_expired'>('profile');
  const [customMessage, setCustomMessage] = useState('');
  const [senderName, setSenderName] = useState('Test User');
  const [giftTheme, setGiftTheme] = useState<'default' | 'adoption' | 'birthday' | 'christmas' | 'holiday'>('default');
  const [giftCode, setGiftCode] = useState('GIFT-TEST123');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  
  const { sendEmail, isLoading } = useEmailSharing();
  const { toast } = useToast();

  const isGiftEmail = emailType.startsWith('gift_');

  const handleSendTestEmail = async () => {
    if (!recipientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingEmail(true);

    try {
      if (isGiftEmail) {
        // Send gift email directly via edge function
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            type: emailType,
            to: recipientEmail,
            recipientName: recipientName || 'Friend',
            senderName: senderName || 'Test User',
            giftMessage: customMessage || 'Hope you enjoy this gift membership!',
            giftCode: giftCode,
            redemptionLink: `https://petport.app/claim-gift?code=${giftCode}`,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            daysRemaining: 365,
            theme: giftTheme
          }
        });

        if (error) throw error;

        toast({
          title: "Test Gift Email Sent! 🎁",
          description: `Successfully sent ${emailType} (${giftTheme} theme) to ${recipientEmail}`,
        });
      } else {
        // Regular email via existing hook
        const testShareUrl = `https://petport.app/public/profile/test-pet-id`;
        
        const emailData = {
          type: emailType as 'profile' | 'care' | 'credentials' | 'reviews' | 'missing_pet',
          recipientEmail,
          recipientName: recipientName || undefined,
          petName,
          petId: 'test-pet-id',
          shareUrl: testShareUrl,
          customMessage: customMessage || undefined,
          senderName: senderName || undefined,
          petPhoto: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&q=80'
        };

        const success = await sendEmail(emailData);
        if (!success) {
          throw new Error('Email sending failed');
        }

        toast({
          title: "Test Email Sent! ✅",
          description: `Successfully sent ${emailType} email to ${recipientEmail}`,
        });
      }
      
      // Clear form
      setRecipientEmail('');
      setRecipientName('');
      setCustomMessage('');
    } catch (error) {
      console.error('Email test error:', error);
      toast({
        title: "Email Test Error",
        description: error instanceof Error ? error.message : "An error occurred while sending the test email",
        variant: "destructive"
      });
    } finally {
      setIsLoadingEmail(false);
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
              <SelectItem value="gift_notification">🎁 Gift Notification (Recipient)</SelectItem>
              <SelectItem value="gift_purchase_confirmation">🎁 Gift Purchase Confirmation</SelectItem>
              <SelectItem value="gift_activated">🎁 Gift Activated</SelectItem>
              <SelectItem value="gift_renewal_reminder">🎁 Gift Renewal Reminder</SelectItem>
              <SelectItem value="gift_expired">🎁 Gift Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isGiftEmail && (
          <>
            <div className="space-y-2">
              <Label htmlFor="giftTheme">Gift Theme</Label>
              <Select value={giftTheme} onValueChange={(value: any) => setGiftTheme(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gift theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="adoption">🐾 Adoption</SelectItem>
                  <SelectItem value="birthday">🎂 Birthday</SelectItem>
                  <SelectItem value="christmas">🎄 Christmas</SelectItem>
                  <SelectItem value="holiday">🎉 Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="giftCode">Gift Code</Label>
              <Input
                id="giftCode"
                placeholder="GIFT-TEST123"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
              />
            </div>
          </>
        )}

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
          disabled={isLoading || isLoadingEmail || !recipientEmail}
          className="w-full text-white"
        >
          {(isLoading || isLoadingEmail) ? (
            <>Sending...</>
          ) : (
            <>
              {isGiftEmail ? <Gift className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Test Email
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailTestUtility;