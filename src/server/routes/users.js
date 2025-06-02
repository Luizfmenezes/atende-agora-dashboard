
const express = require('express');
const bcrypt = require('bcrypt');
const { getPool, sql } = require('../config/sqlserver');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Buscar todos os usuários
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const request = pool.request();
    
    const result = await request.query(`
      SELECT u.*, p.view_permission, p.edit_permission, p.delete_permission, p.create_permission
      FROM usuarios u
      LEFT JOIN permissoes p ON u.id = p.usuario_id
      ORDER BY u.username
    `);
    
    const users = result.recordset.map(user => ({
      id: user.id.toString(),
      username: user.username,
      role: user.role,
      permissions: {
        view: user.view_permission || true,
        edit: user.edit_permission || false,
        delete: user.delete_permission || false,
        create: user.create_permission || false
      }
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Buscar usuário por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const request = pool.request();
    
    const result = await request
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT u.*, p.view_permission, p.edit_permission, p.delete_permission, p.create_permission
        FROM usuarios u
        LEFT JOIN permissoes p ON u.id = p.usuario_id
        WHERE u.id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const user = result.recordset[0];
    const userData = {
      id: user.id.toString(),
      username: user.username,
      role: user.role,
      permissions: {
        view: user.view_permission || true,
        edit: user.edit_permission || false,
        delete: user.delete_permission || false,
        create: user.create_permission || false
      }
    };
    
    res.json(userData);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Criar novo usuário
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { username, password, role, permissions } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password e role são obrigatórios' });
    }
    
    const pool = getPool();
    const transaction = pool.transaction();
    
    try {
      await transaction.begin();
      
      // Verificar se usuário já existe
      const checkRequest = transaction.request();
      const existingUser = await checkRequest
        .input('username', sql.VarChar, username)
        .query('SELECT id FROM usuarios WHERE username = @username');
      
      if (existingUser.recordset.length > 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Usuário já existe' });
      }
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Inserir usuário
      const userRequest = transaction.request();
      const userResult = await userRequest
        .input('username', sql.VarChar, username)
        .input('password', sql.VarChar, hashedPassword)
        .input('role', sql.VarChar, role)
        .query(`
          INSERT INTO usuarios (username, password, role)
          OUTPUT INSERTED.id, INSERTED.username, INSERTED.role
          VALUES (@username, @password, @role)
        `);
      
      const newUser = userResult.recordset[0];
      
      // Inserir permissões
      const permRequest = transaction.request();
      await permRequest
        .input('usuario_id', sql.Int, newUser.id)
        .input('view_permission', sql.Bit, permissions?.view || true)
        .input('edit_permission', sql.Bit, permissions?.edit || false)
        .input('delete_permission', sql.Bit, permissions?.delete || false)
        .input('create_permission', sql.Bit, permissions?.create || false)
        .query(`
          INSERT INTO permissoes (usuario_id, view_permission, edit_permission, delete_permission, create_permission)
          VALUES (@usuario_id, @view_permission, @edit_permission, @delete_permission, @create_permission)
        `);
      
      await transaction.commit();
      
      const userData = {
        id: newUser.id.toString(),
        username: newUser.username,
        role: newUser.role,
        permissions: permissions || {
          view: true,
          edit: false,
          delete: false,
          create: false
        }
      };
      
      res.status(201).json(userData);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

module.exports = router;
