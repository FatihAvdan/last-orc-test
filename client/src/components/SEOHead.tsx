import React from 'react';
import type { SEOMeta } from '@devfolio/shared';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

export function SEOHead({ title, description, keywords, ogImage, ogType, canonicalUrl }: SEOHeadProps): React.ReactElement {
  React.useEffect(() => {
    document.title = title;
    const metaTags: Record<string, string> = {
      description,
      keywords,
    };

    Object.entries(metaTags).forEach(([name, content]) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    });

    if (ogImage) {
      let el = document.querySelector('meta[property="og:image"]');
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', 'og:image');
        document.head.appendChild(el);
      }
      el.setAttribute('content', ogImage);
    }

    if (ogType) {
      let el = document.querySelector('meta[property="og:type"]');
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', 'og:type');
        document.head.appendChild(el);
      }
      el.setAttribute('content', ogType);
    }

    if (canonicalUrl) {
      let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
      }
      el.setAttribute('href', canonicalUrl);
    }
  }, [title, description, keywords, ogImage, ogType, canonicalUrl]);

  return React.createElement(React.Fragment, null);
}
