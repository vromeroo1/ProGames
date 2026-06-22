import { apiFetch, exigirUsuarioAutenticado } from './api.js';
import { montarNavbar, toast, tratarErro, moeda, atualizarIcones, textoTipoJogo, textoPt, capaJogo } from './ui.js';

const modalReserva = new bootstrap.Modal(document.getElementById('modalReserva'));
const formReserva = document.getElementById('formReserva');
let tipoAtual = '';
let jogosCatalogo = [];
let jogosReserva = [];

exigirUsuarioAutenticado();
montarNavbar('catalogo');
iniciar();

document.getElementById('formFiltroCatalogo').addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarCatalogo();
});

document.querySelectorAll('[data-tipo-tab]').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('[data-tipo-tab]').forEach((item) => item.classList.remove('active'));
    botao.classList.add('active');
    tipoAtual = botao.dataset.tipoTab;
    carregarCatalogo();
  });
});

formReserva.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  if (!formReserva.checkValidity()) {
    formReserva.classList.add('was-validated');
    return;
  }

  const itens = [...document.querySelectorAll('#listaItensReserva .item-row')].map((row) => ({
    jogo_id: Number(row.querySelector('[data-jogo]').value),
    quantidade: Number(row.querySelector('[data-quantidade]').value)
  }));

  if (itens.length === 0) {
    toast('Adicione pelo menos um jogo à reserva.');
    return;
  }

  try {
    await apiFetch('/reservas', {
      method: 'POST',
      body: {
        data_retirada: document.getElementById('dataRetiradaReserva').value,
        data_prevista_devolucao: document.getElementById('dataPrevistaReserva').value,
        itens
      }
    });
    toast('Reserva solicitada. Aguarde a aprovação do administrador.');
    modalReserva.hide();
    jogosReserva = [];
    carregarCatalogo();
  } catch (erro) {
    tratarErro(erro);
  }
});

document.getElementById('btnAdicionarItemReserva').addEventListener('click', () => adicionarItemReserva());
document.getElementById('dataRetiradaReserva').addEventListener('change', () => {
  ajustarDataDevolucaoReservaMinima();
  atualizarResumoReserva();
});
document.getElementById('dataPrevistaReserva').addEventListener('change', atualizarResumoReserva);

async function iniciar() {
  await carregarCategorias();
  await carregarCatalogo();
}

async function carregarCategorias() {
  const resposta = await apiFetch('/categorias');
  document.getElementById('categoriaFiltro').innerHTML = '<option value="">Todos</option>'
    + resposta.dados.map((categoria) => `<option value="${categoria.id}">${textoPt(categoria.nome)}</option>`).join('');
}

