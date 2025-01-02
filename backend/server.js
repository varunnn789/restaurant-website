const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Log the DATABASE_URL to check if it's being read correctly
console.log('Database URL:', process.env.DATABASE_URL);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Error connecting to the database:', err));

// Get all menu items
app.get('/api/menu', (req, res) => {
  pool.query('SELECT * FROM menu_items')
    .then(results => res.json(results.rows))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching menu items' });
    });
});

// Add a new reservation
app.post('/api/reservations', (req, res) => {
  const { customer_name, email, date, time, party_size } = req.body;
  const query = 'INSERT INTO reservations (customer_name, email, date, time, party_size) VALUES ($1, $2, $3, $4, $5) RETURNING id';
  pool.query(query, [customer_name, email, date, time, party_size])
    .then(result => res.status(201).json({ message: 'Reservation created successfully', id: result.rows[0].id }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while creating the reservation' });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
