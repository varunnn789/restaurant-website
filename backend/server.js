const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Routes will be added here
// Get all menu items
app.get('/api/menu', (req, res) => {
  db.query('SELECT * FROM menu_items', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching menu items' });
      return;
    }
    res.json(results);
  });
});

// Add a new reservation
app.post('/api/reservations', (req, res) => {
  const { customer_name, email, date, time, party_size } = req.body;
  const query = 'INSERT INTO reservations (customer_name, email, date, time, party_size) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [customer_name, email, date, time, party_size], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while creating the reservation' });
      return;
    }
    res.status(201).json({ message: 'Reservation created successfully', id: result.insertId });
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
