
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const usuariosRoutes = require('./routes/usuarios');
const atendimentosRoutes = require('./routes/atendimentos');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3090;

// Middleware
app.use(cors());
app.use(morgan('dev')); // Request logging
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/atendimentos', atendimentosRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema de Atendimento de Recepção' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
