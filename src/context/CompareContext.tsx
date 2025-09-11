import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Certification } from '../types';

interface CompareContextType {
  compareItems: Certification[];
  addToCompare: (certification: Certification) => void;
  removeFromCompare: (certificationId: string) => void;
  clearCompare: () => void;
  isInCompare: (certificationId: string) => boolean;
  isCompareFull: () => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

interface CompareProviderProps {
  children: ReactNode;
}

export const CompareProvider: React.FC<CompareProviderProps> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<Certification[]>([]);

  const addToCompare = (certification: Certification) => {
    setCompareItems(prev => {
      if (prev.length >= 4) {
        return prev; // Max 4 items
      }
      if (prev.some(item => item.id === certification.id)) {
        return prev; // Already in compare
      }
      return [...prev, certification];
    });
  };

  const removeFromCompare = (certificationId: string) => {
    setCompareItems(prev => prev.filter(item => item.id !== certificationId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (certificationId: string) => {
    return compareItems.some(item => item.id === certificationId);
  };

  const isCompareFull = () => {
    return compareItems.length >= 4;
  };

  const value: CompareContextType = {
    compareItems,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    isCompareFull,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = (): CompareContextType => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
