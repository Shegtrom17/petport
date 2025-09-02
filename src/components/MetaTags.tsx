import { useEffect } from 'react';

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: string;
}

export const MetaTags = ({ title, description, image, url, type = "website" }: MetaTagsProps) => {
  const ogImage = image || "https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/og-images/resume-og-v1.png?v=9";
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateNameTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Open Graph tags for Facebook
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'PetPort');
    
    updateMetaTag('og:image', ogImage);
    updateMetaTag('og:image:secure_url', ogImage);
    updateMetaTag('og:image:type', 'image/png');
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:image:alt', 'PetPort digital pet resume preview');

    // Twitter Card tags
    updateNameTag('twitter:card', 'summary_large_image');
    updateNameTag('twitter:title', title);
    updateNameTag('twitter:description', description);
    updateNameTag('twitter:image', ogImage);

    // Facebook specific tags removed (no fb:app_id without numeric value)
    
    // Additional SEO tags
    updateNameTag('description', description);
    updateNameTag('robots', 'index, follow');

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      document.title = 'PetPort - Digital Pet Passport';
      updateNameTag('description', 'Digital passport for your beloved pets');
      
      // Remove dynamic Open Graph tags
      const dynamicTags = [
        'og:title', 'og:description', 'og:url', 'og:image', 
        'twitter:title', 'twitter:description', 'twitter:image'
      ];
      
      dynamicTags.forEach(tag => {
        const meta = document.querySelector(`meta[property="${tag}"], meta[name="${tag}"]`);
        if (meta && meta.getAttribute('content') !== 'Digital passport for your beloved pets') {
          meta.remove();
        }
      });
    };
  }, [title, description, image, url, type, ogImage]);

  return null; // This component doesn't render anything
};