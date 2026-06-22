class Usuario {
  constructor({ id, nome, email, senha, telefone, tipo_usuario = 'usuario', created_at }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.telefone = telefone;
    this.tipo_usuario = tipo_usuario;
    this.created_at = created_at;
  }
}

module.exports = Usuario;
