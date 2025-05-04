
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// Get all users
router.get('/', (req, res) => {
  try {
    const usuarios = db.prepare('SELECT id, matricula, nome, cargo, setor FROM usuarios').all();
    res.json(usuarios);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const usuario = db
      .prepare('SELECT id, matricula, nome, cargo, setor FROM usuarios WHERE id = ?')
      .get(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { matricula, nome, cargo, setor, senha } = req.body;
    
    if (!matricula || !nome || !cargo || !setor || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM usuarios WHERE matricula = ?').get(matricula);
    
    if (existingUser) {
      return res.status(400).json({ error: 'Matrícula já cadastrada' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedSenha = await bcrypt.hash(senha, saltRounds);
    
    // Insert new user
    const result = db
      .prepare('INSERT INTO usuarios (matricula, nome, cargo, setor, senha) VALUES (?, ?, ?, ?, ?)')
      .run(matricula, nome, cargo, setor, hashedSenha);
    
    res.status(201).json({
      id: result.lastInsertRowid,
      matricula,
      nome,
      cargo,
      setor
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// User authentication
router.post('/login', async (req, res) => {
  try {
    const { matricula, senha } = req.body;
    
    if (!matricula || !senha) {
      return res.status(400).json({ error: 'Matrícula e senha são obrigatórios' });
    }
    
    // Find user
    const user = db.prepare('SELECT * FROM usuarios WHERE matricula = ?').get(matricula);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(senha, user.senha);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Return user data (without password)
    const { senha: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

module.exports = router;
