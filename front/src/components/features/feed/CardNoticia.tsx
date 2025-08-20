import React from 'react';
import Card from '../../ui/Card';

interface CardNoticiaProps {
  titulo: string;
  fonte: string;
  data: string;
  tags: string[];
  url: string;
}

const CardNoticia: React.FC<CardNoticiaProps> = ({ titulo, fonte, data, tags, url }) => {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="p-6 hover:shadow-lg cursor-pointer transition-shadow duration-200" 
      onClick={handleClick}
    >
      <h3 className="text-lg font-bold text-black mb-3 leading-tight hover:text-gray-700">
        {titulo}
      </h3>
      
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <span>{fonte}</span>
        <span className="mx-2">•</span>
        <span>{new Date(data).toLocaleDateString('pt-BR')}</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-[#39FF14] text-black text-xs font-medium rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
};

export default CardNoticia;