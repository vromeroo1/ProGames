const { ObjectId } = require('mongodb');
const fs = require('fs/promises');
const path = require('path');
const { obterColecao } = require('../config/mongodb');
const IDAO = require('../interfaces/IDAO');

const arquivoFallback = path.resolve(process.cwd(), 'backend/logs/logs_fallback.jsonl');

class LogDAO extends IDAO {
  async listar(filtros = {}) {
    try {
      const colecao = await obterColecao('logs');
      const query = queryLogsUteis();

      if (filtros.usuario) {
        query.usuario = { $regex: filtros.usuario, $options: 'i' };
      }

      if (filtros.acao) {
        query.acao = filtros.acao;
      }

      if (filtros.data_inicio || filtros.data_fim) {
        query.timestamp = {};

        if (filtros.data_inicio) {
          query.timestamp.$gte = new Date(`${filtros.data_inicio}T00:00:00`);
        }

        if (filtros.data_fim) {
          query.timestamp.$lte = new Date(`${filtros.data_fim}T23:59:59`);
        }
      }

      return colecao.find(query).sort({ timestamp: -1 }).limit(300).toArray();
    } catch (erro) {
      return filtrarFallback(await lerFallback(), filtros);
    }
  }

  async buscarPorId(id) {
    try {
      const colecao = await obterColecao('logs');
      return colecao.findOne({ _id: new ObjectId(id) });
    } catch (erro) {
      const logs = await lerFallback();
      return logs.find((log) => String(log._id) === String(id)) || null;
    }
  }

  async criar(log) {
    const documento = {
      ...log,
      timestamp: log.timestamp ? new Date(log.timestamp) : new Date()
    };

    try {
      const colecao = await obterColecao('logs');
      const resultado = await colecao.insertOne(documento);
      return { _id: resultado.insertedId, ...documento };
    } catch (erro) {
      const fallback = { _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, ...documento };
      await salvarFallback(fallback);
      return fallback;
    }
  }

  async atualizar() {
    throw new Error('Logs nao sao atualizados para preservar auditoria.');
  }

  async remover() {
    throw new Error('Logs nao sao removidos pelo sistema.');
  }
}

async function lerFallback() {
  try {
    const conteudo = await fs.readFile(arquivoFallback, 'utf8');
    return conteudo
      .split(/\r?\n/)
      .filter(Boolean)
      .map((linha) => JSON.parse(linha))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 300);
  } catch (erro) {
    if (erro.code === 'ENOENT') return [];
    throw erro;
  }
}

async function salvarFallback(log) {
  await fs.mkdir(path.dirname(arquivoFallback), { recursive: true });
  await fs.appendFile(arquivoFallback, `${JSON.stringify(log)}\n`, 'utf8');
}

function filtrarFallback(logs, filtros) {
  return logs.filter((log) => {
    if (!logUtilParaListagem(log)) {
      return false;
    }

    if (filtros.usuario && !String(log.usuario || '').toLowerCase().includes(String(filtros.usuario).toLowerCase())) {
      return false;
    }
    if (filtros.acao && log.acao !== filtros.acao) {
      return false;
    }
    if (filtros.data_inicio && new Date(log.timestamp) < new Date(`${filtros.data_inicio}T00:00:00`)) {
      return false;
    }
    if (filtros.data_fim && new Date(log.timestamp) > new Date(`${filtros.data_fim}T23:59:59`)) {
      return false;
    }
    return true;
  });
}

function queryLogsUteis() {
  return {
    endpoint: { $regex: '^/api' },
    status_code: { $nin: [304, 401] },
    $nor: [
      { acao: 'ACESSO_ROTA' }
    ]
  };
}

function logUtilParaListagem(log) {
  const endpoint = String(log.endpoint || '');

  if (!endpoint.startsWith('/api')) {
    return false;
  }

  if ([304, 401].includes(Number(log.status_code))) {
    return false;
  }

  if (log.acao === 'ACESSO_ROTA') {
    return false;
  }

  return true;
}

module.exports = LogDAO;
