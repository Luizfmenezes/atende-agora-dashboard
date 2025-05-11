const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { sql, poolConnect } = require('../db');

// GET all users
router.get('/', async (req, res) => {
  try {
    await poolConnect;
    const result = await poolConnect.request().query(`
      SELECT id, matricula, nome, cargo, setor FROM usuarios
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    await poolConnect;
    const result = await poolConnect
      .request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT id, matricula, nome, cargo, setor FROM usuarios WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { matricula, nome, cargo, setor, senha } = req.body;

    if (!matricula || !nome || !cargo || !setor || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    await poolConnect;

    // Verifica matrícula duplicada
    const existing = await poolConnect
      .request()
      .input('matricula', sql.VarChar, matricula)
      .query('SELECT id FROM usuarios WHERE matricula = @matricula');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ error: 'Matrícula já cadastrada' });
    }

    const hashedSenha = await bcrypt.hash(senha, 10);

    // Inserção
    const result = await poolConnect
      .request()
      .input('matricula', sql.VarChar, matricula)
      .input('nome', sql.VarChar, nome)
      .input('cargo', sql.VarChar, cargo)
      .input('setor', sql.VarChar, setor)
      .input('senha', sql.VarChar, hashedSenha)
      .query(`
        INSERT INTO usuarios (matricula, nome, cargo, setor, senha)
        OUTPUT INSERTED.id
        VALUES (@matricula, @nome, @cargo, @setor, @senha)
      `);

    res.status(201).json({
      id: result.recordset[0].id,
      matricula,
      nome,
      cargo,
      setor
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { matricula, senha } = req.body;

    if (!matricula || !senha) {
      return res.status(400).json({ error: 'Matrícula e senha são obrigatórios' });
    }

    await poolConnect;
    const result = await poolConnect
      .request()
      .input('matricula', sql.VarChar, matricula)
      .query('SELECT * FROM usuarios WHERE matricula = @matricula');

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const isValid = await bcrypt.compare(senha, user.senha);
    if (!isValid) return res.status(401).json({ error: 'Credenciais inválidas' });

    delete user.senha;
    res.json(user);
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

module.exports = router;

