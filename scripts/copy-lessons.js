/**
 * Copies lesson markdown files from docs/ to static/lessons/<slug>.md
 * so they can be fetched at runtime without webpack/MDX processing.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SLUG_TO_FILE = {
  'ai-impactos-custos-industria':          '00-ai-impactos-custos-industria.md',
  'introducao':                             '01-introducao.md',
  'porque-ia-local':                        '02-porque-ia-local.md',
  'limitacoes-hardware':                    '03-limitacoes-hardware.md',
  'escolha-modelo':                         '04-escolha-modelo.md',
  'gguf-quantizacao':                       '05-gguf-quantizacao.md',
  'instalacao-ambiente':                    '06-instalacao-ambiente.md',
  'configuracao-python':                    '07-configuracao-python.md',
  'instalacao-llamacpp':                    '08-instalacao-llamacpp.md',
  'download-modelo':                        '09-download-modelo.md',
  'criacao-ferramentas':                    '10-criacao-ferramentas.md',
  'construcao-agente':                      '11-construcao-agente.md',
  'optimizacoes-cpu':                       '12-optimizacoes-cpu.md',
  'interface-chat':                         '13-interface-chat.md',
  'automatizacao':                          '14-automatizacao.md',
  'seguranca-privacidade':                  '15-seguranca-privacidade.md',
  'melhorias-futuras':                      '16-melhorias-futuras.md',
  'conclusao':                              '17-conclusao.md',
  'qwen-agente':                            '18-qwen-agente.md',
  'memoria-conversacional':                 '19-memoria-conversacional.md',
  'ontologias':                             '20-ontologias.md',
  'openclaw-agentes-locais':                '21-openclaw-agentes-locais.md',
  'alucinacoes-fiabilidade-agentes':        '22-alucinacoes-fiabilidade-agentes.md',
  'ollama-ecossistema-inferencia-local':    '23-ollama-ecossistema-inferencia-local.md',
};

const destDir = path.join(ROOT, 'static', 'lessons');
fs.mkdirSync(destDir, { recursive: true });

let ok = 0, missing = 0;
for (const [slug, file] of Object.entries(SLUG_TO_FILE)) {
  const src = path.join(ROOT, 'docs', file);
  const dst = path.join(destDir, `${slug}.md`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    ok++;
  } else {
    console.warn(`  ⚠️  Missing: docs/${file}`);
    missing++;
  }
}
console.log(`✅ copy-lessons: ${ok} copied, ${missing} missing → static/lessons/`);
