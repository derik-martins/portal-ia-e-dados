import React, { useState, useEffect } from 'react';
import ApiService, { User, Insignia, ConcessaoInsignia } from '../../../services/api';
import Botao from '../../ui/Botao';
import Card from '../../ui/Card';
import TituloSecao from '../../ui/TituloSecao';
import { Award, Search, Users, Plus, Trash2 } from 'lucide-react';

const AtribuirInsignias: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [insignias, setInsignias] = useState<Insignia[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<User | null>(null);
  const [insigniasUsuario, setInsigniasUsuario] = useState<Insignia[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
  const [showConcessaoForm, setShowConcessaoForm] = useState(false);
  const [concessaoData, setConcessaoData] = useState<ConcessaoInsignia & { observacoes?: string }>({
    userId: 0,
    insigniaId: 0,
    observacoes: ''
  });

  useEffect(() => {
    carregarInsignias();
    carregarUsuarios();
  }, [paginaUsuarios, busca]);

  useEffect(() => {
    if (usuarioSelecionado) {
      carregarInsigniasUsuario(usuarioSelecionado.id);
    }
  }, [usuarioSelecionado]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await ApiService.listarTodosUsuarios(paginaUsuarios, 12, busca);
      if (response.success && response.data) {
        setUsuarios(response.data.usuarios);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarInsignias = async () => {
    try {
      const response = await ApiService.listarInsignias(true);
      if (response.success && response.data) {
        setInsignias(response.data.insignias);
      }
    } catch (error) {
      console.error('Erro ao carregar insígnias:', error);
    }
  };

  const carregarInsigniasUsuario = async (userId: number) => {
    try {
      const response = await ApiService.listarInsigniasUsuario(userId);
      if (response.success && response.data) {
        setInsigniasUsuario(response.data.insignias);
      }
    } catch (error) {
      console.error('Erro ao carregar insígnias do usuário:', error);
      setInsigniasUsuario([]);
    }
  };

  const handleConcederInsignia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await ApiService.concederInsignia(concessaoData);
      
      if (response.success) {
        alert('Insígnia concedida com sucesso!');
        if (usuarioSelecionado) {
          carregarInsigniasUsuario(usuarioSelecionado.id);
        }
        setShowConcessaoForm(false);
        setConcessaoData({
          userId: 0,
          insigniaId: 0,
          observacoes: ''
        });
      } else {
        alert(response.message || 'Erro ao conceder insígnia');
      }
    } catch (error) {
      console.error('Erro ao conceder insígnia:', error);
      alert('Erro ao conceder insígnia');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverInsignia = async (userId: number, insigniaId: number) => {
    if (!confirm('Tem certeza que deseja remover esta insígnia?')) return;
    
    try {
      setLoading(true);
      const response = await ApiService.removerInsigniaUsuario(userId, insigniaId);
      
      if (response.success) {
        alert('Insígnia removida com sucesso!');
        carregarInsigniasUsuario(userId);
      } else {
        alert(response.message || 'Erro ao remover insígnia');
      }
    } catch (error) {
      console.error('Erro ao remover insígnia:', error);
      alert('Erro ao remover insígnia');
    } finally {
      setLoading(false);
    }
  };

  const iniciarConcessao = (usuario: User, insignia?: Insignia) => {
    setConcessaoData({
      userId: usuario.id,
      insigniaId: insignia?.id || 0,
      observacoes: ''
    });
    setShowConcessaoForm(true);
  };

  const insigniasDisponiveis = insignias.filter(
    insignia => !insigniasUsuario.some(ui => ui.id === insignia.id)
  );

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div>
        <TituloSecao>Atribuir Insígnias</TituloSecao>
        <div className="bg-gradient-to-r from-[#39FF14] to-green-400 p-6 rounded-lg text-black mt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Award size={28} />
                Gerencie as conquistas dos usuários
              </h2>
              <p className="text-lg">
                Atribua ou remova insígnias para reconhecer as atividades dos usuários na plataforma
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors bg-white/90"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de concessão */}
      {showConcessaoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Conceder Insígnia</h3>
              <button
                onClick={() => setShowConcessaoForm(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleConcederInsignia} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insígnia *
                </label>
                <select
                  value={concessaoData.insigniaId}
                  onChange={(e) => setConcessaoData(prev => ({ ...prev, insigniaId: parseInt(e.target.value) }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition-colors"
                >
                  <option value={0}>Selecione uma insígnia</option>
                  {insigniasDisponiveis.map(insignia => (
                    <option key={insignia.id} value={insignia.id}>
                      {insignia.nome} ({insignia.pontos} pts)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={concessaoData.observacoes}
                  onChange={(e) => setConcessaoData(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                  maxLength={500}
                  placeholder="Motivo da concessão..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition-colors resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Botao
                  type="submit"
                  disabled={loading}
                  className="bg-[#39FF14] hover:bg-green-400 text-black px-6 py-3 font-medium"
                >
                  {loading ? 'Concedendo...' : 'Conceder'}
                </Botao>
                <Botao
                  type="button"
                  onClick={() => setShowConcessaoForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 font-medium"
                >
                  Cancelar
                </Botao>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de usuários */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Usuários</h3>
          {loading && !usuarios.length ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">⏳</div>
              <p className="text-lg font-medium text-gray-600">Carregando usuários...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">👥</div>
              <p className="text-gray-600">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className={`p-4 rounded-lg transition-all cursor-pointer border ${
                    usuarioSelecionado?.id === usuario.id
                      ? 'bg-[#39FF14]/10 border-[#39FF14] shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setUsuarioSelecionado(usuario)}
                >
                  <div className="flex items-center gap-3">
                    {usuario.profile_image ? (
                      <img
                        src={usuario.profile_image}
                        alt={usuario.name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {usuario.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{usuario.name}</h4>
                      <p className="text-sm text-gray-600">{usuario.email}</p>
                    </div>
                    
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        iniciarConcessao(usuario);
                      }}
                      className="bg-[#39FF14] hover:bg-green-400 text-black px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Insígnia
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Insígnias do usuário selecionado */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Insígnias {usuarioSelecionado ? `de ${usuarioSelecionado.name}` : ''}
          </h3>
          
          {!usuarioSelecionado ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">👤</div>
              <p className="text-gray-600">Selecione um usuário para ver suas insígnias</p>
            </div>
          ) : insigniasUsuario.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🏆</div>
              <p className="text-gray-600">Este usuário não possui insígnias</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insigniasUsuario.map((insignia) => (
                <div key={insignia.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    {insignia.imagem_url ? (
                      <img
                        src={insignia.imagem_url}
                        alt={insignia.nome}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: insignia.cor }}
                      >
                        {insignia.nome.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{insignia.nome}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="px-2 py-1 bg-[#39FF14] text-black rounded text-xs font-medium">
                          {insignia.pontos} pontos
                        </span>
                      </div>
                      {insignia.data_conceicao && (
                        <p className="text-xs text-gray-500 mt-2">
                          Concedida em {new Date(insignia.data_conceicao).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {insignia.observacoes && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          "{insignia.observacoes}"
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleRemoverInsignia(usuarioSelecionado.id, insignia.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AtribuirInsignias;
