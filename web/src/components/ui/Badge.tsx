import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'default' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    
    const variantClasses = {
      default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      outline: 'text-foreground',
      success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
      warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600'
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      default: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm'
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// Specialized ranking badge component
interface RankingBadgeProps {
  position: number;
  className?: string;
}

export const RankingBadge: React.FC<RankingBadgeProps> = ({ position, className }) => {
  const getRankingClasses = (pos: number) => {
    if (pos === 1) return 'ranking-badge ranking-badge-1';
    if (pos === 2) return 'ranking-badge ranking-badge-2';
    if (pos === 3) return 'ranking-badge ranking-badge-3';
    return 'ranking-badge ranking-badge-other';
  };

  return (
    <div className={cn(getRankingClasses(position), className)}>
      #{position}
    </div>
  );
};

export { Badge };
