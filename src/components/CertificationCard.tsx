import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Cloud, Building2, Search, Shield, Award, Briefcase, Database, Code, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardFooter } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import type { Certification } from '../types';
import { cn } from '../utils/cn';

interface CertificationCardProps {
  certification: Certification;
  showRanking?: boolean;
  className?: string;
}

const CertificationCard: React.FC<CertificationCardProps> = ({
  certification,
  showRanking = false,
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
      'Cisco': Shield,
      'CompTIA': Award,
      'PMI': Briefcase,
      'FINRA': BarChart3,
      'Adobe': Code
    };
    return icons[issuer] || Database;
  };


  return (
    <Card className={cn('bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden p-0', className)}>
      {/* Banner with Icon */}
      <div className="relative h-20 bg-gray-50 flex items-center justify-center border-b border-gray-200 w-full">
        <div className="flex items-center space-x-3">
          {(() => {
            const IconComponent = getIssuerIcon(issuer);
            return <IconComponent className="h-8 w-8 text-gray-700" />;
          })()}
          <span className="text-sm font-medium text-gray-700">{issuer}</span>
        </div>
        {showRanking && ranking && (
          <div className="absolute top-2 right-2">
            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
              <span>🏆</span>
              <span>#{ranking}</span>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 p-6">
        {/* Title and Provider */}
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
            {name}
          </h3>
          <p className="text-xs text-gray-600">{issuer}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-100 text-blue-800 border-blue-200 flex items-center space-x-1">
            <Code className="w-3 h-3" />
            <span>{domain}</span>
          </Badge>
          <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border-gray-200">
            {level}
          </Badge>
        </div>

        {/* Price */}
        <div className="text-teal-600 font-semibold text-lg mb-3">
          {formatCost(cost, currency)}
        </div>

        {/* Duration */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
          <Clock className="w-4 h-4" />
          <span>{duration}</span>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Rating</span>
            <span className="text-sm font-medium">{rating.toFixed(1)}/5.0</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${(rating / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-0 p-6">
        <Link to={`/certifications/${slug}`} className="w-full">
          <Button variant="outline" className="w-full flex items-center justify-center space-x-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50">
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CertificationCard;