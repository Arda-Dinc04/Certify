import React from 'react';
import { Trophy } from 'lucide-react';

interface RankingBadgeProps {
  rank: number;
  className?: string;
}

export const RankingBadge: React.FC<RankingBadgeProps> = ({ rank, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium ${className}`}>
      <Trophy className="w-4 h-4" />
      #{rank}
    </div>
  );
};

export default RankingBadge;
