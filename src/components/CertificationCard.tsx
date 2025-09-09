import React from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Monitor,
  DollarSign,
  Utensils,
  Scale,
  Cloud,
  Palette,
  Truck,
  Globe,
  Plane,
  Headphones,
  Heart,
  Building,
  Anchor,
  Recycle,
  Dumbbell,
  Music,
  Settings,
  Shield,
  GraduationCap,
  Lock,
  ChefHat,
  Building2,
  BarChart3
} from "lucide-react";
import clsx from "clsx";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import type { Certification } from "../types";

type Props = {
  certification: Certification;
  showRanking?: boolean;
  rank?: number; // <-- pass from list: index + 1
  showCompareButton?: boolean;
  onAddToCompare?: (certification: Certification) => void;
  onRemoveFromCompare?: (certificationId: string) => void;
  isInCompare?: boolean;
  isCompareFull?: boolean;
};

/**
 * Visuals match the provided screenshot:
 * - Large top banner (object-cover, rounded top corners)
 * - Green trophy rank pill at top-right
 * - Title, issuer, tags (domain + level)
 * - Green price, hours row with clock icon
 * - "Rating" label with blue progress bar and "3.3/5.0" at right
 * - "View Details →" button
 * - Smooth hover/active animations
 */
export default function CertificationCard({ 
  certification, 
  showRanking, 
  rank,
  showCompareButton = false,
  onAddToCompare,
  onRemoveFromCompare,
  isInCompare = false,
  isCompareFull = false
}: Props) {
  // Defensive field mapping so we don’t break if your shape differs slightly.
  const title =
    (certification as any).title ??
    (certification as any).name ??
    (certification as any).displayName ??
    "Untitled Certification";

  const issuer =
    (certification as any).issuer ??
    (certification as any).organization ??
    "Unknown issuer";

  const domain =
    (certification as any).domain ??
    (certification as any).domainSlug ??
    (certification as any).domainName;

  const level =
    (certification as any).level ??
    (certification as any).difficulty ??
    undefined;

  const price: number | undefined =
    (certification as any).cost ??
    (certification as any).price ??
    (certification as any).examFee;

  const minHours: number | undefined =
    (certification as any).minHours ??
    (certification as any).studyMinHours;

  const maxHours: number | undefined =
    (certification as any).maxHours ??
    (certification as any).studyMaxHours;

  const hoursRangeText =
    (certification as any).duration ??
    (certification as any).hoursRange ??
    (minHours && maxHours ? `${minHours}-${maxHours} hours` : undefined) ??
    (minHours ? `${minHours}+ hours` : undefined) ??
    (maxHours ? `≤${maxHours} hours` : undefined) ??
    "";

  const rating: number | undefined =
    (certification as any).rating ??
    (certification as any).score ??
    undefined;

  const ratingOutOf = 5;
  const ratingSafe = Math.max(0, Math.min(rating ?? 0, ratingOutOf));
  const ratingPct = (ratingSafe / ratingOutOf) * 100;

  // Domain icon mapping using Lucide React icons
  const getDomainIcon = (domainName: string) => {
    const domainLower = domainName.toLowerCase();
    if (domainLower.includes('cs') || domainLower.includes('it')) return Monitor;
    if (domainLower.includes('finance')) return DollarSign;
    if (domainLower.includes('food')) return Utensils;
    if (domainLower.includes('legal') && !domainLower.includes('compliance')) return Scale;
    if (domainLower.includes('devops') || domainLower.includes('cloud')) return Cloud;
    if (domainLower.includes('design') || domainLower.includes('creative')) return Palette;
    if (domainLower.includes('supply')) return Truck;
    if (domainLower.includes('language')) return Globe;
    if (domainLower.includes('aviation')) return Plane;
    if (domainLower.includes('audio') && domainLower.includes('engineering')) return Headphones;
    if (domainLower.includes('healthcare')) return Heart;
    if (domainLower.includes('hospitality')) return Building;
    if (domainLower.includes('maritime')) return Anchor;
    if (domainLower.includes('sustainability')) return Recycle;
    if (domainLower.includes('fitness') || domainLower.includes('wellness')) return Dumbbell;
    if (domainLower.includes('audio') && domainLower.includes('production')) return Music;
    if (domainLower.includes('engineering') && !domainLower.includes('audio')) return Settings;
    if (domainLower.includes('data') && domainLower.includes('protection')) return Lock;
    if (domainLower.includes('math') || domainLower.includes('actuarial')) return BarChart3;
    if (domainLower.includes('service') && domainLower.includes('management')) return Settings;
    if (domainLower.includes('project') && domainLower.includes('management')) return BarChart3;
    if (domainLower.includes('government') || domainLower.includes('defense')) return Building2;
    if (domainLower.includes('energy')) return Settings;
    if (domainLower.includes('compliance')) return BarChart3;
    if (domainLower.includes('cybersecurity')) return Shield;
    if (domainLower.includes('education')) return GraduationCap;
    if (domainLower.includes('privacy')) return Lock;
    if (domainLower.includes('culinary')) return ChefHat;
    if (domainLower.includes('architecture')) return Building2;
    if (domainLower.includes('governance')) return Building2;
    return BarChart3; // default icon
  };

  // Banner: use bannerImage from data service first, then fallback to hardcoded logic
  const getBannerContent = (certification: Certification, issuerName: string, domainName: string) => {
    // First, try to use the bannerImage from the data service
    if (certification.bannerImage) {
      return { type: 'image', content: certification.bannerImage };
    }
    
    // Fallback to hardcoded logic for issuers
    const issuerLower = issuerName.toLowerCase();
    if (issuerLower.includes('aws') || issuerLower.includes('amazon')) {
      return { type: 'image', content: '/src/assets/aws.jpeg' };
    } else if (issuerLower.includes('microsoft')) {
      return { type: 'image', content: '/src/assets/microsoft.jpg' };
    } else if (issuerLower.includes('finra')) {
      return { type: 'image', content: '/src/assets/finra.png' };
    } else if (issuerLower.includes('google')) {
      return { type: 'image', content: '/src/assets/Google-Logo-PNG.png' };
    } else if (issuerLower.includes('oracle')) {
      return { type: 'image', content: '/src/assets/oracle.png' };
    } else if (issuerLower.includes('docker')) {
      return { type: 'image', content: '/src/assets/docker.png' };
    } else if (issuerLower.includes('adobe')) {
      return { type: 'image', content: '/src/assets/adobe.png' };
    } else if (issuerLower.includes('ncees')) {
      return { type: 'image', content: '/src/assets/NCEES.png' };
    } else if (issuerLower.includes('caia')) {
      return { type: 'image', content: '/src/assets/CAIA Association .png' };
    } else if (issuerLower.includes('snowflake')) {
      return { type: 'image', content: '/src/assets/Snowflake.png' };
    } else if (issuerLower.includes('cfa')) {
      return { type: 'image', content: '/src/assets/cfa.jpg' };
    } else if (issuerLower.includes('faa') || issuerLower.includes('federal aviation')) {
      return { type: 'image', content: '/src/assets/faa.svg' };
    } else if (issuerLower.includes('fmcsa')) {
      return { type: 'image', content: '/src/assets/FMCSA.png' };
    } else if (issuerLower.includes('comptia')) {
      return { type: 'image', content: '/src/assets/comptia.jpeg' };
    }
    
    // Use domain icon if available, otherwise first letter
    const domainIcon = getDomainIcon(domainName);
    if (domainIcon !== BarChart3 || domainName.toLowerCase().includes('math')) {
      return { type: 'icon', content: domainIcon };
    }
    
    // Fallback to first letter
    return { type: 'letter', content: issuerName.charAt(0).toUpperCase() };
  };

  const bannerContent = getBannerContent(certification, issuer, domain || '');

  // slug / id for details link
  const slug =
    (certification as any).slug ??
    (certification as any).id ??
    encodeURIComponent(title.toLowerCase().replace(/\s+/g, "-"));

  return (
    <div className="relative">
      <Card
        // group enables nested hover effects
        className={clsx(
          "overflow-hidden rounded-2xl shadow-sm border border-gray-200 transition",
          "hover:shadow-md hover:-translate-y-1",
          "active:scale-[0.98] active:shadow-sm",
          "bg-white"
        )}
        style={{ 
          width: '280px', 
          height: '360px',
          minWidth: '280px',
          minHeight: '360px'
        }}
      >
              {/* Top banner (full-width brand banner) */}
              <div className="relative h-[100px] overflow-hidden rounded-t-2xl">
                {bannerContent.type === "image" ? (
                  <img
                    src={bannerContent.content as string}
                    alt={`${issuer} logo`}
                    className={`w-full h-full ${
                      issuer.toLowerCase().includes('comptia') 
                        ? 'object-contain bg-white p-2' 
                        : 'object-cover'
                    }`}
                  />
                ) : bannerContent.type === "icon" ? (
                  <div className="w-full h-full bg-[#0b1220] flex items-center justify-center">
                    {(() => {
                      const IconComponent = bannerContent.content as React.ComponentType<any>;
                      return <IconComponent className="h-16 w-16 text-zinc-300" />;
                    })()}
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#0b1220] flex items-center justify-center">
                    <span className="text-white/90 text-3xl font-semibold">
                      {String(bannerContent.content || "").toUpperCase()}
                    </span>
                  </div>
                )}
              </div>


      {/* Body */}
      <div className={clsx("p-3 flex flex-col", showCompareButton ? "h-[240px]" : "h-[240px]")}>
        {/* Certification Name & Company */}
        <div className="mt-3 mb-3">
          <h3 className="text-base font-semibold text-zinc-900 leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-zinc-600 truncate">{issuer}</p>
        </div>

        {/* Tags and Hours */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 flex-wrap">
            {domain && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium">
                {(() => {
                  const DomainIcon = getDomainIcon(domain.toString());
                  return <DomainIcon className="w-3 h-3" />;
                })()}
                {domain.toString().toUpperCase()}
              </span>
            )}
            {level && (
              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-medium">
                {capitalize(level)}
              </span>
            )}
          </div>
          
          {/* Hours */}
          {hoursRangeText && (
            <div className="flex items-center gap-1 text-gray-700">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs">{hoursRangeText}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {price !== undefined && (
          <div className="text-emerald-600 font-bold text-base mb-2">
            ${Intl.NumberFormat().format(price)}
          </div>
        )}


        {/* Rating */}
        <div className="mb-3">
          <div className="text-xs text-gray-700 font-medium mb-1">Rating</div>
          <div className="flex items-center gap-2">
            <div className="relative h-2 rounded-full bg-gray-200 flex-1 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-blue-500 transition-[width] duration-300"
                style={{ width: `${ratingPct}%` }}
              />
            </div>
            <div className="text-xs font-semibold text-gray-800">
              {ratingSafe.toFixed(1)}/{ratingOutOf.toFixed(1)}
            </div>
          </div>
        </div>

        {/* CTA - pushed to bottom */}
        <div className="mt-auto">
          <div className="flex gap-2">
            <Link to={`/cert/${slug}`} className="group inline-block flex-[2]">
              <Button
                variant="outline"
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-xs w-full",
                  "transition-transform",
                  "group-hover:-translate-y-0.5 group-active:translate-y-0"
                )}
              >
                View Details
                <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
              </Button>
            </Link>

            {showCompareButton && (
            <Button
              variant={isInCompare ? "default" : "secondary"}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-[10px] flex-1",
                "transition-colors"
              )}
                onClick={() => {
                  if (isInCompare) {
                    onRemoveFromCompare?.(certification.id);
                  } else {
                    onAddToCompare?.(certification);
                  }
                }}
                disabled={!isInCompare && isCompareFull}
              >
                {isInCompare
                  ? (
                      <>
                        Remove from<br />
                        Compare
                      </>
                    )
                  : isCompareFull
                    ? "Compare is Full"
                    : (
                        <>
                          Add to<br />
                          Compare
                        </>
                      )
                }
              </Button>
            )}
          </div>
        </div>
      </div>
      </Card>

              {/* Ranking badge - completely independent circle that overrides the card */}
              {showRanking && typeof rank === "number" && (
                <div
                  className={clsx(
                    "absolute -top-4",
                    "text-white rounded-full",
                    "w-14 h-14",
                    "flex items-center justify-center",
                    "text-sm font-bold shadow-2xl border-4 border-white"
                  )}
                  style={{ 
                    zIndex: 1000, 
                    right: '-14px',
                    backgroundColor: '#0A66C2'
                  }}
                >
                  #{rank}
                </div>
              )}
    </div>
  );
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
