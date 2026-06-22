import { apiFetch, limparSessao, usuarioLogado, caminhoIndex } from './api.js';

export function montarNavbar(ativo) {
  const usuario = usuarioLogado();
  const alvo = document.getElementById('navbar');
  if (!alvo) return;

  const admin = usuario?.tipo_usuario === 'admin';
  const itens = admin ? [
    ['dashboard', 'Dashboard', 'dashboard.html'],
    ['jogos', 'Jogos', 'jogos.html'],
    ['categorias', 'Categorias', 'categorias.html'],
    ['usuarios', 'Usuários', 'usuarios.html'],
    ['emprestimos', 'Empréstimos/Reservas', 'emprestimos.html'],
    ['relatorios', 'Relatórios', 'relatorios.html'],
    ['importacao', 'Importação/Exportação', 'importacao.html'],
    ['logs', 'Logs', 'logs.html']
  ] : [
    ['catalogo', 'Catálogo', 'catalogo.html'],
    ['minhas-reservas', 'Minhas Reservas', 'minhas-reservas.html'],
    ['historico', 'Histórico', 'historico.html'],
    ['perfil', 'Meu Perfil', 'perfil.html']
  ];

  alvo.innerHTML = `
    <aside class="app-sidebar">
      <a class="brand-mark" href="${admin ? 'dashboard.html' : 'catalogo.html'}">
        <span class="brand-symbol">PG</span>
        <span>ProGames</span>
      </a>
      <span class="sidebar-role">${admin ? 'Painel Administrativo' : 'Área do Usuário'}</span>
      <nav class="sidebar-nav" aria-label="Menu principal">
        ${itens.map(([id, label, href]) => `
          <a class="nav-link ${ativo === id ? 'active' : ''}" href="${href}">
            ${label}
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="user-chip">
          <span>${admin ? 'Administrador da Locadora' : (usuario?.nome || usuario?.email || '')}</span>
          <small>${admin ? 'Administrador' : 'Usuário'}</small>
        </div>
        <button class="btn btn-ghost btn-sm w-100" data-logout>
          Sair
        </button>
      </div>
    </aside>
    <header class="mobile-bar">
      <a class="brand-mark" href="${admin ? 'dashboard.html' : 'catalogo.html'}">
        <span class="brand-symbol">PG</span>
        <span>ProGames</span>
      </a>
      <button class="btn btn-ghost btn-sm" data-logout>
        Sair
      </button>
    </header>
  `;

  document.querySelectorAll('[data-logout]').forEach((botao) => botao.addEventListener('click', async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (erro) {
      console.warn(erro);
    }
    limparSessao();
    window.location.href = caminhoIndex();
  }));

  atualizarIcones();
}

export function toast(mensagem, tipo = 'success') {
  const container = obterToastContainer();
  const id = `toast-${Date.now()}`;
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-bg-${tipo} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${mensagem}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `);
  const elemento = document.getElementById(id);
  const instancia = new bootstrap.Toast(elemento, { delay: 3600 });
  instancia.show();
  elemento.addEventListener('hidden.bs.toast', () => elemento.remove());
}

export function tratarErro(erro) {
  const detalhes = Array.isArray(erro?.detalhes) ? ` ${erro.detalhes.join(', ')}` : '';
  toast(`${erro?.mensagem || 'Erro ao processar solicitação.'}${detalhes}`, 'danger');
}

export function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function badgeStatus(status) {
  const mapa = {
    pendente: 'warning',
    aprovado: 'info',
    retirado: 'primary',
    atrasado: 'danger',
    devolvido: 'success',
    cancelado: 'secondary'
  };
  return `<span class="badge text-bg-${mapa[status] || 'secondary'} status-badge">${status}</span>`;
}

export function textoTipoJogo(tipo) {
  return tipo === 'boardgame' ? 'Board Games' : 'Video Games';
}

