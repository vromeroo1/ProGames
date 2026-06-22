const fs = require('fs');
const path = require('path');

const raiz = process.cwd();
const obrigatorios = [
  'backend/src/app.js',
  'backend/src/server.js',
  'backend/src/interfaces/IDAO.js',
  'backend/src/interfaces/IService.js',
  'backend/src/interfaces/IController.js',
  'backend/src/middlewares/auth_middleware.js',
  'backend/src/middlewares/validation_middleware.js',
  'backend/src/middlewares/error_middleware.js',
  'backend/src/middlewares/log_middleware.js',
  'backend/src/daos/UsuarioDAO.js',
  'backend/src/daos/JogoDAO.js',
  'backend/src/services/EmprestimoService.js',
  'backend/src/controllers/EmprestimoController.js',
  'backend/src/routes/EmprestimoRouter.js',
  'database/banco.sql',
  'frontend/index.html'
];

const faltando = obrigatorios.filter((arquivo) => !fs.existsSync(path.join(raiz, arquivo)));

if (faltando.length > 0) {
  console.error('Arquivos obrigatorios ausentes:');
  faltando.forEach((arquivo) => console.error(`- ${arquivo}`));
  process.exit(1);
}

require('../app');

console.log('Estrutura MVC verificada com sucesso.');
