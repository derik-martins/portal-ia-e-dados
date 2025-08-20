import React, { useState, useEffect } from 'react';
import TituloSecao from '../../ui/TituloSecao';
import CardNoticia from './CardNoticia';
import ApiService, { Noticia } from '../../../services/api';

const MuralDeNoticias: React.FC = () => {
  const [noticiasIA, setNoticiasIA] = useState<Noticia[]>([]);
  const [noticiasDados, setNoticiasDados] = useState<Noticia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarNoticias();
  }, []);

  const carregarNoticias = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      const response = await ApiService.buscarNoticiasPorCategoria();
      
      if (response.success && response.data) {
        setNoticiasIA(response.data.ia || []);
        setNoticiasDados(response.data.dados || []);
      } else {
        setErro('Erro ao carregar notícias');
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
      setErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div>
        <TituloSecao>Feed de Notícias</TituloSecao>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39FF14]"></div>
          <span className="ml-3 text-gray-600">Carregando notícias...</span>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div>
        <TituloSecao>Feed de Notícias</TituloSecao>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{erro}</p>
          <button 
            onClick={carregarNoticias}
            className="px-4 py-2 bg-[#39FF14] text-black rounded hover:bg-green-400 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TituloSecao>Feed de Notícias</TituloSecao>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">Inteligência Artificial</h2>
          <div className="space-y-4">
            {noticiasIA.length > 0 ? (
              noticiasIA.slice(0, 4).map(noticia => (
                <CardNoticia key={noticia.id} {...noticia} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhuma notícia de IA encontrada
              </p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">Dados</h2>
          <div className="space-y-4">
            {noticiasDados.length > 0 ? (
              noticiasDados.slice(0, 4).map(noticia => (
                <CardNoticia key={noticia.id} {...noticia} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhuma notícia de dados encontrada
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuralDeNoticias;