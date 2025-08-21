const { pool } = require('../config/database');

class EventoModel {
  static async findByTitleAndDate(title, startDate) {
    const result = await pool.query(
      'SELECT id FROM calendar_events WHERE title = $1 AND start_date = $2',
      [title, startDate]
    );
    
    return result.rows[0];
  }

  static async create(eventData) {
    const { title, description, start_date, end_date, event_type, created_by } = eventData;
    
    const result = await pool.query(
      `INSERT INTO calendar_events (title, description, start_date, end_date, event_type, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, title, description, start_date, end_date, event_type, created_by, created_at`,
      [title, description, start_date, end_date, event_type, created_by]
    );
    
    return result.rows[0];
  }
  
  static async findAll() {
    const result = await pool.query(
      `SELECT e.*, u.name as created_by_name 
       FROM calendar_events e 
       LEFT JOIN users u ON e.created_by = u.id 
       ORDER BY e.start_date ASC`
    );
    
    return result.rows;
  }
  
  static async findById(id) {
    const result = await pool.query(
      `SELECT e.*, u.name as created_by_name 
       FROM calendar_events e 
       LEFT JOIN users u ON e.created_by = u.id 
       WHERE e.id = $1`,
      [id]
    );
    
    return result.rows[0];
  }
  
  static async findByDateRange(startDate, endDate) {
    const result = await pool.query(
      `SELECT e.*, u.name as created_by_name 
       FROM calendar_events e 
       LEFT JOIN users u ON e.created_by = u.id 
       WHERE e.start_date >= $1 AND e.end_date <= $2 
       ORDER BY e.start_date ASC`,
      [startDate, endDate]
    );
    
    return result.rows;
  }
  
  static async update(id, eventData) {
    const { title, description, start_date, end_date, event_type } = eventData;
    
    const result = await pool.query(
      `UPDATE calendar_events 
       SET title = $1, description = $2, start_date = $3, end_date = $4, event_type = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING id, title, description, start_date, end_date, event_type, created_by, updated_at`,
      [title, description, start_date, end_date, event_type, id]
    );
    
    return result.rows[0];
  }

  // Método para apagar aulas anteriores a uma data específica
  static async deleteEventsBeforeDate(date) {
    const result = await pool.query(
      'DELETE FROM calendar_events WHERE start_date < $1 AND event_type = $2 RETURNING id',
      [date, 'aula']
    );
    
    return result.rows;
  }

  // Método para apagar todas as aulas de um ano específico
  static async deleteEventsByYear(year) {
    const startOfYear = new Date(year, 0, 1).toISOString(); // 1 de janeiro
    const endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString(); // 31 de dezembro
    
    const result = await pool.query(
      'DELETE FROM calendar_events WHERE start_date >= $1 AND start_date <= $2 AND event_type = $3 RETURNING id, title, start_date',
      [startOfYear, endOfYear, 'aula']
    );
    
    return result.rows;
  }

  // Método para encontrar todas as aulas com mesmo título e tipo
  static async findSimilarClasses(title, eventType = 'aula') {
    const result = await pool.query(
      'SELECT * FROM calendar_events WHERE title = $1 AND event_type = $2 ORDER BY start_date ASC',
      [title, eventType]
    );
    
    return result.rows;
  }

  // Método para atualizar todas as aulas similares
  static async updateSimilarClasses(originalTitle, eventType, newData) {
    const { title, description, start_time, end_time } = newData;
    
    // Se não forneceu novos horários, mantém os originais
    if (start_time && end_time) {
      const result = await pool.query(`
        UPDATE calendar_events 
        SET title = $1, 
            description = $2,
            start_date = DATE(start_date) + $3::time,
            end_date = DATE(end_date) + $4::time,
            updated_at = CURRENT_TIMESTAMP
        WHERE title = $5 AND event_type = $6
        RETURNING id, title, description, start_date, end_date, event_type, created_by, updated_at
      `, [title, description, start_time, end_time, originalTitle, eventType]);
      
      return result.rows;
    } else {
      // Apenas título e descrição
      const result = await pool.query(`
        UPDATE calendar_events 
        SET title = $1, 
            description = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE title = $3 AND event_type = $4
        RETURNING id, title, description, start_date, end_date, event_type, created_by, updated_at
      `, [title, description, originalTitle, eventType]);
      
      return result.rows;
    }
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM calendar_events WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows[0];
  }

  // Método para criar eventos recorrentes das aulas
  static async createRecurringClasses(userId) {
    const events = [];
    
    // Data de início: hoje (20/08/2025)
    const startDate = new Date('2025-08-20');
    
    // Data de fim: segunda semana de dezembro de 2025
    const endDate = new Date(2025, 11, 15); // 15 de dezembro de 2025
    
    // Encontrar a primeira segunda-feira a partir de hoje
    let currentMonday = new Date(startDate);
    while (currentMonday.getDay() !== 1) {
      currentMonday.setDate(currentMonday.getDate() + 1);
    }
    
    // Percorrer todas as semanas até a data limite
    for (let date = new Date(currentMonday); date <= endDate; date.setDate(date.getDate() + 7)) {
      // Segunda-feira
      const monday = new Date(date);
      const mondayStart = new Date(monday);
      mondayStart.setHours(13, 30, 0, 0);
      const mondayEnd = new Date(monday);
      mondayEnd.setHours(17, 30, 0, 0);
      
      events.push({
        title: 'Segunda',
        description: 'Aula da trilha IA e Dados',
        start_date: mondayStart.toISOString(),
        end_date: mondayEnd.toISOString(),
        event_type: 'aula',
        created_by: userId
      });

      // Quarta-feira
      const wednesday = new Date(date);
      wednesday.setDate(date.getDate() + 2);
      const wednesdayStart = new Date(wednesday);
      wednesdayStart.setHours(13, 30, 0, 0);
      const wednesdayEnd = new Date(wednesday);
      wednesdayEnd.setHours(17, 30, 0, 0);
      
      events.push({
        title: 'Aula da trilha IA e Dados',
        description: 'Aula da trilha IA e Dados',
        start_date: wednesdayStart.toISOString(),
        end_date: wednesdayEnd.toISOString(),
        event_type: 'aula',
        created_by: userId
      });

      // Sexta-feira
      const friday = new Date(date);
      friday.setDate(date.getDate() + 4);
      const fridayStart = new Date(friday);
      fridayStart.setHours(13, 30, 0, 0);
      const fridayEnd = new Date(friday);
      fridayEnd.setHours(17, 30, 0, 0);
      
      events.push({
        title: 'Aula da trilha IA e Dados',
        description: 'Aula da trilha IA e Dados',
        start_date: fridayStart.toISOString(),
        end_date: fridayEnd.toISOString(),
        event_type: 'aula',
        created_by: userId
      });
    }
    
    return events;
  }
}

module.exports = EventoModel;