import { useEffect } from 'react';

interface PreloadHintsProps {
  resources: Array<{
    href: string;
    as: string;
    type?: string;
  }>;
}

export function PreloadHints({ resources }: PreloadHintsProps) {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) {
        link.type = resource.type;
      }
      
      document.head.appendChild(link);
      links.push(link);
    });

    // Cleanup
    return () => {
      links.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [resources]);

  return null;
}

// Hook for preloading critical data files
export function useDataPreload() {
  useEffect(() => {
    // Preload critical data files
    const criticalResources = [
      '/data/certifications/index.map.json',
      '/data/search/index.json',
      '/data/companies/by_domain.json',
    ];

    criticalResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }, []);
}

export default PreloadHints;