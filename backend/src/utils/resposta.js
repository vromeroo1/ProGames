function sucesso(res, mensagem, dados = null, status = 200, meta = null) {
  return res.status(status).json({
    sucesso: true,
    mensagem,
    dados,
    meta
  });
}

function erro(res, mensagem, status = 500, detalhes = null) {
  return res.status(status).json({
    sucesso: false,
    mensagem,
    detalhes
  });
}

module.exports = {
  sucesso,
  erro
};
