import React, { useState } from 'react';
import { 
  Home, 
  Newspaper, 
  Calendar, 
  Lightbulb, 
  LogOut,
  Shield,
  Bot,
  Edit3,
  User,
  Users,
  Award,
  Trophy,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import PerfilUsuarioCompleto from '../features/perfil/PerfilUsuarioCompleto';
import logoSidebar from '../../img/logo-sidebar.png';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const { user, isAdmin } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminSubmenu, setShowAdminSubmenu] = useState(false);
  
  const menuItems = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'feed', label: 'Feed de Notícias', icon: Newspaper },
    { id: 'chat', label: 'Chat IA', icon: Bot },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'dicas', label: 'Dicas Rápidas', icon: Lightbulb },
    { id: 'minhas-dicas', label: 'Minhas Dicas', icon: Edit3 },
    { id: 'usuarios', label: 'Pessoas', icon: Users },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
  ];

  const adminSubmenuItems = [
    { id: 'admin', label: 'Usuários', icon: Users },
    { id: 'admin-insignias', label: 'Gerenciar Insígnias', icon: Award },
    { id: 'admin-atribuir-insignias', label: 'Atribuir Insígnias', icon: Shield },
  ];

  const MenuItem = ({ item, isSubmenu = false }: { item: typeof menuItems[0], isSubmenu?: boolean }) => {
    const isActive = currentView === item.id;
    const Icon = item.icon;

    return (
      <button
        onClick={() => onNavigate(item.id)}
        className={`w-full flex items-center px-6 py-3 text-left transition-all duration-200 relative ${
          isSubmenu ? 'pl-12' : ''
        } ${
          isActive 
            ? 'bg-[#39FF14] text-black' 
            : 'text-black hover:bg-[#F5F5F5]'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>
        )}
        <Icon size={20} className="mr-4" />
        <span className="font-medium">{item.label}</span>
      </button>
    );
  };

  const AdminMenuItem = () => {
    const isAnyAdminActive = currentView.startsWith('admin');
    
    return (
      <div>
        <button
          onClick={() => setShowAdminSubmenu(!showAdminSubmenu)}
          className={`w-full flex items-center justify-between px-6 py-3 text-left transition-all duration-200 relative ${
            isAnyAdminActive
              ? 'bg-[#39FF14] text-black' 
              : 'text-black hover:bg-[#F5F5F5]'
          }`}
        >
          {isAnyAdminActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>
          )}
          <div className="flex items-center">
            <Shield size={20} className="mr-4" />
            <span className="font-medium">Administração</span>
          </div>
          {showAdminSubmenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {showAdminSubmenu && (
          <div className="bg-gray-50">
            {adminSubmenuItems.map((item) => (
              <MenuItem key={item.id} item={item} isSubmenu={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[280px] h-screen bg-white border-r border-[#F5F5F5] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#F5F5F5] flex justify-center">
        <img 
          src={logoSidebar} 
          alt="Geração Caldeira IA e Dados" 
          className="h-16 w-auto object-contain"
        />
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
        
        {/* Menu Admin com submenu */}
        {isAdmin && <AdminMenuItem />}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-6 border-t border-[#F5F5F5]">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setShowProfile(true)}
            className="flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors w-full"
          >
            <Avatar 
              name={user?.name || 'Usuário'} 
              imageUrl={user?.profile_image}
              size="md" 
            />
            <div className="ml-3 text-left">
              <p className="font-medium text-black text-sm">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Administrador' : 'Estudante'}
              </p>
            </div>
          </button>
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={() => setShowProfile(true)}
            className="p-2 text-gray-500 hover:text-black transition-colors"
            title="Perfil"
          >
            <User size={18} />
          </button>
          <button 
            onClick={onLogout}
            className="p-2 text-gray-500 hover:text-black transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Modal de Perfil */}
      {showProfile && (
        <PerfilUsuarioCompleto onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default Sidebar;