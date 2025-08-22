import React, { useState, useEffect, useRef } from 'react';
import { Award, Plus, Edit, Trash2, Save, X, Users, Star, Eye, EyeOff, Palette, Upload, Image } from 'lucide-react';
import ApiService, { Insignia, InsigniaFormData } from '../../../services/api';
import Botao from '../../ui/Botao';
import Card from '../../ui/Card';
import TituloSecao from '../../ui/TituloSecao';

const GerenciamentoInsignias: React.FC = () => {
  const [insignias, setInsignias] = useState<Insignia[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<InsigniaFormData & { ativo?: boolean }>({
    nome: '',
    descricao: '',
    imagem_url: '',
    pontos: 0,
    cor: '#3B82F6',
    ativo: true
  });
  const [incluirInativas, setIncluirInativas] = useState(false);
  const [imagemPreview, setImagemPreview] = useState<string>('');
  const [uploadingImagem, setUploadingImagem] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregarInsignias();
  }, [incluirInativas]);

  const carregarInsignias = async () => {
    try {
      setLoading(true);
      const response = await ApiService.listarInsignias(!incluirInativas);
      if (response.success && response.data) {
        setInsignias(response.data.insignias);
      }
    } catch (error) {
      console.error('Erro ao carregar insígnias:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      imagem_url: '',
      pontos: 0,
      cor: '#3B82F6',
      ativo: true
    });
    setImagemPreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingId) {
        const response = await ApiService.atualizarInsignia(editingId, formData);
        if (response.success) {
          alert('Insígnia atualizada com sucesso!');
        } else {
          alert(response.message || 'Erro ao atualizar insígnia');
          return;
        }
      } else {
        const response = await ApiService.criarInsignia(formData);
        if (response.success) {
          alert('Insígnia criada com sucesso!');
        } else {
          alert(response.message || 'Erro ao criar insígnia');
          return;
        }
      }
      
      resetForm();
      carregarInsignias();
    } catch (error) {
      console.error('Erro ao salvar insígnia:', error);
      alert('Erro ao salvar insígnia');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (insignia: Insignia) => {
    setFormData({
      nome: insignia.nome,
      descricao: insignia.descricao || '',
      imagem_url: insignia.imagem_url || '',
      pontos: insignia.pontos,
      cor: insignia.cor,
      ativo: insignia.ativo
    });
    setImagemPreview(insignia.imagem_url || '');
    setEditingId(insignia.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta insígnia?')) return;
    
    try {
      setLoading(true);
      const response = await ApiService.deletarInsignia(id);
      if (response.success) {
        alert('Insígnia deletada com sucesso!');
        carregarInsignias();
      } else {
        alert(response.message || 'Erro ao deletar insígnia');
      }
    } catch (error) {
      console.error('Erro ao deletar insígnia:', error);
      alert('Erro ao deletar insígnia');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Apenas imagens são aceitas.');
      return;
    }

    // Validar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Tamanho máximo: 5MB');
      return;
    }

    try {
      setUploadingImagem(true);
      
      // Criar preview local
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagemPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Fazer upload
      const response = await ApiService.uploadImagemInsignia(file);
      
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          imagem_url: response.data!.imageUrl
        }));
        alert('Imagem enviada com sucesso!');
      } else {
        alert(response.message || 'Erro ao enviar imagem');
        setImagemPreview('');
      }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      alert('Erro ao enviar imagem');
      setImagemPreview('');
    } finally {
      setUploadingImagem(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imagem_url: ''
    }));
    setImagemPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div>
        <TituloSecao>Gerenciamento de Insígnias</TituloSecao>
        <div className="bg-gradient-to-r from-[#39FF14] to-green-400 p-6 rounded-lg text-black mt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Award size={28} />
                Crie e gerencie as conquistas dos usuários
              </h2>
              <p className="text-lg">
                Configure insígnias para incentivar e reconhecer atividades na plataforma
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <label className="flex items-center gap-3 bg-black/10 px-4 py-3 rounded-lg hover:bg-black/15 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirInativas}
                  onChange={(e) => setIncluirInativas(e.target.checked)}
                  className="w-4 h-4 rounded accent-black"
                />
                <span className="flex items-center gap-2 text-sm font-medium">
                  {incluirInativas ? <Eye size={16} /> : <EyeOff size={16} />}
                  Incluir inativas
                </span>
              </label>
              
              <Botao
                onClick={() => setShowForm(true)}
                className="bg-white text-black hover:bg-gray-100 px-6 py-3 font-semibold border-2 border-black transition-all duration-200"
              >
                <Plus size={20} className="mr-2" />
                Nova Insígnia
              </Botao>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">{insignias.length}</div>
          <div className="text-sm text-gray-600">Total de Insígnias</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-[#39FF14] mb-2">{insignias.filter(i => i.ativo).length}</div>
          <div className="text-sm text-gray-600">Insígnias Ativas</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {insignias.reduce((acc, curr) => acc + (curr.total_usuarios || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Usuários Premiados</div>
        </Card>
      </div>

      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingId ? 'Editar Insígnia' : 'Nova Insígnia'}
            </h3>
            <button
              onClick={resetForm}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Award size={16} />
                  Nome da Insígnia *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  maxLength={255}
                  placeholder="Ex: Primeiro Login"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Star size={16} />
                  Pontos *
                </label>
                <input
                  type="number"
                  name="pontos"
                  value={formData.pontos}
                  onChange={handleInputChange}
                  required
                  min={0}
                  max={10000}
                  placeholder="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Edit size={16} />
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows={4}
                maxLength={1000}
                placeholder="Descreva o que o usuário deve fazer para conquistar esta insígnia..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition-colors resize-none"
              />
              <div className="text-xs text-gray-500 text-right">
                {(formData.descricao || '').length}/1000 caracteres
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Image size={16} />
                  Imagem da Insígnia
                </label>
                
                {/* Input de upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Área de preview e upload */}
                <div className="space-y-3">
                  {(imagemPreview || formData.imagem_url) && (
                    <div className="relative">
                      <img
                        src={imagemPreview || formData.imagem_url}
                        alt="Preview da insígnia"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImagem}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#39FF14] hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <Upload size={24} />
                    <span className="text-sm font-medium">
                      {uploadingImagem ? 'Enviando...' : 
                       (imagemPreview || formData.imagem_url) ? 'Alterar Imagem' : 'Selecionar Imagem'}
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF até 5MB
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Palette size={16} />
                  Cor da Insígnia
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    name="cor"
                    value={formData.cor || '#3B82F6'}
                    onChange={handleInputChange}
                    className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="cor"
                    value={formData.cor || '#3B82F6'}
                    onChange={handleInputChange}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#3B82F6"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-[#39FF14] transition-colors"
                  />
                </div>
              </div>
            </div>

            {editingId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    {formData.ativo ? <Eye size={16} /> : <EyeOff size={16} />}
                    Insígnia {formData.ativo ? 'ativa' : 'inativa'}
                  </span>
                </label>
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Botao
                type="submit"
                disabled={loading}
                className="bg-[#39FF14] hover:bg-green-400 text-black px-8 py-3 font-medium"
              >
                <Save size={20} className="mr-2" />
                {loading ? 'Salvando...' : (editingId ? 'Atualizar Insígnia' : 'Criar Insígnia')}
              </Botao>
              <Botao
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 font-medium"
              >
                <X size={20} className="mr-2" />
                Cancelar
              </Botao>
            </div>
          </form>
        </Card>
      )}

      {loading && !showForm ? (
        <Card className="p-6 text-center">
          <div className="text-gray-400 text-4xl mb-4">⏳</div>
          <p className="text-lg font-medium text-gray-600">Carregando insígnias...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {insignias.map((insignia) => (
            <Card key={insignia.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Badge de status */}
              {!insignia.ativo && (
                <div className="flex justify-end mb-4">
                  <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    <EyeOff size={12} />
                    Inativa
                  </span>
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                {insignia.imagem_url ? (
                  <img
                    src={insignia.imagem_url}
                    alt={insignia.nome}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: insignia.cor }}
                  >
                    {insignia.nome.slice(0, 2).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">
                    {insignia.nome}
                  </h4>
                  {insignia.descricao && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {insignia.descricao}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#39FF14] text-black rounded text-xs font-medium">
                      <Star size={12} />
                      <span>{insignia.pontos} pts</span>
                    </div>
                    
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      <Users size={12} />
                      <span>{insignia.total_usuarios || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Botao
                  onClick={() => handleEdit(insignia)}
                  className="flex-1 bg-[#39FF14] hover:bg-green-400 text-black font-medium py-2"
                >
                  <Edit size={16} className="mr-2" />
                  Editar
                </Botao>
                <Botao
                  onClick={() => handleDelete(insignia.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2"
                >
                  <Trash2 size={16} className="mr-2" />
                  Deletar
                </Botao>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && insignias.length === 0 && (
        <Card className="p-6 text-center">
          <div className="text-gray-400 text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma insígnia encontrada</h3>
          <p className="text-gray-600 mb-6">
            {incluirInativas 
              ? "Não há insígnias cadastradas no sistema ainda."
              : "Não há insígnias ativas. Experimente incluir as inativas na busca."
            }
          </p>
          <Botao
            onClick={() => setShowForm(true)}
            className="bg-[#39FF14] hover:bg-green-400 text-black px-6 py-3 font-medium"
          >
            <Plus size={20} className="mr-2" />
            Criar Primeira Insígnia
          </Botao>
        </Card>
      )}
    </div>
  );
};

export default GerenciamentoInsignias;
