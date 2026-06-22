const PDFDocument = require('pdfkit');
const JogoDAO = require('../daos/JogoDAO');
const EmprestimoDAO = require('../daos/EmprestimoDAO');
const LogService = require('./LogService');

class RelatorioService {
  constructor(jogoDAO = new JogoDAO(), emprestimoDAO = new EmprestimoDAO(), logService = new LogService()) {
    this.jogoDAO = jogoDAO;
    this.emprestimoDAO = emprestimoDAO;
    this.logService = logService;
  }

  async gerarJogosPdf(filtros, usuario, contexto = {}) {
    const jogos = await this.jogoDAO.listar(filtros);
    const pdf = await gerarPdfBuffer((doc) => {
      cabecalho(doc, 'Relatorio de Jogos', usuario);
      tabela(doc, ['Titulo', 'Categoria', 'Tipo', 'Plataforma', 'Estoque', 'Diaria'], jogos.map((jogo) => [
          jogo.titulo,
          jogo.categoria_nome,
          jogo.tipo_jogo,
          jogo.plataforma || '-',
          String(jogo.estoque),
          `R$ ${Number(jogo.valor_aluguel).toFixed(2)}`
        ]), [120, 90, 70, 105, 55, 70]);
      rodapeResumo(doc, [{ label: 'Total de jogos', value: String(jogos.length) }]);
    });

    await this.registrarRelatorio('GERAR_RELATORIO_JOGOS', usuario, contexto, {
      total_jogos: jogos.length,
      filtros
    });

    return pdf;
  }

  async gerarEmprestimosPdf(filtros, usuario, contexto = {}) {
    const emprestimos = await this.emprestimoDAO.listar(filtros);
    const total = emprestimos.reduce((soma, item) => soma + Number(item.valor_total || 0), 0);

    const pdf = await gerarPdfBuffer((doc) => {
      cabecalho(doc, 'Relatorio de Emprestimos', usuario);
      tabela(doc, ['ID', 'Usuario', 'Jogos', 'Dias', 'Status', 'Desc.', 'Total'], emprestimos.map((emprestimo) => [
          String(emprestimo.id),
          emprestimo.usuario_nome,
          emprestimo.jogos_resumo || '-',
          String(emprestimo.dias_aluguel || 1),
          emprestimo.status,
          `R$ ${Number(emprestimo.desconto || 0).toFixed(2)}`,
          `R$ ${Number(emprestimo.valor_total).toFixed(2)}`
        ]), [35, 95, 165, 42, 65, 55, 60]);
      rodapeResumo(doc, [
        { label: 'Total de emprestimos', value: String(emprestimos.length) },
        { label: 'Total financeiro', value: `R$ ${total.toFixed(2)}` }
      ]);
    });

    await this.registrarRelatorio('GERAR_RELATORIO_EMPRESTIMOS', usuario, contexto, {
      total_emprestimos: emprestimos.length,
      total_financeiro: Number(total.toFixed(2)),
      filtros
    });

    return pdf;
  }

  async registrarRelatorio(acao, usuario, contexto, detalhes) {
    await this.logService.registrar({
      usuario: usuario?.email || 'sistema',
      endpoint: contexto.endpoint,
      metodo: contexto.metodo,
      status_code: 200,
      acao,
      ip: contexto.ip,
      detalhes
    });
  }
}

function gerarPdfBuffer(preencher) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    preencher(doc);
    doc.end();
  });
}

function cabecalho(doc, titulo, usuario) {
  doc
    .fontSize(18)
    .text(titulo, { align: 'center' })
    .moveDown(0.5)
    .fontSize(10)
    .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`)
    .text(`Usuario: ${usuario?.nome || usuario?.email || 'sistema'}`)
    .moveDown();
}

const TABELA_X = 40;
const TABELA_FUNDO_X = 36;
const TABELA_FUNDO_LARGURA = 523;
const ALTURA_LINHA = 18;
const LARGURAS_COLUNAS = [130, 100, 80, 90, 55, 80];

function tabela(doc, cabecalhoTabela, linhas, larguras = LARGURAS_COLUNAS) {
  linha(doc, cabecalhoTabela, true, larguras);
  linhas.forEach((colunas) => {
    if (precisaNovaPagina(doc, ALTURA_LINHA)) {
      doc.addPage();
      linha(doc, cabecalhoTabela, true, larguras);
    }

    linha(doc, colunas, false, larguras);
  });
}

function linha(doc, colunas, destaque = false, larguras = LARGURAS_COLUNAS) {
  const y = doc.y;

  if (destaque) {
    doc.rect(TABELA_FUNDO_X, y - 3, TABELA_FUNDO_LARGURA, ALTURA_LINHA).fill('#f1f5f9').fillColor('#111827');
  }

  doc.fontSize(10).fillColor('#111827');
  colunas.forEach((valor, index) => {
    const x = TABELA_X + larguras.slice(0, index).reduce((a, b) => a + b, 0);
    const largura = larguras[index];
    doc.text(ajustarTexto(doc, valor, largura), x, y, {
      width: largura,
      height: ALTURA_LINHA,
      lineBreak: false
    });
  });

  doc.x = TABELA_X;
  doc.y = y + ALTURA_LINHA;
}

function precisaNovaPagina(doc, altura) {
  return doc.y + altura > doc.page.height - doc.page.margins.bottom;
}

function ajustarTexto(doc, valor, largura) {
  const texto = String(valor ?? '-');
  const larguraUtil = largura - 6;

  if (doc.widthOfString(texto) <= larguraUtil) {
    return texto;
  }

  let reduzido = texto;
  while (reduzido.length > 3 && doc.widthOfString(`${reduzido}...`) > larguraUtil) {
    reduzido = reduzido.slice(0, -1);
  }

  return `${reduzido.trimEnd()}...`;
}

function rodapeResumo(doc, linhas) {
  const alturaLinha = 16;
  const altura = linhas.length * alturaLinha + 12;
  let y = doc.y + 14;

  if (precisaNovaPagina(doc, altura + 14)) {
    doc.addPage();
    y = doc.page.margins.top;
  }

  linhas.forEach((linhaResumo, index) => {
    doc
      .fontSize(10)
      .fillColor('#111827')
      .text(`${linhaResumo.label}: ${linhaResumo.value}`, TABELA_X, y + index * alturaLinha, {
        width: TABELA_FUNDO_LARGURA,
        lineBreak: false
      });
  });

  doc.y = y + altura;
  doc.fillColor('#111827');
}

module.exports = RelatorioService;
