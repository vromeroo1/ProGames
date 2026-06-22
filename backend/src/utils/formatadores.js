function numero(valor, padrao = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : padrao;
}

function inteiro(valor, padrao = 0) {
  return Math.trunc(numero(valor, padrao));
}

function somenteCampos(objeto, camposPermitidos) {
  return camposPermitidos.reduce((resultado, campo) => {
    if (objeto[campo] !== undefined) {
      resultado[campo] = objeto[campo];
    }
    return resultado;
  }, {});
}

module.exports = {
  numero,
  inteiro,
  somenteCampos
};
