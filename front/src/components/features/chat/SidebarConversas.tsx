import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { Conversa } from '../../../services/api';

interface SidebarConversasProps {
  conversas: Conversa[];
  conversaAtiva: number | null;
  onSelecionarConversa: (conversaId: number) => void;
  onNovaConversa: () => void;
  onExcluirConversa: (conversaId: number) => void;
  onAtualizarTitulo: (conversaId: number, novoTitulo: string) => void;
}

const SidebarConversas: React.FC<SidebarConversasProps> = ({
  conversas,
  conversaAtiva,
  onSelecionarConversa,
  onNovaConversa,
  onExcluirConversa,
  onAtualizarTitulo,
}) => {
  const [editandoTitulo, setEditandoTitulo] = useState<number | null>(null);
  const [novoTitulo, setNovoTitulo] = useState('');

  const iniciarEdicao = (conversa: Conversa) => {
    setEditandoTitulo(conversa.id);
    setNovoTitulo(conversa.titulo);
  };

  const cancelarEdicao = () => {
    setEditandoTitulo(null);
    setNovoTitulo('');
  };

  const salvarTitulo = (conversaId: number) => {
    if (novoTitulo.trim()) {
      onAtualizarTitulo(conversaId, novoTitulo.trim());
    }
    setEditandoTitulo(null);
    setNovoTitulo('');
  };

  return (
    <div className="w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="mr-2" size={20} />
            Chat IA
          </h2>
          <button
            onClick={onNovaConversa}
            className="p-2 bg-[#39FF14] text-black rounded-lg hover:bg-[#32E012] transition-colors"
            title="Nova conversa"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto">
        {conversas.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma conversa ainda</p>
            <p className="text-xs text-gray-400">Inicie uma nova conversa</p>
          </div>
        ) : (
          <div className="p-2">
            {conversas.map((conversa) => (
              <div
                key={conversa.id}
                className={`group relative p-3 rounded-lg cursor-pointer mb-2 transition-all ${
                  conversaAtiva === conversa.id
                    ? 'bg-[#39FF14] text-black'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => onSelecionarConversa(conversa.id)}
              >
                {editandoTitulo === conversa.id ? (
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={novoTitulo}
                      onChange={(e) => setNovoTitulo(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') salvarTitulo(conversa.id);
                        if (e.key === 'Escape') cancelarEdicao();
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => salvarTitulo(conversa.id)}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={cancelarEdicao}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{conversa.titulo}</h3>
                        {conversa.ultima_mensagem && (
                          <p className="text-xs opacity-75 truncate mt-1">
                            {conversa.ultima_mensagem}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            iniciarEdicao(conversa);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Editar título"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onExcluirConversa(conversa.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Excluir conversa"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {conversa.total_mensagens && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-60">
                          {conversa.total_mensagens} mensagens
                        </span>
                        <span className="text-xs opacity-60">
                          {new Date(conversa.updated_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarConversas;
