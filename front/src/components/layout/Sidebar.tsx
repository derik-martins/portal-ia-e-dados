import React from 'react';
import { 
  Home, 
  Newspaper, 
  MessageSquare, 
  Calendar, 
  Lightbulb, 
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const { user } = useAuth();
  
  const menuItems = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'feed', label: 'Feed de Notícias', icon: Newspaper },
    { id: 'discord', label: 'Conexão Discord', icon: MessageSquare },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'dicas', label: 'Dicas Rápidas', icon: Lightbulb },
    { id: 'forum', label: 'Fórum', icon: Users },
  ];

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = currentView === item.id;
    const Icon = item.icon;

    return (
      <button
        onClick={() => onNavigate(item.id)}
        className={`w-full flex items-center px-6 py-3 text-left transition-all duration-200 relative ${
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

  return (
    <div className="w-[280px] h-screen bg-white border-r border-[#F5F5F5] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#F5F5F5]">
        <h2 className="text-xl font-bold text-black">
          Geração Caldeira
          <span className="text-[#39FF14]"> IA e Dados</span>
          <br />
          <span className="text-base font-normal text-gray-600">2025</span>
        </h2>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-6 border-t border-[#F5F5F5]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Avatar name={user?.name || 'Usuário'} size="md" />
            <div className="ml-3">
              <p className="font-medium text-black text-sm">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500">Estudante</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button className="p-2 text-gray-500 hover:text-black transition-colors">
            <Settings size={18} />
          </button>
          <button 
            onClick={onLogout}
            className="p-2 text-gray-500 hover:text-black transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;