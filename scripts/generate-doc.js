#!/usr/bin/env node
/**
 * EmpresaIQ eBook — Gerador de Word (.docx)
 * Uso: npm run doc
 */

const {
  Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  AlignmentType, WidthType, Packer, PageBreak, BorderStyle,
  ExternalHyperlink, UnderlineType, ImageRun,
} = require('docx');
const { marked } = require('marked');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const MERMAID_JS = path.join(__dirname, '..', 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const BASE_OUTPUT = path.join(__dirname, '..', 'EmpresaIQ-eBook.docx');

const DOC_FILES = [
  '00-ai-impactos-custos-industria.md',
  '01-introducao.md',
  '02-porque-ia-local.md',
  '03-limitacoes-hardware.md',
  '04-escolha-modelo.md',
  '05-gguf-quantizacao.md',
  '06-instalacao-ambiente.md',
  '07-configuracao-python.md',
  '08-instalacao-llamacpp.md',
  '09-download-modelo.md',
  '10-criacao-ferramentas.md',
  '11-construcao-agente.md',
  '12-optimizacoes-cpu.md',
  '13-interface-chat.md',
  '14-automatizacao.md',
  '15-seguranca-privacidade.md',
  '16-melhorias-futuras.md',
  '17-conclusao.md',
  '18-qwen-agente.md',
  '19-memoria-conversacional.md',
  '20-ontologias.md',
];

// Brand colours
const BRAND_BLUE  = '1D2951';
const BRAND_ORANGE = 'E8720C';
const CODE_BG     = 'F2F2F2';
const QUOTE_BG    = 'FFF8F0';

// ────────────────────────────────────────────────────────
// Mermaid rendering
// ────────────────────────────────────────────────────────

/** Parse PNG IHDR to get width/height without an extra package */
function getPngDimensions(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Collect unique mermaid diagram texts from a token tree */
function collectMermaidDiagrams(tokens, set) {
  for (const tok of tokens) {
    if (tok.type === 'code' && tok.lang && tok.lang.toLowerCase() === 'mermaid') {
      set.add(tok.text);
    }
    if (tok.tokens) collectMermaidDiagrams(tok.tokens, set);
    if (tok.items)  tok.items.forEach(i => i.tokens && collectMermaidDiagrams(i.tokens, set));
  }
}

const DIAGRAM_SCALE = 3; // deviceScaleFactor — higher = sharper (3× = retina quality)

/** Render one mermaid diagram to a PNG Buffer using a shared browser page */
async function renderMermaidDiagram(browser, diagramText, index) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: DIAGRAM_SCALE });
  try {
    await page.setContent(
      `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>
        body { margin: 24px; background: white; font-family: 'Segoe UI', Arial, sans-serif; }
        .mermaid { display: inline-block; max-width: 100%; }
        .mermaid svg { max-width: 100%; height: auto; }
      </style>
      </head><body><div class="mermaid">${diagramText}</div></body></html>`,
      { waitUntil: 'domcontentloaded', timeout: 15000 }
    );
    await page.addScriptTag({ path: MERMAID_JS });
    await page.evaluate(async () => {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          fontSize:          '18px',
          primaryColor:      '#E8F4FD',
          primaryTextColor:  '#1D2951',
          primaryBorderColor:'#1D2951',
          lineColor:         '#1D2951',
          secondaryColor:    '#FFF3E0',
          tertiaryColor:     '#F5F5F5',
          edgeLabelBackground:'#FFFFFF',
          clusterBkg:        '#F0F4FF',
          titleColor:        '#1D2951',
        },
        flowchart: { curve: 'basis', padding: 20 },
        sequence: { actorMargin: 60, messageMargin: 35 },
      });
      await window.mermaid.run({ querySelector: '.mermaid' });
    });
    await page.waitForFunction(
      () => !!document.querySelector('.mermaid svg'),
      { timeout: 12000 }
    );
    // Expand SVG to its natural size before screenshot
    await page.evaluate(() => {
      const svg = document.querySelector('.mermaid svg');
      if (svg) {
        svg.removeAttribute('style');
        svg.style.maxWidth = 'none';
      }
    });
    const el = await page.$('.mermaid');
    const shot = await el.screenshot({ type: 'png' });
    await page.close();
    return Buffer.from(shot);
  } catch (err) {
    console.warn(`  ⚠️  Diagrama ${index + 1} falhou: ${err.message.split('\n')[0]}`);
    try { await page.close(); } catch {}
    return null;
  }
}

// ────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────

function stripFrontmatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end !== -1) return content.slice(end + 3).trimStart();
  }
  return content;
}

