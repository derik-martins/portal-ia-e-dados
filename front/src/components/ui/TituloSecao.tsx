import React from 'react';

interface TituloSecaoProps {
  children: React.ReactNode;
  className?: string;
}

const TituloSecao: React.FC<TituloSecaoProps> = ({ children, className = '' }) => {
  return (
    <h1 className={`text-3xl font-bold text-black mb-8 ${className}`}>
      {children}
    </h1>
  );
};

export default TituloSecao;