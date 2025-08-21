import React from 'react';
import Card from '../../ui/Card';
import { Clock, User, Eye } from 'lucide-react';
import type { Dica } from '../../../services/api';

interface CardDicaProps {
  dica: Dica;
  onClick?: () => void;
}

const CardDica: React.FC<CardDicaProps> = ({ dica, onClick }) => {
  const formatarData = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <Card className="p-6 hover:shadow-lg cursor-pointer transition-all" onClick={onClick}>
      {/* Imagem do header se existir */}
      {dica.imagem_header && (
        <div className="mb-4 -mx-6 -mt-6">
          <img
            src={dica.imagem_header}
            alt={dica.titulo}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        </div>
      )}
      
      <div className="mb-4">
        <span className="px-3 py-1 bg-[#39FF14] text-black text-xs font-medium rounded-full">
          {dica.categoria}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-black mb-3 line-clamp-2">
        {dica.titulo}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
        {dica.descricao_breve}
      </p>
      
      {/* Tags */}
      {dica.tags && dica.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {dica.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {dica.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{dica.tags.length - 3}</span>
          )}
        </div>
      )}
      
      {/* Footer com metadados */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Clock size={12} className="mr-1" />
            <span>{dica.tempo_leitura} min</span>
          </div>
          
          <div className="flex items-center">
            <Eye size={12} className="mr-1" />
            <span>{dica.visualizacoes}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <User size={12} className="mr-1" />
          <span className="truncate max-w-20">{dica.autor_nome}</span>
        </div>
      </div>
      
      <div className="text-right mt-1">
        <span className="text-xs text-gray-400">
          {formatarData(dica.created_at)}
        </span>
      </div>
    </Card>
  );
};

export default CardDica;