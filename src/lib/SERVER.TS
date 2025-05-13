// api/server.ts
import express from 'express';
import { getAttendances } from './attendance';

const app = express();
app.get('/api/attendances', async (req, res) => {
  try {
    const data = await getAttendances();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('API running on port 3001'));