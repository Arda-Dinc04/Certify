import React, { useState, useEffect, useRef } from 'react';
import { Info, X } from 'lucide-react';

interface Signals {
  role_alignment: number;
  issuer_affinity: number;
  global_rank_norm: number;
  cost_penalty: number;
  mention_count?: number;
  mention_z?: number;
}

interface SignalsPopoverProps {
  signals: Signals;
  fitScore: number;
  className?: string;
}

const SignalsPopover: React.FC<SignalsPopoverProps> = ({ 
  signals, 
  fitScore, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const formatPercentage = (value: number) => `${Math.round(value * 100)}%`;
  
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
        aria-label={`View fit score details. Current score: ${formatPercentage(fitScore)} fit`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Info className="h-3 w-3" aria-hidden="true" />
        {formatPercentage(fitScore)} fit
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Popover */}
          <div 
            ref={popoverRef}
            className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
            role="dialog"
            aria-labelledby="popover-title"
            aria-describedby="popover-description"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 id="popover-title" className="font-semibold text-gray-900">Fit Score Breakdown</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Close fit score details"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            
            <div id="popover-description" className="sr-only">
              Detailed breakdown of fit score components including role alignment, company-issuer match, industry ranking, and cost factors
            </div>

            <div className="space-y-3" role="group" aria-label="Score breakdown details">
              {/* Overall Fit Score */}
              <div className="pb-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Overall Fit</span>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`font-semibold ${getScoreColor(fitScore)}`}
                      aria-label={`Overall fit score: ${formatPercentage(fitScore)}`}
                    >
                      {formatPercentage(fitScore)}
                    </span>
                    <span 
                      className={`text-xs px-2 py-1 rounded-full ${
                        fitScore >= 0.8 ? 'bg-green-100 text-green-800' :
                        fitScore >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                      aria-label={`Score rating: ${getScoreLabel(fitScore)}`}
                    >
                      {getScoreLabel(fitScore)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role Alignment */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700" id="role-alignment-label">Role Alignment</span>
                  <p className="text-xs text-gray-500 mt-1">
                    How well your skills match their open positions
                  </p>
                </div>
                <div className="text-right">
                  <span 
                    className={`font-semibold ${getScoreColor(signals.role_alignment)}`}
                    aria-label={`Role alignment score: ${formatPercentage(signals.role_alignment)}`}
                  >
                    {formatPercentage(signals.role_alignment)}
                  </span>
                  <div 
                    className="w-16 h-2 bg-gray-200 rounded-full mt-1" 
                    role="progressbar"
                    aria-valuenow={Math.round(signals.role_alignment * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-labelledby="role-alignment-label"
                    aria-label={`Role alignment: ${formatPercentage(signals.role_alignment)}`}
                  >
                    <div 
                      className={`h-full rounded-full ${
                        signals.role_alignment >= 0.8 ? 'bg-green-500' :
                        signals.role_alignment >= 0.5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(signals.role_alignment * 100, 100)}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              {/* Issuer Affinity */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700" id="issuer-affinity-label">Company-Issuer Match</span>
                  <p className="text-xs text-gray-500 mt-1">
                    How relevant the certification is to this company
                  </p>
                </div>
                <div className="text-right">
                  <span 
                    className={`font-semibold ${getScoreColor(signals.issuer_affinity)}`}
                    aria-label={`Company-issuer match score: ${formatPercentage(signals.issuer_affinity)}`}
                  >
                    {formatPercentage(signals.issuer_affinity)}
                  </span>
                  <div 
                    className="w-16 h-2 bg-gray-200 rounded-full mt-1" 
                    role="progressbar"
                    aria-valuenow={Math.round(signals.issuer_affinity * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-labelledby="issuer-affinity-label"
                    aria-label={`Company-issuer match: ${formatPercentage(signals.issuer_affinity)}`}
                  >
                    <div 
                      className={`h-full rounded-full ${
                        signals.issuer_affinity >= 0.8 ? 'bg-green-500' :
                        signals.issuer_affinity >= 0.5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(signals.issuer_affinity * 100, 100)}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              {/* Global Ranking */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700" id="global-ranking-label">Industry Ranking</span>
                  <p className="text-xs text-gray-500 mt-1">
                    How this certification ranks globally
                  </p>
                </div>
                <div className="text-right">
                  <span 
                    className={`font-semibold ${getScoreColor(signals.global_rank_norm)}`}
                    aria-label={`Industry ranking score: ${formatPercentage(signals.global_rank_norm)}`}
                  >
                    {formatPercentage(signals.global_rank_norm)}
                  </span>
                  <div 
                    className="w-16 h-2 bg-gray-200 rounded-full mt-1" 
                    role="progressbar"
                    aria-valuenow={Math.round(signals.global_rank_norm * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-labelledby="global-ranking-label"
                    aria-label={`Industry ranking: ${formatPercentage(signals.global_rank_norm)}`}
                  >
                    <div 
                      className={`h-full rounded-full ${
                        signals.global_rank_norm >= 0.8 ? 'bg-green-500' :
                        signals.global_rank_norm >= 0.5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(signals.global_rank_norm * 100, 100)}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              {/* Cost Impact */}
              {signals.cost_penalty > 0 && (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">Cost Factor</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Impact of certification cost on overall fit
                    </p>
                  </div>
                  <div className="text-right">
                    <span 
                      className="font-semibold text-red-600"
                      aria-label={`Cost penalty: minus ${formatPercentage(signals.cost_penalty)}`}
                    >
                      -{formatPercentage(signals.cost_penalty)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed">
                This score combines role relevance, company-certification alignment, 
                industry ranking, and cost considerations to help you prioritize your learning.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SignalsPopover;