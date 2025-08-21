import React, { useState, useEffect } from 'react';
import { MessageCircle, Lightbulb, Newspaper, ArrowRight, Clock, User, Eye } from 'lucide-react';
import TituloSecao from '../../ui/TituloSecao';
import Botao from '../../ui/Botao';
import Card from '../../ui/Card';
import { useAuth } from '../../../contexts/AuthContext';
import ApiService from '../../../services/api';
import type { Dica, Noticia } from '../../../services/api';

interface DashboardInicialProps {
  onNavigate: (view: string) => void;
}

const DashboardInicial: React.FC<DashboardInicialProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [ultimaDica, setUltimaDica] = useState<Dica | null>(null);
  const [ultimasNoticias, setUltimasNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar última dica
      const dicasResponse = await ApiService.buscarDicas({ limite: 1 });
      if (dicasResponse.success && dicasResponse.data && dicasResponse.data.length > 0) {
        setUltimaDica(dicasResponse.data[0]);
      }

      // Carregar últimas 3 notícias
      const noticiasResponse = await ApiService.buscarNoticias(undefined, 3);
      if (noticiasResponse.success && noticiasResponse.data) {
        setUltimasNoticias(noticiasResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const formatarDataCompleta = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header de Boas-vindas */}
      <div>
        <TituloSecao>Dashboard Principal</TituloSecao>
        <div className="bg-gradient-to-r from-[#39FF14] to-green-400 p-6 rounded-lg text-black mt-6">
          <h2 className="text-2xl font-bold mb-2">
            Bem-vindo de volta, {user?.name || 'Usuário'}! 👋
          </h2>
          <p className="text-lg">
            Explore as funcionalidades do Portal IA e Dados da Geração Caldeira 2025
          </p>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <MessageCircle className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Chat IA</h3>
              <p className="text-sm text-gray-600">Converse com nossa IA</p>
            </div>
          </div>
          <Botao 
            onClick={() => onNavigate('chat')} 
            className="w-full"
            size="sm"
          >
            Iniciar Chat
            <ArrowRight size={16} className="ml-2" />
          </Botao>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Lightbulb className="text-yellow-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Dicas Rápidas</h3>
              <p className="text-sm text-gray-600">Compartilhe conhecimento</p>
            </div>
          </div>
          <Botao 
            onClick={() => onNavigate('dicas')} 
            variant="outline"
            className="w-full"
            size="sm"
          >
            Ver Dicas
            <ArrowRight size={16} className="ml-2" />
          </Botao>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Newspaper className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Feed de Notícias</h3>
              <p className="text-sm text-gray-600">Fique por dentro</p>
            </div>
          </div>
          <Botao 
            onClick={() => onNavigate('feed')} 
            variant="outline"
            className="w-full"
            size="sm"
          >
            Ver Notícias
            <ArrowRight size={16} className="ml-2" />
          </Botao>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Última Dica */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Última Dica Publicada</h3>
            <Botao 
              onClick={() => onNavigate('dicas')} 
              variant="outline" 
              size="sm"
            >
              Ver todas
            </Botao>
          </div>

          {loading ? (
            <Card className="p-6 animate-pulse">
              <div className="bg-gray-200 h-4 rounded mb-4"></div>
              <div className="bg-gray-200 h-3 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-2/3"></div>
            </Card>
          ) : ultimaDica ? (
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('dicas')}>
              <div className="mb-3">
                <span className="px-3 py-1 bg-[#39FF14] text-black text-xs font-medium rounded-full">
                  {ultimaDica.categoria}
                </span>
              </div>
              
              <h4 className="text-lg font-bold text-black mb-3 overflow-hidden">
                <div className="line-clamp-2">
                  {ultimaDica.titulo}
                </div>
              </h4>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed overflow-hidden">
                <div className="line-clamp-3">
                  {ultimaDica.descricao_breve}
                </div>
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    <span>{ultimaDica.tempo_leitura} min</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Eye size={12} className="mr-1" />
                    <span>{ultimaDica.visualizacoes}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User size={12} className="mr-1" />
                  <span className="truncate max-w-24">{ultimaDica.autor_nome}</span>
                </div>
              </div>
              
              <div className="text-right mt-1">
                <span className="text-xs text-gray-400">
                  {formatarData(ultimaDica.created_at)}
                </span>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <div className="text-gray-400 text-4xl mb-4">💡</div>
              <p className="text-gray-600">Nenhuma dica disponível ainda</p>
            </Card>
          )}
        </div>

        {/* Últimas Notícias */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Últimas Notícias</h3>
            <Botao 
              onClick={() => onNavigate('feed')} 
              variant="outline" 
              size="sm"
            >
              Ver todas
            </Botao>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                </Card>
              ))}
            </div>
          ) : ultimasNoticias.length > 0 ? (
            <div className="space-y-4">
              {ultimasNoticias.map((noticia) => (
                <Card 
                  key={noticia.id} 
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onNavigate('feed')}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-[#39FF14] rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 overflow-hidden">
                        <div className="line-clamp-2">
                          {noticia.titulo}
                        </div>
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 overflow-hidden">
                        <div className="line-clamp-2">
                          {noticia.tags && noticia.tags.length > 0 ? noticia.tags.join(', ') : 'Sem descrição disponível'}
                        </div>
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{noticia.fonte}</span>
                        <span>{formatarDataCompleta(noticia.data)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <div className="text-gray-400 text-4xl mb-4">📰</div>
              <p className="text-gray-600">Nenhuma notícia disponível</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardInicial;
