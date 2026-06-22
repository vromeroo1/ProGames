import { apiFetch, exigirAdmin } from './api.js';
import { montarNavbar, toast, tratarErro, atualizarIcones } from './ui.js';

const modal = new bootstrap.Modal(document.getElementById('modalUsuario'));
const form = document.getElementById('formUsuario');
const telefoneInput = document.getElementById('telefone');

exigirAdmin();
montarNavbar('usuarios');
carregarUsuarios();

document.getElementById('btnNovoUsuario').addEventListener('click', () => abrirModal());
telefoneInput.addEventListener('input', () => {
  telefoneInput.value = formatarTelefone(telefoneInput.value);
  validarTelefone();
});
telefoneInput.addEventListener('blur', validarTelefone);

document.getElementById('formFiltro').addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarUsuarios();
});

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = document.getElementById('usuarioId').value;
  document.getElementById('senha').required = !id;
  telefoneInput.value = formatarTelefone(telefoneInput.value);
  validarTelefone();

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const dados = Object.fromEntries(new FormData(form));
  if (id && !dados.senha) delete dados.senha;

  try {
    await apiFetch(`/usuarios${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: dados
    });
    toast('Usuário salvo com sucesso.');
    modal.hide();
    carregarUsuarios();
  } catch (erro) {
    tratarErro(erro);
  }
});

async function carregarUsuarios() {
  try {
    const busca = document.getElementById('busca').value;
    const tipo = document.getElementById('tipoUsuarioFiltro').value;
    const resposta = await apiFetch(`/usuarios?busca=${encodeURIComponent(busca)}&tipo_usuario=${encodeURIComponent(tipo)}`);
    const tbody = document.getElementById('tabelaUsuarios');
    tbody.innerHTML = resposta.dados.map((usuario) => `
      <tr>
        <td class="fw-semibold">${usuario.nome}</td>
        <td>${usuario.email}</td>
        <td>${usuario.telefone || '-'}</td>
        <td><span class="badge text-bg-${usuario.tipo_usuario === 'admin' ? 'dark' : 'info'}">${textoTipoUsuario(usuario.tipo_usuario)}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-dark" title="Editar" data-editar="${usuario.id}">
            Editar
          </button>
          <button class="btn btn-sm btn-outline-danger" title="Excluir" data-excluir="${usuario.id}">
            Excluir
          </button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-center text-muted">Nenhum usuário encontrado.</td></tr>';

    tbody.querySelectorAll('[data-editar]').forEach((botao) => botao.addEventListener('click', () => editar(botao.dataset.editar)));
    tbody.querySelectorAll('[data-excluir]').forEach((botao) => botao.addEventListener('click', () => excluir(botao.dataset.excluir)));
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function editar(id) {
  try {
    const resposta = await apiFetch(`/usuarios/${id}`);
    abrirModal(resposta.dados);
  } catch (erro) {
    tratarErro(erro);
  }
}

async function excluir(id) {
  if (!confirm('Confirma a exclusão deste usuário?')) return;
  try {
    await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
    toast('Usuário removido.');
    carregarUsuarios();
  } catch (erro) {
    tratarErro(erro);
  }
}

function abrirModal(usuario = null) {
  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('usuarioId').value = usuario?.id || '';
  document.getElementById('tituloModal').textContent = usuario ? 'Editar Usuário' : 'Novo Usuário';
  document.getElementById('nome').value = usuario?.nome || '';
  document.getElementById('email').value = usuario?.email || '';
  telefoneInput.value = formatarTelefone(usuario?.telefone || '');
  telefoneInput.setCustomValidity('');
  document.getElementById('tipo_usuario').value = usuario?.tipo_usuario || 'usuario';
  document.getElementById('senha').value = '';
  document.getElementById('senha').required = !usuario;
  modal.show();
  atualizarIcones();
}

function textoTipoUsuario(tipo) {
  return tipo === 'admin' ? 'Administrador' : 'Usuário';
}

function somenteNumeros(valor) {
  return String(valor || '').replace(/\D/g, '').slice(0, 11);
}

function formatarTelefone(valor) {
  const numeros = somenteNumeros(valor);

  if (numeros.length <= 2) {
    return numeros ? `(${numeros}` : '';
  }

  if (numeros.length <= 6) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

function validarTelefone() {
  const numeros = somenteNumeros(telefoneInput.value);
  const valido = numeros.length === 0 || numeros.length === 10 || numeros.length === 11;
  telefoneInput.setCustomValidity(valido ? '' : 'Informe o telefone com DDD.');
  return valido;
}

