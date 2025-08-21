import React, { useState, useEffect } from 'react';
import ApiService, { RankingUsuario } from '../../../services/api';
import Card from '../../ui/Card';
import TituloSecao from '../../ui/TituloSecao';
import { Search, Trophy, Medal, TrendingUp, Users } from 'lucide-react';

interface RankingInsigniasProps {
  limite?: number;
  showTitle?: boolean;
}

const RankingInsignias: React.FC<RankingInsigniasProps> = ({ 
  limite = 50, 
  showTitle = true 
}) => {
  const [ranking, setRanking] = useState<RankingUsuario[]>([]);
  const [filteredRanking, setFilteredRanking] = useState<RankingUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);

  useEffect(() => {
    carregarRanking();
  }, [limite]);

  useEffect(() => {
    // Filtrar ranking baseado no termo de pesquisa
    if (!searchTerm.trim()) {
      setFilteredRanking(ranking);
    } else {
      const filtered = ranking.filter(usuario => 
        usuario.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRanking(filtered);
    }
  }, [ranking, searchTerm]);

  const carregarRanking = async () => {
    try {
      setLoading(true);
      const response = await ApiService.rankingUsuarios(limite);
      if (response.success && response.data) {
        // Filtrar apenas usuários com pontos > 0 e ordenar
        const rankingComPontos = response.data.ranking
          .filter(usuario => usuario.total_pontos > 0)
          .sort((a, b) => b.total_pontos - a.total_pontos);
        setRanking(rankingComPontos);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPosicaoIcon = (posicao: number) => {
    switch (posicao) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return posicao.toString();
    }
  };

  // Calcular estatísticas
  const estatisticas = {
    totalPontos: ranking.reduce((acc, user) => acc + user.total_pontos, 0),
    totalInsignias: ranking.reduce((acc, user) => acc + user.total_insignias, 0),
    totalUsuarios: ranking.length,
    mediaPontos: ranking.length > 0 ? Math.round(ranking.reduce((acc, user) => acc + user.total_pontos, 0) / ranking.length) : 0
  };

  const displayedRanking = filteredRanking.slice(0, displayLimit);

  if (loading) {
    return (
      <div className="space-y-6">
        {showTitle && (
          <div>
            <div className="h-8 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
            <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        )}
        <Card className="p-6 animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg mb-6"></div>
        </Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded mb-2 w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <TituloSecao>Ranking de Pontos</TituloSecao>
          <div className="bg-gradient-to-r from-[#39FF14] to-green-400 p-6 rounded-lg text-black mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <Trophy size={28} />
                  Os melhores da comunidade
                </h2>
                <p className="text-lg">
                  Confira quem está liderando o ranking com mais pontos e insígnias
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">Top {filteredRanking.length}</span>
                <Users size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Pesquisa */}
      <Card className="p-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar usuário por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
            >
              ×
            </button>
          )}
        </div>
      </Card>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">{estatisticas.totalUsuarios}</div>
          <div className="text-sm text-gray-600">Usuários Ativos</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-[#39FF14] mb-2">{estatisticas.totalPontos}</div>
          <div className="text-sm text-gray-600">Total de Pontos</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{estatisticas.totalInsignias}</div>
          <div className="text-sm text-gray-600">Insígnias Conquistadas</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{estatisticas.mediaPontos}</div>
          <div className="text-sm text-gray-600">Média de Pontos</div>
        </Card>
      </div>

      {displayedRanking.length === 0 ? (
        <Card className="p-6 text-center">
          {searchTerm ? (
            <div>
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">Nenhum usuário encontrado</h4>
              <p className="text-gray-600">Tente pesquisar com outro termo</p>
            </div>
          ) : (
            <div>
              <div className="text-gray-400 text-4xl mb-4">🏆</div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">Nenhum usuário com pontos</h4>
              <p className="text-gray-600">Seja o primeiro a conquistar insígnias!</p>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6">
          <div className="space-y-4">
            {displayedRanking.map((usuario) => {
              const posicao = ranking.findIndex(u => u.id === usuario.id) + 1;
              
              return (
                <div
                  key={usuario.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:shadow-md border ${
                    posicao <= 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-white'
                  }`}
                >
                  {/* Posição */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg ${
                    posicao === 1 ? 'bg-yellow-500 text-white' :
                    posicao === 2 ? 'bg-gray-400 text-white' :
                    posicao === 3 ? 'bg-amber-600 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {posicao <= 3 ? getPosicaoIcon(posicao) : `#${posicao}`}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    {usuario.profile_image ? (
                      <img
                        src={`${import.meta.env.DEV ? 'http://localhost:3001' : ''}${usuario.profile_image}`}
                        alt={usuario.name}
                        className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
                        {usuario.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Coroa para o primeiro lugar */}
                    {posicao === 1 && (
                      <div className="absolute -top-1 -right-1 text-lg">👑</div>
                    )}
                  </div>

                  {/* Informações do usuário */}
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 truncate mb-1">
                      {usuario.name}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Medal size={14} />
                        <span>{usuario.total_insignias} insígnia{usuario.total_insignias !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        <span>{usuario.total_pontos} pontos</span>
                      </div>
                    </div>
                  </div>

                  {/* Pontuação em destaque */}
                  <div className="text-right">
                    <div className={`font-bold text-2xl ${
                      posicao === 1 ? 'text-yellow-600' :
                      posicao === 2 ? 'text-gray-600' :
                      posicao === 3 ? 'text-amber-600' :
                      'text-gray-700'
                    }`}>
                      {usuario.total_pontos}
                    </div>
                    <div className="text-xs text-gray-500">pontos</div>
                  </div>
                </div>
              );
            })}
            
            {/* Botão para carregar mais */}
            {filteredRanking.length > displayLimit && (
              <div className="text-center pt-4 border-t">
                <button
                  onClick={() => setDisplayLimit(prev => prev + 10)}
                  className="px-6 py-3 bg-[#39FF14] text-black rounded-lg hover:bg-green-400 transition-colors font-medium"
                >
                  Carregar mais usuários ({filteredRanking.length - displayLimit} restantes)
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Estatísticas detalhadas */}
      {ranking.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Resumo Geral</h4>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {ranking.reduce((acc, user) => acc + user.total_pontos, 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Pontos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {ranking.reduce((acc, user) => acc + user.total_insignias, 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Insígnias</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#39FF14] mb-1">
                {ranking.length > 0 ? Math.round(
                  ranking.reduce((acc, user) => acc + user.total_pontos, 0) / ranking.length
                ) : 0}
              </div>
              <div className="text-sm text-gray-600">Média de Pontos</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RankingInsignias;
