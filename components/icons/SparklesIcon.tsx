import React from 'react';
export const SparklesIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414l-2.293 2.293m0-4.707l2.293-2.293a1 1 0 011.414 0l2.293 2.293m-4.707 0l-2.293 2.293a1 1 0 01-1.414 0l-2.293-2.293m4.707 0l-2.293-2.293" />
  </svg>
);
