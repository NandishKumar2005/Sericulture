import React from 'react';

export default function Card({ children, className = "", onClick, hoverable = false }) {
  return (
    <div 
      onClick={onClick}
      className={`glass-card rounded-2xl p-4 shadow-xl shadow-black/20 ${hoverable ? 'glass-card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
