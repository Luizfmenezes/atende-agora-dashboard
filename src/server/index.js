import express from 'express';
import sql from 'mssql';
import { dbConfig } from './dbConfig';

const app = express();
app.use(express.json());

app.post('/api/attendances', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Implemente sua query SQL aqui com os filtros de req.body
    const result = await pool.request()
      .input('startDate', sql.DateTime, req.body.startDate)
      // ... outros parâmetros
      .query('SELECT * FROM Attendances WHERE created_at >= @startDate');
    
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));