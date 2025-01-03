const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth header:', authHeader);
    console.log('Token:', token);

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ error: 'Invalid token' });
        }
        
        console.log('Authenticated user:', user);
        req.user = user;
        next();
    });
};

// Auth Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );
        
        const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET);
        res.status(201).json({ token, user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email 
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Add this route to check database tables
app.get('/api/debug/tables', async (req, res) => {
    try {
        // Check users table
        const usersTable = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        `);
        
        // Check reservations table
        const reservationsTable = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'reservations'
            );
        `);
        
        // Get table structures
        const userColumns = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        
        const reservationColumns = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'reservations';
        `);
        
        res.json({
            tables: {
                users: usersTable.rows[0].exists,
                reservations: reservationsTable.rows[0].exists
            },
            structure: {
                users: userColumns.rows,
                reservations: reservationColumns.rows
            }
        });
    } catch (err) {
        console.error('Debug error:', err);
        res.status(500).json({ error: err.message });
    }
});


// Protected Routes
app.get('/api/my-reservations', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching reservations for user:', req.user.userId);
        
        const result = await db.query(
            'SELECT * FROM reservations WHERE user_id = $1 ORDER BY date, time',
            [req.user.userId]
        );
        
        console.log('Found reservations:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching reservations:', err);
        res.status(500).json({ 
            error: 'Error fetching reservations',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Existing routes
app.get('/api/menu', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM menu_items');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update reservation route to include user_id
app.post('/api/reservations', authenticateToken, async (req, res) => {
    try {
        const { customer_name, email, date, time, party_size } = req.body;
        const user_id = req.user.userId;

        console.log('Creating reservation:', {
            customer_name,
            email,
            date,
            time,
            party_size,
            user_id
        });

        const query = `
            INSERT INTO reservations 
            (customer_name, email, date, time, party_size, user_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `;
        const values = [customer_name, email, date, time, party_size, user_id];
        
        const result = await db.query(query, values);
        console.log('Reservation created:', result.rows[0]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Reservation creation error:', err);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Initialize tables
async function initializeTables() {
    try {
        // Create users table first
        console.log('Creating users table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Users table created/verified successfully');

        // Create menu_items table
        console.log('Creating menu_items table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Menu items table created/verified successfully');

        // Create reservations table with foreign key reference
        console.log('Creating reservations table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS reservations (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                party_size INT NOT NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Reservations table created/verified successfully');

        // Verify all tables exist
        const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'menu_items', 'reservations');
        `);

        console.log('Existing tables:', tables.rows.map(row => row.table_name));

        // Additional verification of table structures
        const userColumns = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('Users table structure:', userColumns.rows);

        const reservationColumns = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'reservations';
        `);
        console.log('Reservations table structure:', reservationColumns.rows);

        console.log('All tables initialized successfully');
    } catch (err) {
        console.error('Error initializing tables:', err);
        // Log detailed error information
        console.error('Error details:', {
            message: err.message,
            code: err.code,
            stack: err.stack
        });
        throw err; // Rethrow to handle in server startup
    }
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initializeTables();
});
