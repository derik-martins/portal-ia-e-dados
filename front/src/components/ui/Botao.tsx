import React from 'react';

interface BotaoProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

const Botao: React.FC<BotaoProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled = false
}) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer';
  
  const variantClasses = {
    primary: 'bg-[#39FF14] text-black hover:bg-[#32E012] active:transform active:scale-95',
    secondary: 'bg-[#F5F5F5] text-black hover:bg-gray-200 active:transform active:scale-95'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClasses} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
};

export default Botao;