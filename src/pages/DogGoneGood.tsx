import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { Sparkles, Download, Share2, Wand2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { themes, ThemeId } from "@/config/themes";

type Species = 'dog' | 'cat' | 'horse';

interface ResumeData {
  title: string;
  achievements: string;
  experience: string;
  references: string;
  motto: string;
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
  const [petName1, setPetName1] = useState('');
  const [petName2, setPetName2] = useState('');
  const [photoPreview1, setPhotoPreview1] = useState<string | null>(null);
  const [photoPreview2, setPhotoPreview2] = useState<string | null>(null);
  const [photoFile1, setPhotoFile1] = useState<File | null>(null);
  const [photoFile2, setPhotoFile2] = useState<File | null>(null);
  const [formData, setFormData] = useState<ResumeData>({
    title: dogCatOptions.title[0],
    achievements: themes.patriotic.achievements[0],
    experience: themes.patriotic.experiences[0],
    references: themes.patriotic.references[0],
    motto: themes.patriotic.mottos[0]
  });
  const [showCTA, setShowCTA] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const currentOptions = species === 'horse' ? horseOptions : dogCatOptions;
  const currentTheme = themes[theme];

  useEffect(() => {
    renderCanvas();
  }, [formData, petName1, petName2, photoPreview1, photoPreview2, species, theme]);

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

    if (photoNumber === 1) {
      setPhotoFile1(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview1(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoFile2(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview2(reader.result as string);
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
    const randomAchievement = currentTheme.achievements[Math.floor(Math.random() * currentTheme.achievements.length)];
    const randomExperience = currentTheme.experiences[Math.floor(Math.random() * currentTheme.experiences.length)];
    const randomReference = currentTheme.references[Math.floor(Math.random() * currentTheme.references.length)];
    const randomMotto = currentTheme.mottos[Math.floor(Math.random() * currentTheme.mottos.length)];

    setFormData({
      title: randomTitle,
      achievements: randomAchievement,
      experience: randomExperience,
      references: randomReference,
      motto: randomMotto
    });

    setTimeout(() => setIsRandomizing(false), 500);
    toast.success("🎲 Feeling fetchy!");
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
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
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 68px 'Fredoka', Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PET RÉSUMÉ", 600, 180);

    // Pet Photos Section - TWO SQUARE PHOTOS SIDE BY SIDE
    let yOffset = 320;
    const hasPhoto1 = !!photoPreview1;
    const hasPhoto2 = !!photoPreview2;
    const photoCount = (hasPhoto1 ? 1 : 0) + (hasPhoto2 ? 1 : 0);
    
    // Photo sizing
    const twoPhotoSize = 480; // Each photo is 40% of 1200px canvas
    const onePhotoSize = 720; // Single photo is 60% of canvas
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
      
      yOffset += twoPhotoSize + 20;
      
      // Draw pet names under photos with theme accent color
      ctx.fillStyle = currentTheme.colors.accent;
      ctx.font = "bold 36px 'Fredoka', Inter, sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      if (hasPhoto1 && petName1) {
        ctx.fillText(petName1, photo1X + twoPhotoSize / 2, yOffset);
      }
      if (hasPhoto2 && petName2) {
        ctx.fillText(petName2, photo2X + twoPhotoSize / 2, yOffset);
      }
      
      yOffset += 70;
    } else if (photoCount === 1) {
      // One photo centered at 60% width
      const photoX = (1200 - onePhotoSize) / 2;
      
      if (hasPhoto1) {
        drawSquarePhoto(photoPreview1, photoX, yOffset, onePhotoSize);
      } else if (hasPhoto2) {
        drawSquarePhoto(photoPreview2, photoX, yOffset, onePhotoSize);
      }
      
      yOffset += onePhotoSize + 20;
      
      // Draw single pet name centered under photo with theme accent color
      const displayPetName = petName1 || petName2;
      if (displayPetName) {
        ctx.fillStyle = currentTheme.colors.accent;
        ctx.font = "bold 36px 'Fredoka', Inter, sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(displayPetName, 600, yOffset);
      }
      
      yOffset += 70;
    } else {
      // No photos - show centered placeholder
      const photoX = (1200 - onePhotoSize) / 2;
      drawPlaceholder(photoX, yOffset, onePhotoSize);
      yOffset += onePhotoSize + 60;
    }

    // Title (not individual pet names - those appear under photos now)
    ctx.fillStyle = currentTheme.colors.text;
    ctx.font = "bold 70px 'Fredoka', Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const displayName = petName1 || petName2 || species.charAt(0).toUpperCase() + species.slice(1);
    ctx.fillText(`RÉSUMÉ OF ${displayName.toUpperCase()}`, 600, yOffset);

    yOffset += 90;

    // Content sections - more compact
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const leftMargin = 80;
    const maxWidth = 1040;

    // Title
    ctx.fillStyle = currentTheme.colors.accent;
    ctx.font = "bold 38px 'Fredoka', Inter, sans-serif";
    ctx.fillText('PROFESSIONAL TITLE', leftMargin, yOffset);
    yOffset += 48;
    ctx.fillStyle = currentTheme.colors.text;
    ctx.font = '26px Inter, sans-serif';
    wrapText(ctx, formData.title, leftMargin, yOffset, maxWidth, 38);
    yOffset += 85;

    // Achievements
    ctx.fillStyle = currentTheme.colors.accent;
    ctx.font = "bold 38px 'Fredoka', Inter, sans-serif";
    ctx.fillText('KEY ACHIEVEMENTS', leftMargin, yOffset);
    yOffset += 48;
    ctx.fillStyle = currentTheme.colors.text;
    ctx.font = '26px Inter, sans-serif';
    wrapText(ctx, formData.achievements, leftMargin, yOffset, maxWidth, 38);
    yOffset += 85;

    // Experience
    ctx.fillStyle = currentTheme.colors.accent;
    ctx.font = "bold 38px 'Fredoka', Inter, sans-serif";
    ctx.fillText('PROFESSIONAL EXPERIENCE', leftMargin, yOffset);
    yOffset += 48;
    ctx.fillStyle = currentTheme.colors.text;
    ctx.font = '26px Inter, sans-serif';
    wrapText(ctx, formData.experience, leftMargin, yOffset, maxWidth, 38);
    yOffset += 85;

    // References
    ctx.fillStyle = currentTheme.colors.accent;
    ctx.font = "bold 38px 'Fredoka', Inter, sans-serif";
    ctx.fillText('REFERENCES', leftMargin, yOffset);
    yOffset += 48;
    ctx.fillStyle = currentTheme.colors.text;
    ctx.font = '26px Inter, sans-serif';
    wrapText(ctx, formData.references, leftMargin, yOffset, maxWidth, 38);
    yOffset += 85;

    // Motto - larger and more prominent
    ctx.fillStyle = currentTheme.colors.accent;
    ctx.font = "bold italic 34px 'Fredoka', Inter, sans-serif";
    ctx.textAlign = "center";
    wrapText(ctx, `"${formData.motto}"`, 600, yOffset, 1000, 44);

    // Pawprint watermark in bottom corner
    ctx.globalAlpha = 0.08;
    ctx.font = '120px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = currentTheme.colors.text;
    ctx.fillText('🐾', 1150, 1450);
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
      const blob = await generateJPEGBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `petport-resume-${theme}-${species}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded! 🎉');
      setShowCTA(true);

      // Analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'resume_download', {
          event_category: 'conversion',
          event_label: `${theme}_${species}`
        });
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
    }
  };

  const viewResume = async () => {
    try {
      const blob = await generateJPEGBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.success('Opening résumé in new tab! 👀');
    } catch (error) {
      console.error('View failed:', error);
      toast.error('Failed to open résumé');
    }
  };

  const shareNative = async () => {
    if (!navigator.share) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied! Share it anywhere.");
      return;
    }

    try {
      const blob = await generateJPEGBlob();
      const file = new File([blob], `petport-resume-${theme}-${species}.jpg`, { type: 'image/jpeg' });

      await navigator.share({
        title: `${petName1 || petName2 || 'My Pet'}'s Résumé`,
        text: `Just made a ${currentTheme.name} résumé for my pet with PetPort! 😂 Try it yourself: ${window.location.href}`,
        files: [file]
      });

      toast.success("Shared successfully! 🎉");
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
      toast.error('Share canceled');
    }
  };

  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies);
    const options = newSpecies === 'horse' ? horseOptions : dogCatOptions;
    setFormData({
      title: options.title[0],
      achievements: currentTheme.achievements[0],
      experience: currentTheme.experiences[0],
      references: currentTheme.references[0],
      motto: currentTheme.mottos[0]
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
      achievements: newThemeData.achievements[0],
      experience: newThemeData.experiences[0],
      references: newThemeData.references[0],
      motto: newThemeData.mottos[0]
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

      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" alt="PetPort" className="w-10 h-10" />
          <span className="text-xl font-semibold text-brand-primary">PetPort</span>
        </div>
        <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
      </header>

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

            {/* Pet Names (Optional) */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <label className="block text-sm font-semibold text-brand-primary mb-3">
                Pet Names (optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Pet 1 Name</label>
                  <input 
                    type="text" 
                    value={petName1}
                    onChange={(e) => setPetName1(e.target.value)}
                    placeholder="Enter first pet name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Pet 2 Name</label>
                  <input 
                    type="text" 
                    value={petName2}
                    onChange={(e) => setPetName2(e.target.value)}
                    placeholder="Enter second pet name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              </div>
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
                  {currentTheme.achievements.map((option) => (
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
                  {currentTheme.experiences.map((option) => (
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
                  {currentTheme.references.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={`bg-white rounded-xl p-6 shadow-lg transition-transform ${isRandomizing ? 'scale-105' : 'scale-100'}`}>
              <label className="block text-sm font-semibold text-brand-primary mb-3">Life Motto</label>
              <Select value={formData.motto} onValueChange={(val) => updateField('motto', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentTheme.mottos.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Randomizer Button */}
            <Button 
              onClick={randomizeAll}
              size="lg"
              className="w-full bg-gradient-to-r from-brand-secondary to-brand-primary text-white hover:opacity-90 animate-bounce hover:animate-none"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              🎲 I'm Feeling Fetchy
            </Button>
          </div>

          {/* Right Column: Live Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-2xl border-2 border-brand-primary/20 md:sticky md:top-4">
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
              <Button 
                onClick={viewResume}
                size="lg"
                variant="outline"
                className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary/10"
              >
                <Eye className="mr-2 h-5 w-5" />
                View Full Size
              </Button>
              <Button 
                onClick={downloadJPEG}
                size="lg"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                <Download className="mr-2 h-5 w-5" />
                Download as Image
              </Button>
              <Button 
                onClick={shareNative}
                size="lg"
                variant="outline"
                className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share on Social
              </Button>
            </div>

            {/* Conversion CTA */}
            {showCTA && (
              <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl p-6 text-white text-center shadow-xl animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-bold mb-2">
                  Want a REAL PetPort Profile{petName1 || petName2 ? ` for ${petName1 || petName2}` : ''}?
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
      </main>

      {/* Ad Slot - Footer */}
      <div id="adslot-doggone-footer" className="max-w-7xl mx-auto px-4 py-4" />

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
