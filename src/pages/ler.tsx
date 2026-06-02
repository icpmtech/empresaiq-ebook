import type { ReactNode } from 'react';
import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Mermaid from '@theme/Mermaid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ler.module.css';

const chapterSourceBySlug: Record<string, string> = {
  'ai-impactos-custos-industria': require('!!raw-loader!@site/docs/00-ai-impactos-custos-industria.md').default as string,
  introducao: require('!!raw-loader!@site/docs/01-introducao.md').default as string,
  'porque-ia-local': require('!!raw-loader!@site/docs/02-porque-ia-local.md').default as string,
  'limitacoes-hardware': require('!!raw-loader!@site/docs/03-limitacoes-hardware.md').default as string,
  'escolha-modelo': require('!!raw-loader!@site/docs/04-escolha-modelo.md').default as string,
  'gguf-quantizacao': require('!!raw-loader!@site/docs/05-gguf-quantizacao.md').default as string,
  'instalacao-ambiente': require('!!raw-loader!@site/docs/06-instalacao-ambiente.md').default as string,
  'configuracao-python': require('!!raw-loader!@site/docs/07-configuracao-python.md').default as string,
  'instalacao-llamacpp': require('!!raw-loader!@site/docs/08-instalacao-llamacpp.md').default as string,
  'download-modelo': require('!!raw-loader!@site/docs/09-download-modelo.md').default as string,
  'criacao-ferramentas': require('!!raw-loader!@site/docs/10-criacao-ferramentas.md').default as string,
  'construcao-agente': require('!!raw-loader!@site/docs/11-construcao-agente.md').default as string,
  'optimizacoes-cpu': require('!!raw-loader!@site/docs/12-optimizacoes-cpu.md').default as string,
  'interface-chat': require('!!raw-loader!@site/docs/13-interface-chat.md').default as string,
  automatizacao: require('!!raw-loader!@site/docs/14-automatizacao.md').default as string,
  'seguranca-privacidade': require('!!raw-loader!@site/docs/15-seguranca-privacidade.md').default as string,
  'melhorias-futuras': require('!!raw-loader!@site/docs/16-melhorias-futuras.md').default as string,
  conclusao: require('!!raw-loader!@site/docs/17-conclusao.md').default as string,
  'qwen-agente': require('!!raw-loader!@site/docs/18-qwen-agente.md').default as string,
  'memoria-conversacional': require('!!raw-loader!@site/docs/19-memoria-conversacional.md').default as string,
  ontologias: require('!!raw-loader!@site/docs/20-ontologias.md').default as string,
};

interface ChapterMeta {
  num: string;
  title: string;
  slug: string;
  icon: string;
}

const chapters: ChapterMeta[] = [
  { num: '00', title: 'IA, Hardware e Impacto Económico', slug: 'ai-impactos-custos-industria', icon: '🌍',
  },
  { num: '01', title: 'Introdução', slug: 'introducao', icon: '🚀',
  },
  { num: '02', title: 'Porque IA Local?', slug: 'porque-ia-local', icon: '🔒',
  },
  { num: '03', title: 'Limitações de Hardware', slug: 'limitacoes-hardware', icon: '💻',
  },
  { num: '04', title: 'Escolha do Modelo', slug: 'escolha-modelo', icon: '🤖',
  },
  { num: '05', title: 'Como o Ollama Gere Modelos', slug: 'gguf-quantizacao', icon: '📦',
  },
  { num: '06', title: 'Instalação do Ambiente', slug: 'instalacao-ambiente', icon: '⚙️',
  },
  { num: '07', title: 'Configuração Python', slug: 'configuracao-python', icon: '🐍',
  },
  { num: '08', title: 'Instalação do Ollama', slug: 'instalacao-llamacpp', icon: '🦙',
  },
  { num: '09', title: 'Download do Modelo', slug: 'download-modelo', icon: '⬇️',
  },
  { num: '10', title: 'Criação de Ferramentas', slug: 'criacao-ferramentas', icon: '🔧',
  },
  { num: '11', title: 'Construção do Agente', slug: 'construcao-agente', icon: '🧠',
  },
  { num: '12', title: 'Otimizações CPU', slug: 'optimizacoes-cpu', icon: '⚡',
  },
  { num: '13', title: 'Interface Chat', slug: 'interface-chat', icon: '💬',
  },
  { num: '14', title: 'Automatização', slug: 'automatizacao', icon: '🔄',
  },
  { num: '15', title: 'Segurança e Privacidade', slug: 'seguranca-privacidade', icon: '🛡️',
  },
  { num: '16', title: 'Melhorias Futuras', slug: 'melhorias-futuras', icon: '🔮',
  },
  { num: '17', title: 'Conclusão', slug: 'conclusao', icon: '🎯',
  },
  { num: '18', title: 'Qwen2.5 no Agente EmpresaIQ', slug: 'qwen-agente', icon: '🧩',
  },
  { num: '19', title: 'Memória Conversacional', slug: 'memoria-conversacional', icon: '🗃️',
  },
  { num: '20', title: 'Ontologias', slug: 'ontologias', icon: '🕸️',
  },
];

