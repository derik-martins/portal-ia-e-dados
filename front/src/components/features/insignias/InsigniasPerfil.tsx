import React, { useState, useEffect } from 'react';
import ApiService, { Insignia } from '../../../services/api';
import Card from '../../ui/Card';

interface InsigniasPerfilProps {
  userId: number;
  showTitle?: boolean;
}

const InsigniasPerfil: React.FC<InsigniasPerfilProps> = ({ userId, showTitle = true }) => {
  const [insignias, setInsignias] = useState<Insignia[]>([]);
  const [totalPontos, setTotalPontos] = useState(0);
  const [posicaoRanking, setPosicaoRanking] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarInsignias();
  }, [userId]);

  const carregarInsignias = async () => {
    try {
      setLoading(true);
      
      // Carregar insígnias do usuário
      const response = await ApiService.listarInsigniasUsuario(userId);
      if (response.success && response.data) {
        setInsignias(response.data.insignias);
        setTotalPontos(response.data.total_pontos);
      }

      // Buscar posição no ranking se o usuário tem pontos
      if (response.success && response.data && response.data.total_pontos > 0) {
        const responseRanking = await ApiService.rankingUsuarios(100);
        if (responseRanking.success && responseRanking.data) {
          const posicao = responseRanking.data.ranking.findIndex(u => u.id === userId);
          setPosicaoRanking(posicao >= 0 ? posicao + 1 : null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar insígnias:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 h-6 rounded mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <div className="bg-gray-200 w-20 h-20 rounded-xl mx-auto"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Conquistas
          </h3>
          <div className="flex items-center gap-3">
            {totalPontos > 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                {totalPontos} pontos
              </div>
            )}
            {posicaoRanking && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                #{posicaoRanking} no ranking
              </div>
            )}
          </div>
        </div>
      )}

      {insignias.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🏆</div>
          <h4 className="text-lg font-medium text-gray-600 mb-2">Nenhuma conquista ainda</h4>
          <p className="text-sm text-gray-500">Continue participando para ganhar suas primeiras insígnias!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {insignias.map((insignia) => (
            <div
              key={insignia.id}
              className="group relative flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-lg hover:scale-105"
              title={`${insignia.nome} - ${insignia.pontos} pontos${insignia.observacoes ? `\n${insignia.observacoes}` : ''}`}
            >
              {/* Insígnia */}
              <div className="relative mb-3">
                {insignia.imagem_url ? (
                  <img
                    src={insignia.imagem_url}
                    alt={insignia.nome}
                    className="w-20 h-20 rounded-xl object-cover shadow-md group-hover:shadow-xl transition-all duration-200 ring-2 ring-gray-200 group-hover:ring-[#39FF14]"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-xl transition-all duration-200 ring-2 ring-gray-200 group-hover:ring-[#39FF14]"
                    style={{ backgroundColor: insignia.cor || '#39FF14' }}
                  >
                    {insignia.nome.slice(0, 2).toUpperCase()}
                  </div>
                )}
                
                {/* Badge de pontos melhorado */}
                <div className="absolute -top-2 -right-2 bg-[#39FF14] text-black text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg ring-2 ring-white">
                  {insignia.pontos}
                </div>
              </div>

              {/* Nome da insígnia */}
              <h4 className="text-sm font-semibold text-center text-gray-900 group-hover:text-black transition-colors duration-200 leading-tight">
                {insignia.nome}
              </h4>

              {/* Data de concessão */}
              {insignia.data_conceicao && (
                <p className="text-xs text-gray-500 text-center mt-2 bg-gray-50 px-2 py-1 rounded-full">
                  {new Date(insignia.data_conceicao).toLocaleDateString('pt-BR')}
                </p>
              )}

              {/* Tooltip melhorado */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl z-20 pointer-events-none min-w-max max-w-xs">
                <div className="font-semibold text-sm mb-1">{insignia.nome}</div>
                <div className="text-[#39FF14] font-medium">{insignia.pontos} pontos</div>
                {insignia.descricao && (
                  <div className="text-gray-300 mt-2 leading-relaxed">
                    {insignia.descricao}
                  </div>
                )}
                {insignia.observacoes && (
                  <div className="text-gray-300 mt-2 pt-2 border-t border-gray-700 leading-relaxed">
                    {insignia.observacoes}
                  </div>
                )}
                {insignia.concedida_por_nome && (
                  <div className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700">
                    Concedida por: <span className="text-gray-300">{insignia.concedida_por_nome}</span>
                  </div>
                )}
                
                {/* Seta do tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas resumidas */}
      {insignias.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <div className="font-bold text-2xl text-gray-900 mb-1">{insignias.length}</div>
              <div className="text-sm text-gray-600 font-medium">Insígnia{insignias.length !== 1 ? 's' : ''}</div>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
              <div className="font-bold text-2xl text-blue-700 mb-1">{totalPontos}</div>
              <div className="text-sm text-blue-600 font-medium">Pontos</div>
            </div>
            
            {posicaoRanking && (
              <div className="text-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors duration-200">
                <div className="font-bold text-2xl text-green-700 mb-1">#{posicaoRanking}</div>
                <div className="text-sm text-green-600 font-medium">Posição</div>
              </div>
            )}
            
            {insignias.length > 0 && (
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#39FF14] to-green-200 hover:from-green-200 hover:to-green-300 transition-colors duration-200">
                <div className="font-bold text-2xl text-black mb-1">
                  {Math.round(totalPontos / insignias.length)}
                </div>
                <div className="text-sm text-black font-medium">Média</div>
              </div>
            )}
          </div>
          
          {/* Barra de progresso visual */}
          {totalPontos > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#39FF14] to-green-300 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-black">Nível de Conquistas</span>
                <span className="text-sm font-bold text-black">{totalPontos} pts</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-600 to-green-800 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((totalPontos / Math.max(totalPontos, 100)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default InsigniasPerfil;
