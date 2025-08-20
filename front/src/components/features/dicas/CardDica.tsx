import React from 'react';
import Card from '../../ui/Card';
import { Clock } from 'lucide-react';

interface CardDicaProps {
  categoria: string;
  titulo: string;
  descricao: string;
  tempoLeitura: string;
}

const CardDica: React.FC<CardDicaProps> = ({ categoria, titulo, descricao, tempoLeitura }) => {
  return (
    <Card className="p-6 hover:shadow-lg cursor-pointer">
      <div className="mb-4">
        <span className="px-3 py-1 bg-[#39FF14] text-black text-xs font-medium rounded-full">
          {categoria}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-black mb-3">{titulo}</h3>
      
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{descricao}</p>
      
      <div className="flex items-center text-xs text-gray-500">
        <Clock size={12} className="mr-1" />
        <span>{tempoLeitura}</span>
      </div>
    </Card>
  );
};

export default CardDica;