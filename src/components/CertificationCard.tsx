import { Link } from "react-router-dom";
import {
  Clock,
  MonitorSmartphone
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
  isInCompare?: boolean;
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
  isInCompare = false
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
    (certification as any).price ??
    (certification as any).cost ??
    (certification as any).examFee;

  const minHours: number | undefined =
    (certification as any).minHours ??
    (certification as any).studyMinHours;

  const maxHours: number | undefined =
    (certification as any).maxHours ??
    (certification as any).studyMaxHours;

  const hoursRangeText =
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

  // Domain emoji mapping
  const getDomainEmoji = (domainName: string) => {
    const domainLower = domainName.toLowerCase();
    if (domainLower.includes('cs') || domainLower.includes('it')) return '💻';
    if (domainLower.includes('finance')) return '💰';
    if (domainLower.includes('food')) return '🍽️';
    if (domainLower.includes('legal') && !domainLower.includes('compliance')) return '⚖️';
    if (domainLower.includes('devops') || domainLower.includes('cloud')) return '☁️';
    if (domainLower.includes('design') || domainLower.includes('creative')) return '🎨';
    if (domainLower.includes('supply')) return '🚚';
    if (domainLower.includes('language')) return '🌐';
    if (domainLower.includes('aviation')) return '✈️';
    if (domainLower.includes('audio') && domainLower.includes('engineering')) return '🎧';
    if (domainLower.includes('healthcare')) return '🏥';
    if (domainLower.includes('hospitality')) return '🏨';
    if (domainLower.includes('maritime')) return '⚓';
    if (domainLower.includes('sustainability')) return '♻️';
    if (domainLower.includes('fitness') || domainLower.includes('wellness')) return '💪';
    if (domainLower.includes('audio') && domainLower.includes('production')) return '🎵';
    if (domainLower.includes('engineering') && !domainLower.includes('audio')) return '⚙️';
    if (domainLower.includes('data') && domainLower.includes('protection')) return '🔐';
    if (domainLower.includes('math') || domainLower.includes('actuarial')) return '📊';
    if (domainLower.includes('service') && domainLower.includes('management')) return '🛠️';
    if (domainLower.includes('project') && domainLower.includes('management')) return '📋';
    if (domainLower.includes('government') || domainLower.includes('defense')) return '🏛️';
    if (domainLower.includes('energy')) return '⚡';
    if (domainLower.includes('compliance')) return '📋';
    if (domainLower.includes('cybersecurity')) return '🛡️';
    if (domainLower.includes('education')) return '🎓';
    if (domainLower.includes('privacy')) return '🔒';
    if (domainLower.includes('culinary')) return '👨‍🍳';
    if (domainLower.includes('architecture')) return '🏗️';
    if (domainLower.includes('governance')) return '🏛️';
    return '📊'; // default emoji
  };

  // Banner: either image or domain-based emoji/letter fallback
  const getBannerContent = (issuerName: string, domainName: string) => {
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
    }
    
    // Use domain emoji if available, otherwise first letter
    const domainEmoji = getDomainEmoji(domainName);
    if (domainEmoji !== '📊' || domainName.toLowerCase().includes('math')) {
      return { type: 'emoji', content: domainEmoji };
    }
    
    // Fallback to first letter
    return { type: 'letter', content: issuerName.charAt(0).toUpperCase() };
  };

  const bannerContent = getBannerContent(issuer, domain || '');

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
          width: '291.5px', 
          height: '399px',
          minWidth: '291.5px',
          minHeight: '399px'
        }}
      >
      {/* Top banner */}
      <div className="relative">
        {bannerContent.type === 'image' ? (
          <div className="w-full h-[160px] bg-white flex items-center justify-center p-4">
            <img
              src={bannerContent.content}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : bannerContent.type === 'emoji' ? (
          <div className="w-full h-[160px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-8xl">
              {bannerContent.content}
            </span>
          </div>
        ) : (
          <div className="w-full h-[160px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-6xl font-bold">
              {bannerContent.content}
            </span>
          </div>
        )}
      </div>


      {/* Body */}
      <div className={clsx("p-3 flex flex-col", showCompareButton ? "h-[220px]" : "h-[239px]")}>
        {/* Title & Issuer */}
        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-600 mb-2 truncate">{issuer}</p>

        {/* Tags */}
        <div className="flex items-center gap-1 flex-wrap mb-3">
          {domain && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium">
              <MonitorSmartphone className="w-3 h-3" />
              {domain.toString().toUpperCase()}
            </span>
          )}
          {level && (
            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-medium">
              {capitalize(level)}
            </span>
          )}
        </div>

        {/* Price */}
        {price !== undefined && (
          <div className="text-emerald-600 font-bold text-base mb-2">
            ${Intl.NumberFormat().format(price)}
          </div>
        )}

        {/* Hours */}
        {hoursRangeText && (
          <div className="flex items-center gap-1 text-gray-700 mb-3">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs">{hoursRangeText}</span>
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
        <div className="mt-auto space-y-2">
          <Link to={`/cert/${slug}`} className="group inline-block w-full">
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
                "rounded-lg px-3 py-1.5 text-xs w-full",
                "transition-colors"
              )}
              onClick={() => onAddToCompare?.(certification)}
              disabled={isInCompare}
            >
              {isInCompare ? "Added to Compare" : "Add to Compare"}
            </Button>
          )}
        </div>
      </div>
      </Card>

      {/* Ranking badge - completely independent circle that overrides the card */}
      {showRanking && typeof rank === "number" && (
        <div
          className={clsx(
            "absolute -top-4",
            "bg-blue-400 text-white rounded-full",
            "w-14 h-14",
            "flex items-center justify-center",
            "text-sm font-bold shadow-2xl border-4 border-white"
          )}
          style={{ zIndex: 1000, right: '-14px' }}
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
