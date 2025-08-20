import React, { useState, useEffect } from 'react';
import { theme } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  loading?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'lg',
  hover = true,
  loading = false
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), Math.random() * 200);
    return () => clearTimeout(timer);
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white dark:bg-slate-800 shadow-lg border-0';
      case 'outlined':
        return 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 shadow-sm';
      case 'glass':
        return 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50';
      default:
        return 'bg-white dark:bg-slate-800 shadow-md border border-gray-200/80 dark:border-slate-700';
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'sm': return 'p-3';
      case 'md': return 'p-4';
      case 'lg': return 'p-6';
      case 'xl': return 'p-8';
      default: return 'p-6';
    }
  };

  const baseStyles = `
    rounded-xl 
    transition-all 
    duration-300 
    ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
    ${isMounted ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-4'}
    ${loading ? 'animate-pulse' : ''}
  `;

  return (
    <div className={`${baseStyles} ${getVariantStyles()} ${getPaddingStyles()} ${className}`}>
      {loading ? (
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded animate-pulse w-3/4"></div>
          <div className="h-8 bg-gray-200 dark:bg-slate-600 rounded animate-pulse"></div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};