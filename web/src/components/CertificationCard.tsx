import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Cloud, Building2, Search, Shield, Award, Briefcase, Database, Code, BarChart3, Container, Cpu, Bot, Users, Car } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import type { Certification } from '../types';
import { cn } from '../utils/cn';
import { getDomainLabel, getDomainIcon } from '../config/domains';
import { useCompare } from '../context/CompareContext';

interface CertificationCardProps {
  certification: Certification;
  showRanking?: boolean;
  rank?: number;
  showCompareButton?: boolean;
  className?: string;
}

const CertificationCard: React.FC<CertificationCardProps> = ({
  certification,
  showRanking = false,
  rank,
  showCompareButton = false,
  className
}) => {
  const { addToCompare, removeFromCompare, isInCompare, canAddToCompare } = useCompare();
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
      'PMI (Project Management Institute)': Briefcase,
      'FINRA': BarChart3,
      'Adobe': Code,
      'Oracle': Database,
      'VMware': Shield,
      'Red Hat': Shield,
      'Docker': Code,
      'HashiCorp': Code,
      'Apple': Code,
      'Autodesk': Code,
      'GitLab': Code,
      'ISACA': Shield,
      'Unity': Code,
      'EC-Council': Shield,
      'GIAC': Shield,
      'Offensive Security': Shield,
      'The Open Group': Building2,
      'ACAMS': BarChart3,
      'ATD': Award,
      'CAIA Association': BarChart3,
      'CFA Institute': BarChart3,
      'FAA': Shield,
      'NCEES': Award,
      'Snowflake': Database,
      'MongoDB': Database,
      'Salesforce': Cloud,
      'IBM': Building2,
      'JetBrains': Code,
      'Kubernetes': Container,
      'OSHA': Shield,
      'NVIDIA': Cpu,
      'IEEE': Award,
      'Elastic': Search,
      'DataRobot': Bot,
      'Atlassian': Briefcase,
      'Databricks': Database,
      'SHRM': Users,
      'AHIMA': Shield,
      'AAPC': Award,
      'IMA': BarChart3,
      'COSO': Shield,
      'HRCI': Award,
      'IIBA': BarChart3,
      'Scrum.org': Users,
      'I-CAR': Car
    };
    return icons[issuer] || Database;
  };

  const getIssuerLogo = (issuer: string) => {
    const logoMap: { [key: string]: string } = {
      // Existing logos
      'Amazon Web Services (AWS)': '/assets/aws.jpeg',
      'Microsoft': '/assets/microsoft.jpg',
      'Google Cloud': '/assets/Google-Logo-PNG.png',
      'Adobe': '/assets/adobe.png',
      'Oracle': '/assets/oracle.png',
      'FINRA': '/assets/finra.png',
      'Docker': '/assets/docker.png',
      'CAIA Association': '/assets/CAIA Association .png',
      'NCEES': '/assets/NCEES.png',
      'Snowflake': '/assets/Snowflake.png',
      'CFA Institute': '/assets/cfa.jpg',
      'FAA': '/assets/faa.svg',
      'CompTIA': '/assets/comptia.jpeg',
      
      // Companies actually in the data with logos
      'Cisco': '/assets/Cisco.png',
      'VMware': '/assets/vmware.png',
      'Red Hat': '/assets/Red_Hat.svg',
      'ACAMS': '/assets/ACAMS.png',
      'ATD': '/assets/atd.jpg',
      'MongoDB': '/assets/MongoDB.png',
      'Salesforce': '/assets/Salesforce.png',
      'IBM': '/assets/IBM.png',
      'JetBrains': '/assets/JetBrains.png',
      'Kubernetes': '/assets/Kubernetes.svg',
      'OSHA': '/assets/OSHA.svg',
      'NVIDIA': '/assets/nvidia.png',
      'IEEE': '/assets/ieee.png',
      'Elastic': '/assets/elastic.png',
      'DataRobot': '/assets/datarobot.png',
      'Atlassian': '/assets/atlassian.webp',
      'Databricks': '/assets/Databricks.png',
      'SHRM': '/assets/SHRM.png',
      'AHIMA': '/assets/AHIMA.png',
      'AAPC': '/assets/AAPC.png',
      'IMA': '/assets/IMA.jpg',
      'COSO': '/assets/coso.png',
      'HRCI': '/assets/hrci.svg',
      'IIBA': '/assets/iiba.svg',
      'Scrum.org': '/assets/scrum.org.png',
      'I-CAR': '/assets/i-car.png',
      
      // Additional companies that might appear
      'Apple': '/assets/Google-Logo-PNG.png', // Using Google logo as fallback
      'Autodesk': '/assets/Google-Logo-PNG.png',
      'GitLab': '/assets/Google-Logo-PNG.png',
      'HashiCorp': '/assets/Google-Logo-PNG.png',
      'ISACA': '/assets/Google-Logo-PNG.png',
      'PMI (Project Management Institute)': '/assets/Google-Logo-PNG.png',
      'Unity': '/assets/Google-Logo-PNG.png',
      'EC-Council': '/assets/Google-Logo-PNG.png',
      'GIAC': '/assets/Google-Logo-PNG.png',
      'Offensive Security': '/assets/Google-Logo-PNG.png',
      'The Open Group': '/assets/Google-Logo-PNG.png'
    };
    
    // Try exact match first
    if (logoMap[issuer]) {
      return logoMap[issuer];
    }
    
    // Try case-insensitive match
    const lowerIssuer = issuer.toLowerCase();
    for (const [key, value] of Object.entries(logoMap)) {
      if (key.toLowerCase() === lowerIssuer) {
        return value;
      }
    }
    
    return undefined;
  };


  return (
    <Card 
      className={cn('bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl h-full flex flex-col relative', className)}
      role="article"
      aria-labelledby={`cert-title-${slug}`}
      aria-describedby={`cert-details-${slug}`}
    >
      {/* Ranking Badge - Floating Above Card */}
      {showRanking && (rank || ranking) && (
        <div className="absolute -top-4 -right-4 z-30">
          <div 
            className="w-16 h-16 bg-blue-600 text-white text-xl font-bold rounded-full flex items-center justify-center shadow-2xl border-4 border-white transform hover:scale-110 transition-transform duration-200"
            role="img"
            aria-label={`Ranked number ${rank || ranking}`}
            style={{
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
          >
            <span className="drop-shadow-lg font-black">#{rank || ranking}</span>
          </div>
        </div>
      )}

      {/* Full Width Company Banner */}
      <div className="relative h-20 bg-white flex items-center justify-center rounded-t-2xl overflow-hidden">
        {(() => {
          const logoUrl = getIssuerLogo(issuer);
          if (logoUrl) {
            return (
              <img 
                src={logoUrl} 
                alt={`${issuer} logo`} 
                   className={cn(
                     "object-contain",
                     ['Docker', 'Google', 'CompTIA', 'Cisco', 'MongoDB', 'Snowflake', 'NVIDIA', 'Atlassian', 'DataRobot', 'IMA', 'Adobe', 'Scrum.org', 'COSO'].includes(issuer) ? "h-16 w-auto" : "h-20 w-full object-cover"
                   )}
                onError={(e) => {
                  const iconElement = document.createElement('div');
                  iconElement.className = 'h-20 w-full text-gray-600 flex items-center justify-center';
                  iconElement.innerHTML = '🏢';
                  e.currentTarget.replaceWith(iconElement);
                }}
              />
            );
          } else {
            const IconComponent = getIssuerIcon(issuer);
            return (
              <div className="h-20 w-20 flex items-center justify-center">
                <IconComponent className="h-16 w-16 text-gray-600" aria-hidden="true" />
              </div>
            );
          }
        })()}
      </div>

      {/* Content Section */}
      <div className="p-4 pb-2 flex-grow flex flex-col">

        {/* Certification Title */}
        <h3 id={`cert-title-${slug}`} className="font-bold text-gray-900 text-lg leading-tight mb-1">
          {name}
        </h3>
        
        {/* Issuer Name */}
        <p className="text-sm text-gray-600 mb-3">
          {issuer}
        </p>

        {/* Domain and Level Badges */}
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Certification tags">
          <Badge 
            variant="outline" 
            className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 border-blue-200 flex items-center space-x-1"
            role="img"
            aria-label={`Domain: ${getDomainLabel(domain)}`}
          >
            {React.createElement(getDomainIcon(domain), { className: "w-2.5 h-2.5", "aria-hidden": "true" })}
            <span>{getDomainLabel(domain)}</span>
          </Badge>
          <Badge 
            variant="outline" 
            className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 border-gray-200"
            aria-label={`Level: ${level}`}
          >
            {level}
          </Badge>
        </div>

        <div id={`cert-details-${slug}`}>
          {/* Price and Duration Row */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-green-600" aria-label={`Cost: ${formatCost(cost, currency)}`}>
              {formatCost(cost, currency)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
              <span aria-label={`Duration: ${duration}`}>{duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Bar - Positioned above action buttons */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Rating</span>
          <span className="text-sm font-bold text-gray-900" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
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

      {/* Action Buttons */}
      <div className="p-4 pt-0">
        <div className="flex gap-2" role="group" aria-label="Certification actions">
          <Link 
            to={`/cert/${slug}`} 
            className="flex-[2]"
            aria-label={`View details for ${name}`}
          >
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center space-x-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
          {showCompareButton && (
            <div className="flex-[1] flex items-center justify-center">
              <button
                onClick={() => {
                  if (isInCompare(certification.id)) {
                    removeFromCompare(certification.id);
                  } else {
                    addToCompare(certification);
                  }
                }}
                disabled={!isInCompare(certification.id) && !canAddToCompare}
                className={cn(
                  "text-[10px] font-medium py-0.5 px-1 rounded transition-colors focus:outline-none",
                  isInCompare(certification.id)
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                    : !canAddToCompare
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                )}
                aria-label={isInCompare(certification.id) ? `Remove ${name} from compare list` : `Add ${name} to compare list`}
              >
                {isInCompare(certification.id) ? "Remove from Compare" : "Add to Compare"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Memoize component for performance
export default memo(CertificationCard, (prevProps, nextProps) => {
  return (
    prevProps.certification.slug === nextProps.certification.slug &&
    prevProps.showRanking === nextProps.showRanking &&
    prevProps.rank === nextProps.rank &&
    prevProps.showCompareButton === nextProps.showCompareButton
  );
});