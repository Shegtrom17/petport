import { useState } from "react";
import { Search, MessageSquare, AlertTriangle, Heart, FileText, Settings, Home, RotateCcw, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import { Link } from "react-router-dom";
import { MetaTags } from "@/components/MetaTags";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";

import { useAuth } from "@/context/AuthContext";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const { user } = useAuth();
  

  const quickLinks = [
    {
      title: "Mark Pet as Missing",
      description: "Report your pet as lost and create a missing pet poster",
      icon: AlertTriangle,
      link: "/app",
      color: "text-destructive",
      event: "navigate-to-quickid"
    },
    {
      title: "Add New Pet",
      description: "Create a profile for a new pet",
      icon: Heart,
      link: "/add-pet",
      color: "text-primary"
    },
    {
      title: "Pet Profiles",
      description: "View and manage your pet profiles",
      icon: Home,
      link: "/app",
      color: "text-secondary-foreground"
    },
    {
      title: "Account Settings",
      description: "Manage your account and preferences",
      icon: Settings,
      link: "/profile",
      color: "text-muted-foreground"
    },
    {
      title: "Email Test",
      description: "Test email configuration and sending",
      icon: Mail,
      link: "/email-test",
      color: "text-blue-600"
    }
  ];

  const faqs = [
    {
      id: "getting-started",
      question: "How do I get started with PetPort?",
      answer: "Welcome to PetPort! Start by creating your first pet profile using the 'Add Pet' button. You can add photos, basic information, medical records, and care instructions. Each pet gets a unique QR code for easy sharing."
    },
    {
      id: "qr-codes",
      question: "How do QR codes work?",
      answer: "Each pet profile generates a unique QR code that links to their public profile. Anyone can scan this code to view your pet's information, making it perfect for pet tags, sharing with sitters, or emergency situations. Note: Your pet's profile must be set to public (using the toggle at the top) for QR codes to work properly."
    },
    {
      id: "lost-pet",
      question: "What should I do if my pet goes missing?",
      answer: "Immediately go to the 'Lost Pet' section and mark your pet as missing. This will generate a missing pet poster with QR codes that you can print and share. The poster includes your contact information and your pet's photo and details. Important: Make sure your pet's profile is set to public (using the toggle at the top) so people can access the information when they scan the QR code."
    },
    {
      id: "privacy",
      question: "How do I control what information is visible?",
      answer: "Your pet's profile has a single privacy toggle at the top that controls whether the entire profile is public or private. When set to public, all sections (Profile, Resume, Care Instructions, Gallery, Reviews) become viewable by anyone with the link. When private, only you can view the profile. Note: Missing pet alerts have separate visibility and don't require the public setting."
    },
    {
      id: "medical-records",
      question: "Can I store vaccination records and medical information?",
      answer: "Yes! You can store all types of documents including vaccination records, medical certificates, and any other important papers. Upload documents in PDF, JPG, or PNG formats, or take photos directly in the app. All documents are automatically converted to PDFs for easy download and sharing via email with vets, pet sitters, or emergency contacts."
    },
    {
      id: "multiple-pets",
      question: "Can I manage multiple pets?",
      answer: "Absolutely! You can create profiles for all your pets. Use the pet selector at the top of the app to switch between different pet profiles."
    },
    {
      id: "sharing",
      question: "How do I share my pet's profile?",
      answer: "You can share your pet's profile via QR code, direct link, PDF download, email sharing, or by using the share button in the app. The PDF option creates a professional document with all your pet's information that you can print or email. Recipients can view the information you've made public without needing an account. Remember: You must toggle your pet's profile to public (using the switch at the top) before sharing for others to access the information."
    },
    {
      id: "emergency-contact",
      question: "How do emergency contacts work?",
      answer: "Add emergency contacts in your pet's profile. When someone scans your pet's QR code, they can see these contacts if your pet is marked as missing, helping reunite you quickly. Make sure your pet's profile is set to public so emergency contacts can access this vital information."
    },
    {
      id: "data-security",
      question: "Is my pet's information secure?",
      answer: "Yes, we take data security seriously. All information is encrypted and stored securely. You control what information is public, and we never share your data with third parties without your consent."
    },
    {
      id: "pet-transfer",
      question: "How do I transfer my pet's account to another user?",
      answer: "You can transfer your pet's account to another PetPort user through the Profile Edit section. This feature is especially useful for foster organizations transferring pets between foster families or to adopters. Go to your pet's profile, click 'Edit', scroll down to the 'Ownership & Transfer' section, and use the Transfer Pet button. Enter the recipient's email address and they will receive an email with instructions to accept the transfer. Important: This action is permanent and cannot be undone. The recipient must have an active PetPort subscription to accept the transfer."
    },
    {
      id: "transfer-requirements",
      question: "What are the requirements for transferring a pet account?",
      answer: "To transfer a pet account (commonly used by foster organizations): 1) You must be the current owner of the pet profile, 2) The recipient (foster family, adopter, or another user) must have a valid email address, 3) The recipient must have an active PetPort subscription, 4) The transfer request expires after 7 days if not accepted. Once transferred, you will immediately lose access to the pet's profile and all associated data. This is perfect for when foster pets move to new homes or between foster families."
    },
    {
      id: "transfer-process",
      question: "What happens during the transfer process?",
      answer: "When you initiate a transfer (ideal for foster organizations and adopters): 1) The recipient (new foster family or adopter) receives an email with a secure link, 2) They have 7 days to accept the transfer, 3) Upon acceptance, ownership immediately transfers to them, 4) You lose all access to the pet's profile, photos, documents, and data, 5) The transfer cannot be reversed. Foster organizations should ensure all necessary records are shared before transferring. Make sure you've downloaded any important documents or photos before transferring."
    },
    {
      id: "contact-relay",
      question: "Where do Contact Owner messages go?",
      answer: "When someone uses the 'Contact Owner' button on your public pages (Lost Pet, Profile, Resume, etc.), their message is securely relayed to the email address associated with your PetPort account (visible in Profile → Account Information). Your email is never exposed publicly. You can reply directly to the sender from your email inbox, and they will receive your response at the email address they provided."
    },
    {
      id: "sharing-privacy",
      question: "How are my contacts shared in PDFs vs LiveLinks?",
      answer: "All PDFs include contact numbers for easy printing and offline access. For social media safety, LiveLinks (public shareable links) have smart privacy controls: Your Photo Gallery & Complete Profile hides contacts, Resume shows only Vet contact, while Care Instructions, Emergency Profile, and Missing Pet alerts display all contacts. This ensures your contact info is available when needed for emergencies, but protected when sharing socially."
    }
  ];

  const filteredFAQs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PWALayout>
      <MetaTags 
        title="Help Center - PetPort"
        description="Find answers to common questions about using PetPort. Get help with QR codes, lost pets, privacy settings, and more."
        url={window.location.origin + "/help"}
      />
      
      <AppHeader title="Help Center" showBack={true} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-muted-foreground">
              Find answers to your questions or get support
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* FAQs */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <Card>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-b last:border-b-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <span className="text-left font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {filteredFAQs.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or browse all topics above.
                </p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              </div>
            )}
          </div>

          {/* Report Issue Button */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Need More Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Can't find what you're looking for? Report an issue and we'll help you out.
                </p>
                <Button onClick={() => setShowReportModal(true)} className="text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Report an Issue
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link 
                  key={link.title} 
                  to={link.link}
                  onClick={() => {
                    if (link.event) {
                      window.dispatchEvent(new Event(link.event));
                    }
                  }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <link.icon className={`w-6 h-6 ${link.color} mt-1`} />
                        <div>
                          <h3 className="font-medium text-foreground">{link.title}</h3>
                          <p className="text-sm text-muted-foreground">{link.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ReportIssueModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />
    </PWALayout>
  );
};

export default Help;