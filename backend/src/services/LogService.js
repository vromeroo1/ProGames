const { Builder } = require('xml2js');
const IService = require('../interfaces/IService');
const LogDAO = require('../daos/LogDAO');
const LogSistema = require('../models/LogSistema');

class LogService extends IService {
  constructor(logDAO = new LogDAO()) {
    super();
    this.logDAO = logDAO;
  }

  async listar(filtros) {
    return this.logDAO.listar(filtros);
  }

  async buscarPorId(id) {
    return this.logDAO.buscarPorId(id);
  }

  async criar(dados) {
    return this.registrar(dados);
  }

  async registrar(dados) {
    try {
      return await this.logDAO.criar(new LogSistema(dados));
    } catch (erro) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('MongoDB indisponivel para registrar log:', erro.message);
      }
      return null;
    }
  }

  async exportarXml(filtros) {
    const logs = await this.listar(filtros);
    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true }
    });

    return builder.buildObject({
      logs: {
        evento: logs.map((log, index) => ({
          $: { id: String(index + 1) },
          usuario: log.usuario,
          acao: log.acao,
          descricao: log.detalhes?.descricao || log.endpoint || 'Evento registrado no sistema',
          data_hora: new Date(log.timestamp).toISOString(),
          tipo_evento: classificarEvento(log.acao),
          endpoint: log.endpoint,
          metodo: log.metodo,
          status_code: log.status_code,
          ip_origem: log.ip,
          detalhes: JSON.stringify(log.detalhes || {})
        }))
      }
    });
  }
}

function classificarEvento(acao) {
  if (acao?.includes('LOGIN') || acao?.includes('LOGOUT')) return 'autenticacao';
  if (acao?.includes('ERRO')) return 'erro';
  if (acao?.includes('RELATORIO')) return 'relatorio';
  if (acao?.includes('CRIAR') || acao?.includes('ATUALIZAR') || acao?.includes('REMOVER')) return 'cadastro';
  return 'acesso';
}

module.exports = LogService;
