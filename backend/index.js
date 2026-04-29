const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'parking_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

app.get('/', (req, res) => {
  res.send('Parking Super Admin Backend is running!');
});

app.get('/db-status', async (req, res) => {
  console.log('Received /db-status request');
  try {
    console.log('Connecting to pool...');
    const client = await pool.connect();
    console.log('Connected to pool, running query...');
    const result = await client.query('SELECT NOW()');
    console.log('Query successful');
    client.release();
    res.json({ status: 'connected', time: result.rows[0].now });
  } catch (err) {
    console.error('DB connection error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
