import React from 'react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
        <path d="M12 2L6 6V18L12 22L18 18V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M12 12L18 9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 12V22" stroke="currentColor" strokeWidth="2" />
        <path d="M12 12L6 9" stroke="currentColor" strokeWidth="2" />
        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
      <h1 className="text-xl font-bold text-foreground">BioChain</h1>
    </div>
  );
}
