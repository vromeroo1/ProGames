import { apiFetch, exigirAdmin, baixarBlob } from './api.js';
import { montarNavbar, toast, tratarErro, moeda, badgeStatus, atualizarIcones, textoPt } from './ui.js';

const modalEmprestimo = new bootstrap.Modal(document.getElementById('modalEmprestimo'));
const modalEdicao = new bootstrap.Modal(document.getElementById('modalEdicao'));
const formEmprestimo = document.getElementById('formEmprestimo');
const formEdicao = document.getElementById('formEdicao');
let usuarios = [];
let jogos = [];

exigirAdmin();
montarNavbar('emprestimos');
iniciar();

document.getElementById('btnNovoEmprestimo').addEventListener('click', abrirModalNovo);
document.getElementById('btnAdicionarItem').addEventListener('click', () => adicionarItem());
document.getElementById('btnPdfEmprestimos').addEventListener('click', baixarPdf);
document.getElementById('data_retirada').addEventListener('change', () => {
  ajustarDataDevolucaoMinima();
  atualizarResumoEmprestimo();
});
document.getElementById('data_prevista_devolucao').addEventListener('change', atualizarResumoEmprestimo);
document.getElementById('formFiltro').addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarEmprestimos();
});

formEmprestimo.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!formEmprestimo.checkValidity()) {
    formEmprestimo.classList.add('was-validated');
    return;
  }

  const itens = [...document.querySelectorAll('.item-row')].map((row) => ({
    jogo_id: Number(row.querySelector('[data-jogo]').value),
    quantidade: Number(row.querySelector('[data-quantidade]').value)
  }));

  if (itens.length === 0) {
    toast('Adicione pelo menos um jogo ao empréstimo.');
    return;
  }

  try {
    await apiFetch('/emprestimos', {
      method: 'POST',
      body: {
        usuario_id: Number(document.getElementById('usuario_id').value),
        data_retirada: document.getElementById('data_retirada').value,
        data_prevista_devolucao: document.getElementById('data_prevista_devolucao').value,
        observacoes: document.getElementById('observacoes').value,
        itens
      }
    });
    toast('Empréstimo criado com sucesso.');
    modalEmprestimo.hide();
    await carregarEmprestimos();
  } catch (erro) {
    tratarErro(erro);
  }
});

formEdicao.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = document.getElementById('emprestimoIdEdicao').value;
  try {
    await apiFetch(`/emprestimos/${id}`, {
      method: 'PUT',
      body: {
        data_prevista_devolucao: document.getElementById('dataPrevistaEdicao').value,
        status: document.getElementById('statusEdicao').value,
        observacoes: document.getElementById('observacoesEdicao').value
      }
    });
    toast('Empréstimo atualizado.');
    modalEdicao.hide();
    carregarEmprestimos();
  } catch (erro) {
    tratarErro(erro);
  }
});

async function iniciar() {
  const [usuariosResposta, jogosResposta] = await Promise.all([
    apiFetch('/usuarios'),
    apiFetch('/jogos?disponiveis=1')
  ]);
  usuarios = usuariosResposta.dados;
  jogos = jogosResposta.dados;
  preencherCombos();
  await carregarEmprestimos();
}

function preencherCombos() {
  const usuariosOptions = '<option value="">Todos</option>' + usuarios.map((usuario) => `<option value="${usuario.id}">${usuario.nome}</option>`).join('');
  document.getElementById('usuarioFiltro').innerHTML = usuariosOptions;
  document.getElementById('usuario_id').innerHTML = usuarios.map((usuario) => `<option value="${usuario.id}">${usuario.nome}</option>`).join('');
}

