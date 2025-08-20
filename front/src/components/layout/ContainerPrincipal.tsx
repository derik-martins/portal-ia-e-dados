import React from 'react';
import MuralDeNoticias from '../features/feed/MuralDeNoticias';
import PainelDiscord from '../features/discord/PainelDiscord';
import VisualizacaoCalendario from '../features/calendario/VisualizacaoCalendario';
import GridDeDicas from '../features/dicas/GridDeDicas';
import ListaDeTopicos from '../features/forum/ListaDeTopicos';
import TituloSecao from '../ui/TituloSecao';

interface ContainerPrincipalProps {
  currentView: string;
}

const ContainerPrincipal: React.FC<ContainerPrincipalProps> = ({ currentView }) => {
  const renderContent = () => {
    switch (currentView) {
      case 'inicio':
        return (
          <div>
            <TituloSecao>Dashboard Principal</TituloSecao>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#F5F5F5] p-8 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Bem-vindo ao Portal!</h3>
                <p className="text-gray-700">Explore as funcionalidades disponíveis na barra lateral.</p>
              </div>
              <div className="bg-[#F5F5F5] p-8 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Estatísticas</h3>
                <p className="text-gray-700">Acompanhe seu progresso e atividades.</p>
              </div>
            </div>
          </div>
        );
      case 'feed':
        return <MuralDeNoticias />;
      case 'discord':
        return <PainelDiscord />;
      case 'calendario':
        return <VisualizacaoCalendario />;
      case 'dicas':
        return <GridDeDicas />;
      case 'forum':
        return <ListaDeTopicos />;
      default:
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <div className="flex-1 p-8 bg-white overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default ContainerPrincipal;