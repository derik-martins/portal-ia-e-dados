import React from 'react';
import Card from '../../ui/Card';
import Avatar from '../../ui/Avatar';
import { MessageCircle, Heart, Check } from 'lucide-react';

interface ItemTopicoProps {
  titulo: string;
  autor: string;
  categoria: string;
  respostas: number;
  curtidas: number;
  tempoAtualizacao: string;
  isResolvido: boolean;
}

const ItemTopico: React.FC<ItemTopicoProps> = ({
  titulo,
  autor,
  categoria,
  respostas,
  curtidas,
  tempoAtualizacao,
  isResolvido
}) => {
  return (
    <Card className="p-6 hover:shadow-lg cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="px-3 py-1 bg-[#39FF14] text-black text-xs font-medium rounded-full mr-3">
              {categoria}
            </span>
            {isResolvido && (
              <span className="flex items-center text-xs text-green-600">
                <Check size={12} className="mr-1" />
                Resolvido
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-black mb-3 hover:text-gray-700 transition-colors">
            {titulo}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar name={autor} size="sm" />
              <div className="ml-2">
                <span className="text-sm font-medium text-black">{autor}</span>
                <span className="text-xs text-gray-500 ml-2">{tempoAtualizacao}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <MessageCircle size={16} className="mr-1" />
                <span>{respostas}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Heart size={16} className="mr-1" />
                <span>{curtidas}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ItemTopico;