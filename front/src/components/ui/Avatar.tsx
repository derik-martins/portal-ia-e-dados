import React from 'react';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center font-bold ${className}`;

  if (imageUrl) {
    // Construir URL da imagem baseado no ambiente
    const getImageUrl = (url: string) => {
      if (url.startsWith('http')) {
        return url;
      }
      
      // Em desenvolvimento, usar URL completa
      if (import.meta.env.DEV) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        return baseUrl.replace('/api', '') + url;
      }
      
      // Em produção, usar URL relativa (nginx fará o proxy)
      return url;
    };

    return (
      <div className={baseClasses}>
        <img
          src={getImageUrl(imageUrl)}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={(e) => {
            // Fallback para iniciais se a imagem não carregar
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="${baseClasses} bg-[#39FF14] text-black">${initials}</div>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-[#39FF14] text-black`}>
      {initials}
    </div>
  );
};

export default Avatar;