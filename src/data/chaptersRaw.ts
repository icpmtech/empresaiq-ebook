// @ts-nocheck
// Raw markdown imports — loaded as plain text via webpack asset/source
import ch00 from '../../docs/00-ai-impactos-custos-industria.md?raw';
import ch01 from '../../docs/01-introducao.md?raw';
import ch02 from '../../docs/02-porque-ia-local.md?raw';
import ch03 from '../../docs/03-limitacoes-hardware.md?raw';
import ch04 from '../../docs/04-escolha-modelo.md?raw';
import ch05 from '../../docs/05-gguf-quantizacao.md?raw';
import ch06 from '../../docs/06-instalacao-ambiente.md?raw';
import ch07 from '../../docs/07-configuracao-python.md?raw';
import ch08 from '../../docs/08-instalacao-llamacpp.md?raw';
import ch09 from '../../docs/09-download-modelo.md?raw';
import ch10 from '../../docs/10-criacao-ferramentas.md?raw';
import ch11 from '../../docs/11-construcao-agente.md?raw';
import ch12 from '../../docs/12-optimizacoes-cpu.md?raw';
import ch13 from '../../docs/13-interface-chat.md?raw';
import ch14 from '../../docs/14-automatizacao.md?raw';
import ch15 from '../../docs/15-seguranca-privacidade.md?raw';
import ch16 from '../../docs/16-melhorias-futuras.md?raw';
import ch17 from '../../docs/17-conclusao.md?raw';
import ch18 from '../../docs/18-qwen-agente.md?raw';
import ch19 from '../../docs/19-memoria-conversacional.md?raw';
import ch20 from '../../docs/20-ontologias.md?raw';
import ch21 from '../../docs/21-openclaw-agentes-locais.md?raw';
import ch22 from '../../docs/22-alucinacoes-fiabilidade-agentes.md?raw';
import ch23 from '../../docs/23-ollama-ecossistema-inferencia-local.md?raw';

export const rawChapters: string[] = [
  ch01, ch02, ch03, ch04, ch05,
  ch06, ch07, ch08, ch09, ch10,
  ch11, ch12, ch13, ch14, ch15,
  ch16, ch18, ch19, ch20, ch21,
  ch22, ch17,
];

/** Keyed by lesson slug — used by the course module */
export const rawBySlug: Record<string, string> = {
  'ai-impactos-custos-industria': ch00,
  introducao: ch01,
  'porque-ia-local': ch02,
  'limitacoes-hardware': ch03,
  'escolha-modelo': ch04,
  'gguf-quantizacao': ch05,
  'instalacao-ambiente': ch06,
  'configuracao-python': ch07,
  'instalacao-llamacpp': ch08,
  'download-modelo': ch09,
  'criacao-ferramentas': ch10,
  'construcao-agente': ch11,
  'optimizacoes-cpu': ch12,
  'interface-chat': ch13,
  automatizacao: ch14,
  'seguranca-privacidade': ch15,
  'melhorias-futuras': ch16,
  conclusao: ch17,
  'qwen-agente': ch18,
  'memoria-conversacional': ch19,
  ontologias: ch20,
  'openclaw-agentes-locais': ch21,
  'alucinacoes-fiabilidade-agentes': ch22,
  'ollama-ecossistema-inferencia-local': ch23,
};
