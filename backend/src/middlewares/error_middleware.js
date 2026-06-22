const { erro: responderErro } = require('../utils/resposta');
const LogService = require('../services/LogService');

const logService = new LogService();

function errorMiddleware(err, req, res, next) {
  const erroBanco = traduzirErroDeBanco(err);
  const status = err.statusCode || erroBanco?.status || 500;
  const detalhes = err.detalhes || erroBanco?.detalhes || null;
  const mensagem = erroBanco?.mensagem || err.message || 'Erro interno no servidor.';

  if (status !== 401) {
    logService.registrar({
      usuario: req.usuario?.email || 'anonimo',
      endpoint: req.originalUrl,
      metodo: req.method,
      status_code: status,
      acao: 'ERRO',
      ip: req.ip,
      detalhes: {
        erro: mensagem,
        stack_trace: process.env.NODE_ENV === 'production' ? undefined : err.stack
      }
    }).catch(() => {});
  }

  return responderErro(res, mensagem, status, detalhes);
}

function traduzirErroDeBanco(err) {
  const mensagem = String(err.message || '');
  const portas = Array.isArray(err.errors) ? err.errors.map((erro) => erro.port) : [];

  if (err.code === 'ECONNREFUSED' && (mensagem.includes('3306') || portas.includes(3306))) {
    return {
      status: 503,
      mensagem: 'Banco MySQL indisponivel. Verifique se o MySQL do XAMPP esta iniciado.',
      detalhes: 'Depois de iniciar o MySQL no XAMPP, importe o arquivo database/banco.sql pelo phpMyAdmin ou MySQL Workbench.'
    };
  }

  if (err.code === 'ER_BAD_DB_ERROR') {
    return {
      status: 503,
      mensagem: 'Banco MySQL locacao_jogos nao encontrado.',
      detalhes: 'Execute o script database/banco.sql no MySQL.'
    };
  }

  if (err.code === 'ER_NO_SUCH_TABLE') {
    return {
      status: 503,
      mensagem: 'Tabela obrigatoria nao encontrada no MySQL.',
      detalhes: 'Reimporte o script database/banco.sql para criar todas as tabelas.'
    };
  }

  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return {
      status: 503,
      mensagem: 'Acesso negado ao MySQL com as credenciais configuradas.',
      detalhes: 'Confira MYSQL_USER e MYSQL_PASSWORD no arquivo .env.'
    };
  }

  if (err.code === 'ECONNREFUSED' && (mensagem.includes('27017') || portas.includes(27017))) {
    return {
      status: 503,
      mensagem: 'MongoDB indisponivel. Verifique se o servico do MongoDB esta iniciado.',
      detalhes: 'Os logs do sistema dependem do MongoDB em mongodb://127.0.0.1:27017.'
    };
  }

  return null;
}

module.exports = errorMiddleware;
