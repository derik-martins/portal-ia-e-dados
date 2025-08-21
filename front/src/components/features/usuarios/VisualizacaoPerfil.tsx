  import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  MapPin, 
  Calendar, 
  Github, 
  Linkedin,
  Globe,
  Phone,
  Mail,
  Edit,
  Camera
} from 'lucide-react';
import ApiService, { User } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../ui/Card';
import Botao from '../../ui/Botao';
import Avatar from '../../ui/Avatar';
import TituloSecao from '../../ui/TituloSecao';
import InsigniasPerfil from '../insignias/InsigniasPerfil';

interface VisualizacaoPerfilProps {
  userId: number;
  onBack: () => void;
  onEdit?: () => void;
}

const VisualizacaoPerfil: React.FC<VisualizacaoPerfilProps> = ({ 
  userId, 
  onBack, 
  onEdit 
}) => {
  const { user: currentUser } = useAuth();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.id === userId;

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.buscarUsuarioPorId(userId);
      
      if (response.success && response.data) {
        setUsuario(response.data.usuario);
      } else {
        setError(response.message || 'Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, [userId]);

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const obterUrlCompleta = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <TituloSecao>Perfil do Usuário</TituloSecao>
          <div className="bg-gradient-to-r from-[#39FF14] to-green-400 p-6 rounded-lg text-black mt-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 bg-black bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-black" />
              </button>
              <div>
                <h2 className="text-2xl font-bold mb-1">Carregando perfil...</h2>
                <p className="text-lg opacity-90">Aguarde enquanto buscamos as informações</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Carregando informações do perfil...</p>
        </Card>
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="space-y-8">
        <div>
          <TituloSecao>Perfil do Usuário</TituloSecao>
          <div className="bg-gradient-to-r from-[#39FF14] to-green-400 p-6 rounded-lg text-black mt-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 bg-black bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-black" />
              </button>
              <div>
                <h2 className="text-2xl font-bold mb-1">Erro ao carregar perfil</h2>
                <p className="text-lg opacity-90">Não foi possível encontrar o usuário</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {error || 'Usuário não encontrado'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Não foi possível carregar as informações do perfil. Tente novamente mais tarde.
          </p>
          <Botao onClick={onBack} variant="outline" className="px-6 py-3">
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Botao>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <TituloSecao>Perfil do Usuário</TituloSecao>
        <div className="bg-gradient-to-r from-[#39FF14] to-green-400 p-6 rounded-lg text-black mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 bg-black bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-black" />
              </button>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {isOwnProfile ? 'Meu Perfil' : `Perfil de ${usuario.name}`}
                </h2>
                <p className="text-lg opacity-90">
                  {isOwnProfile ? 'Gerencie suas informações pessoais' : 'Visualize as informações do usuário'}
                </p>
              </div>
            </div>

            {isOwnProfile && onEdit && (
              <Botao
                onClick={onEdit}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 bg-white text-black border-black hover:bg-gray-100"
              >
                <Edit size={16} />
                Editar Perfil
              </Botao>
            )}
          </div>
        </div>
      </div>

      {/* Perfil Principal */}
      <Card className="overflow-hidden">
        {/* Banner */}
        <div 
          className="h-56 lg:h-64 bg-gradient-to-r from-[#39FF14] to-green-400 relative"
          style={{
            backgroundImage: usuario.banner_image 
              ? `url(${import.meta.env.DEV ? 'http://localhost:3001' : ''}${usuario.banner_image})` 
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {isOwnProfile && (
            <div className="absolute top-6 right-6">
              <button className="p-3 bg-black bg-opacity-50 text-white rounded-xl hover:bg-opacity-75 transition-colors">
                <Camera size={20} />
              </button>
            </div>
          )}
          
          {/* Overlay para melhor legibilidade */}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        {/* Informações do perfil */}
        <div className="p-8">
          <div className="flex items-start gap-8 mb-8">
            {/* Avatar */}
            <div className="relative -mt-16">
              <Avatar
                name={usuario.name}
                imageUrl={usuario.profile_image}
                size="lg"
                className="border-4 border-white shadow-xl w-28 h-28 lg:w-32 lg:h-32 rounded-2xl"
              />
              {isOwnProfile && (
                <button className="absolute bottom-2 right-2 p-2 bg-[#39FF14] text-black rounded-xl hover:bg-green-400 transition-colors">
                  <Camera size={16} />
                </button>
              )}
            </div>

            {/* Informações básicas */}
            <div className="flex-1 pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    {usuario.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      usuario.role === 'admin' 
                        ? 'bg-[#39FF14] text-black' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {usuario.role === 'admin' ? '👑 Administrador' : '🎓 Estudante'}
                    </span>
                  </div>
                </div>
              </div>
              
              {usuario.bio && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 leading-relaxed">
                    {usuario.bio}
                  </p>
                </div>
              )}

              {/* Informações de contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                {usuario.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin size={18} className="text-gray-500" />
                    <span className="font-medium">{usuario.location}</span>
                  </div>
                )}
                
                {usuario.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone size={18} className="text-gray-500" />
                    <span className="font-medium">{usuario.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={18} className="text-gray-500" />
                  <span className="font-medium">{usuario.email}</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={18} className="text-gray-500" />
                  <span className="font-medium">Membro desde {formatarData(usuario.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Links sociais */}
          {(usuario.github_url || usuario.linkedin_url || usuario.website_url) && (
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe size={20} />
                Links Sociais
              </h3>
              <div className="flex flex-wrap gap-4">
                {usuario.github_url && (
                  <a
                    href={obterUrlCompleta(usuario.github_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 bg-gray-800 hover:bg-black text-white rounded-xl transition-colors duration-200 hover:scale-105"
                  >
                    <Github size={20} />
                    <span className="font-medium">GitHub</span>
                  </a>
                )}
                
                {usuario.linkedin_url && (
                  <a
                    href={obterUrlCompleta(usuario.linkedin_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 hover:scale-105"
                  >
                    <Linkedin size={20} />
                    <span className="font-medium">LinkedIn</span>
                  </a>
                )}
                
                {usuario.website_url && (
                  <a
                    href={obterUrlCompleta(usuario.website_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 bg-[#39FF14] hover:bg-green-400 text-black rounded-xl transition-colors duration-200 hover:scale-105 font-medium"
                  >
                    <Globe size={20} />
                    <span className="font-medium">Website</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {usuario.skills && usuario.skills.length > 0 && (
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                💻 Skills ({usuario.skills.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {usuario.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-medium hover:bg-[#39FF14] hover:text-black transition-colors duration-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interesses */}
          {usuario.interests && usuario.interests.length > 0 && (
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ❤️ Interesses ({usuario.interests.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {usuario.interests.map((interesse, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[#39FF14] text-black rounded-xl text-sm font-medium hover:bg-green-400 transition-colors duration-200"
                  >
                    {interesse}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Seção de Insígnias */}
          <div className="border-t border-gray-200 pt-8">
            <InsigniasPerfil userId={usuario.id} showTitle={true} />
          </div>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💻</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {usuario.skills?.length || 0}
            </div>
            <div className="text-gray-600 font-medium">Skills Dominadas</div>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❤️</span>
            </div>
            <div className="text-3xl font-bold text-black mb-2">
              {usuario.interests?.length || 0}
            </div>
            <div className="text-gray-600 font-medium">Interesses</div>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {new Date(usuario.created_at).getFullYear()}
            </div>
            <div className="text-gray-600 font-medium">Membro desde</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VisualizacaoPerfil;
