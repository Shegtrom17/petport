import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface GiftEmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
  recipientEmail: string;
  senderName: string;
  giftMessage: string;
  scheduledDate?: Date;
  additionalPets: number;
  theme: 'default' | 'christmas' | 'birthday' | 'adoption';
}

export const GiftEmailPreviewModal = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  recipientEmail,
  senderName,
  giftMessage,
  scheduledDate,
  additionalPets,
  theme
}: GiftEmailPreviewModalProps) => {
  const petCount = 1 + additionalPets;
  
  // Theme-specific colors and content
  const themeConfig = {
    christmas: {
      gradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      borderColor: '#dc2626',
      primaryColor: '#dc2626',
      textColor: '#991b1b',
      emoji: '🎄',
      greeting: 'Merry Christmas',
      title: '💜 You\'ve Been Gifted PetPort — A Year of Pawsitivity!',
      subtitle: 'The App that gives your pet a voice for life!!'
    },
    birthday: {
      gradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      borderColor: '#8b5cf6',
      primaryColor: '#8b5cf6',
      textColor: '#6b21a8',
      emoji: '🎂',
      greeting: 'Happy Birthday',
      title: '💜 You\'ve Been Gifted PetPort — A Year of Pawsitivity!',
      subtitle: 'The App that gives your pet a voice for life!!'
    },
    adoption: {
      gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      borderColor: '#ec4899',
      primaryColor: '#ec4899',
      textColor: '#831843',
      emoji: '💝',
      greeting: 'Congratulations',
      title: '💜 You\'ve Been Gifted PetPort — A Year of Pawsitivity!',
      subtitle: 'The App that gives your pet a voice for life!!'
    },
    default: {
      gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderColor: '#5691af',
      primaryColor: '#5691af',
      textColor: '#0c4a6e',
      emoji: '🎁',
      greeting: 'Congratulations',
      title: '💜 You\'ve Been Gifted PetPort — A Year of Pawsitivity!',
      subtitle: 'The App that gives your pet a voice for life!!'
    }
  };

  const config = themeConfig[theme];

  const emailHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <!-- Header with gradient -->
      <div style="background: ${config.gradient}; padding: 40px 30px; text-align: center; border-bottom: 3px solid ${config.borderColor};">
        <div style="font-size: 64px; margin-bottom: 15px;">${config.emoji}</div>
        <h1 style="margin: 0 0 15px 0; color: ${config.textColor}; font-size: 28px; font-weight: 700;">
          ${config.title}
        </h1>
        <p style="margin: 0; color: ${config.textColor}; font-size: 18px; font-weight: 600;">
          ${config.subtitle}
        </p>
      </div>

      <!-- Main Content -->
      <div style="padding: 30px;">
        ${senderName ? `
          <div style="background: #f8fafc; border-left: 4px solid ${config.primaryColor}; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
            <p style="margin: 0; color: #475569; line-height: 1.6; font-size: 16px;">
              <strong style="color: #1e293b;">From ${senderName}:</strong><br>
              ${giftMessage || 'I hope you enjoy this special gift for you and your furry friend!'}
            </p>
          </div>
        ` : ''}
        
        <!-- First CTA Button - Top -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="display: inline-block; background: ${config.primaryColor}; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-size: 20px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            🎁 Claim Your Gift Now
          </a>
        </div>
        
        <div style="background: ${config.gradient}; border: 2px solid ${config.borderColor}; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
          <h3 style="margin: 0 0 15px 0; color: ${config.textColor}; font-size: 20px;">This gift includes:</h3>
          <ul style="text-align: left; color: #475569; margin: 15px auto; padding-left: 20px; line-height: 1.8; max-width: 400px;">
            <li><strong>~ Full year of premium membership</strong></li>
            <li><strong>~ ${petCount} free pet profile${petCount > 1 ? 's' : ''}</strong></li>
            <li>~ Beautiful Photo Gallery up to 36 photos</li>
            <li>~ Medical, Vaccination and Doc record storage</li>
            <li>~ One-Tap Lost pet flyer generation</li>
            <li>~ Livelinks for Care Instructions for all caregivers</li>
            <li>~ Resume Builder for sitters, groomers, lodging and more</li>
          </ul>
        </div>
        
        <!-- Second CTA Button - Middle -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="display: inline-block; background: ${config.primaryColor}; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-size: 20px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            🎁 Claim Your Gift Now
          </a>
        </div>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 15px 0; color: #92400e; line-height: 1.7; font-size: 16px;">
            <strong>📋 Your Gift Code:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: 700;">GIFT-XXXX-XXXX</span><br>
            <strong>⏰ Valid Until:</strong> ${scheduledDate ? format(new Date(scheduledDate.getTime() + 365 * 24 * 60 * 60 * 1000), 'MMMM d, yyyy') : format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'MMMM d, yyyy')}
          </p>
          <div style="text-align: center;">
            <a href="#" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 16px; font-weight: 600;">
              ✨ Redeem Gift Code
            </a>
          </div>
        </div>
        
        <!-- Third CTA Button - Bottom -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="display: inline-block; background: ${config.primaryColor}; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-size: 20px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            🎁 Claim Your Gift Now
          </a>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <p style="color: #64748b; font-size: 16px; margin: 5px 0;">
            ${theme === 'adoption' ? '🎊 Congratulations on Your Adoption from PetPort! 💝' :
              theme === 'christmas' ? '🎄 Merry Christmas from PetPort! 🎁' :
              theme === 'birthday' ? '🎂 Happy Birthday from PetPort! 🎉' :
              '🎁 From PetPort with Love! 🐾'}
          </p>
          <p style="color: #94a3b8; font-size: 13px; margin: 15px 0 5px 0;">
            Having trouble? <a href="#" style="color: #5691af; text-decoration: underline;">Click here to claim your gift</a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0 0 10px 0;">This gift was sent to <strong>${recipientEmail}</strong></p>
        ${scheduledDate ? `<p style="margin: 0 0 10px 0;">Scheduled delivery: <strong>${format(scheduledDate, 'MMMM d, yyyy')}</strong></p>` : ''}
        <p style="margin: 0;">Questions? Visit <a href="https://petport.app" style="color: #5691af; text-decoration: underline;">petport.app</a></p>
      </div>
    </div>
  `;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Preview Your Gift Email</DialogTitle>
          <DialogDescription>
            This is how your gift email will appear to {recipientEmail}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] border rounded-lg">
          <div dangerouslySetInnerHTML={{ __html: emailHTML }} />
        </ScrollArea>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Edit Details
          </Button>
          <Button onClick={onProceedToCheckout}>
            Looks Good - Purchase Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
