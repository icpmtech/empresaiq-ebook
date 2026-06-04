import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './curso.module.css';
import { isLoggedIn, getUserKey } from '../../utils/keyUtils';
import { dbGetProgress, dbMarkComplete } from '../../utils/db';
import { ALL_LICOES, getPrevNext, getModuloForLicao, exerciciosBySlug, TOTAL_LICOES } from '../../data/curso-modulos';

function stripFrontmatter(md: string): string {
  if (md.startsWith('---')) {
    const end = md.indexOf('---', 3);
    if (end !== -1) return md.slice(end + 3).trimStart();
  }
  return md;
}

export default function LicaoPage(): React.JSX.Element {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug') || '';

  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [content, setContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loggedIn = isLoggedIn();
    setAuthed(loggedIn);
    if (loggedIn) {
      const key = getUserKey();
      dbGetProgress(key).then(slugs => {
        setProgress(slugs);
        setCompleted(slugs.includes(slug));
      });
    }
  }, [slug]);

  // Fetch raw markdown from static/lessons/ at runtime (avoids Docusaurus MDX processing)
  useEffect(() => {
    if (!slug) return;
    setContent(null);
    setContentLoading(true);
    fetch(`/lessons/${slug}.md`)
      .then(r => (r.ok ? r.text() : Promise.reject(r.status)))
      .then(text => setContent(text))
      .catch(() => setContent(''))
      .finally(() => setContentLoading(false));
  }, [slug]);

  const licao = ALL_LICOES.find(l => l.slug === slug);
  const modulo = getModuloForLicao(slug);
  const { prev, next } = getPrevNext(slug);
  const quizzes = exerciciosBySlug[slug] || [];

  const handleComplete = useCallback(async () => {
    const key = getUserKey();
    await dbMarkComplete(key, slug);
    setCompleted(true);
    setProgress(prev => prev.includes(slug) ? prev : [...prev, slug]);
  }, [slug]);

  const handleQuizAnswer = (qi: number, oi: number) => {
    if (!quizSubmitted) setQuizAnswers(prev => ({ ...prev, [qi]: oi }));
  };

  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length < quizzes.length) return;
    setQuizSubmitted(true);
    const allCorrect = quizzes.every((q, i) => quizAnswers[i] === q.correta);
    if (allCorrect && !completed) handleComplete();
  };

  const quizScore = quizSubmitted
    ? quizzes.filter((q, i) => quizAnswers[i] === q.correta).length
    : 0;

  if (!mounted) return <Layout title="Lição"><main /></Layout>;

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!slug || !licao) {
    return (
      <Layout title="Lição não encontrada">
        <main className={styles.main}>
          <div className={styles.notFound}>
            <h1>Lição não encontrada</h1>
            <p>O slug <code>{slug}</code> não corresponde a nenhuma lição.</p>
            <Link to="/curso" className={styles.backBtn}>← Voltar ao Curso</Link>
          </div>
        </main>
      </Layout>
    );
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <Layout title={`${licao.title} — Curso EmpresaIQ`}>
        <main className={styles.main}>
          <div className={styles.authGate}>
            <div className={styles.authCard}>
              <div className={styles.authIcon}>🔒</div>
              <h1 className={styles.authTitle}>Conteúdo Exclusivo</h1>
              <p className={styles.authSub}>
                Esta lição é exclusiva para compradores do eBook.<br />
                <Link to="/aceder">Acede com a tua chave →</Link>
              </p>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  const completedCount = progress.length;

  // ── Lesson view ────────────────────────────────────────────────────────────
  return (
    <Layout
      title={`${licao.icon} ${licao.title} — Curso EmpresaIQ`}
      description={`Lição ${licao.num}: ${licao.title}`}
    >
      <main className={styles.main}>
        <div className={styles.licaoLayout}>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <Link to="/curso" className={styles.sidebarBack}>← Voltar ao Curso</Link>
              <div className={styles.sidebarProgress}>
                <span>{completedCount}/{TOTAL_LICOES}</span>
                <div className={styles.sidebarBar}>
                  <div
                    className={styles.sidebarBarFill}
                    style={{ width: `${Math.round((completedCount / TOTAL_LICOES) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <nav className={styles.sidebarNav}>
              {ALL_LICOES.map(l => {
                const done = progress.includes(l.slug);
                const active = l.slug === slug;
                return (
                  <Link
                    key={l.slug}
                    to={`/curso/licao?slug=${l.slug}`}
                    className={`${styles.sidebarItem} ${active ? styles.sidebarActive : ''} ${done ? styles.sidebarDone : ''}`}
                  >
                    <span className={styles.sidebarItemIcon}>
                      {done ? '✅' : l.icon}
                    </span>
                    <span className={styles.sidebarItemTitle}>{l.num}. {l.title}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <div className={styles.licaoMain}>

            {/* Breadcrumb */}
            <div className={styles.breadcrumb}>
              <Link to="/curso">Curso</Link>
              {modulo && <><span> / </span><span>Módulo {modulo.id}: {modulo.title}</span></>}
              <span> / </span>
              <span>{licao.title}</span>
            </div>

            {/* Lesson header */}
            <div className={styles.licaoHeader}>
              <div className={styles.licaoMeta}>
                <span className={styles.licaoNum}>Lição {licao.num}</span>
                <span className={styles.licaoDuracaoTag}>⏱ {licao.duracao}</span>
                {completed && <span className={styles.licaoCompletedTag}>✅ Concluída</span>}
              </div>
              <h1 className={styles.licaoTitle}>{licao.icon} {licao.title}</h1>
            </div>

            {/* Markdown content */}
            <div className={styles.mdContent}>
              {contentLoading && <p className={styles.loadingMsg}>A carregar conteúdo…</p>}
              {!contentLoading && content !== null && (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {stripFrontmatter(content)}
                </ReactMarkdown>
              )}
            </div>

            {/* Quiz section */}
            {quizzes.length > 0 && (
              <div className={styles.quizSection}>
                <h2 className={styles.quizTitle}>📝 Exercícios de Consolidação</h2>
                <p className={styles.quizSub}>
                  Responde a {quizzes.length} pergunta{quizzes.length > 1 ? 's' : ''} para verificar os teus conhecimentos.
                </p>

                {quizzes.map((q, qi) => {
                  const answered = quizAnswers[qi] !== undefined;
                  const correct = quizSubmitted && quizAnswers[qi] === q.correta;
                  const wrong = quizSubmitted && quizAnswers[qi] !== q.correta;
                  return (
                    <div key={qi} className={`${styles.quizCard} ${quizSubmitted ? (correct ? styles.quizCorrect : styles.quizWrong) : ''}`}>
                      <p className={styles.quizPergunta}>
                        <strong>{qi + 1}. {q.pergunta}</strong>
                      </p>
                      <div className={styles.quizOpcoes}>
                        {q.opcoes.map((op, oi) => {
                          const chosen = quizAnswers[qi] === oi;
                          const isRight = quizSubmitted && oi === q.correta;
                          const isWrong = quizSubmitted && chosen && oi !== q.correta;
                          return (
                            <button
                              key={oi}
                              className={`${styles.quizOpcao} ${chosen && !quizSubmitted ? styles.quizChosen : ''} ${isRight ? styles.quizRight : ''} ${isWrong ? styles.quizWrongOpt : ''}`}
                              onClick={() => handleQuizAnswer(qi, oi)}
                              disabled={quizSubmitted}
                            >
                              <span className={styles.quizLetter}>
                                {String.fromCharCode(65 + oi)}
                              </span>
                              {op}
                            </button>
                          );
                        })}
                      </div>
                      {quizSubmitted && (
                        <div className={`${styles.quizExplicacao} ${correct ? styles.quizExplicacaoOk : styles.quizExplicacaoErr}`}>
                          {correct ? '✅ ' : '❌ '}
                          {q.explicacao}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!quizSubmitted ? (
                  <button
                    className={styles.quizSubmitBtn}
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < quizzes.length}
                  >
                    Submeter respostas →
                  </button>
                ) : (
                  <div className={styles.quizResult}>
                    <span className={quizScore === quizzes.length ? styles.quizPerfect : styles.quizPartial}>
                      {quizScore === quizzes.length
                        ? `🎉 Perfeito! ${quizScore}/${quizzes.length} respostas corretas!`
                        : `${quizScore}/${quizzes.length} respostas corretas.`}
                    </span>
                    {!completed && (
                      <button className={styles.completeBtn} onClick={handleComplete}>
                        ✅ Marcar lição como concluída
                      </button>
                    )}
                    {completed && (
                      <span className={styles.alreadyDone}>✅ Lição concluída!</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Complete button (no quiz) */}
            {quizzes.length === 0 && !completed && (
              <div className={styles.completeSection}>
                <button className={styles.completeBtn} onClick={handleComplete}>
                  ✅ Marcar lição como concluída
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className={styles.licaoNav}>
              {prev ? (
                <Link to={`/curso/licao?slug=${prev.slug}`} className={styles.navBtn}>
                  ← {prev.icon} {prev.title}
                </Link>
              ) : <div />}
              {next ? (
                <Link to={`/curso/licao?slug=${next.slug}`} className={`${styles.navBtn} ${styles.navBtnNext}`}>
                  {next.icon} {next.title} →
                </Link>
              ) : (
                <Link to="/curso" className={`${styles.navBtn} ${styles.navBtnNext}`}>
                  🏁 Voltar ao Curso →
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
