import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Cloud, Building2, Search, Shield, Award, Briefcase, Database, Code, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardFooter } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import type { Certification } from '../types';
import { cn } from '../utils/cn';
import { getDomainLabel, getDomainEmoji } from '../config/domains';

interface CertificationCardProps {
  certification: Certification;
  showRanking?: boolean;
  rank?: number;
  showCompareButton?: boolean;
  onAddToCompare?: (certification: Certification) => void;
  isInCompare?: boolean;
  className?: string;
}

const CertificationCard: React.FC<CertificationCardProps> = ({
  certification,
  showRanking = false,
  rank,
  showCompareButton = false,
  onAddToCompare,
  isInCompare = false,
  className
}) => {
  const {
    name,
    slug,
    issuer,
    domain,
    level,
    duration,
    cost,
    currency,
    rating,
    ranking
  } = certification;

  const formatCost = (cost: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cost);
  };

  const getIssuerIcon = (issuer: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'Amazon Web Services (AWS)': Cloud,
      'Microsoft': Building2,
      'Google': Search,
      'Google Cloud': Search,
      'Cisco': Shield,
      'CompTIA': Award,
      'PMI': Briefcase,
      'FINRA': BarChart3,
      'Adobe': Code,
      'Oracle': Database,
      'Salesforce': Cloud,
      'VMware': Shield,
      'Red Hat': Shield,
      'Docker': Code,
      'Kubernetes': Code,
      'IBM': Building2,
      'NVIDIA': Code,
      'Tableau': BarChart3,
      'SAS': BarChart3
    };
    return icons[issuer] || Database;
  };

  const getIssuerLogo = (issuer: string) => {
    const logoMap: { [key: string]: string } = {
      'Amazon Web Services (AWS)': '/assets/aws.jpeg',
      'Microsoft': '/assets/microsoft.jpg',
      'Google': '/assets/Google-Logo-PNG.png',
      'Google Cloud': '/assets/Google-Logo-PNG.png',
      'Adobe': '/assets/adobe.png',
      'Oracle': '/assets/oracle.png',
      'FINRA': '/assets/finra.png',
      'Docker': '/assets/docker.png',
      'CAIA Association': '/assets/CAIA Association .png',
      'NCEES': '/assets/NCEES.png'
    };
    return logoMap[issuer];
  };


  return (
    <Card 
      className={cn('bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden p-0 h-full flex flex-col', className)}
      role="article"
      aria-labelledby={`cert-title-${slug}`}
      aria-describedby={`cert-details-${slug}`}
    >
      {/* Banner with Logo/Icon */}
      <div className="relative h-20 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-200 w-full">
        <div className="flex items-center space-x-3">
          {(() => {
            const logoUrl = getIssuerLogo(issuer);
            if (logoUrl) {
              return (
                <img 
                  src={logoUrl} 
                  alt={`${issuer} logo`} 
                  className="h-8 w-8 object-contain rounded" 
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    const IconComponent = getIssuerIcon(issuer);
                    const iconElement = document.createElement('div');
                    iconElement.className = 'h-8 w-8 text-gray-700';
                    e.currentTarget.replaceWith(iconElement);
                  }}
                />
              );
            } else {
              const IconComponent = getIssuerIcon(issuer);
              return <IconComponent className="h-8 w-8 text-gray-700" aria-hidden="true" />;
            }
          })()}
          <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]" title={issuer}>
            {issuer}
          </span>
        </div>
        {showRanking && (rank || ranking) && (
          <div className="absolute top-2 right-2">
            <div 
              className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1"
              role="img"
              aria-label={`Ranked number ${rank || ranking}`}
            >
              <span aria-hidden="true">🏆</span>
              <span>#{rank || ranking}</span>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 p-6">
        {/* Title and Provider */}
        <div className="mb-3">
          <h3 id={`cert-title-${slug}`} className="font-bold text-gray-900 text-sm leading-tight mb-1">
            {name}
          </h3>
          <p className="text-xs text-gray-600" aria-label={`Issued by ${issuer}`}>{issuer}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Certification tags">
          <Badge 
            variant="outline" 
            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 border-blue-200 flex items-center space-x-1"
            role="img"
            aria-label={`Domain: ${getDomainLabel(domain)}`}
          >
            <span aria-hidden="true">{getDomainEmoji(domain)}</span>
            <span>{getDomainLabel(domain)}</span>
          </Badge>
          <Badge 
            variant="outline" 
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border-gray-200"
            aria-label={`Level: ${level}`}
          >
            {level}
          </Badge>
        </div>

        <div id={`cert-details-${slug}`}>
          {/* Price */}
          <div className="text-teal-600 font-semibold text-lg mb-3" aria-label={`Cost: ${formatCost(cost, currency)}`}>
            {formatCost(cost, currency)}
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span aria-label={`Duration: ${duration}`}>{duration}</span>
          </div>

          {/* Rating */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Rating</span>
              <span className="text-sm font-medium" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
                {rating.toFixed(1)}/5.0
              </span>
            </div>
            <div 
              className="w-full bg-gray-200 rounded-full h-2" 
              role="progressbar" 
              aria-valuenow={rating} 
              aria-valuemin={0} 
              aria-valuemax={5}
              aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}
            >
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(rating / 5) * 100}%` }}
                aria-hidden="true"
              ></div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-0 p-6 mt-auto">
        <div className={cn("flex gap-2", showCompareButton ? "flex-col" : "")} role="group" aria-label="Certification actions">
          <Link 
            to={`/cert/${slug}`} 
            className={cn("w-full", showCompareButton ? "" : "")}
            aria-label={`View details for ${name}`}
          >
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center space-x-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
          {showCompareButton && onAddToCompare && (
            <Button 
              variant={isInCompare ? "default" : "outline"}
              onClick={() => onAddToCompare(certification)}
              disabled={isInCompare}
              className={cn(
                "w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isInCompare 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
              aria-label={isInCompare ? `${name} added to compare list` : `Add ${name} to compare list`}
            >
              {isInCompare ? "Added to Compare" : "Add to Compare"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

// Memoize component for performance
export default memo(CertificationCard, (prevProps, nextProps) => {
  return (
    prevProps.certification.slug === nextProps.certification.slug &&
    prevProps.showRanking === nextProps.showRanking &&
    prevProps.rank === nextProps.rank &&
    prevProps.showCompareButton === nextProps.showCompareButton &&
    prevProps.isInCompare === nextProps.isInCompare
  );
});