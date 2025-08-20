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
      const events = await EventoModel.createRecurringClasses();
      
      // Criar todos os eventos
      const createdEvents = [];
      for (const eventData of events) {
        try {
          const evento = await EventoModel.create(eventData);
          createdEvents.push(evento);
        } catch (error) {
          // Ignorar erros de duplicação
          console.log('Evento já existe ou erro:', error.message);
        }
      }

      res.status(201).json({
        success: true,
        message: `${createdEvents.length} aulas criadas com sucesso`,
        data: { eventos: createdEvents }
      });
    } catch (error) {
      console.error('Erro ao criar aulas recorrentes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = EventoController;