
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
app.use(cors());
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
  res.json({ message: 'API do Sistema de Atendimento de Recepção - SQL Server' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API conectada ao SQL Server`);
    });
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();
