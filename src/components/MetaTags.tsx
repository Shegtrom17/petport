// ⚠️ WARNING: FROZEN MODULE — DO NOT MODIFY WITHOUT OWNER APPROVAL
// This file contains verified production logic for OG metadata and social sharing tags.
// Last verified: October 2025
// Changes require explicit approval from Susan Hegstrom after:
//   1. Regression testing on iOS Safari, Android Chrome, Desktop
//   2. Verification that OG images still load from Cloudflare R2
//   3. Confirmation that Facebook/Twitter sharing previews work correctly
// Any refactor proposals must be discussed in chat-and-plan mode first.
// @lovable:protect begin

import { useEffect } from 'react';
import { getSafeBaseURL } from '@/utils/domainGuard';

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: string;
}

// @lovable:protect-function - OG tag injection for social media (Oct 2025)
export const MetaTags = ({ title, description, image, url, type = "website" }: MetaTagsProps) => {
  const ogImage = image || "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/OG%20General.png";
  const canonicalUrl = url.includes('petport.app') ? url : getSafeBaseURL() + new URL(url).pathname;
  
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

    // Add canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Open Graph tags for Facebook
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:url', canonicalUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'PetPort');
    
    updateMetaTag('og:image', ogImage);
    updateMetaTag('og:image:secure_url', ogImage);
    updateMetaTag('og:image:type', 'image/png');
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:image:alt', 'PetPort digital pet passport preview');

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

// @lovable:protect end