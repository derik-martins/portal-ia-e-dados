import React from 'react';
import TituloSecao from '../../ui/TituloSecao';
import CardDica from './CardDica';

const GridDeDicas: React.FC = () => {
  const dicas = [
    {
      id: 1,
      categoria: "Python",
      titulo: "List Comprehensions",
      descricao: "Aprenda a usar list comprehensions para escrever código mais limpo e eficiente.",
      tempoLeitura: "3 min"
    },
    {
      id: 2,
      categoria: "Machine Learning",
      titulo: "Feature Engineering",
      descricao: "Técnicas essenciais para criar features que melhorem a performance dos seus modelos.",
      tempoLeitura: "5 min"
    },
    {
      id: 3,
      categoria: "Data Visualization",
      titulo: "Cores em Gráficos",
      descricao: "Como escolher paletas de cores que tornem seus gráficos mais efetivos e acessíveis.",
      tempoLeitura: "4 min"
    },
    {
      id: 4,
      categoria: "SQL",
      titulo: "Window Functions",
      descricao: "Domine window functions para análises mais avançadas em SQL.",
      tempoLeitura: "6 min"
    },
    {
      id: 5,
      categoria: "Pandas",
      titulo: "Performance Tips",
      descricao: "Otimize suas operações com Pandas para trabalhar com grandes datasets.",
      tempoLeitura: "4 min"
    },
    {
      id: 6,
      categoria: "Deep Learning",
      titulo: "Regularização",
      descricao: "Técnicas para evitar overfitting em redes neurais profundas.",
      tempoLeitura: "7 min"
    }
  ];

  return (
    <div>
      <TituloSecao>Dicas Rápidas</TituloSecao>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dicas.map(dica => (
          <CardDica key={dica.id} {...dica} />
        ))}
      </div>
    </div>
  );
};

export default GridDeDicas;