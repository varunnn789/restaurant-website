const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: 'ep-steep-recipe-a49ck4ln.us-east-1.pg.koyeb.app',
    database: 'koyebdb',
    user: 'koyeb-adm',
    password: 'Wmn9zHMTFRk8',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
