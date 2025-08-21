import React, { useState } from 'react';
import { X, Calendar, Clock, Type, FileText } from 'lucide-react';
import { Evento } from '../../../services/api';

interface FormularioEventoProps {
  evento?: Evento;
  onSave: (evento: Omit<Evento, 'id' | 'created_by' | 'created_by_name' | 'created_at' | 'updated_at'>, updateSimilar?: boolean) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const FormularioEvento: React.FC<FormularioEventoProps> = ({
  evento,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: evento?.title || '',
    description: evento?.description || '',
    start_date: evento?.start_date ? new Date(evento.start_date).toISOString().slice(0, 16) : '',
    end_date: evento?.end_date ? new Date(evento.end_date).toISOString().slice(0, 16) : '',
    event_type: evento?.event_type || 'evento' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updateSimilar, setUpdateSimilar] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Data de início é obrigatória';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Data de fim é obrigatória';
    }

    if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'Data de fim deve ser posterior à data de início';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        event_type: formData.event_type
      }, updateSimilar);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">
            {evento ? 'Editar Evento' : 'Novo Evento'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Type size={16} className="mr-2" />
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39FF14] ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Digite o título do evento"
              disabled={loading}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="mr-2" />
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39FF14] resize-none"
              rows={3}
              placeholder="Descrição opcional do evento"
              disabled={loading}
            />
          </div>

          {/* Tipo de Evento */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="mr-2" />
              Tipo de Evento
            </label>
            <select
              value={formData.event_type}
              onChange={(e) => handleChange('event_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
              disabled={loading}
            >
              <option value="evento">Evento</option>
              <option value="aula">Aula</option>
              <option value="prova">Prova</option>
              <option value="feriado">Feriado</option>
            </select>
          </div>

          {/* Data e Hora de Início */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="mr-2" />
              Data e Hora de Início *
            </label>
            <input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39FF14] ${
                errors.start_date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
          </div>

          {/* Data e Hora de Fim */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="mr-2" />
              Data e Hora de Fim *
            </label>
            <input
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39FF14] ${
                errors.end_date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
          </div>

          {/* Opção para atualizar aulas similares (apenas para edição de aulas) */}
          {evento && evento.event_type === 'aula' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="updateSimilar"
                checked={updateSimilar}
                onChange={(e) => setUpdateSimilar(e.target.checked)}
                className="rounded border-gray-300 text-[#39FF14] focus:ring-[#39FF14]"
                disabled={loading}
              />
              <label htmlFor="updateSimilar" className="text-sm text-gray-700">
                Aplicar alterações a todas as aulas similares (mesmo título e tipo)
              </label>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#39FF14] text-black font-medium rounded-lg hover:bg-[#32E612] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioEvento;