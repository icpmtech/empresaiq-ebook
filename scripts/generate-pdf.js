#!/usr/bin/env node
/**
 * EmpresaIQ eBook — Gerador de PDF
 * Uso: npm run pdf   (requer o servidor a correr: npm start)
 */

const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/docs';
const OUTPUT_DIR = path.join(__dirname, '..', '.pdf-tmp');
const FINAL_PDF = path.join(__dirname, '..', 'EmpresaIQ-eBook.pdf');

const CHAPTERS = [
  { slug: 'introducao',            title: '1. Introdução' },
  { slug: 'porque-ia-local',       title: '2. Porque usar IA Local' },
  { slug: 'limitacoes-hardware',   title: '3. Limitações de Hardware' },
  { slug: 'escolha-modelo',        title: '4. Escolha do Modelo Ideal' },
  { slug: 'gguf-quantizacao',      title: '5. GGUF e Quantização' },
  { slug: 'instalacao-ambiente',   title: '6. Instalação do Ambiente' },
  { slug: 'configuracao-python',   title: '7. Configuração Python' },
  { slug: 'instalacao-llamacpp',   title: '8. Instalação llama.cpp' },
  { slug: 'download-modelo',       title: '9. Download do Modelo' },
  { slug: 'criacao-ferramentas',   title: '10. Criação de Ferramentas' },
  { slug: 'construcao-agente',     title: '11. Construção do Agente' },
  { slug: 'optimizacoes-cpu',      title: '12. Optimizações CPU' },
  { slug: 'interface-chat',        title: '13. Interface de Chat' },
  { slug: 'automatizacao',         title: '14. Automatização' },
  { slug: 'seguranca-privacidade', title: '15. Segurança e Privacidade' },
  { slug: 'melhorias-futuras',     title: '16. Melhorias Futuras' },
  { slug: 'qwen-agente',           title: '17. Qwen2.5 no Agente' },
  { slug: 'memoria-conversacional',title: '18. Memória Conversacional' },
  { slug: 'ontologias',            title: '19. Ontologias e Estrutura de Conhecimento' },
  { slug: 'conclusao',             title: '20. Conclusão' },
];

// CSS injectado para esconder elementos de navegação no PDF
const PRINT_CSS = `
  .navbar, .theme-doc-sidebar-container, .theme-doc-toc-desktop,
  .pagination-nav, footer, .breadcrumbs,
  [class*="editThisPage"], [class*="lastUpdated"],
  [class*="tocCollapsibleButton"], [class*="announcementBar"] {
    display: none !important;
  }
  .main-wrapper { padding: 0 !important; }
  article { max-width: 100% !important; padding: 1rem 2rem !important; }
  body { background: white !important; color: #111 !important; }
  h1 { color: #1D2951 !important; border-bottom: 3px solid #E8720C; padding-bottom: .4rem; }
  h2 { color: #1D2951 !important; }
  pre { background: #f5f5f5 !important; border: 1px solid #ddd !important; }
  .docusaurus-mermaid-container { page-break-inside: avoid; }
  h1, h2, h3 { page-break-after: avoid; }
  table { page-break-inside: avoid; }
  .admonition { page-break-inside: avoid; border: 1px solid #ccc; padding: 1rem; margin: 1rem 0; }
`;

async function waitForMermaid(page) {
  try {
    await page.waitForFunction(() => {
      const containers = document.querySelectorAll('[class*="mermaid"]');
      if (containers.length === 0) return true;
      return [...containers].every(c => c.querySelector('svg') !== null);
    }, { timeout: 8000 });
  } catch {
    // Continua mesmo que o timeout expire
  }
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('🚀 EmpresaIQ — Gerador de PDF\n');
  console.log('   Certifique-se que o servidor está a correr: npm start\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const pdfPaths = [];

  for (const chapter of CHAPTERS) {
    const url = `${BASE_URL}/${chapter.slug}`;
    process.stdout.write(`  📄 ${chapter.title}...`);

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitForMermaid(page);

    // Injectar print CSS
    await page.addStyleTag({ content: PRINT_CSS });
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfPath = path.join(OUTPUT_DIR, `${chapter.slug}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '18mm', right: '18mm' },
    });

    pdfPaths.push(pdfPath);
    console.log(' ✓');
  }

  await browser.close();

  // Juntar todos os PDFs
  console.log('\n  📦 A juntar capítulos...');
  const merged = await PDFDocument.create();

  // Metadados do PDF
  merged.setTitle('EmpresaIQ — Agentes Inteligentes Locais com IA Open Source');
  merged.setAuthor('EmpresaIQ');
  merged.setSubject('Guia completo para criar agentes IA locais em hardware com 8 GB RAM');
  merged.setKeywords(['IA', 'LLM', 'llama.cpp', 'GGUF', 'agentes', 'Python', 'local']);
  merged.setCreator('EmpresaIQ PDF Generator');

  for (const pdfPath of pdfPaths) {
    const bytes = fs.readFileSync(pdfPath);
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }

  const finalBytes = await merged.save();
  fs.writeFileSync(FINAL_PDF, finalBytes);

  // Limpar temporários
  for (const p of pdfPaths) fs.unlinkSync(p);
  fs.rmdirSync(OUTPUT_DIR);

  const sizeMB = (fs.statSync(FINAL_PDF).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ PDF gerado com sucesso!`);
  console.log(`   📁 ${FINAL_PDF}`);
  console.log(`   📊 ${CHAPTERS.length} capítulos · ${sizeMB} MB\n`);
}

run().catch(err => {
  console.error('\n❌ Erro:', err.message);
  console.error('   Certifique-se que o servidor está a correr em http://localhost:3000\n');
  process.exit(1);
});
