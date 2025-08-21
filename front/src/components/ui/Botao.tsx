import React from 'react';

interface BotaoProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

const Botao: React.FC<BotaoProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  loading = false
}) => {
  const baseClasses = 'rounded-lg font-bold transition-all duration-200 cursor-pointer inline-flex items-center justify-center';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };
  
  const variantClasses = {
    primary: 'bg-[#39FF14] text-black hover:bg-[#32E012] active:transform active:scale-95',
    secondary: 'bg-[#F5F5F5] text-black hover:bg-gray-200 active:transform active:scale-95',
    outline: 'border-2 border-gray-300 bg-transparent text-gray-700 hover:border-gray-400 hover:bg-gray-50'
  };

  const widthClasses = fullWidth ? 'w-full' : '';
  
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Botao;