const path = require('path');
require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'chave_progames_local',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h'
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'locacao_jogos'
  },
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
    database: process.env.MONGODB_DATABASE || 'locacao_jogos_logs'
  },
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'backend/uploads'),
  frontendDir: path.resolve(process.cwd(), 'frontend'),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
};