async function carregarEmprestimos() {
  try {
    const params = new URLSearchParams({
      usuario_id: document.getElementById('usuarioFiltro').value,
      status: document.getElementById('statusFiltro').value
    });
    const resposta = await apiFetch(`/emprestimos?${params}`);
    const tbody = document.getElementById('tabelaEmprestimos');
    tbody.innerHTML = resposta.dados.map((emprestimo) => `
      <tr>
        <td>#${emprestimo.id}</td>
        <td class="fw-semibold">${emprestimo.usuario_nome}</td>
        <td class="loan-games-cell">${escaparHtml(textoPt(emprestimo.jogos_resumo || '-'))}</td>
        <td>${String(emprestimo.data_emprestimo).slice(0, 10)}</td>
        <td>${String(emprestimo.data_prevista_devolucao).slice(0, 10)}</td>
        <td>${badgeStatus(emprestimo.status)}</td>
        <td class="text-end">${emprestimo.dias_aluguel || 1}</td>
        <td class="text-end">${moeda(emprestimo.desconto || 0)}</td>
        <td class="text-end">${moeda(emprestimo.valor_total)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-dark" title="Editar" data-editar="${emprestimo.id}">
            Editar
          </button>
          <button class="btn btn-sm btn-outline-success" title="Devolver" data-devolver="${emprestimo.id}" ${['devolvido', 'cancelado', 'pendente'].includes(emprestimo.status) ? 'disabled' : ''}>
            Devolver
          </button>
          <button class="btn btn-sm btn-outline-danger" title="Excluir" data-excluir="${emprestimo.id}">
            Excluir
          </button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="10" class="text-center text-muted">Nenhum empréstimo encontrado.</td></tr>';

    tbody.querySelectorAll('[data-editar]').forEach((botao) => botao.addEventListener('click', () => editar(botao.dataset.editar)));
    tbody.querySelectorAll('[data-devolver]').forEach((botao) => botao.addEventListener('click', () => devolver(botao.dataset.devolver)));
    tbody.querySelectorAll('[data-excluir]').forEach((botao) => botao.addEventListener('click', () => excluir(botao.dataset.excluir)));
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

function abrirModalNovo() {
  formEmprestimo.reset();
  formEmprestimo.classList.remove('was-validated');
  document.getElementById('listaItens').innerHTML = '';
  const dataRetirada = new Date();
  const dataDevolucao = new Date(dataRetirada);
  dataDevolucao.setDate(dataDevolucao.getDate() + 3);
  document.getElementById('data_retirada').value = formatarDataInput(dataRetirada);
  document.getElementById('data_prevista_devolucao').value = formatarDataInput(dataDevolucao);
  ajustarDataDevolucaoMinima();
  adicionarItem();
  atualizarResumoEmprestimo();
  modalEmprestimo.show();
  atualizarIcones();
}

function adicionarItem() {
  const lista = document.getElementById('listaItens');
  const div = document.createElement('div');
  div.className = 'item-row';
  div.innerHTML = `
    <div class="loan-game-field">
      <select class="form-select" data-jogo required>
        ${jogos.map((jogo) => `<option value="${jogo.id}">${rotuloJogoEmprestimo(jogo)}</option>`).join('')}
      </select>
      <div class="selected-game-info" data-jogo-info></div>
    </div>
    <input type="number" class="form-control" data-quantidade min="1" value="1" required aria-label="Quantidade" title="Quantidade">
    <button type="button" class="btn btn-outline-danger" title="Remover item">Remover</button>
  `;
  const select = div.querySelector('[data-jogo]');
  const quantidade = div.querySelector('[data-quantidade]');
  select.addEventListener('change', () => {
    atualizarResumoJogo(div);
    atualizarResumoEmprestimo();
  });
  quantidade.addEventListener('input', atualizarResumoEmprestimo);
  div.querySelector('button').addEventListener('click', () => {
    div.remove();
    atualizarResumoEmprestimo();
  });
  lista.appendChild(div);
  atualizarResumoJogo(div);
  atualizarResumoEmprestimo();
  atualizarIcones();
}

function rotuloJogoEmprestimo(jogo) {
  return [
    textoPt(jogo.titulo),
    jogo.plataforma,
    textoPt(jogo.categoria_nome),
    `${moeda(jogo.valor_aluguel)}/dia`,
    `estoque ${jogo.estoque}`
  ].map(escaparHtml).join(' | ');
}

function atualizarResumoJogo(row) {
  const select = row.querySelector('[data-jogo]');
  const info = row.querySelector('[data-jogo-info]');
  const jogo = jogos.find((item) => Number(item.id) === Number(select.value));

  if (!jogo) {
    info.innerHTML = '';
    return;
  }

  const quantidade = row.querySelector('[data-quantidade]');
  quantidade.max = Math.max(1, Number(jogo.estoque || 1));
  if (Number(quantidade.value) > Number(quantidade.max)) {
    quantidade.value = quantidade.max;
  }

  info.innerHTML = `
    <span>Plataforma: <strong>${escaparHtml(jogo.plataforma)}</strong></span>
    <span>Gênero: <strong>${escaparHtml(textoPt(jogo.categoria_nome))}</strong></span>
    <span>Diária: <strong>${moeda(jogo.valor_aluguel)}</strong></span>
    <span>Estoque: <strong>${Number(jogo.estoque || 0)}</strong></span>
  `;
}

function atualizarResumoEmprestimo() {
  const resumo = document.getElementById('resumoEmprestimo');
  const dataRetirada = document.getElementById('data_retirada').value;
  const dataDevolucao = document.getElementById('data_prevista_devolucao').value;
  const dias = calcularDiasPeriodo(dataRetirada, dataDevolucao);
  const totais = calcularTotaisItens('#listaItens .item-row', dias);

  resumo.innerHTML = montarResumoPeriodo(dataRetirada, dataDevolucao, dias, totais);
}

function calcularTotaisItens(seletorLinhas, dias) {
  return [...document.querySelectorAll(seletorLinhas)].reduce((total, row) => {
    const jogoId = Number(row.querySelector('[data-jogo]').value);
    const quantidade = Number(row.querySelector('[data-quantidade]').value || 0);
    const jogo = jogos.find((item) => Number(item.id) === jogoId);

    if (!jogo || quantidade <= 0) {
      return total;
    }

    const diaria = Number(jogo.valor_aluguel || 0);
    const subtotalItem = diaria * quantidade * dias;
    const descontoItem = dias >= 3 ? Math.min(10, diaria * dias) * quantidade : 0;

    return {
      itens: total.itens + quantidade,
      subtotal: total.subtotal + subtotalItem,
      desconto: total.desconto + descontoItem
    };
  }, { itens: 0, subtotal: 0, desconto: 0 });
}

function montarResumoPeriodo(dataRetirada, dataDevolucao, dias, totais) {
  const subtotal = Number(totais.subtotal.toFixed(2));
  const desconto = Number(totais.desconto.toFixed(2));
  const total = Number((subtotal - desconto).toFixed(2));

  return `
    <div class="loan-summary-item">
      <span class="loan-summary-label">Retirada</span>
      <span class="loan-summary-value">${formatarDataVisual(dataRetirada)}</span>
    </div>
    <div class="loan-summary-item">
      <span class="loan-summary-label">Devolução</span>
      <span class="loan-summary-value">${formatarDataVisual(dataDevolucao)}</span>
    </div>
    <div class="loan-summary-item">
      <span class="loan-summary-label">Período</span>
      <span class="loan-summary-value">${dias} diária${dias > 1 ? 's' : ''}</span>
    </div>
    <div class="loan-summary-item">
      <span class="loan-summary-label">Itens</span>
      <span class="loan-summary-value">${totais.itens}</span>
    </div>
    <div class="loan-summary-item">
      <span class="loan-summary-label">Subtotal</span>
      <span class="loan-summary-value">${moeda(subtotal)}</span>
    </div>
    <div class="loan-summary-item">
      <span class="loan-summary-label">Desconto</span>
      <span class="loan-summary-value">${moeda(desconto)}</span>
    </div>
    <div class="loan-summary-item">
      <span class="loan-summary-label">Total previsto</span>
      <span class="loan-summary-value">${moeda(total)}</span>
    </div>
  `;
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function editar(id) {
  try {
    const resposta = await apiFetch(`/emprestimos/${id}`);
    const emprestimo = resposta.dados;
    document.getElementById('emprestimoIdEdicao').value = emprestimo.id;
    document.getElementById('dataPrevistaEdicao').value = String(emprestimo.data_prevista_devolucao).slice(0, 10);
    document.getElementById('statusEdicao').value = emprestimo.status;
    document.getElementById('observacoesEdicao').value = emprestimo.observacoes || '';
    modalEdicao.show();
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function devolver(id) {
  if (!confirm('Confirmar devolução deste empréstimo?')) return;
  try {
    await apiFetch(`/emprestimos/${id}/devolver`, { method: 'POST' });
    toast('Devolução registrada.');
    carregarEmprestimos();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function excluir(id) {
  if (!confirm('Confirma a exclusão deste empréstimo?')) return;
  try {
    await apiFetch(`/emprestimos/${id}`, { method: 'DELETE' });
    toast('Empréstimo removido.');
    carregarEmprestimos();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function baixarPdf() {
  try {
    const pdf = await apiFetch('/relatorios/emprestimos/pdf');
    baixarBlob(pdf, 'relatorio-emprestimos.pdf');
  } catch (erro) {
    tratarErro(erro);
  }
}

function formatarDataInput(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function ajustarDataDevolucaoMinima() {
  const retirada = document.getElementById('data_retirada').value;
  const devolucao = document.getElementById('data_prevista_devolucao');

  if (!retirada) return;

  devolucao.min = retirada;
  if (devolucao.value && devolucao.value < retirada) {
    devolucao.value = retirada;
  }
}

function calcularDiasPeriodo(dataRetirada, dataDevolucao) {
  const inicio = criarDataLocal(dataRetirada) || criarDataLocal(formatarDataInput(new Date()));
  const fim = criarDataLocal(dataDevolucao);

  if (!fim || fim <= inicio) {
    return 1;
  }

  const umDia = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.ceil((fim - inicio) / umDia));
}

function criarDataLocal(valor) {
  if (!valor) return null;
  const data = new Date(`${valor}T00:00:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}

function formatarDataVisual(valor) {
  const data = criarDataLocal(valor);
  if (!data) return '-';
  return data.toLocaleDateString('pt-BR');
}

