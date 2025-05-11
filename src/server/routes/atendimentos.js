import express from 'express';
import { poolPromise } from '../db'; // conexão SQL Server
const router = express.Router();

// GET all attendances (with filters)
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const { startDate, endDate, sector, status } = req.query;

    let query = `
      SELECT a.*, u.nome, u.matricula, u.cargo, u.setor AS usuario_setor 
      FROM atendimentos a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];


    if (startDate) {
      query += ' AND a.horario >= @startDate';
    }

    if (endDate) {
      query += ' AND a.horario <= @endDate';
    }

    if (sector) {
      query += ' AND a.setor = @sector';
    }

    if (status === 'attended') {
      query += ' AND a.attended = 1';
    } else if (status === 'waiting') {
      query += ' AND a.attended = 0';
    }

    query += ' ORDER BY a.horario DESC';

    const request = pool.request();

    if (startDate) request.input('startDate', startDate);
    if (endDate) request.input('endDate', endDate);
    if (sector) request.input('sector', sector);

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao buscar atendimentos:', error);
    res.status(500).json({ error: 'Erro ao buscar atendimentos' });
  }
});

// GET atendimento por ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;

    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT a.*, u.nome, u.matricula, u.cargo, u.setor AS usuario_setor 
        FROM atendimentos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.id = @id
      `);

    const atendimento = result.recordset[0];

    if (!atendimento) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    res.json(atendimento);
  } catch (error) {
    console.error('Erro ao buscar atendimento:', error);
    res.status(500).json({ error: 'Erro ao buscar atendimento' });
  }
});

// POST - Criar novo atendimento
router.post('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const { usuario_id, setor, motivo } = req.body;

    if (!usuario_id || !setor || !motivo) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const insertResult = await pool.request()
      .input('usuario_id', usuario_id)
      .input('setor', setor)
      .input('motivo', motivo)
      .query(`
        INSERT INTO atendimentos (usuario_id, setor, motivo)
        OUTPUT INSERTED.id
        VALUES (@usuario_id, @setor, @motivo)
      `);

    const atendimentoId = insertResult.recordset[0].id;

    const result = await pool.request()
      .input('id', atendimentoId)
      .query(`
        SELECT a.*, u.nome, u.matricula, u.cargo, u.setor AS usuario_setor 
        FROM atendimentos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.id = @id
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Erro ao criar atendimento:', error);
    res.status(500).json({ error: 'Erro ao criar atendimento' });
  }
});

// PATCH - Marcar como atendido
router.patch('/:id/attend', async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;

    await pool.request()
      .input('id', id)
      .query(`
        UPDATE atendimentos 
        SET attended = 1, attendedAt = GETDATE() 
        WHERE id = @id
      `);

    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT a.*, u.nome, u.matricula, u.cargo, u.setor AS usuario_setor 
        FROM atendimentos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.id = @id
      `);

    const atendimento = result.recordset[0];

    if (!atendimento) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    res.json(atendimento);
  } catch (error) {
    console.error('Erro ao atualizar atendimento:', error);
    res.status(500).json({ error: 'Erro ao atualizar atendimento' });
  }
});

export default router;
