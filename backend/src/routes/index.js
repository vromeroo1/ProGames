const express = require('express');
const AuthRouter = require('./AuthRouter');
const UsuarioRouter = require('./UsuarioRouter');
const CategoriaRouter = require('./CategoriaRouter');
const JogoRouter = require('./JogoRouter');
const EmprestimoRouter = require('./EmprestimoRouter');
const DashboardRouter = require('./DashboardRouter');
const ExportacaoRouter = require('./ExportacaoRouter');
const LogRouter = require('./LogRouter');
const RelatorioRouter = require('./RelatorioRouter');
const ReservaRouter = require('./ReservaRouter');
const { sucesso } = require('../utils/resposta');

const router = express.Router();

router.get('/health', (req, res) => sucesso(res, 'API da ProGames esta funcionando.', {
  nome: 'ProGames',
  versao: '1.0.0'
}));

router.use('/auth', new AuthRouter().getRouter());
router.use('/usuarios', new UsuarioRouter().getRouter());
router.use('/categorias', new CategoriaRouter().getRouter());
router.use('/jogos', new JogoRouter().getRouter());
router.use('/emprestimos', new EmprestimoRouter().getRouter());
router.use('/dashboard', new DashboardRouter().getRouter());
router.use('/exportacao', new ExportacaoRouter().getRouter());
router.use('/importacao', new ExportacaoRouter().getRouter());
router.use('/logs', new LogRouter().getRouter());
router.use('/relatorios', new RelatorioRouter().getRouter());
router.use('/', new ReservaRouter().getRouter());

module.exports = router;
