import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
import { Mensagem } from '../../../services/api';

interface AreaChatProps {
  mensagens: Mensagem[];
  onEnviarMensagem: (mensagem: string) => void;
  carregando: boolean;
  conversaId: number | null;
}

const AreaChat: React.FC<AreaChatProps> = ({
  mensagens,
  onEnviarMensagem,
  carregando,
  conversaId,
}) => {
  const [mensagemInput, setMensagemInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Função temporária para renderizar markdown básico
  const renderMarkdown = (content: string) => {
    let html = content;

    // Cabeçalhos (processa primeiro)
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-sm font-bold mb-1 text-gray-900 mt-3">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-base font-bold mb-2 text-gray-900 mt-4">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold mb-2 text-gray-900 mt-4">$1</h1>');

    // Negrito
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');

    // Itálico
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Código inline
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 rounded text-sm font-mono text-gray-900">$1</code>');

    // Blockquotes (citações) - processa antes das listas
    html = html.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-[#39FF14] pl-3 italic text-gray-700 mb-2 bg-gray-50 py-2">$1</blockquote>');

    // Processar tabelas linha por linha
    const lines = html.split('\n');
    let processedLines: string[] = [];
    let inTable = false;
    let tableRows: string[] = [];
    let isFirstRow = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('|') && line.length > 1) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
          isFirstRow = true;
        }
        
        // Ignorar linha separadora
        if (line.includes('---')) {
          continue;
        }
        
        const cells = line.split('|').map(cell => cell.trim()).filter((cell, index, arr) => {
          // Remove células vazias no início e fim
          return !(cell === '' && (index === 0 || index === arr.length - 1));
        });
        
        if (cells.length > 0) {
          if (isFirstRow) {
            const headerRow = cells.map(cell => 
              `<th class="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-left text-gray-900">${cell}</th>`
            ).join('');
            tableRows.push(`<tr>${headerRow}</tr>`);
            isFirstRow = false;
          } else {
            const dataRow = cells.map(cell => 
              `<td class="border border-gray-300 px-3 py-2 text-gray-900">${cell}</td>`
            ).join('');
            tableRows.push(`<tr>${dataRow}</tr>`);
          }
        }
      } else {
        if (inTable && tableRows.length > 0) {
          // Finalizar tabela
          const tableHtml = `<div class="overflow-x-auto mb-4 mt-4"><table class="min-w-full border-collapse border border-gray-300 text-sm rounded">${tableRows.join('')}</table></div>`;
          processedLines.push(tableHtml);
          inTable = false;
          tableRows = [];
        }
        processedLines.push(line);
      }
    }

    // Se terminou em uma tabela
    if (inTable && tableRows.length > 0) {
      const tableHtml = `<div class="overflow-x-auto mb-4 mt-4"><table class="min-w-full border-collapse border border-gray-300 text-sm rounded">${tableRows.join('')}</table></div>`;
      processedLines.push(tableHtml);
    }

    html = processedLines.join('\n');

    // Listas não ordenadas (após tabelas)
    html = html.replace(/^- (.*$)/gm, '<li class="mb-1 text-gray-900">• $1</li>');
    html = html.replace(/(<li class="mb-1.*?<\/li>\s*)+/g, (match) => {
      return `<ul class="list-none pl-4 mb-3 mt-2">${match}</ul>`;
    });

    // Listas numeradas
    html = html.replace(/^\d+\. (.*$)/gm, '<li class="mb-1 text-gray-900">$1</li>');
    html = html.replace(/(<li class="mb-1 text-gray-900">[^•].*?<\/li>\s*)+/g, (match) => {
      return `<ol class="list-decimal pl-4 mb-3 mt-2">${match}</ol>`;
    });

    // Paragráfos (quebras de linha duplas)
    html = html.replace(/\n\n+/g, '</p><p class="mb-3">');
    html = '<p class="mb-3">' + html + '</p>';

    // Quebras de linha simples
    html = html.replace(/\n/g, '<br>');

    // Limpar parágrafos vazios
    html = html.replace(/<p class="mb-3"><\/p>/g, '');

    return html;
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  useEffect(() => {
    // Scroll imediatamente e com delay para garantir que funcione
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [mensagens]);

  useEffect(() => {
    // Scroll quando terminar de carregar
    if (!carregando) {
      scrollToBottom();
    }
  }, [carregando]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mensagemInput.trim() && !carregando) {
      onEnviarMensagem(mensagemInput.trim());
      setMensagemInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${Math.max(newHeight, 48)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [mensagemInput]);

  if (!conversaId) {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Área de Boas-vindas com scroll interno */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="text-center p-4">
            <Bot size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Bem-vindo ao Chat IA
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              Sou especializado em Inteligência Artificial e Ciência de Dados. 
              Digite sua pergunta abaixo para começar uma nova conversa!
            </p>
          </div>
        </div>

        {/* Área de Input para Nova Conversa */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={mensagemInput}
                onChange={(e) => setMensagemInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta sobre IA ou Dados para iniciar uma conversa..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-transparent"
                disabled={carregando}
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!mensagemInput.trim() || carregando}
              className="px-4 py-3 bg-[#39FF14] text-black rounded-lg hover:bg-[#32E012] disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center flex-shrink-0"
            >
              {carregando ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Especializado em Inteligência Artificial e Ciência de Dados
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Área de Mensagens com altura fixa e scroll interno */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bot size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Inicie uma conversa!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {mensagens.map((mensagem) => (
              <div
                key={mensagem.id}
                className={`flex ${
                  mensagem.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    mensagem.role === 'user'
                      ? 'bg-[#39FF14] text-black'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {mensagem.role === 'assistant' && (
                      <Bot size={16} className="mt-1 flex-shrink-0 text-gray-600" />
                    )}
                    {mensagem.role === 'user' && (
                      <User size={16} className="mt-1 flex-shrink-0 text-black" />
                    )}
                    <div className="flex-1">
                      {mensagem.role === 'assistant' ? (
                        <div 
                          className="prose prose-sm max-w-none text-gray-900"
                          dangerouslySetInnerHTML={{ 
                            __html: renderMarkdown(mensagem.content) 
                          }}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap break-words">{mensagem.content}</div>
                      )}
                      <div className="text-xs mt-2 opacity-60">
                        {new Date(mensagem.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {carregando && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Bot size={16} className="text-gray-600" />
                    <div className="flex items-center space-x-1">
                      <Loader2 size={16} className="animate-spin text-gray-600" />
                      <span className="text-gray-600">Pensando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Área de Input */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={mensagemInput}
              onChange={(e) => setMensagemInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta sobre IA ou Dados..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-transparent"
              disabled={carregando}
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!mensagemInput.trim() || carregando}
            className="px-4 py-3 bg-[#39FF14] text-black rounded-lg hover:bg-[#32E012] disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center flex-shrink-0"
          >
            {carregando ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Especializado em Inteligência Artificial e Ciência de Dados
        </div>
      </div>
    </div>
  );
};

export default AreaChat;
