const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: 'postgresql://restaurant_db_aozf_user:do72GnfFKRnyPkUp2N4VlGHfrPKkCwQq@dpg-ctrgba1u0jms73fv2320-a.oregon-postgres.render.com/restaurant_db_aozf',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
