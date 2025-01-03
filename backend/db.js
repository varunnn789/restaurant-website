const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: 'postgresql://restaurant_db_aozf_user:do72GnfFKRnyPkUp2N4VlGHfrPKkCwQq@dpg-ctrgba1u0jms73fv2320-a.oregon-postgres.render.com/restaurant_db_aozf',
    ssl: {
        rejectUnauthorized: false
    }
});

// Add this to test the connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Connected to database successfully');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
