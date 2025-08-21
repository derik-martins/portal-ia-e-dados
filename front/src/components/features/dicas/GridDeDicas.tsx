import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit } from 'lucide-react';
import TituloSecao from '../../ui/TituloSecao';
import CardDica from './CardDica';
import FormularioDica from './FormularioDica';
import VisualizacaoDica from './VisualizacaoDica';
import Botao from '../../ui/Botao';
import Input from '../../ui/Input';
import type { Dica, DicaFilters, Categoria } from '../../../services/api';
import ApiService from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const GridDeDicas: React.FC = () => {
  const { user } = useAuth();
  const [dicas, setDicas] = useState<Dica[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [dicaSelecionada, setDicaSelecionada] = useState<number | null>(null);
  const [dicaEditando, setDicaEditando] = useState<number | null>(null);
  
  // Filtros
  const [filtros, setFiltros] = useState<DicaFilters>({});
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);

  useEffect(() => {
    carregarDicas();
    carregarCategorias();
  }, [filtros]);

  const carregarDicas = async () => {
    try {
      setLoading(true);
      const response = await ApiService.buscarDicas(filtros);
      
      if (response.success && response.data) {
        setDicas(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dicas:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarCategorias = async () => {
    try {
      const response = await ApiService.buscarCategoriasDicas();
      if (response.success && response.data) {
        setCategorias(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const aplicarFiltros = () => {
    const novosFiltros: DicaFilters = {};
    
    if (busca.trim()) {
      novosFiltros.busca = busca.trim();
    }
    
    if (categoriaFiltro) {
      novosFiltros.categoria = categoriaFiltro;
    }
    
    setFiltros(novosFiltros);
  };

  const limparFiltros = () => {
    setBusca('');
    setCategoriaFiltro('');
    setFiltros({});
    setShowFiltros(false);
  };

  const handleDicaClick = (dicaId: number) => {
    setDicaSelecionada(dicaId);
  };

  const handleFormSuccess = () => {
    carregarDicas();
    setShowForm(false);
    setDicaEditando(null);
  };

  const handleEditDica = (dicaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDicaEditando(dicaId);
    setShowForm(true);
  };

  const handleDeleteDica = async (dicaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir esta dica? Esta ação não pode ser desfeita.'
    );
    
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      const response = await ApiService.excluirDica(dicaId);
      
      if (response.success) {
        alert('Dica excluída com sucesso!');
        carregarDicas(); // Recarregar a lista
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
      {/* Header com título e botão de criar */}
      <div className="flex items-center justify-between mb-6">
        <TituloSecao>Dicas da Comunidade</TituloSecao>
        
        {user && (
          <Botao
            onClick={() => setShowForm(true)}
            size="sm"
          >
            <Plus size={16} className="mr-2" />
            Nova Dica
          </Botao>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              value={busca}
              onChange={(value) => setBusca(value)}
              placeholder="Buscar dicas por título ou descrição..."
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
            />
          </div>
          
          <Botao onClick={aplicarFiltros} size="sm">
            <Search size={16} className="mr-2" />
            Buscar
          </Botao>
          
          <Botao
            onClick={() => setShowFiltros(!showFiltros)}
            variant="outline"
            size="sm"
          >
            <Filter size={16} className="mr-2" />
            Filtros
          </Botao>
        </div>

        {/* Painel de filtros avançados */}
        {showFiltros && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-transparent"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map(cat => (
                    <option key={cat.categoria} value={cat.categoria}>
                      {cat.categoria} ({cat.total})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Botao onClick={aplicarFiltros} size="sm">
                Aplicar Filtros
              </Botao>
              <Botao onClick={limparFiltros} variant="outline" size="sm">
                Limpar
              </Botao>
            </div>
          </div>
        )}
      </div>

      {/* Grid de dicas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      ) : dicas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dicas.map(dica => (
            <div key={dica.id} className="relative group">
              <CardDica
                dica={dica}
                onClick={() => handleDicaClick(dica.id)}
              />
              
              {/* Botões de ação para o autor */}
              {user && user.id === dica.autor_id && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => handleEditDica(dica.id, e)}
                    className="bg-white hover:bg-blue-50 p-2 rounded-full shadow-md hover:text-blue-600 transition-colors"
                    title="Editar dica"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={(e) => handleDeleteDica(dica.id, e)}
                    className="bg-white hover:bg-red-50 p-2 rounded-full shadow-md hover:text-red-600 transition-colors"
                    title="Excluir dica"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma dica encontrada
          </h3>
          <p className="text-gray-600 mb-6">
            {Object.keys(filtros).length > 0 
              ? 'Tente ajustar os filtros ou fazer uma nova busca.'
              : 'Seja o primeiro a compartilhar uma dica com a comunidade!'
            }
          </p>
          
          {user && Object.keys(filtros).length === 0 && (
            <Botao onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-2" />
              Criar Primeira Dica
            </Botao>
          )}
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

export default GridDeDicas;