const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Debug route to check database connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ 
            message: 'Database connected successfully',
            timestamp: result.rows[0].now
        });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ 
            error: 'Database connection failed',
            details: err.message
        });
    }
});

// Existing routes
app.get('/api/menu', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM menu_items');
        console.log('Menu items retrieved:', result.rows); // Add this line for debugging
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching menu items:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            details: err.message
        });
    }
});

app.post('/api/menu', async (req, res) => {
    const { name, description, price, category } = req.body;
    
    // Validation
    if (!name || !description || !price || !category) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['name', 'description', 'price', 'category']
        });
    }

    try {
        const query = 'INSERT INTO menu_items (name, description, price, category) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [name, description, price, category];
        
        console.log('Attempting to insert:', values); // Debug log
        
        const result = await db.query(query, values);
        console.log('Insert result:', result.rows[0]); // Debug log
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Detailed error:', err); // This will show in your server logs
        res.status(500).json({ 
            error: 'Internal server error',
            details: err.message
        });
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
