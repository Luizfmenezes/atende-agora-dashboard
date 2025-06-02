
const express = require('express');
const { getPool, sql } = require('../config/sqlserver');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Buscar todos os atendimentos
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, sector, status } = req.query;
    const pool = getPool();
    const request = pool.request();
    
    let query = `
      SELECT a.*, s.nome as setor_nome
      FROM atendimentos a
      LEFT JOIN setores s ON a.setor_id = s.id
      WHERE 1=1
    `;
    
    // Aplicar filtros
    if (startDate) {
      query += ' AND CAST(a.horario AS DATE) >= @startDate';
      request.input('startDate', sql.Date, new Date(startDate));
    }
    
    if (endDate) {
      query += ' AND CAST(a.horario AS DATE) <= @endDate';
      request.input('endDate', sql.Date, new Date(endDate));
    }
    
    if (sector) {
      query += ' AND s.nome = @sector';
      request.input('sector', sql.VarChar, sector);
    }
    
    if (status === 'attended') {
      query += ' AND a.atendido = 1';
    } else if (status === 'waiting') {
      query += ' AND a.atendido = 0';
    }
    
    query += ' ORDER BY a.horario DESC';
    
    const result = await request.query(query);
    
    const atendimentos = result.recordset.map(row => ({
      id: row.id,
      matricula: row.matricula,
      nome: row.nome,
      cargo: row.cargo,
      setor: row.setor_nome,
      motivo: row.motivo,
      horario: row.horario,
      atendido: row.atendido,
      atendido_em: row.atendido_em
    }));
    
    res.json(atendimentos);
  } catch (error) {
    console.error('Erro ao buscar atendimentos:', error);
    res.status(500).json({ error: 'Erro ao buscar atendimentos' });
  }
});

// Buscar atendimento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const request = pool.request();
    
    const result = await request
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT a.*, s.nome as setor_nome
        FROM atendimentos a
        LEFT JOIN setores s ON a.setor_id = s.id
        WHERE a.id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }
    
    const atendimento = result.recordset[0];
    res.json({
      id: atendimento.id,
      matricula: atendimento.matricula,
      nome: atendimento.nome,
      cargo: atendimento.cargo,
      setor: atendimento.setor_nome,
      motivo: atendimento.motivo,
      horario: atendimento.horario,
      atendido: atendimento.atendido,
      atendido_em: atendimento.atendido_em
    });
  } catch (error) {
    console.error('Erro ao buscar atendimento:', error);
    res.status(500).json({ error: 'Erro ao buscar atendimento' });
  }
});

// Criar novo atendimento
router.post('/', async (req, res) => {
  try {
    const { registration, name, position, sector, reason } = req.body;
    
    if (!registration || !name || !position || !sector || !reason) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    const pool = getPool();
    const transaction = pool.transaction();
    
    try {
      await transaction.begin();
      
      // Buscar ID do setor
      const sectorRequest = transaction.request();
      const sectorResult = await sectorRequest
        .input('sector', sql.VarChar, sector)
        .query('SELECT id FROM setores WHERE nome = @sector');
      
      if (sectorResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Setor não encontrado' });
      }
      
      const setorId = sectorResult.recordset[0].id;
      
      // Inserir atendimento
      const attendanceRequest = transaction.request();
      const result = await attendanceRequest
        .input('matricula', sql.VarChar, registration)
        .input('nome', sql.VarChar, name)
        .input('cargo', sql.VarChar, position)
        .input('setor_id', sql.Int, setorId)
        .input('motivo', sql.VarChar, reason)
        .query(`
          INSERT INTO atendimentos (matricula, nome, cargo, setor_id, motivo)
          OUTPUT INSERTED.*
          VALUES (@matricula, @nome, @cargo, @setor_id, @motivo)
        `);
      
      await transaction.commit();
      
      const atendimento = result.recordset[0];
      res.status(201).json({
        id: atendimento.id,
        matricula: atendimento.matricula,
        nome: atendimento.nome,
        cargo: atendimento.cargo,
        setor: sector,
        motivo: atendimento.motivo,
        horario: atendimento.horario,
        atendido: atendimento.atendido,
        atendido_em: atendimento.atendido_em
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao criar atendimento:', error);
    res.status(500).json({ error: 'Erro ao criar atendimento' });
  }
});

// Marcar como atendido
router.patch('/:id/attend', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const request = pool.request();
    
    const result = await request
      .input('id', sql.Int, parseInt(id))
      .query(`
        UPDATE atendimentos 
        SET atendido = 1, atendido_em = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }
    
    const atendimento = result.recordset[0];
    res.json({
      id: atendimento.id,
      matricula: atendimento.matricula,
      nome: atendimento.nome,
      cargo: atendimento.cargo,
      motivo: atendimento.motivo,
      horario: atendimento.horario,
      atendido: atendimento.atendido,
      atendido_em: atendimento.atendido_em
    });
  } catch (error) {
    console.error('Erro ao atualizar atendimento:', error);
    res.status(500).json({ error: 'Erro ao atualizar atendimento' });
  }
});

// Excluir atendimento
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const request = pool.request();
    
    const result = await request
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM atendimentos WHERE id = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }
    
    res.json({ message: 'Atendimento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir atendimento:', error);
    res.status(500).json({ error: 'Erro ao excluir atendimento' });
  }
});

module.exports = router;
