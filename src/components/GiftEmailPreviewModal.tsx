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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      ${theme === 'adoption' ? `
        <div style="background: #ec4899; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
          <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">💜 ADOPTION ANNIVERSARY 💜</span>
        </div>
        <h2 style="color: #ec4899; text-align: center; font-size: 28px; margin-bottom: 10px;">💜 You've Been Gifted PetPort — A Year of Pawsitivity!</h2>
        <p style="text-align: center; color: #831843; font-size: 16px; margin-bottom: 10px;">The App that gives your pet a voice for life!!</p>
      ` : theme === 'christmas' ? `
        <div style="background: #dc2626; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
          <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">🎄 MERRY CHRISTMAS 🎁</span>
        </div>
        <h2 style="color: #dc2626; text-align: center; font-size: 28px; margin-bottom: 10px;">🎁 You've Been Gifted PetPort — A Year of Pawsitivity!</h2>
        <p style="text-align: center; color: #991b1b; font-size: 16px; margin-bottom: 10px;">The App that gives your pet a voice for life!!</p>
      ` : theme === 'birthday' ? `
        <div style="background: #8b5cf6; padding: 6px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
          <span style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px;">🎂 HAPPY BIRTHDAY 🎉</span>
        </div>
        <h2 style="color: #8b5cf6; text-align: center; font-size: 28px; margin-bottom: 10px;">🎂 You've Been Gifted PetPort — A Year of Pawsitivity!</h2>
        <p style="text-align: center; color: #6b21a8; font-size: 16px; margin-bottom: 10px;">The App that gives your pet a voice for life!!</p>
      ` : `
        <h2 style="color: #5691af; text-align: center; font-size: 28px; margin-bottom: 10px;">🎁 You've Received a Gift!</h2>
      `}

      
      <p style="font-size: 16px; line-height: 1.6; color: #333333; text-align: center; padding: 0 20px;">
        ${theme === 'adoption' ? '🏡 Love multiplies when shared!' :
          theme === 'christmas' ? '🎄 \'Tis the season of giving!' :
          theme === 'birthday' ? '🎂 Make a wish!' :
          '🎁 Something special awaits!'}
        <strong>${senderName || 'Someone special'}</strong> sent you ${theme === 'adoption' ? 'a special adoption anniversary gift' : theme === 'christmas' ? 'a Christmas gift' : theme === 'birthday' ? 'a birthday gift' : 'a gift'} — a full year of PetPort to ${theme === 'adoption' ? 'celebrate and preserve the beautiful journey with your furry family member' : 'keep your pet safe, organized, and connected'} 💕
      </p>
      
      ${giftMessage ? `
        <div style="background: #f8fafc; border-left: 4px solid ${config.primaryColor}; padding: 20px; border-radius: 8px; margin: 25px 20px;">
          <p style="font-style: italic; color: #475569; margin: 0; line-height: 1.6;">
            "${giftMessage}"
          </p>
          <p style="text-align: right; color: #64748b; margin: 10px 0 0 0; font-size: 14px;">
            — ${senderName || 'Your gift sender'}
          </p>
        </div>
      ` : ''}
      
      <!-- First CTA Button - Top -->
      <div style="text-align: center; margin: 30px 20px;">
        <a href="#" style="display: inline-block; background: ${config.primaryColor}; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-size: 20px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          🎁 Claim Your Gift Now
        </a>
      </div>
      
      <div style="background: ${config.gradient}; border: 2px solid ${config.borderColor}; border-radius: 12px; padding: 25px; margin: 25px 20px; text-align: center;">
        <h3 style="margin: 0 0 15px 0; color: ${config.textColor}; font-size: 20px;">This gift includes:</h3>
        <ul style="text-align: left; color: #475569; margin: 15px auto; padding-left: 20px; line-height: 1.8; max-width: 400px;">
          <li>~ Full year of premium membership</li>
          <li>~ 1 free pet profile</li>
          <li>~ Beautiful Photo Gallery up to 36 photo</li>
          <li>~ Medical, Vaccination and Doc record storage</li>
          <li>~ One-Tap Lost pet flyer generation</li>
          <li>~ Livelinks for Care Instructions for all caregivers</li>
          <li>~ Resume Builder for sitters, groomers, lodging and more</li>
        </ul>
      </div>
      
      <!-- Second CTA Button - Middle -->
      <div style="text-align: center; margin: 30px 20px;">
        <a href="#" style="display: inline-block; background: ${config.primaryColor}; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-size: 20px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          🎁 Claim Your Gift Now
        </a>
      </div>
      
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 20px;">
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
      <div style="text-align: center; margin: 30px 20px;">
        <a href="#" style="display: inline-block; background: ${config.primaryColor}; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-size: 20px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          🎁 Claim Your Gift Now
        </a>
      </div>
      
      <div style="text-align: center; margin: 25px 20px;">
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
