import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Certification } from '../types';

interface CompareContextType {
  compareItems: Certification[];
  addToCompare: (certification: Certification) => void;
  removeFromCompare: (certificationId: string) => void;
  clearCompare: () => void;
  isInCompare: (certificationId: string) => boolean;
  canAddToCompare: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

interface CompareProviderProps {
  children: ReactNode;
}

export const CompareProvider: React.FC<CompareProviderProps> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<Certification[]>([]);
  const maxCompareItems = 4;

  const addToCompare = useCallback((certification: Certification) => {
    setCompareItems(prev => {
      if (prev.length >= maxCompareItems) return prev;
      if (prev.some(item => item.id === certification.id)) return prev;
      return [...prev, certification];
    });
  }, []);

  const removeFromCompare = useCallback((certificationId: string) => {
    setCompareItems(prev => prev.filter(item => item.id !== certificationId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const isInCompare = useCallback((certificationId: string) => {
    return compareItems.some(item => item.id === certificationId);
  }, [compareItems]);

  const canAddToCompare = compareItems.length < maxCompareItems;

  const value: CompareContextType = {
    compareItems,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddToCompare,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};