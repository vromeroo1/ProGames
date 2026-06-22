import { apiFetch, exigirUsuarioAutenticado, usuarioLogado } from './api.js';
import { montarNavbar, tratarErro, atualizarIcones } from './ui.js';

exigirUsuarioAutenticado();
montarNavbar('perfil');
carregarPerfil();

async function carregarPerfil() {
  try {
    const resposta = await apiFetch('/auth/me');
    const usuario = resposta.dados || usuarioLogado();
    document.getElementById('perfilNome').textContent = usuario.nome || 'Usuário';
    document.getElementById('perfilEmail').textContent = usuario.email || '-';
    document.getElementById('perfilId').textContent = `#${usuario.id}`;
    document.getElementById('perfilTipo').textContent = usuario.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário';
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

