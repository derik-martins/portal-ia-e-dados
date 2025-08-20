import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const baseClasses = 'bg-white border border-gray-100 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.05)] transition-all duration-200';
  const hoverClasses = onClick ? 'hover:shadow-[0_6px_12px_rgba(0,0,0,0.1)] cursor-pointer' : '';

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;