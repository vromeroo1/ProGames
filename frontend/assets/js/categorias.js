import { apiFetch, exigirAdmin } from './api.js';
import { montarNavbar, toast, tratarErro, atualizarIcones, textoPt } from './ui.js';

const modal = new bootstrap.Modal(document.getElementById('modalCategoria'));
const form = document.getElementById('formCategoria');

exigirAdmin();
montarNavbar('categorias');
carregarCategorias();

document.getElementById('btnNovaCategoria').addEventListener('click', () => abrirModal());
document.getElementById('formFiltro').addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarCategorias();
});

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const id = document.getElementById('categoriaId').value;
  const dados = Object.fromEntries(new FormData(form));

  try {
    await apiFetch(`/categorias${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: dados
    });
    toast('Categoria salva com sucesso.');
    modal.hide();
    carregarCategorias();
  } catch (erro) {
    tratarErro(erro);
  }
});

async function carregarCategorias() {
  try {
    const busca = document.getElementById('busca').value;
    const resposta = await apiFetch(`/categorias?busca=${encodeURIComponent(busca)}`);
    const tbody = document.getElementById('tabelaCategorias');
    tbody.innerHTML = resposta.dados.map((categoria) => `
      <tr>
        <td class="fw-semibold">${textoPt(categoria.nome)}</td>
        <td>${textoPt(categoria.descricao || '-')}</td>
        <td class="text-end">${categoria.total_jogos || 0}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-dark" title="Editar" data-editar="${categoria.id}">
            Editar
          </button>
          <button class="btn btn-sm btn-outline-danger" title="Excluir" data-excluir="${categoria.id}">
            Excluir
          </button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="4" class="text-center text-muted">Nenhuma categoria encontrada.</td></tr>';

    tbody.querySelectorAll('[data-editar]').forEach((botao) => botao.addEventListener('click', () => editar(botao.dataset.editar)));
    tbody.querySelectorAll('[data-excluir]').forEach((botao) => botao.addEventListener('click', () => excluir(botao.dataset.excluir)));
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function editar(id) {
  try {
    const resposta = await apiFetch(`/categorias/${id}`);
    abrirModal(resposta.dados);
  } catch (erro) {
    tratarErro(erro);
  }
}

async function excluir(id) {
  if (!confirm('Confirma a exclusão desta categoria?')) return;
  try {
    await apiFetch(`/categorias/${id}`, { method: 'DELETE' });
    toast('Categoria removida.');
    carregarCategorias();
  } catch (erro) {
    tratarErro(erro);
  }
}

function abrirModal(categoria = null) {
  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('categoriaId').value = categoria?.id || '';
  document.getElementById('tituloModal').textContent = categoria ? 'Editar Categoria' : 'Nova Categoria';
  document.getElementById('nome').value = categoria?.nome || '';
  document.getElementById('descricao').value = categoria?.descricao || '';
  modal.show();
  atualizarIcones();
}

