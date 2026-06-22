const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  ...env.mysql,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: true
});

module.exports = pool;