/** Convert inline token array → TextRun[] */
function inlineToRuns(tokens, baseStyle = {}) {
  if (!tokens || tokens.length === 0) return [new TextRun({ text: '', ...baseStyle })];
  const runs = [];
  for (const tok of tokens) {
    switch (tok.type) {
      case 'text':
        runs.push(new TextRun({ text: tok.text, ...baseStyle }));
        break;
      case 'strong': {
        const inner = tok.tokens ? inlineToRuns(tok.tokens, { ...baseStyle, bold: true }) : [new TextRun({ text: tok.text, bold: true, ...baseStyle })];
        runs.push(...inner);
        break;
      }
      case 'em': {
        const inner = tok.tokens ? inlineToRuns(tok.tokens, { ...baseStyle, italics: true }) : [new TextRun({ text: tok.text, italics: true, ...baseStyle })];
        runs.push(...inner);
        break;
      }
      case 'codespan':
        runs.push(new TextRun({
          text: tok.text,
          font: 'Courier New',
          size: 18,
          shading: { fill: CODE_BG },
          ...baseStyle,
        }));
        break;
      case 'link':
        runs.push(new TextRun({
          text: tok.text,
          color: '0563C1',
          underline: { type: UnderlineType.SINGLE },
          ...baseStyle,
        }));
        break;
      case 'br':
        runs.push(new TextRun({ break: 1 }));
        break;
      default:
        if (tok.raw) runs.push(new TextRun({ text: tok.raw, ...baseStyle }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text: '' })];
}

/** Paragraph from inline tokens with optional paragraph options */
function inlineParagraph(tokens, paragraphOpts = {}) {
  return new Paragraph({ children: inlineToRuns(tokens), ...paragraphOpts });
}

/** Build docx elements from a list of block tokens.
 *  @param {object[]} tokens - marked token array
 *  @param {Map<string,Buffer>} diagramCache - mermaid text → PNG buffer
 */
function tokensToElements(tokens, diagramCache = new Map()) {
  const elements = [];

  for (const tok of tokens) {
    switch (tok.type) {
      // ── Headings ──────────────────────────────────────
      case 'heading': {
        const levelMap = {
          1: HeadingLevel.HEADING_1,
          2: HeadingLevel.HEADING_2,
          3: HeadingLevel.HEADING_3,
          4: HeadingLevel.HEADING_4,
          5: HeadingLevel.HEADING_5,
          6: HeadingLevel.HEADING_6,
        };
        elements.push(new Paragraph({
          heading: levelMap[tok.depth] || HeadingLevel.HEADING_3,
          children: inlineToRuns(tok.tokens || [{ type: 'text', text: tok.text }]),
        }));
        break;
      }

      // ── Paragraph ─────────────────────────────────────
      case 'paragraph':
        elements.push(inlineParagraph(tok.tokens || [], {
          spacing: { after: 160 },
        }));
        break;

      // ── Code block ────────────────────────────────────
      case 'code': {
        const lang = (tok.lang || '').toLowerCase();
        if (lang === 'mermaid') {
          const png = diagramCache.get(tok.text);
          if (png) {
            // PNG pixels are DIAGRAM_SCALE× the logical size — divide back to get display pixels
            const { width: rawW, height: rawH } = getPngDimensions(png);
            const logicalW = rawW / DIAGRAM_SCALE;
            const logicalH = rawH / DIAGRAM_SCALE;
            const MAX_W = 580;
            const scale = Math.min(1, MAX_W / logicalW);
            elements.push(new Paragraph({
              children: [new ImageRun({
                data: png,
                transformation: {
                  width:  Math.round(logicalW * scale),
                  height: Math.round(logicalH * scale),
                },
              })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 160, after: 160 },
            }));
          } else {
            elements.push(new Paragraph({
              children: [new TextRun({
                text: '[Diagrama — ver versão web]',
                italics: true,
                color: '888888',
              })],
              spacing: { before: 80, after: 80 },
              indent: { left: 360 },
            }));
          }
          break;
        }
        // Split code into lines, one paragraph each
        const lines = tok.text.split('\n');
        // Opening border paragraph
        elements.push(new Paragraph({
          children: [new TextRun({ text: '' })],
          spacing: { before: 120, after: 0 },
          shading: { fill: CODE_BG },
          border: {
            top:    { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
            left:   { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
            right:  { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
            bottom: { style: BorderStyle.NONE,   size: 0, color: 'CCCCCC' },
          },
        }));
        for (let i = 0; i < lines.length; i++) {
          const isLast = i === lines.length - 1;
          elements.push(new Paragraph({
            children: [new TextRun({
              text: lines[i] || '\u00A0',
              font: 'Courier New',
              size: 18,
              color: '333333',
            })],
            spacing: { before: 0, after: 0 },
            shading: { fill: CODE_BG },
            indent: { left: 180, right: 180 },
            border: {
              left:   { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
              right:  { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
              ...(isLast ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } } : {}),
            },
          }));
        }
        elements.push(new Paragraph({
          children: [new TextRun({ text: '' })],
          spacing: { before: 0, after: 120 },
        }));
        break;
      }

      // ── Blockquote ────────────────────────────────────
      case 'blockquote': {
        const innerElements = tokensToElements(tok.tokens || [], diagramCache);
        // Re-wrap inner paragraphs with blockquote style
        for (const el of innerElements) {
          if (el instanceof Paragraph) {
            elements.push(new Paragraph({
              children: el.options && el.options.children ? el.options.children.map(r => {
                if (r instanceof TextRun) return new TextRun({ ...r.options, italics: true, color: '555555' });
                return r;
              }) : [new TextRun({ text: tok.text, italics: true, color: '555555' })],
              spacing: { before: 80, after: 80 },
              indent: { left: 440, right: 440 },
              shading: { fill: QUOTE_BG },
              border: {
                left: { style: BorderStyle.THICK, size: 12, color: BRAND_ORANGE },
              },
            }));
          }
        }
        break;
      }

      // ── Lists ─────────────────────────────────────────
      case 'list': {
        tok.items.forEach((item, idx) => {
          const bullet = tok.ordered ? `${idx + 1}.` : '•';
          const innerTokens = item.tokens?.[0]?.tokens || [{ type: 'text', text: item.text }];
          elements.push(new Paragraph({
            children: [
              new TextRun({ text: `${bullet}  `, bold: tok.ordered }),
              ...inlineToRuns(innerTokens),
            ],
            spacing: { before: 40, after: 40 },
            indent: { left: 440, hanging: 280 },
          }));
          // Nested lists
          if (item.tokens) {
            const nestedLists = item.tokens.filter(t => t.type === 'list');
            for (const nested of nestedLists) {
              nested.items.forEach((ni, ni_idx) => {
                const nb = nested.ordered ? `${ni_idx + 1}.` : '◦';
                const nt = ni.tokens?.[0]?.tokens || [{ type: 'text', text: ni.text }];
                elements.push(new Paragraph({
                  children: [new TextRun({ text: `${nb}  ` }), ...inlineToRuns(nt)],
                  spacing: { before: 20, after: 20 },
                  indent: { left: 880, hanging: 280 },
                }));
              });
            }
          }
        });
        break;
      }

      // ── Horizontal rule ───────────────────────────────
      case 'hr':
        elements.push(new Paragraph({
          children: [new TextRun({ text: '' })],
          spacing: { before: 200, after: 200 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          },
        }));
        break;

      // ── Table ─────────────────────────────────────────
      case 'table': {
        const headerRow = new TableRow({
          children: tok.header.map(cell => new TableCell({
            children: [new Paragraph({
              children: inlineToRuns(cell.tokens || [{ type: 'text', text: cell.text }], { bold: true, color: 'FFFFFF' }),
            })],
            shading: { fill: BRAND_BLUE },
            width: { size: Math.floor(9000 / tok.header.length), type: WidthType.DXA },
          })),
          tableHeader: true,
        });

        const bodyRows = tok.rows.map(row => new TableRow({
          children: row.map(cell => new TableCell({
            children: [new Paragraph({
              children: inlineToRuns(cell.tokens || [{ type: 'text', text: cell.text }]),
            })],
            width: { size: Math.floor(9000 / tok.header.length), type: WidthType.DXA },
          })),
        }));

        elements.push(new Table({
          rows: [headerRow, ...bodyRows],
          width: { size: 9000, type: WidthType.DXA },
        }));
        elements.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 160 } }));
        break;
      }

      // ── Space / HTML / other ──────────────────────────
      case 'space':
      case 'html':
        break;

      default:
        if (tok.text) {
          elements.push(new Paragraph({
            children: [new TextRun({ text: tok.text })],
            spacing: { after: 160 },
          }));
        }
    }
  }

  return elements;
}

