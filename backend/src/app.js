const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const env = require('./config/env');
const apiRoutes = require('./routes');
const logMiddleware = require('./middlewares/log_middleware');
const errorMiddleware = require('./middlewares/error_middleware');
const { erro } = require('./utils/resposta');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(env.uploadDir));
app.use('/vendor/bootstrap', express.static(path.resolve(process.cwd(), 'node_modules/bootstrap/dist')));
app.use('/vendor/chart.js', express.static(path.resolve(process.cwd(), 'node_modules/chart.js/dist')));
app.use('/api', logMiddleware, apiRoutes);

if (fs.existsSync(env.frontendDir)) {
  app.use(express.static(env.frontendDir));
  app.get('/', (req, res) => {
    res.sendFile(path.join(env.frontendDir, 'index.html'));
  });
}

app.use((req, res) => erro(res, 'Rota nao encontrada.', 404));
app.use(errorMiddleware);

module.exports = app;
