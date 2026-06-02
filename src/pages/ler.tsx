import type { ReactNode } from 'react';
import React, { useRef, useCallback, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './ler.module.css';

const chapters = [
  { num: '01', title: 'Introdução', slug: 'introducao', icon: '🚀',
    topics: ['O que é o EmpresaIQ', 'IA local vs cloud', 'O que vamos construir', 'Requisitos mínimos'] },
  { num: '02', title: 'Porque IA Local?', slug: 'porque-ia-local', icon: '🔒',
    topics: ['Privacidade e RGPD', 'Custo zero mensal', 'Funciona 100% offline', 'Controlo total dos dados'] },
  { num: '03', title: 'Limitações de Hardware', slug: 'limitacoes-hardware', icon: '💻',
    topics: ['8 GB RAM — o mínimo', 'CPU vs GPU', 'Modelos 3B vs 7B vs 13B', 'Técnicas de otimização'] },
  { num: '04', title: 'Escolha do Modelo', slug: 'escolha-modelo', icon: '🤖',
    topics: ['Qwen2.5-3B vs alternativas', 'Benchmarks em CPU', 'Critérios de seleção', 'Família Qwen2.5'] },
  { num: '05', title: 'Como o Ollama Gere Modelos', slug: 'gguf-quantizacao', icon: '📦',
    topics: ['Quantização e formatos GGUF', 'Camadas internas do Ollama', 'Modelfile customizado', 'Gestão de memória'] },
  { num: '06', title: 'Instalação do Ambiente', slug: 'instalacao-ambiente', icon: '⚙️',
    topics: ['Windows / Linux / macOS', 'Python 3.11', 'Ambientes virtuais', 'Dependências base'] },
  { num: '07', title: 'Configuração Python', slug: 'configuracao-python', icon: '🐍',
    topics: ['ollama Python SDK', 'LangChain + Ollama', 'Variáveis de ambiente', 'Primeiro teste de geração'] },
  { num: '08', title: 'Instalação do Ollama', slug: 'instalacao-llamacpp', icon: '🦙',
    topics: ['Download e instalação', 'Comandos essenciais', 'ollama serve', 'Verificar funcionamento'] },
  { num: '09', title: 'Download do Modelo', slug: 'download-modelo', icon: '⬇️',
    topics: ['ollama pull qwen2.5:3b', 'Criar Modelfile EmpresaIQ', 'System prompt personalizado', 'Testar o modelo'] },
  { num: '10', title: 'Criação de Ferramentas', slug: 'criacao-ferramentas', icon: '🔧',
    topics: ['Ferramentas do agente', 'Pesquisa de clientes', 'Análise de vendas', 'Integração com dados locais'] },
  { num: '11', title: 'Construção do Agente', slug: 'construcao-agente', icon: '🧠',
    topics: ['Padrão ReAct', 'LangChain AgentExecutor', 'Memória e contexto', 'Ciclo think → act → observe'] },
  { num: '12', title: 'Otimizações CPU', slug: 'optimizacoes-cpu', icon: '⚡',
    topics: ['Parâmetros Ollama', 'num_ctx e num_predict', 'Temperature e top_p', 'Benchmarking e métricas'] },
  { num: '13', title: 'Interface Chat', slug: 'interface-chat', icon: '💬',
    topics: ['CLI interativo', 'Modo streaming', 'Histórico de sessão', 'Comandos especiais'] },
  { num: '14', title: 'Automatização', slug: 'automatizacao', icon: '🔄',
    topics: ['Scripts automáticos', 'Tarefas agendadas', 'Relatórios automáticos', 'Integração empresa'] },
  { num: '15', title: 'Segurança e Privacidade', slug: 'seguranca-privacidade', icon: '🛡️',
    topics: ['RGPD compliance', 'Dados nunca saem da rede', 'Autenticação local', 'Auditoria e logs'] },
  { num: '16', title: 'Melhorias Futuras', slug: 'melhorias-futuras', icon: '🔮',
    topics: ['Aceleração GPU', 'Modelos maiores', 'Arquitectura multi-agente', 'Fine-tuning local'] },
  { num: '17', title: 'Conclusão', slug: 'conclusao', icon: '🎯',
    topics: ['Recapitulação do percurso', 'Stack tecnológica completa', 'Próximos passos', 'Comunidade EmpresaIQ'] },
  { num: '18', title: 'Qwen2.5 no Agente EmpresaIQ', slug: 'qwen-agente', icon: '🧩',
    topics: ['Framework Qwen-Agent', 'Tools nativas', 'RAG integrado', 'Exemplos práticos'] },
  { num: '19', title: 'Memória Conversacional', slug: 'memoria-conversacional', icon: '🗃️',
    topics: ['ChromaDB local', 'Embeddings sem cloud', 'Contexto longo', 'LangChain Memory chains'] },
  { num: '20', title: 'Ontologias', slug: 'ontologias', icon: '🕸️',
    topics: ['RDF e OWL', 'Conhecimento estruturado', 'Integração com agente', 'Inferência local'] },
];

interface FlipEvent { data: number; }

function FlipBookInner(): ReactNode {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const HTMLFlipBook = (require('react-pageflip') as { default: React.ComponentType<any> }).default;
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = chapters.length + 2; // cover + chapters + back cover

  const handleFlip = useCallback((e: FlipEvent) => setCurrentPage(e.data), []);

  const getLabel = () => {
    if (currentPage === 0) return 'Capa';
    if (currentPage >= totalPages - 1) return 'Contracapa';
    return `Capítulo ${currentPage} de ${chapters.length}`;
  };

  return (
    <div className={styles.scene ?? ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div className={styles.bookWrapper}>
        <HTMLFlipBook
          ref={bookRef}
          width={420}
          height={580}
          size="fixed"
          minWidth={280}
          maxWidth={500}
          minHeight={380}
          maxHeight={700}
          showCover={true}
          mobileScrollSupport={false}
          flippingTime={700}
          drawShadow={true}
          useMouseEvents={true}
          onFlip={handleFlip}
          className={styles.book ?? ''}
        >
          {/* Page 0 — Front cover */}
          <div className={`${styles.page} ${styles.coverFront}`}>
            <div className={styles.coverContent}>
              <div className={styles.coverPublisher}>EmpresaIQ</div>
              <div className={styles.coverIconLarge}>🤖</div>
              <h1 className={styles.coverTitle}>Agentes Inteligentes<br />com IA Local</h1>
              <p className={styles.coverSubtitle}>Guia Técnico Prático</p>
              <div className={styles.coverDivider} />
              <div className={styles.coverTech}>
                <span>Ollama</span>
                <span>Qwen2.5-3B</span>
                <span>Python 3.11</span>
              </div>
              <div className={styles.coverEdition}>Versão 2.0 — 2026</div>
            </div>
          </div>

          {/* Pages 1-20 — Chapters */}
          {chapters.map((ch, i) => (
            <div
              key={ch.num}
              className={`${styles.page} ${styles.chapterPage} ${i % 2 === 0 ? styles.pageLeft : styles.pageRight}`}
            >
              <div className={styles.pageInner}>
                <div className={styles.chapterBadge}>Cap. {ch.num}</div>
                <div className={styles.chapterIcon}>{ch.icon}</div>
                <h2 className={styles.chapterTitle}>{ch.title}</h2>
                <ul className={styles.topicList}>
                  {ch.topics.map(t => <li key={t}>{t}</li>)}
                </ul>
                <div className={styles.pageFooter}>
                  <Link to={`/docs/${ch.slug}`} className={styles.readLink}>
                    Ler capítulo completo →
                  </Link>
                  <span className={styles.pageNum}>{i + 1}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Last page — Back cover */}
          <div className={`${styles.page} ${styles.coverBack}`}>
            <div className={styles.coverBackContent}>
              <div className={styles.backIcon}>📖</div>
              <h2>EmpresaIQ</h2>
              <p>Inteligência Empresarial &amp; IA</p>
              <div className={styles.backStats}>
                <div><strong>20</strong>Capítulos</div>
                <div><strong>8 GB</strong>RAM</div>
                <div><strong>0€</strong>Cloud</div>
              </div>
              <Link to="/comprar" className={styles.backCta}>
                🛒 Obter PDF Completo — €10
              </Link>
              <p className={styles.backUrl}>empresa.market-pro.digital</p>
            </div>
          </div>
        </HTMLFlipBook>
      </div>

      {/* Navigation controls */}
      <div className={styles.controls}>
        <button
          className={styles.navBtn}
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
          disabled={currentPage === 0}
        >
          ◀ Anterior
        </button>
        <span className={styles.pageIndicator}>{getLabel()}</span>
        <button
          className={styles.navBtn}
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
          disabled={currentPage >= totalPages - 1}
        >
          Próxima ▶
        </button>
      </div>

      <div className={styles.hint}>
        💡 Clique nas bordas do livro para folhear, ou use os botões
      </div>
    </div>
  );
}

export default function Ler(): ReactNode {
  return (
    <Layout
      title="Ler eBook — EmpresaIQ"
      description="Leia o eBook EmpresaIQ em formato de livro interativo com efeito de folhear"
    >
      <div className={styles.pageWrapper}>
        <BrowserOnly fallback={<div className={styles.loading}>A carregar o livro…</div>}>
          {() => <FlipBookInner />}
        </BrowserOnly>
      </div>
    </Layout>
  );
}