async function carregarCatalogo() {
  try {
    const params = new URLSearchParams({
      busca: document.getElementById('busca').value,
      categoria_id: document.getElementById('categoriaFiltro').value,
      tipo_jogo: tipoAtual,
      disponiveis: '1'
    });

    const plataforma = document.getElementById('plataformaFiltro').value;
    if (plataforma) params.set('plataforma', plataforma);

    const resposta = await apiFetch(`/jogos?${params}`);
    jogosCatalogo = resposta.dados;
    const grid = document.getElementById('catalogoGrid');
    grid.innerHTML = jogosCatalogo.map(cardJogo).join('')
      || '<div class="app-card p-4 text-center text-muted">Nenhum jogo disponível com esses filtros.</div>';

    grid.querySelectorAll('[data-reservar]').forEach((botao) => {
      botao.addEventListener('click', async () => {
        try {
          await abrirReserva(botao.dataset.reservar);
        } catch (erro) {
          tratarErro(erro);
        }
      });
    });
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

function cardJogo(jogo) {
  return `
    <article class="app-card catalog-card">
      <img class="catalog-cover" src="${capaJogo(jogo)}" alt="Capa de ${textoPt(jogo.titulo)}">
      <div class="catalog-body">
        <div class="d-flex justify-content-between gap-2">
          <span class="badge text-bg-light">${textoTipoJogo(jogo.tipo_jogo)}</span>
          <span class="badge text-bg-warning">${jogo.estoque} disp.</span>
        </div>
        <h2 class="catalog-title h6">${textoPt(jogo.titulo)}</h2>
        <p class="text-muted small mb-0">${textoPt(jogo.descricao || '')}</p>
        <div class="catalog-meta small">
          <div><strong>Plataforma:</strong> ${jogo.plataforma || '-'}</div>
          <div><strong>Gênero:</strong> ${textoPt(jogo.categoria_nome)}</div>
          <div><strong>Diária:</strong> ${moeda(jogo.valor_aluguel)}/dia</div>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <strong>${jogo.tipo_jogo === 'boardgame' ? 'Mesa' : 'Console'}</strong>
          <button class="btn btn-primary btn-sm" data-reservar="${jogo.id}">
            Reservar
          </button>
        </div>
      </div>
    </article>
  `;
}

async function abrirReserva(id) {
  await carregarJogosReserva();
  formReserva.reset();
  formReserva.classList.remove('was-validated');
  document.getElementById('listaItensReserva').innerHTML = '';

  const dataRetirada = new Date();
  const dataDevolucao = new Date(dataRetirada);
  dataDevolucao.setDate(dataDevolucao.getDate() + 3);
  document.getElementById('dataRetiradaReserva').value = formatarDataInput(dataRetirada);
  document.getElementById('dataPrevistaReserva').value = formatarDataInput(dataDevolucao);
  ajustarDataDevolucaoReservaMinima();
  adicionarItemReserva(id);
  atualizarResumoReserva();
  modalReserva.show();
}

async function carregarJogosReserva() {
  if (jogosReserva.length > 0) return;

  const resposta = await apiFetch('/jogos?disponiveis=1');
  jogosReserva = resposta.dados;
}

function adicionarItemReserva(jogoSelecionadoId = '') {
  const lista = document.getElementById('listaItensReserva');
  const div = document.createElement('div');
  div.className = 'item-row';
  div.innerHTML = `
    <div class="loan-game-field">
      <select class="form-select" data-jogo required>
        ${jogosReserva.map((jogo) => `<option value="${jogo.id}">${rotuloJogoReserva(jogo)}</option>`).join('')}
      </select>
      <div class="selected-game-info" data-jogo-info></div>
    </div>
    <input type="number" class="form-control" data-quantidade min="1" value="1" required aria-label="Quantidade" title="Quantidade">
    <button type="button" class="btn btn-outline-danger" title="Remover item">Remover</button>
  `;

  const select = div.querySelector('[data-jogo]');
  const quantidade = div.querySelector('[data-quantidade]');
  if (jogoSelecionadoId) {
    select.value = String(jogoSelecionadoId);
  }

  select.addEventListener('change', () => {
    atualizarResumoJogoReserva(div);
    atualizarResumoReserva();
  });
  quantidade.addEventListener('input', atualizarResumoReserva);
  div.querySelector('button').addEventListener('click', () => {
    div.remove();
    atualizarResumoReserva();
  });

  lista.appendChild(div);
  atualizarResumoJogoReserva(div);
  atualizarResumoReserva();
}

function rotuloJogoReserva(jogo) {
  return [
    textoPt(jogo.titulo),
    jogo.plataforma,
    textoPt(jogo.categoria_nome),
    `${moeda(jogo.valor_aluguel)}/dia`,
    `estoque ${jogo.estoque}`
  ].map(escaparHtml).join(' | ');
}

function atualizarResumoJogoReserva(row) {
  const select = row.querySelector('[data-jogo]');
  const info = row.querySelector('[data-jogo-info]');
  const jogo = jogosReserva.find((item) => Number(item.id) === Number(select.value));

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

function atualizarResumoReserva() {
  const dataRetirada = document.getElementById('dataRetiradaReserva').value;
  const dataDevolucao = document.getElementById('dataPrevistaReserva').value;
  const dias = calcularDiasPeriodo(dataRetirada, dataDevolucao);
  const totais = calcularTotaisReserva(dias);
  const subtotal = Number(totais.subtotal.toFixed(2));
  const desconto = Number(totais.desconto.toFixed(2));
  const total = Number((subtotal - desconto).toFixed(2));

  document.getElementById('resumoReserva').innerHTML = `
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

function calcularTotaisReserva(dias) {
  return [...document.querySelectorAll('#listaItensReserva .item-row')].reduce((total, row) => {
    const jogoId = Number(row.querySelector('[data-jogo]').value);
    const quantidade = Number(row.querySelector('[data-quantidade]').value || 0);
    const jogo = jogosReserva.find((item) => Number(item.id) === jogoId);

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

function calcularDiasPeriodo(dataRetirada, dataDevolucao) {
  const inicio = criarDataLocal(dataRetirada) || criarDataLocal(formatarDataInput(new Date()));
  const fim = criarDataLocal(dataDevolucao);

  if (!fim || fim <= inicio) {
    return 1;
  }

  return Math.max(1, Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)));
}

function formatarDataInput(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function ajustarDataDevolucaoReservaMinima() {
  const retirada = document.getElementById('dataRetiradaReserva').value;
  const devolucao = document.getElementById('dataPrevistaReserva');

  if (!retirada) return;

  devolucao.min = retirada;
  if (devolucao.value && devolucao.value < retirada) {
    devolucao.value = retirada;
  }
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

function escaparHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

