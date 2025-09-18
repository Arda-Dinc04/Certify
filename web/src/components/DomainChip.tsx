import React from 'react';
import { getDomainLabel, getDomainMeta, getDomainIcon } from '../config/domains';

interface DomainChipProps {
  domain: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function DomainChip({ domain, size = 'md', className = '' }: DomainChipProps) {
  const meta = getDomainMeta(domain);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2 py-1 text-sm';
  
  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} rounded-full bg-muted ${meta?.color || 'bg-gray-100'} ${className}`}>
      {React.createElement(getDomainIcon(domain), { className: "w-4 h-4" })}
      <span>{getDomainLabel(domain)}</span>
    </span>
  );
}

export default DomainChip;