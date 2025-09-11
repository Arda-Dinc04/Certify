import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Browse', href: '/certifications' },
    { name: 'Compare', href: '/compare' },
    { name: 'Rankings', href: '/rankings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo - Far Left */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="border-2 border-gray-800 rounded px-3 py-1">
                <span className="text-lg font-bold text-gray-800">Certify</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Sign In Button - Far Right */}
          <div className="hidden md:flex items-center">
            <Button 
              variant="default" 
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                    isActive(item.href)
                      ? 'text-gray-900 bg-gray-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
