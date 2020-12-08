const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'task2',
  password: '123',
  port: 4000,
})

module.exports = pool;