interface FlipEvent { data: number; }

type ReaderMode = 'mobile' | 'tablet' | 'desktop';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface ChapterFlipPage {
  chapter: ChapterMeta;
  markdown: string;
  pageInChapter: number;
  totalPagesInChapter: number;
}

const MAX_CHARS_PER_PAGE = 1800;
const PAGE_BUDGET = 1650;

function stripFrontmatter(raw: string): string {
  return raw
    .replace(/\r/g, '')
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .trim();
}

function toBlocks(markdown: string): string[] {
  const lines = markdown.split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let inFence = false;

  const flush = () => {
    const text = current.join('\n').trim();
    if (text) {
      blocks.push(text);
    }
    current = [];
  };

  lines.forEach((line) => {
    const fenceOpenOrClose = line.trim().startsWith('```');
    const isHeading = /^#{1,3}\s/.test(line);
    const isBlank = line.trim() === '';

    if (fenceOpenOrClose) {
      current.push(line);
      inFence = !inFence;
      if (!inFence) {
        flush();
      }
      return;
    }

    if (inFence) {
      current.push(line);
      return;
    }

    if (isHeading && current.length > 0) {
      flush();
    }

    if (isBlank) {
      if (current.length > 0) {
        flush();
      }
      return;
    }

    current.push(line);
  });

  flush();
  return blocks;
}

function isMermaidBlock(block: string): boolean {
  return /^```\s*mermaid\s*$/im.test(block.split('\n')[0] ?? '');
}

function isCodeFenceBlock(block: string): boolean {
  return /^```/.test(block.trim());
}

function isTableBlock(block: string): boolean {
  return /\|/.test(block) && /\n\s*\|?\s*[-:]{3,}/.test(block);
}

function isHeadingBlock(block: string): boolean {
  return /^#{1,6}\s/.test(block.trim());
}

function estimateBlockWeight(block: string): number {
  if (isMermaidBlock(block)) {
    return 2000;
  }
  if (isCodeFenceBlock(block)) {
    return Math.max(1200, block.length);
  }
  if (isTableBlock(block)) {
    return Math.max(1100, block.length);
  }
  if (isHeadingBlock(block)) {
    return 240;
  }
  return block.length;
}

function splitLongTextBlock(block: string, maxChars: number): string[] {
  const text = block.trim();
  if (text.length <= maxChars) {
    return [text];
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += maxChars) {
      chunks.push(text.slice(i, i + maxChars));
    }
    return chunks;
  }

  const chunks: string[] = [];
  let current = '';

  sentences.forEach((sentence) => {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxChars && current) {
      chunks.push(current);
      current = sentence;
      return;
    }
    current = next;
  });

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function splitIntoPages(markdown: string, maxChars: number): string[] {
  const blocks = toBlocks(stripFrontmatter(markdown));
  if (blocks.length === 0) {
    return ['Conteúdo indisponível para este capítulo.'];
  }

  const pages: string[] = [];
  let current = '';
  let currentWeight = 0;

  blocks.forEach((block) => {
    const blockWeight = estimateBlockWeight(block);

    // Mermaid/code/table blocks get dedicated pages to preserve rendering quality.
    if (isMermaidBlock(block) || isCodeFenceBlock(block) || isTableBlock(block)) {
      if (current) {
        pages.push(current);
        current = '';
        currentWeight = 0;
      }
      pages.push(block);
      return;
    }

    if (blockWeight > maxChars) {
      if (current) {
        pages.push(current);
        current = '';
        currentWeight = 0;
      }
      splitLongTextBlock(block, Math.floor(maxChars * 0.8)).forEach((chunk) => {
        pages.push(chunk);
      });
      return;
    }

    if (currentWeight + blockWeight > PAGE_BUDGET && current) {
      pages.push(current);
      current = block;
      currentWeight = blockWeight;
      return;
    }

    current = current ? `${current}\n\n${block}` : block;
    currentWeight += blockWeight;
  });

  if (current) {
    pages.push(current);
  }

  return pages;
}

