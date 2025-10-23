import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { Sparkles, Download, Share2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  ],
  achievements: [
    "Completed basic obedience (eventually)",
    "Mastered 'The Stare' technique",
    "Survived a bath without retaliation",
    "Awarded 'Best Snuggler' 2024",
    "Achieved 10,000 tail wags in a day",
    "Top score in Treat Acquisition Program",
    "Successfully ignored 97% of commands",
    "Perfected the 'Feed Me Now' eyes",
    "Made peace with the vacuum cleaner",
    "Caught tail on multiple occasions",
    "Never met a stranger (all are friends)",
    "Completed marathon nap session (18 hrs)",
    "Won 'Most Dramatic' at doggy daycare",
    "Mastered door-opening techniques",
    "Perfect attendance at dinner time"
  ],
  experience: [
    "3 years in backyard security",
    "5 years in nap optimization",
    "Volunteer greeter at local dog park",
    "Neighborhood patrol specialist",
    "Intern, Snack Research Division",
    "Resident alarm clock",
    "Expert in couch warming",
    "Head of household morale",
    "Former lead toy destroyer",
    "Senior squirrel surveillance officer",
    "Professional treat taste tester",
    "Certified lap warmer (self-certified)",
    "Full-time cuddle coordinator",
    "Part-time bird watcher",
    "Freelance belly rub quality inspector"
  ],
  references: [
    "The mailman (reluctant)",
    "The neighbor's cat",
    "Mom & Dad",
    "The groomer",
    "Grandma (biased)",
    "Local vet",
    "The UPS driver (conflicted feelings)",
    "The dog next door",
    "My favorite toy",
    "The treat jar (no comment)",
    "The vacuum cleaner (arch nemesis)",
    "Random squirrels (declined to comment)",
    "The couch (well-worn)",
    "Neighborhood birds (traumatized)",
    "The doorbell (frenemies)"
  ],
  motto: [
    "Work hard, nap harder.",
    "Fetching is a lifestyle.",
    "Purrfection takes practice.",
    "Treats are temporary, loyalty is forever.",
    "If it fits, I sits.",
    "Life's short — chase the squirrel.",
    "Love unconditionally, bark occasionally.",
    "Snacks first, questions later.",
    "Every day is a tail-wagging adventure.",
    "Nap like nobody's watching.",
    "Bark softly, carry a big stick.",
    "Paws for a moment, enjoy life.",
    "Eat, sleep, play, repeat.",
    "Be the person your dog thinks you are.",
    "Happiness is a warm lap."
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
  ],
  achievements: [
    "Cleared every fence (eventually)",
    "Won 'Best Mane' at county fair",
    "Survived fly season with dignity",
    "Logged 10,000 pasture laps",
    "Perfected side-eye communication",
    "Carried human safely through chaos",
    "Never bucked at the vet (mostly)",
    "Mastered trailer loading (finally)",
    "Accepted bridle without drama",
    "Champion ear pinning technique",
    "Avoided work detail successfully",
    "Perfect record of finding treats",
    "Master of dramatic sighs"
  ],
  experience: [
    "7 years trail experience",
    "Former therapy horse",
    "Lead mare responsibilities",
    "Showjumping intern",
    "Pasture maintenance supervisor",
    "Seasoned trailer traveler",
    "Professional arena work avoidance",
    "Expert hay quality inspector",
    "5 years in carrot acquisition",
    "Veteran of the county fair circuit",
    "Barn favorite status (earned)",
    "Professional photo model",
    "Full-time pasture ornament"
  ],
  references: [
    "Farrier",
    "Barn manager",
    "Riding instructor",
    "Stablehand",
    "Groom",
    "Other horses (anonymous)",
    "The local goat",
    "Vet (mixed reviews)",
    "Feed supplier",
    "Tack store owner",
    "Trail riding buddies",
    "The neighbor's donkey",
    "County fair judge"
  ],
  motto: [
    "Trot like you mean it.",
    "Neigh today, shine tomorrow.",
    "Eat hay, stay humble.",
    "Not all who wander are lost — some just found a better patch of grass.",
    "Keep calm and canter on.",
    "Born to run, forced to work.",
    "Hay is for horses (obviously).",
    "Life is better in the saddle.",
    "Carrots are life.",
    "Whinny more, worry less.",
    "Mane goals daily.",
    "Hoof it or lose it.",
    "Gallop towards your dreams."
  ]
};

