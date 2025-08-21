import React, { useState, useEffect } from 'react';
import TituloSecao from '../../ui/TituloSecao';
import Card from '../../ui/Card';
import FormularioEvento from './FormularioEvento';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import ApiService, { Evento } from '../../../services/api';

const VisualizacaoCalendario: React.FC = () => {
  const { isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evento | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  // Carregar eventos
  const loadEventos = async () => {
    setLoading(true);
    try {
      const response = await ApiService.buscarEventos();
      if (response.success && response.data) {
        setEventos(response.data.eventos);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventos();
  }, []);

  // Funções auxiliares
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Agrupar eventos por data
  const getEventosPorData = () => {
    const eventosPorData: Record<string, Evento[]> = {};
    
    eventos.forEach(evento => {
      const date = new Date(evento.start_date);
      const dateKey = formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (!eventosPorData[dateKey]) {
        eventosPorData[dateKey] = [];
      }
      eventosPorData[dateKey].push(evento);
    });
    
    return eventosPorData;
  };

  // Gerenciar eventos (admin)
  const handleSaveEvent = async (eventData: Omit<Evento, 'id' | 'created_by' | 'created_by_name' | 'created_at' | 'updated_at'>, updateSimilar?: boolean) => {
    setFormLoading(true);
    try {
      if (editingEvent) {
        if (updateSimilar) {
          await ApiService.atualizarEventosSimilares(editingEvent.id, { ...eventData, updateSimilar: true });
        } else {
          await ApiService.atualizarEvento(editingEvent.id, eventData);
        }
      } else {
        await ApiService.criarEvento(eventData);
      }
      
      await loadEventos();
      setShowForm(false);
      setEditingEvent(undefined);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEvent = async (evento: Evento) => {
    if (!confirm(`Tem certeza que deseja deletar o evento "${evento.title}"?`)) {
      return;
    }

    try {
      await ApiService.deletarEvento(evento.id);
      await loadEventos();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
    }
  };

  const handleCreateRecurringClasses = async () => {
    if (!confirm('Isso criará todas as aulas recorrentes até dezembro. Continuar?')) {
      return;
    }

    try {
      setLoading(true);
      await ApiService.criarAulasRecorrentes();
      await loadEventos();
    } catch (error) {
      console.error('Erro ao criar aulas recorrentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const eventosPorData = getEventosPorData();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <TituloSecao>Calendário de Aulas e Eventos</TituloSecao>
        
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#39FF14] text-black font-medium rounded-lg hover:bg-[#32E612] transition-colors"
            >
              <Plus size={16} />
              Novo Evento
            </button>
            <button
              onClick={handleCreateRecurringClasses}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <Calendar size={16} />
              Criar Aulas
            </button>
            <button
              onClick={loadEventos}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        )}
      </div>
      
      <Card className="p-6">
        {/* Cabeçalho do Calendário */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-2xl font-bold text-black">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button 
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do Mês */}
        <div className="grid grid-cols-7 gap-1">
          {/* Dias vazios do início do mês */}
          {Array.from({ length: firstDay }, (_, index) => (
            <div key={`empty-${index}`} className="p-3"></div>
          ))}
          
          {/* Dias do mês */}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = eventosPorData[dateKey] || [];
            const isToday = 
              today.getDate() === day &&
              today.getMonth() === currentDate.getMonth() &&
              today.getFullYear() === currentDate.getFullYear();

            return (
              <div
                key={day}
                className={`p-3 text-center relative cursor-pointer transition-colors rounded-lg ${
                  isToday ? 'bg-[#39FF14] text-black font-bold' : 'hover:bg-[#F5F5F5]'
                }`}
              >
                <span className="text-sm">{day}</span>
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {dayEvents.slice(0, 3).map((evento, idx) => (
                      <div 
                        key={idx}
                        className={`w-1 h-1 rounded-full ${
                          evento.event_type === 'aula' ? 'bg-blue-500' :
                          evento.event_type === 'prova' ? 'bg-red-500' :
                          evento.event_type === 'feriado' ? 'bg-orange-500' :
                          'bg-[#39FF14]'
                        }`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Eventos do Mês */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-black mb-4">Eventos do Mês</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39FF14] mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando eventos...</p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum evento encontrado</p>
              {isAdmin && (
                <p className="text-sm mt-2">Clique em "Novo Evento" para adicionar eventos</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(eventosPorData)
                .filter(([date]) => {
                  const eventDate = new Date(date + 'T00:00:00');
                  return eventDate.getMonth() === currentDate.getMonth() && 
                         eventDate.getFullYear() === currentDate.getFullYear();
                })
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, eventList]) => (
                  <div key={date} className="bg-[#F5F5F5] p-4 rounded-lg">
                    <h4 className="font-medium text-black mb-3">
                      {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </h4>
                    {eventList.map((evento) => (
                      <div key={evento.id} className="flex items-center justify-between text-sm mb-2 last:mb-0">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${
                            evento.event_type === 'aula' ? 'bg-blue-500' :
                            evento.event_type === 'prova' ? 'bg-red-500' :
                            evento.event_type === 'feriado' ? 'bg-orange-500' :
                            'bg-[#39FF14]'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {new Date(evento.start_date).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              <span className="text-gray-700">{evento.title}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                evento.event_type === 'aula' ? 'bg-blue-100 text-blue-800' :
                                evento.event_type === 'prova' ? 'bg-red-100 text-red-800' :
                                evento.event_type === 'feriado' ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {evento.event_type}
                              </span>
                            </div>
                            {evento.description && (
                              <p className="text-xs text-gray-600 mt-1 ml-12">{evento.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {isAdmin && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingEvent(evento);
                                setShowForm(true);
                              }}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Editar evento"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(evento)}
                              className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                              title="Deletar evento"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal do Formulário */}
      {showForm && (
        <FormularioEvento
          evento={editingEvent}
          onSave={handleSaveEvent}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(undefined);
          }}
          loading={formLoading}
        />
      )}
    </div>
  );
};

export default VisualizacaoCalendario;