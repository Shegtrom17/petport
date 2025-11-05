import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { Sparkles, Download, Share2, Wand2, Eye, X, Heart, FileText, AlertTriangle, Camera, Menu } from "lucide-react";
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
          <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
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
                variant="outline"
                disabled={!isCanvasReady || photosLoading}
                className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="mr-2 h-5 w-5" />
                View Full Size
              </Button>
              <Button 
                onClick={downloadJPEG}
                size="lg"
                disabled={!isCanvasReady || photosLoading}
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="mr-2 h-5 w-5" />
                Download as Image
              </Button>
              <Button 
                onClick={shareNative}
                size="lg"
                variant="outline"
                disabled={!isCanvasReady || photosLoading}
                className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share on Social
              </Button>
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
              This free résumé generator is just the beginning. See what else PetPort can do for your pets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Lost Pet Flyer - Featured with Red Branding */}
            <Card 
              className="border-2 border-red-500 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={() => {
                navigate('/demos/missing-pet');
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
                  Lost Pet Flyer Generator
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  Generate professional missing pet flyers with custom details, photos, and QR codes in seconds. Every minute counts.
                </p>
                <Button 
                  variant="default" 
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/demos/missing-pet');
                  }}
                >
                  Try It Free →
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
                  className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
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
                navigate('/demos/gallery');
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
                  className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/demos/gallery');
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
                  navigate('/demos/missing-pet');
                  setShowPostDownload(false);
                }}
              >
                <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                <h4 className="font-bold text-sm text-red-900 mb-1">Lost Pet Flyers</h4>
                <p className="text-xs text-red-700">Generate in seconds</p>
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
                  navigate('/demos/care');
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
                  navigate('/demos/gallery');
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
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-bold text-sm">Lost Pet Protection</h4>
            </div>
            <p className="text-xs text-white/90 mb-3">
              Generate lost pet flyers instantly if your pet ever goes missing
            </p>
            <Button 
              size="sm"
              className="bg-white text-amber-600 hover:bg-amber-50 w-full"
              onClick={() => {
                navigate('/demos/missing-pet');
                setDismissedSticky(true);
                if (typeof window !== 'undefined' && 'gtag' in window) {
                  (window as any).gtag('event', 'sticky_banner_click', {
                    event_category: 'conversion',
                    event_label: 'lost_pet_demo'
                  });
                }
              }}
            >
              Try It Free →
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
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
