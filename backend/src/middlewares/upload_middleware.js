const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const AppError = require('../utils/AppError');

fs.mkdirSync(env.uploadDir, { recursive: true });

const storageImagem = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.uploadDir),
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nomeSeguro = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
    cb(null, nomeSeguro);
  }
});

function filtroImagem(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new AppError('O arquivo enviado deve ser uma imagem.', 422));
  }
  return cb(null, true);
}

const uploadImagem = multer({
  storage: storageImagem,
  fileFilter: filtroImagem,
  limits: { fileSize: 2 * 1024 * 1024 }
});

const uploadJson = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }
});

module.exports = {
  uploadImagem,
  uploadJson
};
