function montarUpdate(dados, camposPermitidos) {
  const sets = [];
  const valores = [];

  camposPermitidos.forEach((campo) => {
    if (dados[campo] !== undefined) {
      sets.push(`${campo} = ?`);
      valores.push(dados[campo]);
    }
  });

  return { sets, valores };
}

module.exports = {
  montarUpdate
};
