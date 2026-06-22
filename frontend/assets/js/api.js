export const API_URL = localStorage.getItem('api_url') || `${window.location.origin}/api`;

export function token() {
  return localStorage.getItem('token_locacao_jogos');
}

export function usuarioLogado() {
  const bruto = localStorage.getItem('usuario_locacao_jogos');
  return bruto ? JSON.parse(bruto) : null;
}

export function salvarSessao(dados) {
  localStorage.setItem('token_locacao_jogos', dados.token);
  localStorage.setItem('usuario_locacao_jogos', JSON.stringify(dados.usuario));
}

export function limparSessao() {
  localStorage.removeItem('token_locacao_jogos');
  localStorage.removeItem('usuario_locacao_jogos');
}

export function exigirLogin() {
  if (!token()) {
    window.location.href = caminhoIndex();
  }
}

export function exigirAdmin() {
  exigirLogin();
  if (usuarioLogado()?.tipo_usuario !== 'admin') {
    window.location.href = caminhoPaginaUsuario('catalogo.html');
  }
}

export function exigirUsuarioAutenticado() {
  exigirLogin();
  if (usuarioLogado()?.tipo_usuario === 'admin') {
    window.location.href = caminhoPaginaUsuario('dashboard.html');
  }
}

export function caminhoIndex() {
  return window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
}

export function caminhoPaginaUsuario(pagina) {
  return window.location.pathname.includes('/pages/') ? pagina : `pages/${pagina}`;
}

export async function apiFetch(caminho, opcoes = {}) {
  const headers = new Headers(opcoes.headers || {});

  if (token()) {
    headers.set('Authorization', `Bearer ${token()}`);
  }

  if (opcoes.body && !(opcoes.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers,
    body: opcoes.body && !(opcoes.body instanceof FormData) ? JSON.stringify(opcoes.body) : opcoes.body
  });

  const tipo = resposta.headers.get('content-type') || '';
  const dados = tipo.includes('application/json') ? await resposta.json() : await resposta.blob();

  if (!resposta.ok || dados.sucesso === false) {
    throw dados;
  }

  return dados;
}

export function baixarBlob(blob, nome) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}

