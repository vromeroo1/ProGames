const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const origem = path.resolve(process.cwd(), 'docs/documentacao.md');
const destino = path.resolve(process.cwd(), 'docs/documentacao.pdf');

if (!fs.existsSync(origem)) {
  console.error('Arquivo docs/documentacao.md nao encontrado.');
  process.exit(1);
}

const markdown = fs.readFileSync(origem, 'utf8');
const doc = new PDFDocument({ margin: 48, size: 'A4' });
const stream = fs.createWriteStream(destino);

doc.pipe(stream);
doc.font('Helvetica');

markdown.split('\n').forEach((linhaOriginal) => {
  const linha = linhaOriginal.replace(/\r/g, '');

  if (linha.startsWith('# ')) {
    doc.moveDown(0.6).fontSize(18).font('Helvetica-Bold').text(linha.replace('# ', ''));
    doc.font('Helvetica').fontSize(11).moveDown(0.4);
  } else if (linha.startsWith('## ')) {
    doc.moveDown(0.5).fontSize(14).font('Helvetica-Bold').text(linha.replace('## ', ''));
    doc.font('Helvetica').fontSize(10).moveDown(0.2);
  } else if (linha.startsWith('- ')) {
    doc.fontSize(10).text(`• ${linha.replace('- ', '')}`, { indent: 12 });
  } else if (linha.trim().startsWith('```')) {
    doc.moveDown(0.1);
  } else if (linha.trim()) {
    doc.fontSize(10).font('Helvetica').text(linha, { lineGap: 2 });
  } else {
    doc.moveDown(0.35);
  }
});

doc.end();

stream.on('finish', () => {
  console.log(`Documentacao PDF gerada em ${destino}`);
});
