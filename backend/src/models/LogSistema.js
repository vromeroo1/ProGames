class LogSistema {
  constructor({ usuario, endpoint, metodo, timestamp, status_code, acao, ip, detalhes }) {
    this.usuario = usuario || 'anonimo';
    this.endpoint = endpoint;
    this.metodo = metodo;
    this.timestamp = timestamp || new Date();
    this.status_code = status_code;
    this.acao = acao;
    this.ip = ip;
    this.detalhes = detalhes || {};
  }
}

module.exports = LogSistema;