export function textoPt(valor) {
  if (valor === null || valor === undefined) return '';

  const texto = String(valor);
  const substituicoes = [
    [/\bAcao\b/g, 'Ação'],
    [/\bacao\b/g, 'ação'],
    [/\bEstrategia\b/g, 'Estratégia'],
    [/\bestrategia\b/g, 'estratégia'],
    [/\bFamilia\b/g, 'Família'],
    [/\bfamilia\b/g, 'família'],
    [/\bSimulacao\b/g, 'Simulação'],
    [/\bsimulacao\b/g, 'simulação'],
    [/\bInvestigacao\b/g, 'Investigação'],
    [/\binvestigacao\b/g, 'investigação'],
    [/\bDeducao\b/g, 'Dedução'],
    [/\bdeducao\b/g, 'dedução'],
    [/\bTraicao\b/g, 'Traição'],
    [/\btraicao\b/g, 'traição'],
    [/\bCivilizacoes\b/g, 'Civilizações'],
    [/\bcivilizacoes\b/g, 'civilizações'],
    [/\bSimultaneas\b/g, 'Simultâneas'],
    [/\bsimultaneas\b/g, 'simultâneas'],
    [/\bClassico\b/g, 'Clássico'],
    [/\bclassico\b/g, 'clássico'],
    [/\bClassicos\b/g, 'Clássicos'],
    [/\bclassicos\b/g, 'clássicos'],
    [/\bClassicas\b/g, 'Clássicas'],
    [/\bclassicas\b/g, 'clássicas'],
    [/\bTatico\b/g, 'Tático'],
    [/\btatico\b/g, 'tático'],
    [/\bTatica\b/g, 'Tática'],
    [/\btatica\b/g, 'tática'],
    [/\bEpica\b/g, 'Épica'],
    [/\bepica\b/g, 'épica'],
    [/\bNordica\b/g, 'Nórdica'],
    [/\bnordica\b/g, 'nórdica'],
    [/\bAmeacas\b/g, 'Ameaças'],
    [/\bameacas\b/g, 'ameaças'],
    [/\bFiccao\b/g, 'Ficção'],
    [/\bficcao\b/g, 'ficção'],
    [/\bRapido\b/g, 'Rápido'],
    [/\brapido\b/g, 'rápido'],
    [/\bRapida\b/g, 'Rápida'],
    [/\brapida\b/g, 'rápida'],
    [/\bRapidas\b/g, 'Rápidas'],
    [/\brapidas\b/g, 'rápidas'],
    [/\bEstrategica\b/g, 'Estratégica'],
    [/\bestrategica\b/g, 'estratégica'],
    [/\bEstrategicas\b/g, 'Estratégicas'],
    [/\bestrategicas\b/g, 'estratégicas'],
    [/\bPrecisao\b/g, 'Precisão'],
    [/\bprecisao\b/g, 'precisão'],
    [/\bHistoria\b/g, 'História'],
    [/\bhistoria\b/g, 'história'],
    [/\bSensivel\b/g, 'Sensível'],
    [/\bsensivel\b/g, 'sensível'],
    [/\bConstrucao\b/g, 'Construção'],
    [/\bconstrucao\b/g, 'construção'],
    [/\bExploracao\b/g, 'Exploração'],
    [/\bexploracao\b/g, 'exploração'],
    [/\bSobrevivencia\b/g, 'Sobrevivência'],
    [/\bsobrevivencia\b/g, 'sobrevivência'],
    [/\bPontuacao\b/g, 'Pontuação'],
    [/\bpontuacao\b/g, 'pontuação'],
    [/\bPolitica\b/g, 'Política'],
    [/\bpolitica\b/g, 'política'],
    [/\bDimensoes\b/g, 'Dimensões'],
    [/\bdimensoes\b/g, 'dimensões'],
    [/\bMecanicas\b/g, 'Mecânicas'],
    [/\bmecanicas\b/g, 'mecânicas'],
    [/\bCooperacao\b/g, 'Cooperação'],
    [/\bcooperacao\b/g, 'cooperação'],
    [/\bExpansao\b/g, 'Expansão'],
    [/\bexpansao\b/g, 'expansão'],
    [/\bFormula\b/g, 'Fórmula'],
    [/\bformula\b/g, 'fórmula'],
    [/\bDinamicos\b/g, 'Dinâmicos'],
    [/\bdinamicos\b/g, 'dinâmicos'],
    [/\bTerritorios\b/g, 'Territórios'],
    [/\bterritorios\b/g, 'territórios'],
    [/\bColonias\b/g, 'Colônias'],
    [/\bcolonias\b/g, 'colônias'],
    [/\bAliancas\b/g, 'Alianças'],
    [/\baliancas\b/g, 'alianças'],
    [/\bFaccoes\b/g, 'Facções'],
    [/\bfaccoes\b/g, 'facções'],
    [/\bPapeis\b/g, 'Papéis'],
    [/\bpapeis\b/g, 'papéis'],
    [/\bPecas\b/g, 'Peças'],
    [/\bpecas\b/g, 'peças'],
    [/\bDoencas\b/g, 'Doenças'],
    [/\bdoencas\b/g, 'doenças'],
    [/\bEliminacao\b/g, 'Eliminação'],
    [/\beliminacao\b/g, 'eliminação'],
    [/\bVersao\b/g, 'Versão'],
    [/\bversao\b/g, 'versão'],
    [/\bAte\b/g, 'Até'],
    [/\bate\b/g, 'até'],
    [/\bMao\b/g, 'Mão'],
    [/\bmao\b/g, 'mão'],
    [/\bAcessiveis\b/g, 'Acessíveis'],
    [/\bacessiveis\b/g, 'acessíveis'],
    [/\bAcessivel\b/g, 'Acessível'],
    [/\bacessivel\b/g, 'acessível'],
    [/\bDecoracao\b/g, 'Decoração'],
    [/\bdecoracao\b/g, 'decoração'],
    [/\bNegociacao\b/g, 'Negociação'],
    [/\bnegociacao\b/g, 'negociação'],
    [/\bAlugueis\b/g, 'Aluguéis'],
    [/\balugueis\b/g, 'aluguéis'],
    [/\bFerroviarias\b/g, 'Ferroviárias'],
    [/\bferroviarias\b/g, 'ferroviárias'],
    [/\bSubterraneo\b/g, 'Subterrâneo'],
    [/\bsubterraneo\b/g, 'subterrâneo'],
    [/\bCaca\b/g, 'Caça'],
    [/\bcaca\b/g, 'caça'],
    [/\bColocacao\b/g, 'Colocação'],
    [/\bcolocacao\b/g, 'colocação'],
    [/\bCientifica\b/g, 'Científica'],
    [/\bcientifica\b/g, 'científica'],
    [/\bMemoraveis\b/g, 'Memoráveis'],
    [/\bmemoraveis\b/g, 'memoráveis'],
    [/\bMitologico\b/g, 'Mitológico'],
    [/\bmitologico\b/g, 'mitológico'],
    [/\bAssimetrica\b/g, 'Assimétrica'],
    [/\bassimetrica\b/g, 'assimétrica'],
    [/\bNumeros\b/g, 'Números'],
    [/\bnumeros\b/g, 'números'],
    [/\bImobiliario\b/g, 'Imobiliário'],
    [/\bPokemon\b/g, 'Pokémon']
  ];

  return substituicoes.reduce((resultado, [busca, troca]) => resultado.replace(busca, troca), texto);
}

export function capaJogo(jogo) {
  if (jogo?.imagem && (jogo.imagem.startsWith('/uploads/') || jogo.imagem.startsWith('http'))) {
    return jogo.imagem;
  }

  const mapa = {
    PS5: '../assets/img/default-ps5.jpg',
    'Xbox Series X|S': '../assets/img/default-xbox.jpg',
    'Nintendo Switch': '../assets/img/default-switch.jpg',
    'Nintendo Switch 2': '../assets/img/default-switch-2.jpg',
    'Board Game': '../assets/img/default-boardgame.jpg'
  };

  return mapa[jogo?.plataforma] || '../assets/img/default-boardgame.jpg';
}

export function atualizarIcones() {
  return true;
}

function obterToastContainer() {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
  }
  return container;
}

