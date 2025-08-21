import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Eye, Calendar, User, Tag } from 'lucide-react';
import type { Dica } from '../../../services/api';
import ApiService from '../../../services/api';
import Card from '../../ui/Card';

interface VisualizacaoDicaProps {
  dicaId: number;
  onBack: () => void;
}

const VisualizacaoDica: React.FC<VisualizacaoDicaProps> = ({ dicaId, onBack }) => {
  const [dica, setDica] = useState<Dica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarDica();
  }, [dicaId]);

  const carregarDica = async () => {
    try {
      setLoading(true);
      const response = await ApiService.buscarDicaPorId(dicaId);
      
      if (response.success && response.data) {
        setDica(response.data);
      } else {
        setError('Dica não encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar dica:', error);
      setError('Erro ao carregar a dica');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Função para processar texto com formatação inline
  const processarTextoInline = (texto: string) => {
    if (!texto) return texto;
    
    // Primeiro, vamos processar quebras de linha
    const linhas = texto.split('\n');
    
    return linhas.map((linha, index) => {
      if (index === linhas.length - 1 && !linha.trim()) {
        return null; // Remove linha vazia no final
      }
      
      // Processar links automaticamente
      const textoComLinks = linha.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all">$1</a>'
      );
      
      // Processar emails
      const textoComEmails = textoComLinks.replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        '<a href="mailto:$1" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
      );
      
      return (
        <span key={index}>
          <span dangerouslySetInnerHTML={{ __html: textoComEmails }} />
          {index < linhas.length - 1 && <br />}
        </span>
      );
    }).filter(Boolean);
  };

  // Função para processar itens de lista com formatação inline
  const processarItemLista = (item: string) => {
    // Processar links
    const textoComLinks = item.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all">$1</a>'
    );
    
    // Processar emails
    const textoComEmails = textoComLinks.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
    );
    
    return <span dangerouslySetInnerHTML={{ __html: textoComEmails }} />;
  };

  const renderizarConteudo = (conteudo: any) => {
    if (!conteudo || !conteudo.blocks) {
      return <p className="text-gray-600">Conteúdo não disponível.</p>;
    }

    return conteudo.blocks.map((block: any, index: number) => {
      switch (block.type) {
        case 'paragraph':
          if (!block.data.text || !block.data.text.trim()) {
            return <div key={index} className="mb-2"></div>; // Espaço para parágrafo vazio
          }
          return (
            <div key={index} className="mb-4 text-gray-700 leading-relaxed text-base">
              {processarTextoInline(block.data.text)}
            </div>
          );
        
        case 'header':
          const HeaderTag = `h${Math.min(block.data.level || 2, 6)}` as keyof JSX.IntrinsicElements;
          return (
            <HeaderTag 
              key={index} 
              className={`mb-4 font-bold text-gray-900 ${
                block.data.level === 1 ? 'text-3xl mt-8' :
                block.data.level === 2 ? 'text-2xl mt-6' :
                block.data.level === 3 ? 'text-xl mt-5' :
                'text-lg mt-4'
              }`}
            >
              {processarTextoInline(block.data.text)}
            </HeaderTag>
          );
        
        case 'list':
          const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
          const listClass = block.data.style === 'ordered' 
            ? 'mb-4 pl-6 space-y-2 list-decimal list-inside' 
            : 'mb-4 pl-6 space-y-2 list-disc list-inside';
          
          return (
            <ListTag key={index} className={listClass}>
              {block.data.items.map((item: string, itemIndex: number) => (
                <li key={itemIndex} className="text-gray-700 leading-relaxed">
                  {processarItemLista(item)}
                </li>
              ))}
            </ListTag>
          );
        
        case 'quote':
          return (
            <blockquote key={index} className="mb-6 p-4 bg-gray-50 border-l-4 border-[#39FF14] rounded-r-lg my-6">
              <div className="text-gray-700 italic text-lg mb-2">
                "{processarTextoInline(block.data.text)}"
              </div>
              {block.data.caption && (
                <footer className="text-gray-500 text-sm mt-3">
                  — {processarTextoInline(block.data.caption)}
                </footer>
              )}
            </blockquote>
          );
        
        case 'delimiter':
          return (
            <div key={index} className="mb-8 mt-8 text-center">
              <div className="inline-flex items-center">
                <div className="w-3 h-3 bg-[#39FF14] rounded-full mx-1.5"></div>
                <div className="w-3 h-3 bg-[#39FF14] rounded-full mx-1.5"></div>
                <div className="w-3 h-3 bg-[#39FF14] rounded-full mx-1.5"></div>
              </div>
            </div>
          );
        
        case 'code':
          return (
            <div key={index} className="mb-6">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{block.data.code}</code>
              </pre>
            </div>
          );
        
        case 'warning':
          return (
            <div key={index} className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              {block.data.title && (
                <h4 className="font-bold text-yellow-800 mb-2 text-lg">
                  {processarTextoInline(block.data.title)}
                </h4>
              )}
              <div className="text-yellow-700">
                {processarTextoInline(block.data.message)}
              </div>
            </div>
          );
        
        case 'image':
          return (
            <div key={index} className="mb-8">
              <img
                src={block.data.file?.url || block.data.url}
                alt={block.data.caption || 'Imagem'}
                className="w-full h-auto rounded-lg shadow-md"
              />
              {block.data.caption && (
                <p className="text-center text-sm text-gray-500 mt-3 italic">
                  {processarTextoInline(block.data.caption)}
                </p>
              )}
            </div>
          );

        case 'table':
          return (
            <div key={index} className="mb-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                <tbody className="bg-white divide-y divide-gray-200">
                  {block.data.content?.map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50' : ''}>
                      {row.map((cell: string, cellIndex: number) => {
                        const CellTag = rowIndex === 0 ? 'th' : 'td';
                        return (
                          <CellTag
                            key={cellIndex}
                            className={`px-4 py-2 text-sm border border-gray-200 ${
                              rowIndex === 0 
                                ? 'font-semibold text-gray-900 bg-gray-50' 
                                : 'text-gray-700'
                            }`}
                          >
                            {processarTextoInline(cell)}
                          </CellTag>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

        case 'checklist':
          return (
            <div key={index} className="mb-4 space-y-2">
              {block.data.items?.map((item: any, itemIndex: number) => (
                <div key={itemIndex} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      item.checked 
                        ? 'bg-[#39FF14] border-[#39FF14]' 
                        : 'border-gray-300'
                    }`}>
                      {item.checked && (
                        <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className={`flex-1 text-gray-700 ${item.checked ? 'line-through text-gray-500' : ''}`}>
                    {processarTextoInline(item.text)}
                  </div>
                </div>
              ))}
            </div>
          );
        
        default:
          return (
            <div key={index} className="mb-4 p-3 bg-gray-100 rounded-lg border-l-4 border-orange-400">
              <p className="text-sm text-gray-600">
                <strong>Tipo de conteúdo não suportado:</strong> {block.type}
              </p>
              {block.data && (
                <pre className="text-xs text-gray-500 mt-2 overflow-auto">
                  {JSON.stringify(block.data, null, 2)}
                </pre>
              )}
            </div>
          );
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !dica) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Dica não encontrada'}
          </h2>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar a dica solicitada.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 bg-[#39FF14] text-black font-medium rounded-lg hover:bg-[#32E012] transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Botão de voltar */}
      <button
        onClick={onBack}
        className="inline-flex items-center mb-6 text-gray-600 hover:text-black transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Voltar para dicas
      </button>

      {/* Header da dica */}
      <Card className="mb-6">
        {/* Imagem do header */}
        {dica.imagem_header && (
          <div className="relative h-64 md:h-80">
            <img
              src={dica.imagem_header}
              alt={dica.titulo}
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-lg"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-block px-3 py-1 bg-[#39FF14] text-black text-sm font-medium rounded-full mb-4">
                {dica.categoria}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {dica.titulo}
              </h1>
            </div>
          </div>
        )}
        
        <div className={`p-6 ${!dica.imagem_header ? 'pt-8' : ''}`}>
          {/* Título sem imagem */}
          {!dica.imagem_header && (
            <>
              <span className="inline-block px-3 py-1 bg-[#39FF14] text-black text-sm font-medium rounded-full mb-4">
                {dica.categoria}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {dica.titulo}
              </h1>
            </>
          )}
          
          {/* Descrição breve */}
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {dica.descricao_breve}
          </p>
          
          {/* Metadados */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t pt-6">
            <div className="flex items-center">
              <User size={16} className="mr-2" />
              <span>{dica.autor_nome}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>{formatarData(dica.created_at)}</span>
            </div>
            
            <div className="flex items-center">
              <Clock size={16} className="mr-2" />
              <span>{dica.tempo_leitura} min de leitura</span>
            </div>
            
            <div className="flex items-center">
              <Eye size={16} className="mr-2" />
              <span>{dica.visualizacoes} visualizações</span>
            </div>
          </div>
          
          {/* Tags */}
          {dica.tags && dica.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t">
              <Tag size={16} className="text-gray-400 mr-1" />
              {dica.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Conteúdo da dica */}
      <Card className="p-8">
        <div className="prose prose-lg max-w-none">
          {renderizarConteudo(dica.conteudo)}
        </div>
      </Card>
    </div>
  );
};

export default VisualizacaoDica;
