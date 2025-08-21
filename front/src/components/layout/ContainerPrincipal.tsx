import React from 'react';
import MuralDeNoticias from '../features/feed/MuralDeNoticias';
import PainelDiscord from '../features/discord/PainelDiscord';
import VisualizacaoCalendario from '../features/calendario/VisualizacaoCalendario';
import GridDeDicas from '../features/dicas/GridDeDicas';
import MinhasDicas from '../features/dicas/MinhasDicas';
import ListaDeTopicos from '../features/forum/ListaDeTopicos';
import GerenciamentoUsuarios from '../features/admin/GerenciamentoUsuarios';
import GerenciamentoInsignias from '../features/admin/GerenciamentoInsignias';
import AtribuirInsignias from '../features/admin/AtribuirInsignias';
import GerenciadorUsuarios from '../features/usuarios/GerenciadorUsuarios';
import ChatIA from '../features/chat/ChatIA';
import DashboardInicial from '../features/dashboard/DashboardInicial';
import RankingInsignias from '../features/insignias/RankingInsignias';
import TituloSecao from '../ui/TituloSecao';

interface ContainerPrincipalProps {
  currentView: string;
  onNavigate?: (view: string) => void;
}

const ContainerPrincipal: React.FC<ContainerPrincipalProps> = ({ currentView, onNavigate }) => {
  const renderContent = () => {
    switch (currentView) {
      case 'inicio':
        return onNavigate ? <DashboardInicial onNavigate={onNavigate} /> : (
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
      case 'chat':
        return <ChatIA />;
      case 'discord':
        return <PainelDiscord />;
      case 'calendario':
        return <VisualizacaoCalendario />;
      case 'dicas':
        return <GridDeDicas />;
      case 'minhas-dicas':
        return <MinhasDicas />;
      case 'usuarios':
        return <GerenciadorUsuarios />;
      case 'forum':
        return <ListaDeTopicos />;
      case 'admin':
        return <GerenciamentoUsuarios />;
      case 'admin-insignias':
        return <GerenciamentoInsignias />;
      case 'admin-atribuir-insignias':
        return <AtribuirInsignias />;
      case 'ranking':
        return <RankingInsignias />;
      default:
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <div className={`flex-1 ${currentView === 'chat' ? 'h-screen' : 'p-8'} bg-white ${currentView === 'chat' ? '' : 'overflow-y-auto'}`}>
      {renderContent()}
    </div>
  );
};

export default ContainerPrincipal;