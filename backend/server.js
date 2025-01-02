const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Get all menu items
app.get('/api/menu', (req, res) => {
  pool.query('SELECT * FROM menu_items', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching menu items' });
      return;
    }
    res.json(results.rows);
  });
});

// Add a new reservation
app.post('/api/reservations', (req, res) => {
  const { customer_name, email, date, time, party_size } = req.body;
  const query = 'INSERT INTO reservations (customer_name, email, date, time, party_size) VALUES ($1, $2, $3, $4, $5) RETURNING id';
  pool.query(query, [customer_name, email, date, time, party_size], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while creating the reservation' });
      return;
    }
    res.status(201).json({ message: 'Reservation created successfully', id: result.rows[0].id });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