// ────────────────────────────────────────────────────────
// Cover page
// ────────────────────────────────────────────────────────

function buildCoverPage() {
  return [
    new Paragraph({
      children: [new TextRun({ text: 'CAPA', bold: true, size: 22, color: BRAND_ORANGE })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '' })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BRAND_ORANGE } },
      spacing: { after: 1800 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'EmpresaIQ',
        bold: true,
        size: 72,
        color: BRAND_BLUE,
        font: 'Calibri',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'Agente de IA Local para a Sua Empresa',
        size: 36,
        color: BRAND_ORANGE,
        font: 'Calibri',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'Do Zero ao Agente Inteligente — sem Cloud, sem Custos, sem Limites',
        size: 24,
        italics: true,
        color: '555555',
        font: 'Calibri',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 900 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'Edição 2026',
        size: 22,
        color: BRAND_BLUE,
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 1400 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: `© ${new Date().getFullYear()} EmpresaIQ`,
        size: 20,
        color: '888888',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

function buildBackCoverPage() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      children: [new TextRun({ text: 'CONTRACAPA', bold: true, size: 22, color: BRAND_ORANGE })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '' })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BRAND_ORANGE } },
      spacing: { after: 1400 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'EmpresaIQ',
        bold: true,
        size: 60,
        color: BRAND_BLUE,
        font: 'Calibri',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'Agentes Inteligentes Locais com IA Open Source',
        size: 28,
        color: BRAND_ORANGE,
        font: 'Calibri',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'Obrigado por construir uma base de IA mais privada, previsível e controlada.',
        size: 22,
        color: '555555',
        font: 'Calibri',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'empresa.market-pro.digital',
        size: 20,
        color: BRAND_BLUE,
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: `© ${new Date().getFullYear()} EmpresaIQ`,
        size: 18,
        color: '888888',
      })],
      alignment: AlignmentType.CENTER,
    }),
  ];
}

