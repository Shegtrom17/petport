import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { Sparkles, Download, Share2, Wand2, Eye, X, Heart, FileText, AlertTriangle, Camera, Menu, Facebook, Home, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { themes, ThemeId } from "@/config/themes";
import { PublicNavigationMenu } from "@/components/PublicNavigationMenu";
import { PodcastBanner } from "@/components/PodcastBanner";

type Species = 'dog' | 'cat' | 'horse';

interface ResumeData {
  title: string;
  achievements: string;
  experience: string;
  references: string;
}

const dogCatOptions = {
  title: [
    "Chief Barketing Officer",
    "Director of Purrsonnel",
    "Head of Squirrel Surveillance",
    "Couch Cushion Inspector",
    "Freelance Snack Tester",
    "Senior Zoomies Engineer",
    "Professional Lap Occupier",
    "Director of Fetch Operations",
    "Sleep Studies Researcher",
    "Treat Acquisition Specialist",
    "Chief Happiness Officer",
    "Master of Mischief Management",
    "Senior Belly Rub Consultant",
    "Head of Household Security",
    "Professional Cuddle Coordinator"
  ]
};

const horseOptions = {
  title: [
    "Director of Hay Procurement",
    "Equine Transport Specialist",
    "Chief Trail Navigator",
    "Mane-tainer of the Year",
    "Gallop Consultant",
    "Barnyard Operations Manager",
    "Hoofcare Influencer",
    "Pasture Maintenance Supervisor",
    "Senior Carrot Negotiator",
    "Lead Mare of the Herd",
    "Professional Fence Inspector",
    "Head of Grazing Operations",
    "Chief Whinny Officer"
  ]
};

export default function DogGoneGood() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [species, setSpecies] = useState<Species>('dog');
  const [theme, setTheme] = useState<ThemeId>('patriotic');
  const [petName, setPetName] = useState('');
  const [photoPreview1, setPhotoPreview1] = useState<string | null>(null);
  const [photoPreview2, setPhotoPreview2] = useState<string | null>(null);
  const [photoFile1, setPhotoFile1] = useState<File | null>(null);
  const [photoFile2, setPhotoFile2] = useState<File | null>(null);
  const [formData, setFormData] = useState<ResumeData>({
    title: dogCatOptions.title[0],
    achievements: themes.patriotic.achievements[0],
    experience: themes.patriotic.experiences[0],
    references: themes.patriotic.references[0]
  });
  const [showCTA, setShowCTA] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showPostDownload, setShowPostDownload] = useState(false);
  const [dismissedSticky, setDismissedSticky] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentOptions = species === 'horse' ? horseOptions : dogCatOptions;
  const currentTheme = themes[theme];

  useEffect(() => {
    setIsCanvasReady(false);
    const timer = setTimeout(() => {
      renderCanvas();
      // Mark as ready after a short delay to ensure all async operations complete
      setTimeout(() => setIsCanvasReady(true), 300);
    }, 100);
    return () => clearTimeout(timer);
  }, [formData, petName, photoPreview1, photoPreview2, species, theme]);

  const handlePhotoUpload = (photoNumber: 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Photo must be under 10MB");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WEBP image");
      return;
    }

    setPhotosLoading(true);
    setIsCanvasReady(false);

    if (photoNumber === 1) {
      setPhotoFile1(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imgSrc = reader.result as string;
        // Preload image to ensure it's ready
        const img = new Image();
        img.onload = () => {
          setPhotoPreview1(imgSrc);
          setPhotosLoading(false);
          toast.success("Photo 1 loaded!");
        };
        img.onerror = () => {
          setPhotosLoading(false);
          toast.error("Failed to load photo");
        };
        img.src = imgSrc;
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoFile2(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imgSrc = reader.result as string;
        // Preload image to ensure it's ready
        const img = new Image();
        img.onload = () => {
          setPhotoPreview2(imgSrc);
          setPhotosLoading(false);
          toast.success("Photo 2 loaded!");
        };
        img.onerror = () => {
          setPhotosLoading(false);
          toast.error("Failed to load photo");
        };
        img.src = imgSrc;
      };
      reader.readAsDataURL(file);
    }
  };

  const updateField = (field: keyof ResumeData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const randomizeAll = () => {
    setIsRandomizing(true);
    const randomTitle = currentOptions.title[Math.floor(Math.random() * currentOptions.title.length)];
    const randomAchievement = currentTheme.achievements[species][Math.floor(Math.random() * currentTheme.achievements[species].length)];
    const randomExperience = currentTheme.experiences[species][Math.floor(Math.random() * currentTheme.experiences[species].length)];
    const randomReference = currentTheme.references[species][Math.floor(Math.random() * currentTheme.references[species].length)];

    setFormData({
      title: randomTitle,
      achievements: randomAchievement,
      experience: randomExperience,
      references: randomReference
    });

    setTimeout(() => setIsRandomizing(false), 500);
    toast.success("🎲 Feeling fetchy!");
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines?: number
  ): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        lineCount++;
        if (maxLines && lineCount >= maxLines) {
          return lineCount * lineHeight; // Stop if we've reached max lines
        }
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (!maxLines || lineCount < maxLines) {
      ctx.fillText(line, x, currentY);
      lineCount++;
    }
    return lineCount * lineHeight;
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get theme banner (for Christmas, pick random)
    const banner = 'bannerChoices' in currentTheme.colors 
      ? currentTheme.colors.bannerChoices[Math.floor(Math.random() * currentTheme.colors.bannerChoices.length)]
      : currentTheme.colors.banner;

    // Clear canvas with theme background
    ctx.fillStyle = currentTheme.colors.background;
    ctx.fillRect(0, 0, 1200, 1600);

    // Theme Banner at top
    ctx.fillStyle = banner.bg;
    ctx.fillRect(0, 0, 1200, 80);
    ctx.fillStyle = banner.fg;
    ctx.font = "bold 36px 'Fredoka', Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(banner.text, 600, 40);

    // Header gradient (below banner)
    const gradient = ctx.createLinearGradient(0, 80, 1200, 280);
    gradient.addColorStop(0, currentTheme.colors.accent);
    gradient.addColorStop(1, currentTheme.colors.text);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 80, 1200, 200);

    // Title
    // "RÉSUMÉ OF [PET NAME]" title
    const displayName = petName || species.charAt(0).toUpperCase() + species.slice(1);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 68px 'Fredoka', Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`RÉSUMÉ FOR ${displayName.toUpperCase()}`, 600, 180);

    // Pet Photos Section - TWO SQUARE PHOTOS SIDE BY SIDE
    let yOffset = 320;
    const hasPhoto1 = !!photoPreview1;
    const hasPhoto2 = !!photoPreview2;
    const photoCount = (hasPhoto1 ? 1 : 0) + (hasPhoto2 ? 1 : 0);
    
    // Photo sizing
    const twoPhotoSize = 440; // Slightly smaller to free vertical space
    const onePhotoSize = 640; // Slightly smaller single photo
    const gap = 40;
    
    const drawSquarePhoto = (photoSrc: string, x: number, y: number, size: number) => {
      const img = new Image();
      img.src = photoSrc;
      img.onload = () => {
        ctx.save();
        
        // Shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // Draw square photo
        const imgAspect = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;
        let drawX = x;
        let drawY = y;
        
        if (imgAspect > 1) {
          drawWidth = size * imgAspect;
          drawX = x - (drawWidth - size) / 2;
        } else {
          drawHeight = size / imgAspect;
          drawY = y - (drawHeight - size) / 2;
        }
        
        // Clip to square
        ctx.beginPath();
        ctx.rect(x, y, size, size);
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
        
        // Border with theme accent color
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = currentTheme.colors.accent;
        ctx.lineWidth = 6;
        ctx.strokeRect(x, y, size, size);
      };
    };
    
    const drawPlaceholder = (x: number, y: number, size: number) => {
      // Shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      
      // Background
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(x, y, size, size);
      
      ctx.shadowColor = 'transparent';
      
      // Border
      ctx.strokeStyle = currentTheme.colors.accent;
      ctx.lineWidth = 6;
      ctx.strokeRect(x, y, size, size);
      
      // Large species emoji
      ctx.font = `${size * 0.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const emoji = species === 'dog' ? '🐕' : species === 'cat' ? '🐱' : '🐴';
      ctx.fillText(emoji, x + size / 2, y + size / 2);
    };
    
    if (photoCount === 2) {
      // Two photos side by side
      const photo1X = (1200 - (twoPhotoSize * 2 + gap)) / 2;
      const photo2X = photo1X + twoPhotoSize + gap;
      
      if (hasPhoto1) {
        drawSquarePhoto(photoPreview1, photo1X, yOffset, twoPhotoSize);
      } else {
        drawPlaceholder(photo1X, yOffset, twoPhotoSize);
      }
      
      if (hasPhoto2) {
        drawSquarePhoto(photoPreview2, photo2X, yOffset, twoPhotoSize);
      } else {
        drawPlaceholder(photo2X, yOffset, twoPhotoSize);
      }
      
      yOffset += twoPhotoSize + 32;
    } else if (photoCount === 1) {
      // One photo centered at 60% width
      const photoX = (1200 - onePhotoSize) / 2;
      
      if (hasPhoto1) {
        drawSquarePhoto(photoPreview1, photoX, yOffset, onePhotoSize);
      } else if (hasPhoto2) {
        drawSquarePhoto(photoPreview2, photoX, yOffset, onePhotoSize);
      }
      
      yOffset += onePhotoSize + 32;
    } else {
      // No photos - show centered placeholder
      const photoX = (1200 - onePhotoSize) / 2;
      drawPlaceholder(photoX, yOffset, onePhotoSize);
      yOffset += onePhotoSize + 40;
    }

    // Remove duplicate "RÉSUMÉ OF" text - name is already at top
    yOffset += 12;

    // Content sections - compact with dynamic height accounting
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const leftMargin = 80;
    const maxWidth = 1040;
    const lineHeight = 38;
    const headerSpacing = 48;
    const sectionGap = 32;
    const bottomSafeY = 1460; // Reserve space for PetPort banner (1500-1600)

    // Title
    ctx.fillStyle = currentTheme.colors.accent;
    ctx.font = "bold 38px 'Fredoka', Inter, sans-serif";
    ctx.fillText('PROFESSIONAL TITLE', leftMargin, yOffset);
    yOffset += headerSpacing;
    ctx.fillStyle = currentTheme.colors.text;
    ctx.font = '26px Inter, sans-serif';
    let used = wrapText(ctx, formData.title, leftMargin, yOffset, maxWidth, lineHeight);
    yOffset += used + sectionGap;

    // Achievements
    ctx.fillStyle = currentTheme.colors.accent;
    ctx.font = "bold 38px 'Fredoka', Inter, sans-serif";
    ctx.fillText('KEY ACHIEVEMENTS', leftMargin, yOffset);
    yOffset += headerSpacing;
    ctx.fillStyle = currentTheme.colors.text;
    ctx.font = '26px Inter, sans-serif';
    used = wrapText(ctx, formData.achievements, leftMargin, yOffset, maxWidth, lineHeight);
    yOffset += used + sectionGap;

    // Experience
    ctx.fillStyle = currentTheme.colors.accent;
    ctx.font = "bold 38px 'Fredoka', Inter, sans-serif";
    ctx.fillText('PROFESSIONAL EXPERIENCE', leftMargin, yOffset);
    yOffset += headerSpacing;
    ctx.fillStyle = currentTheme.colors.text;
    ctx.font = '26px Inter, sans-serif';
    used = wrapText(ctx, formData.experience, leftMargin, yOffset, maxWidth, lineHeight);
    yOffset += used + sectionGap;

    // References - dynamically limit lines to avoid banner overlap
    ctx.fillStyle = currentTheme.colors.accent;
    ctx.font = "bold 38px 'Fredoka', Inter, sans-serif";
    ctx.fillText('REFERENCES', leftMargin, yOffset);
    yOffset += headerSpacing;
    ctx.fillStyle = currentTheme.colors.text;
    ctx.font = '26px Inter, sans-serif';
    const remainingLines = Math.max(0, Math.floor((bottomSafeY - yOffset) / lineHeight));
    if (remainingLines > 0) {
      wrapText(ctx, formData.references, leftMargin, yOffset, maxWidth, lineHeight, remainingLines);
    }


    // Watermarks on the right side - stacked vertically
    ctx.globalAlpha = 0.08;
    ctx.font = '120px Arial';
    ctx.fillStyle = currentTheme.colors.text;
    ctx.textAlign = 'right';
    
    // Dog paw at top right
    ctx.fillText('🐾', 1150, 400);
    
    // Cat at middle right
    ctx.fillText('🐱', 1150, 700);
    
    // Horse at bottom right
    ctx.fillText('🐴', 1150, 1000);
    
    // Additional paw at very bottom right
    ctx.fillText('🐾', 1150, 1290);
    
    ctx.globalAlpha = 1.0;

    // Footer banner with theme color
    ctx.fillStyle = currentTheme.colors.text;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0, 1500, 1200, 100);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 24px 'Fredoka', Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText('🐾 Created with love at PetPort.app', 600, 1540);
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText('Giving Pets a Voice for Their Lifetime', 600, 1572);
  };

  const generateJPEGBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas not found'));
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image'));
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const downloadJPEG = async () => {
    try {
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      toast.loading('Preparing your résumé...', { id: 'download-prep' });
      
      // Force re-render canvas with current data
      await new Promise(resolve => {
        renderCanvas();
        setTimeout(resolve, 500); // Wait for canvas to fully render
      });

      const blob = await generateJPEGBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = petName 
        ? `${petName.toLowerCase().replace(/\s+/g, '-')}-resume-${theme}.jpg`
        : `petport-resume-${theme}-${species}-${Date.now()}.jpg`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded! 🎉', { id: 'download-prep' });
      setShowCTA(true);
      setShowPostDownload(true);

      // Analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'resume_download', {
          event_category: 'conversion',
          event_label: `${theme}_${species}`
        });
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image', { id: 'download-prep' });
    }
  };

  const viewResume = async () => {
    try {
      toast.loading('Preparing preview...', { id: 'view-prep' });
      
      // Force re-render canvas with current data
      await new Promise(resolve => {
        renderCanvas();
        setTimeout(resolve, 500);
      });

      const blob = await generateJPEGBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.success('Opening résumé in new tab! 👀', { id: 'view-prep' });
    } catch (error) {
      console.error('View failed:', error);
      toast.error('Failed to open résumé', { id: 'view-prep' });
    }
  };

  const shareNative = async () => {
    if (!navigator.share) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied! Share it anywhere.");
      return;
    }

    try {
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      toast.loading('Preparing to share...', { id: 'share-prep' });
      
      // Force re-render canvas with current data
      await new Promise(resolve => {
        renderCanvas();
        setTimeout(resolve, 500);
      });

      const blob = await generateJPEGBlob();
      const fileName = petName 
        ? `${petName.toLowerCase().replace(/\s+/g, '-')}-resume-${theme}.jpg`
        : `petport-resume-${theme}-${species}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      await navigator.share({
        title: `${petName || 'My Pet'}'s Résumé`,
        text: `Just made a ${currentTheme.name} résumé for my pet with PetPort! 😂 Try it yourself: ${window.location.href}`,
        files: [file]
      });

      toast.success("Shared successfully! 🎉", { id: 'share-prep' });
      setShowCTA(true);

      // Analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'resume_share', {
          event_category: 'conversion',
          event_label: `${theme}_${species}`
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Share canceled', { id: 'share-prep' });
    }
  };

  const handleXShare = () => {
    const shareUrl = 'https://petport.app/dog-gone-good';
    const shareText = `Just created a hilarious résumé for my pet! 😂🐾 Try the free Dog-Gone-Good Résumé Generator at PetPort!`;
    
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
    
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'social_share', {
        event_category: 'engagement',
        event_label: 'twitter_dog_gone_good'
      });
    }
  };

  const handleFacebookShare = () => {
    const shareUrl = 'https://petport.app/dog-gone-good';
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'social_share', {
        event_category: 'engagement',
        event_label: 'facebook_dog_gone_good'
      });
    }
  };

  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies);
    const options = newSpecies === 'horse' ? horseOptions : dogCatOptions;
    setFormData({
      title: options.title[0],
      achievements: currentTheme.achievements[newSpecies][0],
      experience: currentTheme.experiences[newSpecies][0],
      references: currentTheme.references[newSpecies][0]
    });

    // Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'species_select', {
        event_category: 'engagement',
        event_label: newSpecies
      });
    }
  };

  const handleThemeChange = (newTheme: ThemeId) => {
    setTheme(newTheme);
    const newThemeData = themes[newTheme];
    setFormData({
      title: currentOptions.title[0],
      achievements: newThemeData.achievements[species][0],
      experience: newThemeData.experiences[species][0],
      references: newThemeData.references[species][0]
    });

    // Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'theme_select', {
        event_category: 'engagement',
        event_label: newTheme
      });
    }
  };

  // Page view analytics
  useEffect(() => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'page_view', {
        page_path: '/dog-gone-good',
        page_title: 'Dog-Gone-Good Résumé Generator'
      });
    }
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-cream">
      <MetaTags 
        title="Dog-Gone-Good Résumé Generator | Free Pet Résumé Maker"
        description="Create hilarious, shareable résumés for your dog, cat, or horse in seconds. Free, no signup required. Perfect for social media!"
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/OG%20General.png"
        url={`${window.location.origin}/dog-gone-good`}
      />

      {/* Keywords Meta Tag for SEO */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var meta = document.querySelector('meta[name="keywords"]');
            if (!meta) {
              meta = document.createElement('meta');
              meta.name = 'keywords';
              document.head.appendChild(meta);
            }
            meta.content = 'pet resume maker, free pet resume, dog housing application, cat resume, pet screening tool, horse resume, pet rental application, landlord pet resume, pet reference letter, pet housing approval, apartment pet resume, pet screening service, rental pet application, dog resume builder, cat resume generator, pet application form, housing pet documentation, pet friendly housing, pet resume template, pet screening report, professional pet resume';
          })();
        `
      }} />

      {/* Schema.org WebApplication Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Dog-Gone-Good Résumé Generator",
          "description": "Create hilarious, shareable résumés for your dog, cat, or horse in seconds. Free, no signup required. Perfect for social media!",
          "applicationCategory": "SoftwareApplication",
          "operatingSystem": "All",
          "url": "https://petport.app/dog-gone-good",
          "inLanguage": "en-US",
          "keywords": "pet resume maker, free pet resume, dog housing application, cat resume, pet screening tool, horse resume, pet rental application",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "Free Pet Résumé Maker",
            "Instant Shareable Profiles",
            "Supports Dog, Cat, and Horse",
            "No Signup Required",
            "Multiple Themes Available",
            "Download as JPEG"
          ],
          "author": {
            "@type": "Organization",
            "name": "PetPort",
            "url": "https://petport.app"
          }
        })}
      </script>

      {/* Breadcrumb Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://petport.app/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Dog-Gone-Good Résumé Generator",
              "item": "https://petport.app/dog-gone-good"
            }
          ]
        })}
      </script>

      {/* FAQPage Schema for Rich Snippets */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Do landlords actually accept pet resumes for rental applications?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Many landlords and property managers now accept pet resumes as part of the screening process. A professional pet resume demonstrates responsible pet ownership by showing vaccination records, training certifications, references from previous landlords or veterinarians, and proof of pet insurance. This helps landlords make informed decisions and can significantly increase your chances of approval in competitive rental markets."
              }
            },
            {
              "@type": "Question",
              "name": "What should I include in a pet resume for housing applications?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A strong pet resume should include: your pet's basic information (name, breed, age, weight), spay/neuter status, current vaccinations and veterinary records, obedience training certifications, behavioral traits and temperament, previous landlord references confirming no property damage or noise complaints, pet insurance information, emergency care plans, and professional photos. PetPort's platform helps organize all this information in one shareable, professional document."
              }
            },
            {
              "@type": "Question",
              "name": "How does a pet screening resume help with rental applications?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Pet screening resumes help rental applications by presenting your pet as a responsible, well-cared-for companion rather than a liability. They provide landlords with documented proof of vaccinations, training, and good behavior, addressing common concerns about property damage, noise, or safety. In competitive markets, a professional pet resume can be the deciding factor between multiple qualified applicants, showing you take pet ownership seriously."
              }
            },
            {
              "@type": "Question",
              "name": "Can I use the Dog-Gone-Good resume generator for cats and horses?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely! The Dog-Gone-Good generator works for dogs, cats, and horses. Each species has customized fields and options appropriate for that animal type. Whether you need a professional resume for a rental application, boarding facility, or just for fun social media sharing, you can create a polished, shareable document for any pet species in seconds - completely free with no signup required."
              }
            },
            {
              "@type": "Question",
              "name": "Is the pet resume generator really free to use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! The Dog-Gone-Good pet resume generator is completely free with no signup, no payment, and no hidden fees. You can create, customize, download, and share as many pet resumes as you want. While the fun resume generator is free, PetPort also offers a full digital pet profile platform with comprehensive features like medical records, LiveLinks for lost pet recovery, and travel documentation for pet owners who want an all-in-one solution."
              }
            },
            {
              "@type": "Question",
              "name": "What's the difference between the free resume and PetPort's full resume?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Free resume: 1–2 photos plus playful, humorous Q&A prompts for social sharing; downloadable image only. No bio/core details and no advanced sections (training, achievements, references, travel, or contact). Full resume: a professional, multi‑section profile with Experience & Activities, Achievements, Training, Professional Certifications, References & Reviews, Travel history, a public share link and PDF export, and a Contact Owner button."
              }
            },
            {
              "@type": "Question",
              "name": "Can I update my pet's resume after downloading it?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The free Dog-Gone-Good generator creates a downloadable image file, so you would need to regenerate it with updated information. However, with a PetPort subscription, your pet's digital resume and profile are always editable and update in real-time. When you share your PetPort profile link with landlords or facilities, they always see the most current information - no need to create and send new documents every time something changes."
              }
            }
          ]
        })}
      </script>

      {/* HowTo Schema for Step-by-Step Rich Snippets */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Create a Pet Resume for Rental Applications",
          "description": "Step-by-step guide to creating a professional pet resume using the Dog-Gone-Good generator. Perfect for housing applications and social media sharing.",
          "totalTime": "PT5M",
          "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": "0"
          },
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Upload Pet Photos",
              "text": "Add up to 2 photos of your pet. Choose clear, high-quality images that show your pet's personality and appearance. Photos should be in JPEG, PNG, or HEIC format. The generator will automatically optimize them for the resume layout.",
              "url": "https://petport.app/dog-gone-good#upload"
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Enter Pet Name",
              "text": "Type your pet's name in the designated field. This will appear prominently at the top of the resume. Make sure to spell it exactly as you want it to appear on the final document.",
              "url": "https://petport.app/dog-gone-good#name"
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Customize Content",
              "text": "Select from pre-written options or customize the professional title, key achievements, relevant experience, and professional references sections. Choose options that best represent your pet's personality, training, and behavior. For housing applications, emphasize well-behaved traits and training certifications.",
              "url": "https://petport.app/dog-gone-good#customize"
            },
            {
              "@type": "HowToStep",
              "position": 4,
              "name": "Choose Theme",
              "text": "Select a theme for your pet's resume: Classic Patriotic (professional red, white, and blue), Autumn Harvest (warm seasonal colors), or Christmas Holiday (festive design). Each theme includes appropriate graphics and color schemes while maintaining readability.",
              "url": "https://petport.app/dog-gone-good#theme"
            },
            {
              "@type": "HowToStep",
              "position": 5,
              "name": "Download Resume",
              "text": "Click the Download button to save your pet's resume as a high-quality JPEG image. The file will be optimized for both digital sharing and printing. You can then attach it to rental applications, email it to landlords, or share it on social media platforms.",
              "url": "https://petport.app/dog-gone-good#download"
            }
          ]
        })}
      </script>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort" className="w-10 h-10" />
            <span className="text-xl font-semibold text-brand-primary">PetPort</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/gift')} variant="outline" className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            <span className="hidden sm:inline">Gift PetPort</span>
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </div>
      </header>

      {/* Podcast Banner */}
      <PodcastBanner />

      {/* Mobile Navigation Menu */}
      <PublicNavigationMenu
        isOpen={showMobileMenu} 
        onClose={() => setShowMobileMenu(false)} 
      />

      {/* Ad Slot - Top */}
      <div id="adslot-doggone-top" className="max-w-7xl mx-auto px-4 py-2" />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-5 w-5 text-brand-primary" />
            <span className="text-brand-primary font-semibold">Viral Fun Generator</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4">
            Dog-Gone-Good Résumé Generator 🐾
          </h1>
          <p className="text-xl text-brand-primary-dark max-w-2xl mx-auto">
            Create a hilarious professional résumé for your pet in 60 seconds. Share it on social media and watch the laughs roll in!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          <div className="space-y-6">
            {/* Theme Selector */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <label className="block text-sm font-semibold text-brand-primary mb-3">
                Choose Your Theme
              </label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patriotic">{themes.patriotic.name}</SelectItem>
                  <SelectItem value="christmas">{themes.christmas.name}</SelectItem>
                  <SelectItem value="fall">{themes.fall.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Species Toggle */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <label className="block text-sm font-semibold text-brand-primary mb-3">
                Who's applying today?
              </label>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSpeciesChange('dog')} 
                  variant={species === 'dog' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  🐕 Dog
                </Button>
                <Button 
                  onClick={() => handleSpeciesChange('cat')} 
                  variant={species === 'cat' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  🐱 Cat
                </Button>
                <Button 
                  onClick={() => handleSpeciesChange('horse')} 
                  variant={species === 'horse' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  🐴 Horse
                </Button>
              </div>
            </div>

            {/* Photo Uploads (Optional) */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <label className="block text-sm font-semibold text-brand-primary mb-3">
                Pet Photos (optional - up to 2)
              </label>
              
              {/* Photo 1 */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-2">Photo 1</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload(1)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                />
                {photoPreview1 && (
                  <div className="mt-2 flex justify-center">
                    <img src={photoPreview1} alt="Preview 1" className="w-24 h-24 rounded object-cover border-2 border-brand-primary/20" />
                  </div>
                )}
              </div>
              
              {/* Photo 2 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">Photo 2</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload(2)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                />
                {photoPreview2 && (
                  <div className="mt-2 flex justify-center">
                    <img src={photoPreview2} alt="Preview 2" className="w-24 h-24 rounded object-cover border-2 border-brand-primary/20" />
                  </div>
                )}
              </div>
            </div>

            {/* Pet Name (Optional) */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <label className="block text-sm font-semibold text-brand-primary mb-3">
                Pet Name (optional)
              </label>
              <input 
                type="text" 
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Enter pet name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            {/* Dropdown Fields */}
            <div className={`bg-white rounded-xl p-6 shadow-lg transition-transform ${isRandomizing ? 'scale-105' : 'scale-100'}`}>
              <label className="block text-sm font-semibold text-brand-primary mb-3">Professional Title</label>
              <Select value={formData.title} onValueChange={(val) => updateField('title', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentOptions.title.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={`bg-white rounded-xl p-6 shadow-lg transition-transform ${isRandomizing ? 'scale-105' : 'scale-100'}`}>
              <label className="block text-sm font-semibold text-brand-primary mb-3">Key Achievement</label>
              <Select value={formData.achievements} onValueChange={(val) => updateField('achievements', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentTheme.achievements[species].map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={`bg-white rounded-xl p-6 shadow-lg transition-transform ${isRandomizing ? 'scale-105' : 'scale-100'}`}>
              <label className="block text-sm font-semibold text-brand-primary mb-3">Professional Experience</label>
              <Select value={formData.experience} onValueChange={(val) => updateField('experience', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentTheme.experiences[species].map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={`bg-white rounded-xl p-6 shadow-lg transition-transform ${isRandomizing ? 'scale-105' : 'scale-100'}`}>
              <label className="block text-sm font-semibold text-brand-primary mb-3">Reference</label>
              <Select value={formData.references} onValueChange={(val) => updateField('references', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentTheme.references[species].map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Randomizer Button */}
            <Button 
              onClick={randomizeAll}
              size="lg"
              className="w-full bg-gradient-to-r from-brand-secondary to-brand-primary text-white hover:opacity-90 hover:scale-105 transition-all"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              🎲 I'm Feeling Fetchy
            </Button>
          </div>

          {/* Right Column: Live Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-2xl border-2 border-brand-primary/20">
              <h3 className="text-lg font-semibold text-brand-primary mb-4 text-center">
                Live Preview
              </h3>
              <canvas 
                ref={canvasRef} 
                width={1200} 
                height={1600} 
                className="w-full h-auto border border-gray-200 rounded-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isCanvasReady && (
                <div className="text-center text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <Camera className="inline-block mr-2 h-4 w-4 animate-pulse" />
                  Rendering your résumé...
                </div>
              )}
              {photosLoading && (
                <div className="text-center text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Camera className="inline-block mr-2 h-4 w-4 animate-pulse" />
                  Loading photo...
                </div>
              )}
              <Button 
                onClick={viewResume}
                size="lg"
                disabled={!isCanvasReady || photosLoading}
                variant="outline"
                className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary hover:!text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="mr-2 h-5 w-5" />
                View Full Size
              </Button>
              <Button 
                onClick={downloadJPEG}
                size="lg"
                disabled={!isCanvasReady || photosLoading}
                variant="azure"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="mr-2 h-5 w-5" />
                Download as Image
              </Button>
              
              {/* Social Share Buttons */}
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={handleXShare}
                  size="lg"
                  disabled={!isCanvasReady || photosLoading}
                  variant="outline"
                  className="flex-1 border-brand-primary text-brand-primary hover:bg-brand-primary hover:!text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Share on X
                </Button>
                
                <Button 
                  onClick={handleFacebookShare}
                  size="lg"
                  disabled={!isCanvasReady || photosLoading}
                  variant="outline"
                  className="flex-1 border-brand-primary text-brand-primary hover:bg-brand-primary hover:!text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Facebook className="w-5 h-5 mr-2" />
                  Share on Facebook
                </Button>
              </div>
            </div>

            {/* Conversion CTA */}
            {showCTA && (
              <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl p-6 text-white text-center shadow-xl animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-bold mb-2">
                  Want a REAL PetPort Profile{petName ? ` for ${petName}` : ''}?
                </h3>
                <p className="text-white/90 mb-4 text-sm">
                  Store medical records, share care instructions, generate lost pet flyers, and more!
                </p>
                <Button 
                  onClick={() => {
                    navigate('/#pricing?utm_source=doggone&utm_medium=cta&utm_campaign=viral');
                    if (typeof window !== 'undefined' && 'gtag' in window) {
                      (window as any).gtag('event', 'cta_click', {
                        event_category: 'conversion',
                        event_label: 'create_real_profile',
                        value: 1
                      });
                    }
                  }}
                  className="bg-white text-brand-primary hover:bg-brand-cream"
                >
                  Start Free Trial
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Feature Showcase Section - Inline Funnel */}
        <div className="mt-16 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-primary mb-3">
              What Else Can You Create?
            </h2>
            <p className="text-brand-primary-dark max-w-2xl mx-auto">
              This free generator is just for fun—PetPort's real power lies beneath. Our platform creates comprehensive digital pet profiles that preserve pet medical records, emergency data, pet care instructions, and your pet's complete story in a secure database. Our Lost pet recovery system is a powerful tool. We're giving pets a permanent voice that protects them for life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Lost Pet Flyer - Featured with Red Branding */}
            <Card 
              className="border-2 border-red-500 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={() => {
                navigate('/demo/missing-pet');
                if (typeof window !== 'undefined' && 'gtag' in window) {
                  (window as any).gtag('event', 'feature_card_click', {
                    event_category: 'conversion',
                    event_label: 'lost_pet_flyer'
                  });
                }
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-red-600 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    EMERGENCY TOOL
                  </span>
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2 group-hover:text-red-700">
                  Lost Pet LiveLink
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  Interactive sighting board, instant social media sharing, and professional PDF flyers. Complete lost pet recovery system.
                </p>
                <Button 
                  variant="default" 
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/demo/missing-pet');
                  }}
                >
                  See Demo →
                </Button>
              </CardContent>
            </Card>

            {/* Pet Profile */}
            <Card 
              className="border-brand-primary/20 hover:border-brand-primary hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => {
                navigate('/demos');
                if (typeof window !== 'undefined' && 'gtag' in window) {
                  (window as any).gtag('event', 'feature_card_click', {
                    event_category: 'conversion',
                    event_label: 'pet_profile'
                  });
                }
              }}
            >
              <CardContent className="p-6">
                <div className="p-3 bg-brand-primary/10 rounded-lg mb-3 w-fit">
                  <Heart className="h-6 w-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-brand-primary mb-2 group-hover:text-brand-secondary">
                  Digital Pet Profiles
                </h3>
                <p className="text-brand-primary-dark text-sm mb-4">
                  Create beautiful, shareable profiles with photos, medical records, care instructions & more.
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary hover:!text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/demos');
                  }}
                >
                  See Demo →
                </Button>
              </CardContent>
            </Card>

            {/* Pet Gallery */}
            <Card 
              className="border-brand-primary/20 hover:border-brand-primary hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => {
                navigate('/demo/gallery');
                if (typeof window !== 'undefined' && 'gtag' in window) {
                  (window as any).gtag('event', 'feature_card_click', {
                    event_category: 'conversion',
                    event_label: 'gallery'
                  });
                }
              }}
            >
              <CardContent className="p-6">
                <div className="p-3 bg-brand-primary/10 rounded-lg mb-3 w-fit">
                  <Camera className="h-6 w-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-brand-primary mb-2 group-hover:text-brand-secondary">
                  Photo Galleries
                </h3>
                <p className="text-brand-primary-dark text-sm mb-4">
                  Share unlimited photos & videos of your pets with friends and family in beautiful galleries.
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary hover:!text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/demo/gallery');
                  }}
                >
                  See Demo →
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* CTA Below Cards */}
          <div className="text-center mt-8">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90"
              onClick={() => {
                navigate('/#pricing?utm_source=doggone&utm_medium=showcase&utm_campaign=viral');
                if (typeof window !== 'undefined' && 'gtag' in window) {
                  (window as any).gtag('event', 'showcase_cta_click', {
                    event_category: 'conversion',
                    event_label: 'start_free_trial'
                  });
                }
              }}
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </main>

      {/* Ad Slot - Footer */}
      <div id="adslot-doggone-footer" className="max-w-7xl mx-auto px-4 py-4" />


      {/* Post-Download Modal */}
      <Dialog open={showPostDownload} onOpenChange={setShowPostDownload}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl text-brand-primary">Love Your Résumé? 🎉</DialogTitle>
            <DialogDescription className="text-base">
              Imagine what you could do with a full PetPort profile...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="p-4 border-2 border-red-500 rounded-lg cursor-pointer hover:bg-red-50 transition-colors bg-gradient-to-br from-red-50 to-rose-50"
                onClick={() => {
                  navigate('/demo/missing-pet');
                  setShowPostDownload(false);
                }}
              >
                <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                <h4 className="font-bold text-sm text-red-900 mb-1">Lost Pet LiveLink</h4>
                <p className="text-xs text-red-700">Sighting board & flyers</p>
              </div>
              <div 
                className="p-4 border-2 border-brand-primary/30 rounded-lg cursor-pointer hover:bg-brand-primary/5 transition-colors"
                onClick={() => {
                  navigate('/demos');
                  setShowPostDownload(false);
                }}
              >
                <FileText className="h-8 w-8 text-brand-primary mb-2" />
                <h4 className="font-bold text-sm text-brand-primary mb-1">Medical Records</h4>
                <p className="text-xs text-brand-primary-dark">Store & share</p>
              </div>
              <div 
                className="p-4 border-2 border-brand-primary/30 rounded-lg cursor-pointer hover:bg-brand-primary/5 transition-colors"
                onClick={() => {
                  navigate('/demo/care');
                  setShowPostDownload(false);
                }}
              >
                <Heart className="h-8 w-8 text-brand-primary mb-2" />
                <h4 className="font-bold text-sm text-brand-primary mb-1">Care Instructions</h4>
                <p className="text-xs text-brand-primary-dark">For sitters</p>
              </div>
              <div 
                className="p-4 border-2 border-brand-primary/30 rounded-lg cursor-pointer hover:bg-brand-primary/5 transition-colors"
                onClick={() => {
                  navigate('/demo/gallery');
                  setShowPostDownload(false);
                }}
              >
                <Camera className="h-8 w-8 text-brand-primary mb-2" />
                <h4 className="font-bold text-sm text-brand-primary mb-1">Photo Gallery</h4>
                <p className="text-xs text-brand-primary-dark">Unlimited storage</p>
              </div>
            </div>
            <Button 
              size="lg"
              className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
              onClick={() => {
                navigate('/#pricing?utm_source=doggone&utm_medium=post_download&utm_campaign=viral');
                setShowPostDownload(false);
                if (typeof window !== 'undefined' && 'gtag' in window) {
                  (window as any).gtag('event', 'post_download_conversion', {
                    event_category: 'conversion',
                    event_label: 'pricing_page'
                  });
                }
              }}
            >
              Start Free Trial
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Bottom Banner - Mobile Only */}
      {!dismissedSticky && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 shadow-2xl z-50 md:hidden">
          <button 
            onClick={() => setDismissedSticky(true)}
            className="absolute top-2 right-2 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5" />
              <h4 className="font-bold text-sm">See What Else PetPort Can Do</h4>
            </div>
            <p className="text-xs text-white/90 mb-3">
              Explore digital pet profiles, lost pet recovery, care instructions & more
            </p>
            <Button 
              size="sm"
              className="bg-white text-amber-600 hover:bg-amber-50 w-full"
              onClick={() => {
                navigate('/demos');
                setDismissedSticky(true);
                if (typeof window !== 'undefined' && 'gtag' in window) {
                  (window as any).gtag('event', 'sticky_banner_click', {
                    event_category: 'conversion',
                    event_label: 'demos_page'
                  });
                }
              }}
            >
              Explore LiveLink Demos →
            </Button>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 mt-16 mb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-brand-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about pet resumes and housing applications
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="font-semibold text-foreground">
                Do landlords actually accept pet resumes for rental applications?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes! Many landlords and property managers now accept pet resumes as part of the screening process. A professional pet resume demonstrates responsible pet ownership by showing vaccination records, training certifications, references from previous landlords or veterinarians, and proof of pet insurance. This helps landlords make informed decisions and can significantly increase your chances of approval in competitive rental markets.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="font-semibold text-foreground">
                What should I include in a pet resume for housing applications?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              A strong pet resume should include: your pet's basic information (name, breed, age, weight), spay/neuter status, current vaccinations and veterinary records, obedience training certifications, behavioral traits and temperament, previous landlord references confirming no property damage or noise complaints, pet insurance information, emergency care plans, and professional photos. PetPort's platform helps organize all this information in one shareable, professional document.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="font-semibold text-foreground">
                How does a pet screening resume help with rental applications?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Pet screening resumes help rental applications by presenting your pet as a responsible, well-cared-for companion rather than a liability. They provide landlords with documented proof of vaccinations, training, and good behavior, addressing common concerns about property damage, noise, or safety. In competitive markets, a professional pet resume can be the deciding factor between multiple qualified applicants, showing you take pet ownership seriously.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="font-semibold text-foreground">
                Can I use the Dog-Gone-Good resume generator for cats and horses?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Absolutely! The Dog-Gone-Good generator works for dogs, cats, and horses. Each species has customized fields and options appropriate for that animal type. Whether you need a professional resume for a rental application, boarding facility, or just for fun social media sharing, you can create a polished, shareable document for any pet species in seconds - completely free with no signup required.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="font-semibold text-foreground">
                Is the pet resume generator really free to use?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes — the Dog-Gone-Good generator is 100% free: no signup, no payment, and no hidden fees. You can create, customize, download, and share as many pet resumes as you want.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="font-semibold text-foreground">
                What's the difference between the free resume and PetPort's full resume?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <p>Free Dog-Gone-Good resume includes:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>1–2 photos</li>
                <li>Playful, humorous Q&A prompts for sharing</li>
                <li>Shareable image download</li>
              </ul>
              <p className="mt-2">No bio/core details or advanced sections (training, achievements, references, travel, or contact).</p>
              <p className="mt-4">PetPort full resume includes:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Experience & Activities</li>
                <li>Achievements</li>
                <li>Training</li>
                <li>Professional Certifications</li>
                <li>References & Reviews (request and display)</li>
                <li>Travel history</li>
                <li>Public share link and PDF export</li>
                <li>Contact Owner button</li>
              </ul>
              <p className="mt-4">In short: the free version is a simple one‑pager; the full resume is a professional, multi‑section profile.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="font-semibold text-foreground">
                Can I update my pet's resume after downloading it?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              The free Dog-Gone-Good generator creates a downloadable image file, so you would need to regenerate it with updated information. However, with a PetPort subscription, your pet's digital resume and profile are always editable and update in real-time. When you share your PetPort profile link with landlords or facilities, they always see the most current information - no need to create and send new documents every time something changes.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* CTA after FAQ */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-2xl p-8 border border-brand-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Ready to Create Your Pet's Digital Profile?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Go beyond the fun resume. Get comprehensive pet management with medical records, lost pet recovery, travel docs, and lifetime updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/#pricing')}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 transition-opacity"
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/demos')}
                className="border-brand-primary text-brand-primary hover:bg-brand-primary/5"
              >
                Explore LiveLink Demos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>
            Powered by{" "}
            <a href={window.location.origin} className="text-brand-primary hover:underline font-medium">
              PetPort.app
            </a>
            {" "}— Giving Pets a Voice for Their Lifetime
          </p>
        </div>
      </footer>
    </div>
  );
}
