import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import TituloSecao from '../../ui/TituloSecao';
import FormularioDica from './FormularioDica';
import VisualizacaoDica from './VisualizacaoDica';
import Botao from '../../ui/Botao';
import Card from '../../ui/Card';
import type { Dica } from '../../../services/api';
import ApiService from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const MinhasDicas: React.FC = () => {
  const { user } = useAuth();
  const [dicas, setDicas] = useState<Dica[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [dicaSelecionada, setDicaSelecionada] = useState<number | null>(null);
  const [dicaEditando, setDicaEditando] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      carregarMinhasDicas();
    }
  }, [user]);

  const carregarMinhasDicas = async () => {
    try {
      setLoading(true);
      const response = await ApiService.buscarMinhasDicas();
      
      if (response.success && response.data) {
        setDicas(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar minhas dicas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleFormSuccess = () => {
    carregarMinhasDicas();
    setShowForm(false);
    setDicaEditando(null);
  };

  const handleEditDica = (dicaId: number) => {
    setDicaEditando(dicaId);
    setShowForm(true);
  };

  const handleDeleteDica = async (dicaId: number) => {
    const dica = dicas.find(d => d.id === dicaId);
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a dica "${dica?.titulo}"? Esta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      const response = await ApiService.excluirDica(dicaId);
      
      if (response.success) {
        alert('Dica excluída com sucesso!');
        carregarMinhasDicas();
      } else {
        alert('Erro ao excluir dica. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir dica:', error);
      alert('Erro ao excluir dica. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDica = (dicaId: number) => {
    setDicaSelecionada(dicaId);
  };

  // Se uma dica está selecionada, mostrar visualização
  if (dicaSelecionada) {
    return (
      <VisualizacaoDica
        dicaId={dicaSelecionada}
        onBack={() => setDicaSelecionada(null)}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <TituloSecao>Minhas Dicas</TituloSecao>
        <Botao onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} className="mr-2" />
          Nova Dica
        </Botao>
      </div>

      {/* Lista de dicas */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      ) : dicas.length > 0 ? (
        <div className="space-y-4">
          {dicas.map(dica => (
            <Card key={dica.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-[#39FF14] text-black text-xs font-medium rounded-full">
                      {dica.categoria}
                    </span>
                    <span className="text-sm text-gray-500">
                      Criada em {formatarData(dica.created_at)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-black mb-2">
                    {dica.titulo}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {dica.descricao_breve}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      <span>{dica.visualizacoes} visualizações</span>
                    </div>
                    <div>
                      <span>{dica.tempo_leitura} min de leitura</span>
                    </div>
                    {dica.tags && dica.tags.length > 0 && (
                      <div>
                        <span>{dica.tags.length} tags</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewDica(dica.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizar dica"
                  >
                    <Eye size={18} />
                  </button>
                  
                  <button
                    onClick={() => handleEditDica(dica.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar dica"
                  >
                    <Edit size={18} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteDica(dica.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir dica"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Você ainda não criou nenhuma dica
          </h3>
          <p className="text-gray-600 mb-6">
            Compartilhe seu conhecimento criando sua primeira dica!
          </p>
          
          <Botao onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Criar Primeira Dica
          </Botao>
        </div>
      )}

      {/* Formulário de criação/edição */}
      {showForm && (
        <FormularioDica
          dicaId={dicaEditando || undefined}
          onClose={() => {
            setShowForm(false);
            setDicaEditando(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default MinhasDicas;
