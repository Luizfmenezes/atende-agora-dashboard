
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { initializeDatabase } = require('./config/sqlserver');

// Import routes
const { router: authRoutes } = require('./routes/auth');
const usersRoutes = require('./routes/users');
const attendancesRoutes = require('./routes/attendances');
const sectorsRoutes = require('./routes/sectors');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://id-preview--c9329295-1d18-4885-b8a8-fe6fbcfc5c29.lovable.app'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/attendances', attendancesRoutes);
app.use('/api/sectors', sectorsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do Sistema de Atendimento de Recepção - SQL Server',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Erro na API:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    await initializeDatabase();
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📡 API disponível em: http://localhost:${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM recebido. Fechando servidor...');
      server.close(() => {
        console.log('Servidor fechado.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();
