import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Calendar, 
  Github, 
  Linkedin,
  Globe,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import ApiService, { User } from '../../../services/api';
import Card from '../../ui/Card';
import Botao from '../../ui/Botao';
import Avatar from '../../ui/Avatar';
import TituloSecao from '../../ui/TituloSecao';

interface ListagemUsuariosProps {
  onViewProfile: (userId: number) => void;
}

const ListagemUsuarios: React.FC<ListagemUsuariosProps> = ({ onViewProfile }) => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillsPopulares, setSkillsPopulares] = useState<Array<{ skill: string, count: number }>>([]);
  const [interessesPopulares, setInteressesPopulares] = useState<Array<{ interesse: string, count: number }>>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  const carregarUsuarios = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await ApiService.listarTodosUsuarios(page, 12, search);
      
      if (response.success && response.data) {
        setUsuarios(response.data.usuarios);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosPopulares = async () => {
    try {
      const [skillsResponse, interessesResponse] = await Promise.all([
        ApiService.listarSkillsPopulares(),
        ApiService.listarInteressesPopulares()
      ]);

      if (skillsResponse.success && skillsResponse.data) {
        setSkillsPopulares(skillsResponse.data.skills);
      }

      if (interessesResponse.success && interessesResponse.data) {
        setInteressesPopulares(interessesResponse.data.interesses);
      }
    } catch (error) {
      console.error('Erro ao carregar dados populares:', error);
    }
  };

  useEffect(() => {
    carregarUsuarios();
    carregarDadosPopulares();
  }, []);

  const handleSearch = (termo: string) => {
    setSearchTerm(termo);
    setCurrentPage(1);
    carregarUsuarios(1, termo);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    carregarUsuarios(page, searchTerm);
  };

  const filtrarPorSkill = async (skill: string) => {
    try {
      setLoading(true);
      const response = await ApiService.buscarUsuariosPorSkill(skill);
      
      if (response.success && response.data) {
        setUsuarios(response.data.usuarios);
        setSearchTerm(`Skill: ${skill}`);
        // Reset pagination para filtros
        setPagination(prev => ({ ...prev, page: 1, pages: 1, hasNext: false, hasPrev: false }));
      }
    } catch (error) {
      console.error('Erro ao filtrar por skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPorInteresse = async (interesse: string) => {
    try {
      setLoading(true);
      const response = await ApiService.buscarUsuariosPorInteresse(interesse);
      
      if (response.success && response.data) {
        setUsuarios(response.data.usuarios);
        setSearchTerm(`Interesse: ${interesse}`);
        // Reset pagination para filtros
        setPagination(prev => ({ ...prev, page: 1, pages: 1, hasNext: false, hasPrev: false }));
      }
    } catch (error) {
      console.error('Erro ao filtrar por interesse:', error);
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setSearchTerm('');
    setCurrentPage(1);
    carregarUsuarios(1, '');
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div>
        <TituloSecao>Pessoas da Comunidade</TituloSecao>
        <div className="bg-gradient-to-r from-[#39FF14] to-green-400 p-6 rounded-lg text-black mt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Users size={28} />
                Conecte-se com a comunidade
              </h2>
              <p className="text-lg">
                Descubra pessoas incríveis, suas habilidades e interesses em comum
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou localização..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors bg-white/90 w-80"
                />
              </div>
              
              <div className="flex gap-2">
                {searchTerm && (
                  <button
                    onClick={limparFiltros}
                    className="bg-white text-black hover:bg-gray-100 px-4 py-3 rounded-lg font-medium border-2 border-black transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Limpar
                  </button>
                )}
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white text-black hover:bg-gray-100 px-4 py-3 rounded-lg font-medium border-2 border-black transition-colors flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filtros de Busca</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills populares */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Skills Populares</h4>
              <div className="flex flex-wrap gap-2">
                {skillsPopulares.slice(0, 8).map(({ skill, count }) => (
                  <button
                    key={skill}
                    onClick={() => filtrarPorSkill(skill)}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  >
                    {skill} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* Interesses populares */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Interesses Populares</h4>
              <div className="flex flex-wrap gap-2">
                {interessesPopulares.slice(0, 8).map(({ interesse, count }) => (
                  <button
                    key={interesse}
                    onClick={() => filtrarPorInteresse(interesse)}
                    className="px-3 py-2 text-sm bg-[#39FF14] text-black rounded-lg hover:bg-green-400 transition-colors font-medium"
                  >
                    {interesse} ({count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Grid de usuários */}
      {loading ? (
        <Card className="p-6 text-center">
          <div className="text-gray-400 text-4xl mb-4">⏳</div>
          <p className="text-lg font-medium text-gray-600">Carregando usuários...</p>
        </Card>
      ) : usuarios.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-gray-400 text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Tente buscar com termos diferentes ou remover os filtros.'
              : 'Não há usuários cadastrados no momento.'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {usuarios.map((usuario) => (
            <Card key={usuario.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewProfile(usuario.id)}>
              {/* Banner */}
              <div 
                className="h-24 bg-gradient-to-r from-[#39FF14] to-green-400 relative"
                style={{
                  backgroundImage: usuario.banner_image 
                    ? `url(${import.meta.env.DEV ? 'http://localhost:3001' : ''}${usuario.banner_image})` 
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Avatar sobreposto */}
                <div className="absolute -bottom-6 left-4">
                  <Avatar
                    name={usuario.name}
                    imageUrl={usuario.profile_image}
                    size="lg"
                    className="border-4 border-white shadow-lg"
                  />
                </div>
              </div>

              {/* Conteúdo do card */}
              <div className="pt-8 p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{usuario.name}</h3>
                  <p className="text-sm text-gray-600">
                    {usuario.role === 'admin' ? 'Administrador' : 'Estudante'}
                  </p>
                </div>

                {usuario.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {usuario.bio}
                  </p>
                )}

                {/* Informações adicionais */}
                <div className="space-y-2 mb-4">
                  {usuario.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={14} />
                      <span>{usuario.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>Desde {formatarData(usuario.created_at)}</span>
                  </div>
                </div>

                {/* Links sociais */}
                {(usuario.github_url || usuario.linkedin_url || usuario.website_url) && (
                  <div className="flex gap-3 mb-4">
                    {usuario.github_url && (
                      <a
                        href={usuario.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github size={18} />
                      </a>
                    )}
                    {usuario.linkedin_url && (
                      <a
                        href={usuario.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {usuario.website_url && (
                      <a
                        href={usuario.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe size={18} />
                      </a>
                    )}
                  </div>
                )}

                {/* Skills */}
                {usuario.skills && usuario.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {usuario.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-[#39FF14] text-black rounded font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {usuario.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded font-medium">
                          +{usuario.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <Botao
                  className="w-full bg-[#39FF14] hover:bg-green-400 text-black font-medium"
                  onClick={() => onViewProfile(usuario.id)}
                >
                  Ver Perfil
                </Botao>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.pages > 1 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuários
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600 font-medium">
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ListagemUsuarios;
