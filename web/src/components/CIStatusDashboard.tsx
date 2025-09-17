import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface CIStatus {
  id: string;
  name: string;
  status: 'success' | 'failure' | 'pending' | 'cancelled';
  conclusion?: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  head_sha: string;
  head_branch: string;
  actor: {
    login: string;
    avatar_url: string;
  };
}

interface CIStatusDashboardProps {
  repository: string;
  className?: string;
}

const CIStatusDashboard: React.FC<CIStatusDashboardProps> = ({ 
  repository,
  className = '' 
}) => {
  const [statuses, setStatuses] = useState<CIStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchCIStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from GitHub API
      // For now, we'll simulate the data structure
      const mockStatuses: CIStatus[] = [
        {
          id: '1',
          name: 'Domain Validation',
          status: 'success',
          conclusion: 'success',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 3500000).toISOString(),
          html_url: `https://github.com/${repository}/actions/runs/1`,
          head_sha: 'abc123f',
          head_branch: 'main',
          actor: {
            login: 'github-actions[bot]',
            avatar_url: 'https://github.com/github-actions.png'
          }
        },
        {
          id: '2', 
          name: 'Frontend Build',
          status: 'success',
          conclusion: 'success',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          updated_at: new Date(Date.now() - 1700000).toISOString(),
          html_url: `https://github.com/${repository}/actions/runs/2`,
          head_sha: 'def456a',
          head_branch: 'feature/ci-notifications',
          actor: {
            login: 'developer',
            avatar_url: 'https://github.com/developer.png'
          }
        },
        {
          id: '3',
          name: 'Data Pipeline CI', 
          status: 'pending',
          created_at: new Date(Date.now() - 300000).toISOString(),
          updated_at: new Date(Date.now() - 300000).toISOString(),
          html_url: `https://github.com/${repository}/actions/runs/3`,
          head_sha: 'ghi789b',
          head_branch: 'main',
          actor: {
            login: 'data-engineer',
            avatar_url: 'https://github.com/data-engineer.png'
          }
        }
      ];
      
      setStatuses(mockStatuses);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CI status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCIStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCIStatus, 30000);
    return () => clearInterval(interval);
  }, [repository]);

  const getStatusIcon = (status: string, _conclusion?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />;
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-500" aria-hidden="true" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" aria-hidden="true" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4 text-gray-500" aria-hidden="true" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failure': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success': return 'Passed';
      case 'failure': return 'Failed'; 
      case 'pending': return 'Running';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const overallStatus = statuses.length > 0 ? 
    statuses.some(s => s.status === 'failure') ? 'failure' :
    statuses.some(s => s.status === 'pending') ? 'pending' : 'success'
    : 'unknown';

  if (error) {
    return (
      <Card className={`${className} border-red-200`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Error loading CI status: {error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchCIStatus}
              className="ml-auto"
              aria-label="Retry loading CI status"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`} role="region" aria-label="CI/CD Pipeline Status">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Pipeline Status</h3>
            <div className="flex items-center gap-1">
              {getStatusIcon(overallStatus)}
              <Badge 
                variant="outline" 
                className={getStatusColor(overallStatus)}
                aria-label={`Overall pipeline status: ${getStatusLabel(overallStatus)}`}
              >
                {getStatusLabel(overallStatus)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span aria-label={`Last updated: ${lastUpdated.toLocaleTimeString()}`}>
              Updated {formatRelativeTime(lastUpdated.toISOString())}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchCIStatus}
              disabled={loading}
              className="h-6 w-6 p-0"
              aria-label="Refresh CI status"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {loading && statuses.length === 0 ? (
          <div className="space-y-2" aria-label="Loading CI status">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-full" />
                  <div className="flex-1 h-4 bg-gray-200 rounded" />
                  <div className="w-16 h-4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : statuses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No recent CI runs found
          </p>
        ) : (
          <div className="space-y-2" role="list" aria-label="CI pipeline runs">
            {statuses.map((status) => (
              <div 
                key={status.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                role="listitem"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getStatusIcon(status.status, status.conclusion)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {status.name}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(status.status)}`}
                        aria-label={`Status: ${getStatusLabel(status.status)}`}
                      >
                        {getStatusLabel(status.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{status.head_branch}</span>
                      <span>•</span>
                      <span>{status.head_sha.substring(0, 7)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(status.updated_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <img 
                    src={status.actor.avatar_url} 
                    alt={`${status.actor.login} avatar`}
                    className="w-6 h-6 rounded-full"
                  />
                  <a
                    href={status.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label={`View ${status.name} run details (opens in new tab)`}
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Repository: {repository}</span>
            <a
              href={`https://github.com/${repository}/actions`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="View all workflows on GitHub (opens in new tab)"
            >
              View all workflows
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CIStatusDashboard;