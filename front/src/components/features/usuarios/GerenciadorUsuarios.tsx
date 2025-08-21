import React, { useState } from 'react';
import ListagemUsuarios from './ListagemUsuarios';
import VisualizacaoPerfil from './VisualizacaoPerfil';

const GerenciadorUsuarios: React.FC = () => {
  const [view, setView] = useState<'list' | 'profile'>('list');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleViewProfile = (userId: number) => {
    setSelectedUserId(userId);
    setView('profile');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedUserId(null);
  };

  const handleEditProfile = () => {
    // Função para editar perfil, pode ser implementada depois
    console.log('Editar perfil');
  };

  if (view === 'profile' && selectedUserId) {
    return (
      <VisualizacaoPerfil
        userId={selectedUserId}
        onBack={handleBackToList}
        onEdit={handleEditProfile}
      />
    );
  }

  return <ListagemUsuarios onViewProfile={handleViewProfile} />;
};

export default GerenciadorUsuarios;
