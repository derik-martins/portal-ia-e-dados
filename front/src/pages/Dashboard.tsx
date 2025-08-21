import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import ContainerPrincipal from '../components/layout/ContainerPrincipal';

interface DashboardProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentView, onNavigate }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <Sidebar 
        currentView={currentView}
        onNavigate={onNavigate}
        onLogout={handleLogout}
      />
      <ContainerPrincipal currentView={currentView} onNavigate={onNavigate} />
    </div>
  );
};

export default Dashboard;