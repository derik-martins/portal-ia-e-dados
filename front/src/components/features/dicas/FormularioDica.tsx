import React, { useState, useEffect } from 'react';
import { X, Plus, Clock, Tag, Image as ImageIcon } from 'lucide-react';
import Botao from '../../ui/Botao';
import Input from '../../ui/Input';
import Card from '../../ui/Card';
import type { DicaFormData, Categoria } from '../../../services/api';
import ApiService from '../../../services/api';

interface FormularioDicaProps {
  dicaId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const FormularioDica: React.FC<FormularioDicaProps> = ({
  dicaId,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState<DicaFormData>({
    titulo: '',
    categoria: '',
    descricao_breve: '',
    conteudo: {
      blocks: [{
        type: 'paragraph',
        data: {
          text: ''
        }
      }]
    },
    tempo_leitura: 1,
    imagem_header: '',
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados da dica se estiver editando
  useEffect(() => {
    if (dicaId) {
      carregarDica(dicaId);
    }
  }, [dicaId]);

  // Carregar categorias existentes
  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarDica = async (id: number) => {
    setLoading(true);
    try {
      const response = await ApiService.buscarDicaPorId(id);
      if (response.success && response.data) {
        const dica = response.data;
        setFormData({
          titulo: dica.titulo,
          categoria: dica.categoria,
          descricao_breve: dica.descricao_breve,
          conteudo: dica.conteudo,
          tempo_leitura: dica.tempo_leitura,
          imagem_header: dica.imagem_header || '',
          tags: dica.tags || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dica:', error);
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    } else if (formData.titulo.length < 5) {
      newErrors.titulo = 'Título deve ter pelo menos 5 caracteres';
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (!formData.descricao_breve.trim()) {
      newErrors.descricao_breve = 'Descrição breve é obrigatória';
    } else if (formData.descricao_breve.length < 10) {
      newErrors.descricao_breve = 'Descrição breve deve ter pelo menos 10 caracteres';
    }

    if (formData.tempo_leitura < 1) {
      newErrors.tempo_leitura = 'Tempo de leitura deve ser pelo menos 1 minuto';
    }

    // Validar conteúdo
    const hasContent = formData.conteudo.blocks.some(block => 
      block.data.text && block.data.text.trim()
    );
    
    if (!hasContent) {
      newErrors.conteudo = 'Conteúdo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let response;
      if (dicaId) {
        response = await ApiService.atualizarDica(dicaId, formData);
      } else {
        response = await ApiService.criarDica(formData);
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        if (response.errors) {
          const newErrors: Record<string, string> = {};
          response.errors.forEach(error => {
            newErrors[error.field] = error.message;
          });
          setErrors(newErrors);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar dica:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DicaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const blocks = text ? [{
      type: 'paragraph',
      data: { text }
    }] : [];

    handleInputChange('conteudo', { blocks });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const getConteudoTexto = (): string => {
    return formData.conteudo.blocks
      .filter(block => block.data.text)
      .map(block => block.data.text)
      .join('\n\n');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">
              {dicaId ? 'Editar Dica' : 'Nova Dica'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <Input
                type="text"
                value={formData.titulo}
                onChange={(value) => handleInputChange('titulo', value)}
                placeholder="Digite o título da dica"
                error={errors.titulo}
                maxLength={255}
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <div className="space-y-2">
                <select
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.categoria} value={cat.categoria}>
                      {cat.categoria} ({cat.total})
                    </option>
                  ))}
                </select>
                
                <div className="text-sm text-gray-600">
                  Ou digite uma nova categoria:
                </div>
                
                <Input
                  type="text"
                  value={formData.categoria}
                  onChange={(value) => handleInputChange('categoria', value)}
                  placeholder="Digite uma nova categoria"
                  maxLength={100}
                />
              </div>
              {errors.categoria && (
                <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>
              )}
            </div>

            {/* Descrição Breve */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Breve *
              </label>
              <textarea
                value={formData.descricao_breve}
                onChange={(e) => handleInputChange('descricao_breve', e.target.value)}
                placeholder="Escreva uma descrição breve e atrativa da sua dica"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-transparent resize-vertical"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.descricao_breve && (
                  <p className="text-red-500 text-sm">{errors.descricao_breve}</p>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  {formData.descricao_breve.length}/500
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo *
              </label>
              <textarea
                value={getConteudoTexto()}
                onChange={handleContentChange}
                placeholder="Escreva o conteúdo completo da sua dica aqui. Use quebras de linha para separar parágrafos."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39FF14] focus:border-transparent resize-vertical"
                rows={10}
              />
              {errors.conteudo && (
                <p className="text-red-500 text-sm mt-1">{errors.conteudo}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Nota: Em breve teremos um editor mais avançado com formatação rica!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tempo de Leitura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Tempo de Leitura (minutos) *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={formData.tempo_leitura.toString()}
                  onChange={(e) => handleInputChange('tempo_leitura', parseInt(e) || 1)}
                  error={errors.tempo_leitura}
                />
              </div>

              {/* Imagem do Header */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon size={16} className="inline mr-1" />
                  URL da Imagem do Header
                </label>
                <Input
                  type="url"
                  value={formData.imagem_header}
                  onChange={(value) => handleInputChange('imagem_header', value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  error={errors.imagem_header}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag size={16} className="inline mr-1" />
                Tags
              </label>
              
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(value) => setNewTag(value)}
                  placeholder="Digite uma tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  maxLength={50}
                />
                <Botao
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="sm"
                >
                  <Plus size={16} />
                </Botao>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Máximo de 10 tags. Pressione Enter para adicionar.
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Botao
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Botao>
              <Botao
                type="submit"
                loading={loading}
              >
                {dicaId ? 'Salvar Alterações' : 'Criar Dica'}
              </Botao>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default FormularioDica;