// ────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────

async function run() {
  console.log('📄 EmpresaIQ — Gerador de Word\n');

  // ── Step 1: collect all unique mermaid diagrams ──────
  const diagramSet = new Set();
  for (const filename of DOC_FILES) {
    const filePath = path.join(DOCS_DIR, filename);
    if (!fs.existsSync(filePath)) continue;
    const content = stripFrontmatter(fs.readFileSync(filePath, 'utf8'));
    collectMermaidDiagrams(marked.lexer(content), diagramSet);
  }
  const diagrams = [...diagramSet];
  console.log(`🔷 Diagramas encontrados: ${diagrams.length}`);

  // ── Step 2: render all diagrams with puppeteer ───────
  const diagramCache = new Map();
  if (diagrams.length > 0) {
    console.log('🖼️  A renderizar diagramas...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    for (let i = 0; i < diagrams.length; i++) {
      process.stdout.write(`   Diagrama ${i + 1}/${diagrams.length}...`);
      const png = await renderMermaidDiagram(browser, diagrams[i], i);
      if (png) {
        diagramCache.set(diagrams[i], png);
        process.stdout.write(' ✓\n');
      } else {
        process.stdout.write(' ✗ (placeholder)\n');
      }
    }
    await browser.close();
  }

  // ── Step 3: build Word document ───────────────────────
  console.log('\n📝 A gerar documento...');
  const allElements = [...buildCoverPage()];

  for (const filename of DOC_FILES) {
    const filePath = path.join(DOCS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  Ficheiro não encontrado: ${filename}`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const content = stripFrontmatter(raw);
    const tokens = marked.lexer(content);
    const elements = tokensToElements(tokens, diagramCache);

    allElements.push(...elements);

    // Page break between chapters (after each file except the last)
    if (filename !== DOC_FILES[DOC_FILES.length - 1]) {
      allElements.push(new Paragraph({ children: [new PageBreak()] }));
    }

    console.log(`  ✓ ${filename}`);
  }

  allElements.push(...buildBackCoverPage());

  const doc = new Document({
    creator: 'EmpresaIQ',
    title: 'EmpresaIQ — Agente de IA Local',
    description: 'Guia completo para construir um agente de IA local para a sua empresa',
    styles: {
      default: {
        heading1: {
          run: { bold: true, size: 36, color: BRAND_BLUE, font: 'Calibri' },
          paragraph: { spacing: { before: 400, after: 160 } },
        },
        heading2: {
          run: { bold: true, size: 28, color: BRAND_BLUE, font: 'Calibri' },
          paragraph: { spacing: { before: 320, after: 120 } },
        },
        heading3: {
          run: { bold: true, size: 24, color: BRAND_ORANGE, font: 'Calibri' },
          paragraph: { spacing: { before: 240, after: 80 } },
        },
        document: {
          run: { size: 22, font: 'Calibri' },
          paragraph: { spacing: { line: 276 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top:    1080,
              right:  1080,
              bottom: 1080,
              left:   1080,
            },
          },
        },
        children: allElements,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  let outFile = BASE_OUTPUT;
  try {
    fs.writeFileSync(outFile, buffer);
  } catch (e) {
    if (e.code === 'EBUSY' || e.code === 'EPERM') {
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      outFile = path.join(__dirname, '..', `EmpresaIQ-eBook-${ts}.docx`);
      fs.writeFileSync(outFile, buffer);
      console.warn(`  ⚠️  Ficheiro original bloqueado — guardado em: ${path.basename(outFile)}`);
    } else {
      throw e;
    }
  }
  console.log(`\n✅ Documento gerado: ${path.basename(outFile)}`);
  console.log(`   Tamanho: ${(buffer.length / 1024).toFixed(1)} KB`);
}

run().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