function loadChapterPages(): ChapterFlipPage[] {
  return chapters.flatMap((chapter) => {
    const source = chapterSourceBySlug[chapter.slug] ?? '';
    const paged = splitIntoPages(source, MAX_CHARS_PER_PAGE);

    return paged.map((chunk, idx) => ({
      chapter,
      markdown: chunk,
      pageInChapter: idx + 1,
      totalPagesInChapter: paged.length,
    }));
  });
}

function getBookSize(mode: ReaderMode, isFullPage: boolean): { width: number; height: number; minWidth: number; maxWidth: number; minHeight: number; maxHeight: number } {
  if (mode === 'mobile') {
    return isFullPage
      ? { width: 330, height: 500, minWidth: 280, maxWidth: 360, minHeight: 440, maxHeight: 540 }
      : { width: 300, height: 460, minWidth: 260, maxWidth: 320, minHeight: 410, maxHeight: 490 };
  }

  if (mode === 'tablet') {
    return isFullPage
      ? { width: 470, height: 660, minWidth: 380, maxWidth: 520, minHeight: 560, maxHeight: 720 }
      : { width: 400, height: 580, minWidth: 330, maxWidth: 440, minHeight: 490, maxHeight: 620 };
  }

  return isFullPage
    ? { width: 560, height: 760, minWidth: 450, maxWidth: 620, minHeight: 640, maxHeight: 820 }
    : { width: 420, height: 580, minWidth: 320, maxWidth: 500, minHeight: 450, maxHeight: 700 };
}

