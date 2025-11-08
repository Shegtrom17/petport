import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  RotateCcw,
  Mail,
  Clock,
  Link as LinkIcon,
  Eye,
  Lock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GuidanceHint } from "@/components/ui/guidance-hint";

interface TroubleshootingStep {
  question: string;
  options: {
    label: string;
    value: string;
    next?: string | null;
    solution?: {
      title: string;
      description: string;
      steps: string[];
      icon: any;
      variant: "success" | "warning" | "destructive";
    };
  }[];
}

interface WizardConfig {
  title: string;
  description: string;
  icon: any;
  steps: Record<string, TroubleshootingStep>;
  initialStep: string;
}

export const GiftRedemptionWizard = () => {
  const [currentStep, setCurrentStep] = useState("start");
  const [history, setHistory] = useState<string[]>([]);

  const config: WizardConfig = {
    title: "Gift Card Troubleshooting",
    description: "Let's figure out what's going on with your gift card",
    icon: Gift,
    initialStep: "start",
    steps: {
      start: {
        question: "What issue are you experiencing?",
        options: [
          { 
            label: "Gift code not working", 
            value: "code-invalid",
            next: "code-check"
          },
          { 
            label: "Didn't receive gift email", 
            value: "no-email",
            next: "email-missing"
          },
          { 
            label: "Gift expired or grace period", 
            value: "expired",
            next: "expiry-check"
          },
          {
            label: "Can't find claim link",
            value: "no-link",
            next: "link-missing"
          }
        ]
      },
      "code-check": {
        question: "What happens when you try to use the code?",
        options: [
          {
            label: "Says 'Invalid code'",
            value: "invalid",
            solution: {
              title: "Code Format Issues",
              description: "The gift code format might be incorrect",
              steps: [
                "Gift codes are case-sensitive - check capitalization",
                "Remove any extra spaces before/after the code",
                "Make sure you're copying the full code from the email",
                "Look for the code in the email subject line or body",
                "Try typing it manually instead of copy/paste"
              ],
              icon: XCircle,
              variant: "destructive"
            }
          },
          {
            label: "Says 'Already claimed'",
            value: "claimed",
            solution: {
              title: "Gift Already Activated",
              description: "This gift has already been redeemed",
              steps: [
                "Check if you previously claimed this gift on another account",
                "Ask the gift sender if they claimed it by mistake",
                "Contact support@petport.app if you believe this is an error",
                "The sender may need to purchase a new gift if this was claimed incorrectly"
              ],
              icon: CheckCircle2,
              variant: "warning"
            }
          },
          {
            label: "Says 'Expired'",
            value: "expired-code",
            next: "expiry-check"
          }
        ]
      },
      "email-missing": {
        question: "When was the gift purchased?",
        options: [
          {
            label: "Within last 10 minutes",
            value: "recent",
            solution: {
              title: "Email Delivery Delay",
              description: "Gift emails can take 5-10 minutes to arrive",
              steps: [
                "Wait 10-15 minutes for the email to arrive",
                "Check your spam/junk folder",
                "Search for emails from 'PetPort' or 'noreply@petport.app'",
                "Add noreply@petport.app to your contacts to prevent future delays",
                "If still missing after 15 minutes, contact support@petport.app with purchase confirmation"
              ],
              icon: Clock,
              variant: "warning"
            }
          },
          {
            label: "More than 10 minutes ago",
            value: "delayed",
            solution: {
              title: "Check Spam & Request Resend",
              description: "The email may be in spam or needs to be resent",
              steps: [
                "Check spam/junk/promotions folders thoroughly",
                "Search your entire inbox for 'PetPort' or 'gift'",
                "Ask the sender to check their purchase confirmation email",
                "The sender can forward you their confirmation email which contains the gift link",
                "Contact support@petport.app to resend the gift email (include recipient email address)"
              ],
              icon: Mail,
              variant: "warning"
            }
          }
        ]
      },
      "expiry-check": {
        question: "What's the status in the email?",
        options: [
          {
            label: "Says 'Grace Period' or 'Expires Soon'",
            value: "grace",
            solution: {
              title: "Gift in Grace Period",
              description: "You can still claim this gift!",
              steps: [
                "Click the activation link in the gift email immediately",
                "You have a limited grace period (usually 7 days) to claim",
                "Once claimed, your subscription starts immediately",
                "If the link doesn't work, contact support@petport.app ASAP",
                "Include the gift code from the email in your support request"
              ],
              icon: AlertTriangle,
              variant: "warning"
            }
          },
          {
            label: "Says 'Expired' or 'No Longer Valid'",
            value: "fully-expired",
            solution: {
              title: "Gift Has Fully Expired",
              description: "This gift can no longer be redeemed",
              steps: [
                "Gifts expire after the grace period ends (typically 7 days after expiration notice)",
                "Contact the person who sent you the gift - they may be willing to purchase a new one",
                "Unfortunately, expired gifts cannot be reactivated",
                "Sign up for your own subscription at petport.app/subscribe",
                "Contact billing@petport.app if you believe this expiration was in error"
              ],
              icon: XCircle,
              variant: "destructive"
            }
          }
        ]
      },
      "link-missing": {
        question: "Where are you looking for the link?",
        options: [
          {
            label: "In the gift email",
            value: "in-email",
            solution: {
              title: "Finding the Activation Link",
              description: "The link should be in the gift notification email",
              steps: [
                "Look for a big button that says 'Activate Your Gift' or 'Claim Gift'",
                "The link might also say 'Click here to activate your PetPort subscription'",
                "Check if the email has images disabled - enable images in your email client",
                "The gift code is also in the email - you can manually go to petport.app/claim-gift and enter it",
                "Forward the email to yourself and check if the link appears in the forwarded version"
              ],
              icon: LinkIcon,
              variant: "success"
            }
          },
          {
            label: "Don't have the email",
            value: "no-email-at-all",
            next: "email-missing"
          }
        ]
      }
    }
  };

  const handleSelect = (option: any) => {
    setHistory([...history, currentStep]);
    if (option.next) {
      setCurrentStep(option.next);
    }
  };

  const handleReset = () => {
    setCurrentStep(config.initialStep);
    setHistory([]);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previousStep = history[history.length - 1];
      setCurrentStep(previousStep);
      setHistory(history.slice(0, -1));
    }
  };

  const currentStepData = config.steps[currentStep];
  const currentSolution = currentStepData.options.find(o => o.solution)?.solution;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <config.icon className="w-6 h-6 text-primary" />
          <div>
            <CardTitle>{config.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSolution ? (
          <div className="space-y-4">
            <Alert variant={currentSolution.variant === "destructive" ? "destructive" : "default"}>
              <currentSolution.icon className="w-4 h-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">{currentSolution.title}</div>
                <div className="text-sm">{currentSolution.description}</div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Steps to resolve:</h4>
              <ol className="space-y-2">
                {currentSolution.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <Badge variant="outline" className="shrink-0 h-6 w-6 flex items-center justify-center p-0">
                      {idx + 1}
                    </Badge>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              {history.length > 0 && (
                <Button onClick={handleBack} variant="outline">
                  Back
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium">{currentStepData.question}</h3>
            <div className="space-y-2">
              {currentStepData.options.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  variant="outline"
                  className="w-full justify-between text-left h-auto py-3"
                >
                  <span>{option.label}</span>
                  <ChevronRight className="w-4 h-4 ml-2 shrink-0" />
                </Button>
              ))}
            </div>

            {history.length > 0 && (
              <Button onClick={handleBack} variant="ghost" size="sm">
                ← Back
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const SubscriptionTroubleshootingWizard = () => {
  const [currentStep, setCurrentStep] = useState("start");
  const [history, setHistory] = useState<string[]>([]);

  const config: WizardConfig = {
    title: "Subscription & Billing Help",
    description: "Get help with subscription and payment issues",
    icon: CreditCard,
    initialStep: "start",
    steps: {
      start: {
        question: "What subscription issue are you experiencing?",
        options: [
          { label: "Payment failed or declined", value: "payment-failed", next: "payment-check" },
          { label: "Can't add more pets", value: "pet-limit", next: "pet-limit-check" },
          { label: "Want to cancel subscription", value: "cancel", next: "cancel-info" },
          { label: "Billing questions", value: "billing", next: "billing-check" }
        ]
      },
      "payment-check": {
        question: "When did the payment fail?",
        options: [
          {
            label: "Today or recently",
            value: "recent-failure",
            solution: {
              title: "Update Payment Method",
              description: "Your payment method may need to be updated",
              steps: [
                "Go to Account Settings → Billing",
                "Click 'Manage Subscription' to open Stripe portal",
                "Update your payment method with current card details",
                "Check that your card has sufficient funds and hasn't expired",
                "Contact your bank if the card keeps getting declined",
                "Try a different payment method if the issue persists"
              ],
              icon: CreditCard,
              variant: "warning"
            }
          },
          {
            label: "Multiple failed attempts",
            value: "multiple-failures",
            solution: {
              title: "Account in Grace Period",
              description: "Update payment to avoid service interruption",
              steps: [
                "Your account may be in grace period - update payment immediately",
                "Go to Account Settings → Billing → Manage Subscription",
                "Add a new valid payment method",
                "Contact billing@petport.app if you can't update payment",
                "Grace period typically lasts 7 days before service suspension",
                "All your data is safe and will be restored when payment is updated"
              ],
              icon: AlertTriangle,
              variant: "destructive"
            }
          }
        ]
      },
      "pet-limit-check": {
        question: "What happens when you try to add a pet?",
        options: [
          {
            label: "Says I've reached my limit",
            value: "at-limit",
            solution: {
              title: "Pet Limit Reached",
              description: "You need to upgrade to add more pets",
              steps: [
                "Free trial accounts are limited to 1 pet",
                "Paid subscriptions start at 3 pets",
                "Go to Account Settings → Billing to upgrade",
                "You can purchase additional pet slots if needed",
                "Contact support@petport.app for custom enterprise plans (10+ pets)"
              ],
              icon: AlertTriangle,
              variant: "warning"
            }
          },
          {
            label: "Button is disabled or missing",
            value: "no-button",
            solution: {
              title: "Check Subscription Status",
              description: "Your subscription may be inactive",
              steps: [
                "Go to Account Settings to check subscription status",
                "If subscription is 'Inactive' or 'Grace Period', update payment method",
                "Click 'Manage Subscription' to update billing details",
                "Refresh the page after updating payment",
                "Contact billing@petport.app if the issue persists after payment update"
              ],
              icon: XCircle,
              variant: "destructive"
            }
          }
        ]
      },
      "cancel-info": {
        question: "Why do you want to cancel?",
        options: [
          {
            label: "Too expensive / not using it",
            value: "cost",
            solution: {
              title: "Cancellation & Refund Policy",
              description: "Here's how to cancel your subscription",
              steps: [
                "Go to Account Settings → Billing",
                "Click 'Manage Subscription' to open Stripe portal",
                "Click 'Cancel Subscription' and confirm",
                "You'll retain access until the end of your billing period",
                "Your data is preserved for 30 days after cancellation",
                "You can reactivate anytime by visiting petport.app/subscribe",
                "For refund requests, contact billing@petport.app within 7 days of payment"
              ],
              icon: CheckCircle2,
              variant: "success"
            }
          },
          {
            label: "Having technical issues",
            value: "issues",
            solution: {
              title: "Get Help Before Canceling",
              description: "Let us help you resolve the issue",
              steps: [
                "Contact support@petport.app with details of the issue",
                "We can often resolve technical problems quickly",
                "Include screenshots or error messages if possible",
                "You can still cancel anytime if we can't help",
                "Check the Help Center FAQ for common solutions"
              ],
              icon: AlertTriangle,
              variant: "warning"
            }
          }
        ]
      },
      "billing-check": {
        question: "What billing question do you have?",
        options: [
          {
            label: "When is my next payment?",
            value: "next-payment",
            solution: {
              title: "Check Billing Cycle",
              description: "View your next payment date in Stripe portal",
              steps: [
                "Go to Account Settings → Billing",
                "Click 'Manage Subscription'",
                "Your next billing date is shown at the top",
                "You can also see payment history and download invoices",
                "Payments are processed automatically on your billing date"
              ],
              icon: Clock,
              variant: "success"
            }
          },
          {
            label: "Need an invoice or receipt",
            value: "invoice",
            solution: {
              title: "Download Invoices",
              description: "Access all your payment receipts",
              steps: [
                "Go to Account Settings → Billing",
                "Click 'Manage Subscription'",
                "Scroll to 'Invoice History'",
                "Click any invoice to download PDF receipt",
                "Receipts include all payment details for tax/expense purposes"
              ],
              icon: CheckCircle2,
              variant: "success"
            }
          }
        ]
      }
    }
  };

  const handleSelect = (option: any) => {
    setHistory([...history, currentStep]);
    if (option.next) {
      setCurrentStep(option.next);
    }
  };

  const handleReset = () => {
    setCurrentStep(config.initialStep);
    setHistory([]);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previousStep = history[history.length - 1];
      setCurrentStep(previousStep);
      setHistory(history.slice(0, -1));
    }
  };

  const currentStepData = config.steps[currentStep];
  const currentSolution = currentStepData.options.find(o => o.solution)?.solution;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <config.icon className="w-6 h-6 text-primary" />
          <div>
            <CardTitle>{config.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSolution ? (
          <div className="space-y-4">
            <Alert variant={currentSolution.variant === "destructive" ? "destructive" : "default"}>
              <currentSolution.icon className="w-4 h-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">{currentSolution.title}</div>
                <div className="text-sm">{currentSolution.description}</div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Steps to resolve:</h4>
              <ol className="space-y-2">
                {currentSolution.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <Badge variant="outline" className="shrink-0 h-6 w-6 flex items-center justify-center p-0">
                      {idx + 1}
                    </Badge>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              {history.length > 0 && (
                <Button onClick={handleBack} variant="outline">
                  Back
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium">{currentStepData.question}</h3>
            <div className="space-y-2">
              {currentStepData.options.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  variant="outline"
                  className="w-full justify-between text-left h-auto py-3"
                >
                  <span>{option.label}</span>
                  <ChevronRight className="w-4 h-4 ml-2 shrink-0" />
                </Button>
              ))}
            </div>

            {history.length > 0 && (
              <Button onClick={handleBack} variant="ghost" size="sm">
                ← Back
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const LostPetTroubleshootingWizard = () => {
  const [currentStep, setCurrentStep] = useState("start");
  const [history, setHistory] = useState<string[]>([]);

  const config: WizardConfig = {
    title: "Lost Pet Features Help",
    description: "Get help with missing pet alerts and features",
    icon: AlertTriangle,
    initialStep: "start",
    steps: {
      start: {
        question: "What issue are you experiencing?",
        options: [
          { label: "Can't mark pet as lost", value: "cant-mark", next: "mark-check" },
          { label: "QR code not working", value: "qr-issue", next: "qr-check" },
          { label: "Missing pet poster problems", value: "poster", next: "poster-check" },
          { label: "Profile not showing when scanned", value: "visibility", next: "visibility-check" }
        ]
      },
      "mark-check": {
        question: "What happens when you try to mark as lost?",
        options: [
          {
            label: "Button is missing or disabled",
            value: "no-button",
            solution: {
              title: "Check Subscription Status",
              description: "Lost pet features require an active subscription",
              steps: [
                "Go to Account Settings to verify subscription status",
                "Lost pet features are available on all paid plans",
                "If subscription is inactive, update payment method",
                "Free trial users: upgrade to access lost pet features",
                "After activating subscription, refresh the page"
              ],
              icon: Lock,
              variant: "warning"
            }
          },
          {
            label: "Error message appears",
            value: "error",
            solution: {
              title: "Profile Completion Required",
              description: "Complete your pet's profile before marking as lost",
              steps: [
                "Go to your pet's profile and click 'Edit'",
                "Add at least one photo of your pet",
                "Fill in basic information (name, species, breed)",
                "Add emergency contact information",
                "Make sure profile is set to PUBLIC (toggle at top of page)",
                "Try marking as lost again after saving"
              ],
              icon: AlertTriangle,
              variant: "warning"
            }
          }
        ]
      },
      "qr-check": {
        question: "What's wrong with the QR code?",
        options: [
          {
            label: "Doesn't scan at all",
            value: "no-scan",
            solution: {
              title: "QR Code Scanning Issues",
              description: "Improve QR code readability",
              steps: [
                "Print the QR code larger - minimum 1 inch x 1 inch",
                "Ensure good contrast (black code on white background)",
                "Avoid printing on glossy or reflective surfaces",
                "Keep the QR code flat and unwrinkled",
                "Use a dedicated QR scanner app if your camera app doesn't work",
                "Download a fresh poster PDF if the QR code is damaged"
              ],
              icon: XCircle,
              variant: "destructive"
            }
          },
          {
            label: "Scans but shows wrong info",
            value: "wrong-info",
            next: "visibility-check"
          }
        ]
      },
      "visibility-check": {
        question: "What do people see when they scan?",
        options: [
          {
            label: "Shows 'Profile not found' or error",
            value: "not-found",
            solution: {
              title: "Profile Privacy Settings",
              description: "Your pet's profile must be set to PUBLIC",
              steps: [
                "Open your pet's profile page",
                "Look for the PUBLIC/PRIVATE toggle at the very top",
                "Make sure it's switched to PUBLIC (green)",
                "If it was private, it's now public and QR codes will work",
                "The toggle controls ALL sections: Profile, Resume, Care, Gallery",
                "Test by scanning the QR code yourself"
              ],
              icon: Eye,
              variant: "warning"
            }
          },
          {
            label: "Shows old or incorrect information",
            value: "outdated",
            solution: {
              title: "Update Profile Information",
              description: "QR codes always show current saved data",
              steps: [
                "Go to your pet's profile and click 'Edit'",
                "Update all information to be current",
                "Make sure to click 'Save' after making changes",
                "Wait 30 seconds for changes to propagate",
                "Scan QR code again to verify updates appear",
                "Download a new poster PDF to get fresh QR codes with updated data"
              ],
              icon: CheckCircle2,
              variant: "success"
            }
          }
        ]
      },
      "poster-check": {
        question: "What's the issue with the poster?",
        options: [
          {
            label: "Can't download or generate poster",
            value: "cant-download",
            solution: {
              title: "Poster Generation Issues",
              description: "Troubleshoot PDF download problems",
              steps: [
                "Make sure pet is marked as LOST first (toggle in QuickID section)",
                "Check that popup blockers aren't blocking the download",
                "Try a different browser (Chrome, Safari, Firefox)",
                "Clear browser cache and try again",
                "Ensure stable internet connection",
                "Contact support@petport.app if issue persists with your browser details"
              ],
              icon: XCircle,
              variant: "destructive"
            }
          },
          {
            label: "Poster missing information or photos",
            value: "incomplete",
            solution: {
              title: "Complete Pet Profile",
              description: "Posters include all saved profile data",
              steps: [
                "Edit your pet's profile to add missing information",
                "Upload clear, recent photos (front face and full body work best)",
                "Fill in distinctive features in the Lost Pet section",
                "Add complete contact information and emergency details",
                "Save changes and wait 30 seconds",
                "Generate poster again - it will include all new information"
              ],
              icon: AlertTriangle,
              variant: "warning"
            }
          }
        ]
      }
    }
  };

  const handleSelect = (option: any) => {
    setHistory([...history, currentStep]);
    if (option.next) {
      setCurrentStep(option.next);
    }
  };

  const handleReset = () => {
    setCurrentStep(config.initialStep);
    setHistory([]);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previousStep = history[history.length - 1];
      setCurrentStep(previousStep);
      setHistory(history.slice(0, -1));
    }
  };

  const currentStepData = config.steps[currentStep];
  const currentSolution = currentStepData.options.find(o => o.solution)?.solution;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <config.icon className="w-6 h-6 text-destructive" />
          <div>
            <CardTitle>{config.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSolution ? (
          <div className="space-y-4">
            <Alert variant={currentSolution.variant === "destructive" ? "destructive" : "default"}>
              <currentSolution.icon className="w-4 h-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">{currentSolution.title}</div>
                <div className="text-sm">{currentSolution.description}</div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Steps to resolve:</h4>
              <ol className="space-y-2">
                {currentSolution.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <Badge variant="outline" className="shrink-0 h-6 w-6 flex items-center justify-center p-0">
                      {idx + 1}
                    </Badge>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              {history.length > 0 && (
                <Button onClick={handleBack} variant="outline">
                  Back
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium">{currentStepData.question}</h3>
            <div className="space-y-2">
              {currentStepData.options.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  variant="outline"
                  className="w-full justify-between text-left h-auto py-3"
                >
                  <span>{option.label}</span>
                  <ChevronRight className="w-4 h-4 ml-2 shrink-0" />
                </Button>
              ))}
            </div>

            {history.length > 0 && (
              <Button onClick={handleBack} variant="ghost" size="sm">
                ← Back
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
