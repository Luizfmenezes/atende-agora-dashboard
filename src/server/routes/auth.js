
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/sqlserver');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }
    
    const pool = getPool();
    const request = pool.request();
    
    // Buscar usuário
    const userResult = await request
      .input('username', sql.VarChar, username)
      .query(`
        SELECT u.*, p.view_permission, p.edit_permission, p.delete_permission, p.create_permission
        FROM usuarios u
        LEFT JOIN permissoes p ON u.id = p.usuario_id
        WHERE u.username = @username
      `);
    
    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }
    
    const user = userResult.recordset[0];
    
    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Retornar dados do usuário e token
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
    
    res.json({ user: userData, token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

module.exports = { router, authenticateToken };
