const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/data', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM data');
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

app.post('/api/data', async (req, res) => {
  const { key, value } = req.body;
  try {
    const client = await pool.connect();
    await client.query('INSERT INTO data (key, value) VALUES ($1, $2)', [key, value]);
    res.send('Data inserted');
    client.release();
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
