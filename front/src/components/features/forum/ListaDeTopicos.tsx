import React from 'react';
import TituloSecao from '../../ui/TituloSecao';
import ItemTopico from './ItemTopico';

const ListaDeTopicos: React.FC = () => {
  const topicos = [
    {
      id: 1,
      titulo: "Como implementar cross-validation em projetos reais?",
      autor: "Maria Santos",
      categoria: "Machine Learning",
      respostas: 12,
      curtidas: 23,
      tempoAtualizacao: "2 horas atrás",
      isResolvido: true
    },
    {
      id: 2,
      titulo: "Dúvidas sobre otimização de queries SQL complexas",
      autor: "Pedro Oliveira",
      categoria: "Database",
      respostas: 8,
      curtidas: 15,
      tempoAtualizacao: "4 horas atrás",
      isResolvido: false
    },
    {
      id: 3,
      titulo: "Comparação: Pandas vs Polars para análise de dados",
      autor: "Ana Costa",
      categoria: "Python",
      respostas: 25,
      curtidas: 47,
      tempoAtualizacao: "6 horas atrás",
      isResolvido: false
    },
    {
      id: 4,
      titulo: "Melhores práticas para versionamento de modelos ML",
      autor: "Carlos Lima",
      categoria: "MLOps",
      respostas: 18,
      curtidas: 34,
      tempoAtualizacao: "1 dia atrás",
      isResolvido: true
    },
    {
      id: 5,
      titulo: "Como lidar com dados desbalanceados em classificação?",
      autor: "Julia Ferreira",
      categoria: "Machine Learning",
      respostas: 14,
      curtidas: 28,
      tempoAtualizacao: "1 dia atrás",
      isResolvido: false
    }
  ];

  return (
    <div>
      <TituloSecao>Fórum</TituloSecao>
      
      <div className="space-y-4">
        {topicos.map(topico => (
          <ItemTopico key={topico.id} {...topico} />
        ))}
      </div>
    </div>
  );
};

export default ListaDeTopicos;