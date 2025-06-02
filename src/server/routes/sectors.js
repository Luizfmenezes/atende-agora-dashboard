
const express = require('express');
const { getPool, sql } = require('../config/sqlserver');

const router = express.Router();

// Buscar todos os setores
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const request = pool.request();
    
    const result = await request.query('SELECT * FROM setores ORDER BY nome');
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    res.status(500).json({ error: 'Erro ao buscar setores' });
  }
});

module.exports = router;
