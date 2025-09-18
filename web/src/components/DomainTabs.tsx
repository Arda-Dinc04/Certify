import React from 'react';
import { ALL_DOMAIN_SLUGS, getDomainLabel, getDomainMeta, getDomainIcon } from '../config/domains';

interface DomainTabsProps {
  active: string;
  onChange: (slug: string) => void;
  className?: string;
}

export function DomainTabs({ active, onChange, className = '' }: DomainTabsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {ALL_DOMAIN_SLUGS.map(slug => {
        const meta = getDomainMeta(slug);
        return (
          <button
            key={slug}
            onClick={() => onChange(slug)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              active === slug
                ? 'bg-black text-white border-black'
                : `bg-white hover:${meta?.color || 'bg-gray-50'} border-gray-200`
            }`}
            aria-label={`Filter by ${getDomainLabel(slug)}`}
          >
            <span className="mr-1">{React.createElement(getDomainIcon(slug), { className: "w-4 h-4 inline" })}</span>
            {getDomainLabel(slug)}
          </button>
        );
      })}
    </div>
  );
}

export default DomainTabs;