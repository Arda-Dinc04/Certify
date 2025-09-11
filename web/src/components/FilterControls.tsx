import React, { useState } from 'react';
import { RotateCcw, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface FilterControlsProps {
  onReset: () => void;
  getShareableUrl: () => string;
  activeFiltersCount: number;
  className?: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  onReset,
  getShareableUrl,
  activeFiltersCount,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = getShareableUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for browsers that don't support clipboard API
      const url = getShareableUrl();
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenInNewTab = () => {
    const url = getShareableUrl();
    window.open(url, '_blank');
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Active filters indicator */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-xs h-8 px-3"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      )}

      {/* Share controls */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="text-xs h-8 px-3"
        >
          <Share2 className="h-3 w-3 mr-1" />
          Share
        </Button>

        {showShareMenu && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="w-full justify-start text-xs h-8 px-2"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-2 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-2" />
                    Copy link
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInNewTab}
                className="w-full justify-start text-xs h-8 px-2"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Open in new tab
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default FilterControls;