function FlipBookInner(): ReactNode {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const HTMLFlipBook = (require('react-pageflip') as { default: any }).default;
  const bookRef = useRef<any>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const deferredInstallPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [readerMode, setReaderMode] = useState<ReaderMode>('desktop');
  const [isFullPage, setIsFullPage] = useState(false);
  const [canInstallApp, setCanInstallApp] = useState(false);
  const chapterPages = useMemo(() => loadChapterPages(), []);
  const size = useMemo(() => getBookSize(readerMode, isFullPage), [readerMode, isFullPage]);

  const totalPages = useMemo(() => chapterPages.length + 2, [chapterPages.length]);

  const handleFlip = useCallback((e: FlipEvent) => setCurrentPage(e.data), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentPage]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullPage(Boolean(document.fullscreenElement));
    };

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredInstallPrompt.current = event as BeforeInstallPromptEvent;
      setCanInstallApp(true);
    };

    const onAppInstalled = () => {
      deferredInstallPrompt.current = null;
      setCanInstallApp(false);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const toggleFullPage = useCallback(async () => {
    if (!document.fullscreenElement) {
      await sceneRef.current?.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  }, []);

  const installApp = useCallback(async () => {
    const prompt = deferredInstallPrompt.current;
    if (!prompt) {
      return;
    }

    prompt.prompt();
    await prompt.userChoice;
    deferredInstallPrompt.current = null;
    setCanInstallApp(false);
  }, []);

  const getLabel = () => {
    if (currentPage === 0) return 'Capa';
    if (currentPage >= totalPages - 1) return 'Contracapa';
    const currentContentPage = chapterPages[currentPage - 1];
    if (!currentContentPage) return 'Página';
    return `Cap. ${currentContentPage.chapter.num} • Página ${currentContentPage.pageInChapter}/${currentContentPage.totalPagesInChapter}`;
  };

  return (
    <div ref={sceneRef} className={`${styles.scene} ${isFullPage ? styles.fullPageScene : ''}`}>
      <div className={styles.readerModes}>
        <div className={styles.modeGroup}>
          <button
            className={`${styles.modeBtn} ${readerMode === 'mobile' ? styles.modeBtnActive : ''}`}
            onClick={() => setReaderMode('mobile')}
            type="button"
          >
            Mobile
          </button>
          <button
            className={`${styles.modeBtn} ${readerMode === 'tablet' ? styles.modeBtnActive : ''}`}
            onClick={() => setReaderMode('tablet')}
            type="button"
          >
            Tablet
          </button>
          <button
            className={`${styles.modeBtn} ${readerMode === 'desktop' ? styles.modeBtnActive : ''}`}
            onClick={() => setReaderMode('desktop')}
            type="button"
          >
            Desktop
          </button>
        </div>

        <div className={styles.modeActions}>
          {canInstallApp ? (
            <button className={`${styles.modeBtn} ${styles.installBtn}`} onClick={() => { void installApp(); }} type="button">
              Instalar App
            </button>
          ) : null}
          <button className={`${styles.modeBtn} ${styles.fullPageBtn}`} onClick={() => { void toggleFullPage(); }} type="button">
            {isFullPage ? 'Sair Full Page' : 'Full Page'}
          </button>
        </div>
      </div>

      <div className={styles.bookWrapper}>
        <HTMLFlipBook
          key={`${readerMode}-${isFullPage}`}
          ref={bookRef}
          width={size.width}
          height={size.height}
          size="fixed"
          minWidth={size.minWidth}
          maxWidth={size.maxWidth}
          minHeight={size.minHeight}
          maxHeight={size.maxHeight}
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

          {/* Dynamic pages — full chapter content paginated */}
          {chapterPages.map((page, i) => {
            const isDiagramPage = isMermaidBlock(page.markdown.trim());

            return (
            <div
              key={`${page.chapter.slug}-${page.pageInChapter}`}
              className={`${styles.page} ${styles.chapterPage} ${i % 2 === 0 ? styles.pageLeft : styles.pageRight} ${isDiagramPage ? styles.diagramPage : ''}`}
            >
              <div className={styles.pageInner}>
                <div className={styles.chapterBadge}>Cap. {page.chapter.num}</div>
                <div className={styles.chapterIcon}>{page.chapter.icon}</div>
                <h2 className={styles.chapterTitle}>{page.chapter.title}</h2>
                <p className={styles.chapterPart}>Página {page.pageInChapter} de {page.totalPagesInChapter}</p>
                <div className={styles.chapterText}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const code = String(children || '').replace(/\n$/, '');

                        if (match?.[1]?.toLowerCase() === 'mermaid') {
                          return (
                            <div className={styles.mermaidWrap}>
                              <Mermaid value={code} />
                            </div>
                          );
                        }

                        const isInline = !(className && className.includes('language-'));
                        if (isInline) {
                          return (
                            <code className={styles.inlineCode} {...props}>
                              {children}
                            </code>
                          );
                        }

                        return (
                          <pre className={styles.codeBlock}>
                            <code className={className} {...props}>
                              {code}
                            </code>
                          </pre>
                        );
                      },
                    }}
                  >
                    {page.markdown}
                  </ReactMarkdown>
                </div>
                <div className={styles.pageFooter}>
                  <Link to={`/docs/${page.chapter.slug}`} className={styles.readLink}>
                    Abrir capítulo no formato docs →
                  </Link>
                  <span className={styles.pageNum}>{i + 1}</span>
                </div>
              </div>
            </div>
            );
          })}

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
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
          disabled={currentPage === 0}
        >
          ◀ Anterior
        </button>
        <span className={styles.pageIndicator}>{getLabel()}</span>
        <button
          className={styles.navBtn}
          onClick={() => bookRef.current?.pageFlip().flipNext()}
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
      noFooter
    >
      <div className={styles.pageWrapper}>
        <BrowserOnly fallback={<div className={styles.loading}>A carregar o livro…</div>}>
          {() => <FlipBookInner />}
        </BrowserOnly>
      </div>
    </Layout>
  );
}
