const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/menu', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM menu_items');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/reservations', async (req, res) => {
    const { customer_name, email, date, time, party_size } = req.body;
    try {
        const query = 'INSERT INTO reservations (customer_name, email, date, time, party_size) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const values = [customer_name, email, date, time, party_size];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Initialize tables if they don't exist
async function initializeTables() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(50)
            );

            CREATE TABLE IF NOT EXISTS reservations (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                party_size INT NOT NULL
            );
        `);
        console.log('Tables initialized successfully');
    } catch (err) {
        console.error('Error initializing tables:', err);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initializeTables();
});
