
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all attendances (with optional filters)
router.get('/', (req, res) => {
  try {
    const { startDate, endDate, sector, status } = req.query;
    
    let query = `
      SELECT a.*, u.nome, u.matricula, u.cargo, u.setor as usuario_setor 
      FROM atendimentos a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Apply filters
    if (startDate) {
      query += ' AND DATE(a.horario) >= DATE(?)';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(a.horario) <= DATE(?)';
      params.push(endDate);
    }
    
    if (sector) {
      query += ' AND a.setor = ?';
      params.push(sector);
    }
    
    if (status === 'attended') {
      query += ' AND a.attended = 1';
    } else if (status === 'waiting') {
      query += ' AND a.attended = 0';
    }
    
    query += ' ORDER BY a.horario DESC';
    
    const stmt = db.prepare(query);
    const atendimentos = stmt.all(...params);
    
    res.json(atendimentos);
  } catch (error) {
    console.error('Error fetching attendances:', error);
    res.status(500).json({ error: 'Erro ao buscar atendimentos' });
  }
});

// Get attendance by ID
router.get('/:id', (req, res) => {
  try {
    const atendimento = db
      .prepare(`
        SELECT a.*, u.nome, u.matricula, u.cargo, u.setor as usuario_setor 
        FROM atendimentos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.id = ?
      `)
      .get(req.params.id);
    
    if (!atendimento) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }
    
    res.json(atendimento);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Erro ao buscar atendimento' });
  }
});

// Create new attendance
router.post('/', (req, res) => {
  try {
    const { usuario_id, setor, motivo } = req.body;
    
    if (!usuario_id || !setor || !motivo) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    // Insert new attendance
    const result = db
      .prepare('INSERT INTO atendimentos (usuario_id, setor, motivo) VALUES (?, ?, ?)')
      .run(usuario_id, setor, motivo);
    
    // Get the created attendance
    const atendimento = db
      .prepare(`
        SELECT a.*, u.nome, u.matricula, u.cargo, u.setor as usuario_setor 
        FROM atendimentos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.id = ?
      `)
      .get(result.lastInsertRowid);
    
    res.status(201).json(atendimento);
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Erro ao criar atendimento' });
  }
});

// Mark attendance as attended
router.patch('/:id/attend', (req, res) => {
  try {
    const { id } = req.params;
    
    // Update attendance
    db.prepare('UPDATE atendimentos SET attended = 1, attendedAt = DATETIME() WHERE id = ?')
      .run(id);
    
    // Get the updated attendance
    const atendimento = db
      .prepare(`
        SELECT a.*, u.nome, u.matricula, u.cargo, u.setor as usuario_setor 
        FROM atendimentos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.id = ?
      `)
      .get(id);
    
    if (!atendimento) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }
    
    res.json(atendimento);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Erro ao atualizar atendimento' });
  }
});

module.exports = router;
