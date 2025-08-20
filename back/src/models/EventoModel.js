const { pool } = require('../config/database');

class EventoModel {
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
  
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM calendar_events WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows[0];
  }

  // Método para criar eventos recorrentes das aulas
  static async createRecurringClasses() {
    const startDate = new Date('2024-01-01'); // Ajustar conforme necessário
    const endDate = new Date('2024-12-09'); // Segunda semana de dezembro
    const events = [];

    // Dias da semana: 1 = Segunda, 3 = Quarta, 5 = Sexta
    const classDays = [1, 3, 5];
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      if (classDays.includes(date.getDay())) {
        const startTime = new Date(date);
        startTime.setHours(13, 30, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(17, 30, 0, 0);
        
        events.push({
          title: 'Aula',
          description: 'Aula regular do curso',
          start_date: startTime.toISOString(),
          end_date: endTime.toISOString(),
          event_type: 'aula',
          created_by: 1 // Admin user
        });
      }
    }
    
    return events;
  }
}

module.exports = EventoModel;