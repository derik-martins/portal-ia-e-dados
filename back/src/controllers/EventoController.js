const EventoModel = require('../models/EventoModel');
const { validationResult } = require('express-validator');

class EventoController {
  static async getAll(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      let eventos;
      if (start_date && end_date) {
        eventos = await EventoModel.findByDateRange(start_date, end_date);
      } else {
        eventos = await EventoModel.findAll();
      }

      res.status(200).json({
        success: true,
        data: { eventos }
      });
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const evento = await EventoModel.findById(id);

      if (!evento) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: { evento }
      });
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { title, description, start_date, end_date, event_type } = req.body;
      
      const eventData = {
        title,
        description,
        start_date,
        end_date,
        event_type: event_type || 'evento',
        created_by: req.userId
      };

      const evento = await EventoModel.create(eventData);

      res.status(201).json({
        success: true,
        message: 'Evento criado com sucesso',
        data: { evento }
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const { title, description, start_date, end_date, event_type } = req.body;

      const existingEvent = await EventoModel.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
      }

      const eventData = {
        title,
        description,
        start_date,
        end_date,
        event_type
      };

      const evento = await EventoModel.update(id, eventData);

      res.status(200).json({
        success: true,
        message: 'Evento atualizado com sucesso',
        data: { evento }
      });
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existingEvent = await EventoModel.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
      }

      await EventoModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Evento deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async createRecurringClasses(req, res) {
    try {
      // Primeiro, apagar todas as aulas de 2024
      const deleted2024Events = await EventoModel.deleteEventsByYear(2024);
      
      // Depois, apagar todas as aulas anteriores a 19/08/2025
      const cutoffDate = '2025-08-19';
      const deletedOldEvents = await EventoModel.deleteEventsBeforeDate(cutoffDate);
      
      const events = await EventoModel.createRecurringClasses(req.userId);
      
      // Criar todos os eventos
      const createdEvents = [];
      const skippedEvents = [];
      
      for (const eventData of events) {
        try {
          // Verificar se já existe um evento com o mesmo título e data
          const existingEvent = await EventoModel.findByTitleAndDate(eventData.title, eventData.start_date);
          
          if (existingEvent) {
            skippedEvents.push(eventData);
            continue;
          }
          
          const evento = await EventoModel.create(eventData);
          createdEvents.push(evento);
        } catch (error) {
          console.error('Erro ao criar evento:', error.message);
          skippedEvents.push(eventData);
        }
      }

      const totalDeleted = deleted2024Events.length + deletedOldEvents.length;

      res.status(201).json({
        success: true,
        message: `${createdEvents.length} aulas criadas com sucesso${skippedEvents.length > 0 ? `. ${skippedEvents.length} aulas já existiam ou falharam.` : ''}${totalDeleted > 0 ? ` ${totalDeleted} aulas antigas foram removidas (${deleted2024Events.length} de 2024 e ${deletedOldEvents.length} anteriores a 19/08/2025).` : ''}`,
        data: { 
          eventos: createdEvents,
          skipped: skippedEvents.length,
          deleted2024: deleted2024Events.length,
          deletedOld: deletedOldEvents.length,
          total: events.length
        }
      });
    } catch (error) {
      console.error('Erro ao criar aulas recorrentes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async delete2024Classes(req, res) {
    try {
      const deleted2024Events = await EventoModel.deleteEventsByYear(2024);

      res.status(200).json({
        success: true,
        message: `${deleted2024Events.length} aulas de 2024 foram removidas com sucesso`,
        data: { 
          deletedEvents: deleted2024Events,
          count: deleted2024Events.length
        }
      });
    } catch (error) {
      console.error('Erro ao deletar aulas de 2024:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async updateSimilarEvents(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const { title, description, start_date, end_date, event_type, updateSimilar } = req.body;

      const existingEvent = await EventoModel.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
      }

      let updatedEvents = [];

      if (updateSimilar && existingEvent.event_type === 'aula') {
        // Extrair horários se fornecidos
        let startTime, endTime;
        if (start_date && end_date) {
          const startDateTime = new Date(start_date);
          const endDateTime = new Date(end_date);
          startTime = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}:00`;
          endTime = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}:00`;
        }

        // Atualizar todas as aulas similares
        updatedEvents = await EventoModel.updateSimilarClasses(
          existingEvent.title,
          existingEvent.event_type,
          {
            title,
            description,
            start_time: startTime,
            end_time: endTime
          }
        );

        res.status(200).json({
          success: true,
          message: `${updatedEvents.length} aulas similares atualizadas com sucesso`,
          data: { eventos: updatedEvents }
        });
      } else {
        // Atualizar apenas o evento específico
        const eventData = {
          title,
          description,
          start_date,
          end_date,
          event_type
        };

        const evento = await EventoModel.update(id, eventData);
        updatedEvents = [evento];

        res.status(200).json({
          success: true,
          message: 'Evento atualizado com sucesso',
          data: { evento }
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar evento(s):', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = EventoController;