const AppError = require('../utils/AppError');

function validarCorpo(regras) {
  return (req, res, next) => {
    const erros = validarObjeto(req.body || {}, regras);

    if (erros.length > 0) {
      throw new AppError('Dados invalidos.', 422, erros);
    }

    return next();
  };
}

function validarObjeto(dados, regras) {
  const erros = [];

  Object.entries(regras).forEach(([campo, regra]) => {
    const valor = dados[campo];

    if (regra.obrigatorio && (valor === undefined || valor === null || valor === '')) {
      erros.push(`${campo} e obrigatorio`);
      return;
    }

    if (valor === undefined || valor === null || valor === '') {
      return;
    }

    if (regra.tipo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor))) {
      erros.push(`${campo} deve ser um email valido`);
    }

    if (regra.tipo === 'numero' && Number.isNaN(Number(valor))) {
      erros.push(`${campo} deve ser numerico`);
    }

    if (regra.min !== undefined && Number(valor) < regra.min) {
      erros.push(`${campo} deve ser maior ou igual a ${regra.min}`);
    }

    if (regra.maxLength && String(valor).length > regra.maxLength) {
      erros.push(`${campo} deve ter no maximo ${regra.maxLength} caracteres`);
    }

    if (regra.enum && !regra.enum.includes(valor)) {
      erros.push(`${campo} possui valor invalido`);
    }
  });

  return erros;
}

const schemas = {
  login: {
    email: { obrigatorio: true, tipo: 'email', maxLength: 150 },
    senha: { obrigatorio: true, maxLength: 255 }
  },
  usuario: {
    nome: { obrigatorio: true, maxLength: 120 },
    email: { obrigatorio: true, tipo: 'email', maxLength: 150 },
    senha: { obrigatorio: true, maxLength: 255 },
    telefone: { maxLength: 20 },
    tipo_usuario: { enum: ['admin', 'usuario'] }
  },
  usuarioAtualizacao: {
    nome: { maxLength: 120 },
    email: { tipo: 'email', maxLength: 150 },
    senha: { maxLength: 255 },
    telefone: { maxLength: 20 },
    tipo_usuario: { enum: ['admin', 'usuario'] }
  },
  categoria: {
    nome: { obrigatorio: true, maxLength: 80 },
    descricao: { maxLength: 255 }
  },
  jogo: {
    titulo: { obrigatorio: true, maxLength: 140 },
    categoria_id: { obrigatorio: true, tipo: 'numero', min: 1 },
    tipo_jogo: { obrigatorio: true, enum: ['videogame', 'boardgame'] },
    plataforma: { maxLength: 80 },
    valor_aluguel: { obrigatorio: true, tipo: 'numero', min: 0 },
    estoque: { obrigatorio: true, tipo: 'numero', min: 0 }
  },
  jogoAtualizacao: {
    titulo: { maxLength: 140 },
    categoria_id: { tipo: 'numero', min: 1 },
    tipo_jogo: { enum: ['videogame', 'boardgame'] },
    plataforma: { maxLength: 80 },
    valor_aluguel: { tipo: 'numero', min: 0 },
    estoque: { tipo: 'numero', min: 0 }
  },
  emprestimo: {
    usuario_id: { obrigatorio: true, tipo: 'numero', min: 1 },
    data_retirada: { maxLength: 10 },
    data_prevista_devolucao: { obrigatorio: true, maxLength: 10 }
  },
  reserva: {
    data_retirada: { maxLength: 10 },
    data_prevista_devolucao: { obrigatorio: true, maxLength: 10 }
  },
  emprestimoAtualizacao: {
    data_retirada: { maxLength: 10 },
    data_prevista_devolucao: { maxLength: 10 },
    status: { enum: ['pendente', 'aprovado', 'retirado', 'devolvido', 'cancelado', 'atrasado'] }
  }
};

module.exports = {
  validarCorpo,
  validarObjeto,
  schemas
};