export default function DogGoneGood() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [species, setSpecies] = useState<Species>('dog');
  const [petName, setPetName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ResumeData>({
    title: dogCatOptions.title[0],
    achievements: dogCatOptions.achievements[0],
    experience: dogCatOptions.experience[0],
    references: dogCatOptions.references[0],
    motto: dogCatOptions.motto[0]
  });
  const [showCTA, setShowCTA] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const currentOptions = species === 'horse' ? horseOptions : dogCatOptions;

  useEffect(() => {
    renderCanvas();
  }, [formData, petName, photoPreview, species]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateField = (field: keyof ResumeData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const randomizeAll = () => {
    setIsRandomizing(true);
    const randomTitle = currentOptions.title[Math.floor(Math.random() * currentOptions.title.length)];
    const randomAchievement = currentOptions.achievements[Math.floor(Math.random() * currentOptions.achievements.length)];
    const randomExperience = currentOptions.experience[Math.floor(Math.random() * currentOptions.experience.length)];
    const randomReference = currentOptions.references[Math.floor(Math.random() * currentOptions.references.length)];
    const randomMotto = currentOptions.motto[Math.floor(Math.random() * currentOptions.motto.length)];

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

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 1600);

    // Top section - gradient header
    const gradient = ctx.createLinearGradient(0, 0, 1200, 200);
    gradient.addColorStop(0, '#5691af');
    gradient.addColorStop(1, '#7bb3d1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 200);

    // PetPort logo text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillText('PetPort.app', 60, 120);

    // Pet Info Section
    let yOffset = 250;

    // Pet photo or silhouette
    if (photoPreview) {
      const img = new Image();
      img.src = photoPreview;
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(600, yOffset + 100, 100, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 500, yOffset, 200, 200);
        ctx.restore();
      };
    } else {
      // Draw placeholder circle
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.arc(600, yOffset + 100, 100, 0, Math.PI * 2);
      ctx.fill();
      
      // Species emoji
      ctx.font = '80px Arial';
      ctx.textAlign = 'center';
      const emoji = species === 'dog' ? '🐕' : species === 'cat' ? '🐱' : '🐴';
      ctx.fillText(emoji, 600, yOffset + 125);
    }

    yOffset += 240;

    // Resume title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    const displayName = petName || species.charAt(0).toUpperCase() + species.slice(1);
    ctx.fillText(`RÉSUMÉ OF ${displayName.toUpperCase()}`, 600, yOffset);

    yOffset += 80;

    // Content sections
    ctx.textAlign = 'left';
    const leftMargin = 80;
    const maxWidth = 1040;

    // Title
    ctx.fillStyle = '#5691af';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('PROFESSIONAL TITLE', leftMargin, yOffset);
    yOffset += 40;
    ctx.fillStyle = '#374151';
    ctx.font = '24px Inter, sans-serif';
    wrapText(ctx, formData.title, leftMargin, yOffset, maxWidth, 35);
    yOffset += 80;

    // Achievements
    ctx.fillStyle = '#5691af';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('KEY ACHIEVEMENTS', leftMargin, yOffset);
    yOffset += 40;
    ctx.fillStyle = '#374151';
    ctx.font = '24px Inter, sans-serif';
    wrapText(ctx, formData.achievements, leftMargin, yOffset, maxWidth, 35);
    yOffset += 80;

    // Experience
    ctx.fillStyle = '#5691af';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('PROFESSIONAL EXPERIENCE', leftMargin, yOffset);
    yOffset += 40;
    ctx.fillStyle = '#374151';
    ctx.font = '24px Inter, sans-serif';
    wrapText(ctx, formData.experience, leftMargin, yOffset, maxWidth, 35);
    yOffset += 80;

    // References
    ctx.fillStyle = '#5691af';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('REFERENCES', leftMargin, yOffset);
    yOffset += 40;
    ctx.fillStyle = '#374151';
    ctx.font = '24px Inter, sans-serif';
    wrapText(ctx, formData.references, leftMargin, yOffset, maxWidth, 35);
    yOffset += 80;

    // Motto
    ctx.fillStyle = '#5691af';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('LIFE MOTTO', leftMargin, yOffset);
    yOffset += 40;
    ctx.fillStyle = '#374151';
    ctx.font = 'italic 26px Inter, sans-serif';
    wrapText(ctx, `"${formData.motto}"`, leftMargin, yOffset, maxWidth, 35);

    // Footer banner
    ctx.fillStyle = '#5691af';
    ctx.fillRect(0, 1500, 1200, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 Created with love at PetPort.app — Giving Pets a Voice for Their Lifetime.', 600, 1560);
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
      }, 'image/jpeg', 0.92);
    });
  };

  const downloadJPEG = async () => {
    try {
      const blob = await generateJPEGBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `petport-resume-${species}-${Date.now()}.jpg`;
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
          event_label: species
        });
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
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
      const file = new File([blob], `petport-resume-${species}.jpg`, { type: 'image/jpeg' });

      await navigator.share({
        title: `${petName || 'My Pet'}'s Résumé`,
        text: `Just made a résumé for my pet with PetPort! 😂 Try it yourself: ${window.location.href}`,
        files: [file]
      });

      toast.success("Shared successfully! 🎉");
      setShowCTA(true);

      // Analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'resume_share', {
          event_category: 'conversion',
          event_label: species
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
      achievements: options.achievements[0],
      experience: options.experience[0],
      references: options.references[0],
      motto: options.motto[0]
    });

    // Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'species_select', {
        event_category: 'engagement',
        event_label: newSpecies
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

            {/* Photo Upload (Optional) */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <label className="block text-sm font-semibold text-brand-primary mb-3">
                Pet Photo (optional)
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
              />
              {photoPreview && (
                <div className="mt-4 flex justify-center">
                  <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-brand-primary/20" />
                </div>
              )}
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
                  {currentOptions.achievements.map((option) => (
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
                  {currentOptions.experience.map((option) => (
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
                  {currentOptions.references.map((option) => (
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
                  {currentOptions.motto.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Randomizer Button */}
            <Button 
              onClick={randomizeAll}
              size="lg"
              className="w-full bg-gradient-to-r from-brand-secondary to-brand-primary text-white hover:opacity-90"
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
