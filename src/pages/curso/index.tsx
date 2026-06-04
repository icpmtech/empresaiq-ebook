import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './curso.module.css';
import { isLoggedIn, getUserName, getUserKey, validateKey, LS_USER_KEY, LS_USER_NAME } from '../../utils/keyUtils';
import { dbGetProgress, dbUpsertUser } from '../../utils/db';
import { MODULOS, ALL_LICOES, TOTAL_LICOES } from '../../data/curso-modulos';

export default function CursoPage(): React.JSX.Element {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [userName, setUserName] = useState('');
  const [progress, setProgress] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loggedIn = isLoggedIn();
    setAuthed(loggedIn);
    if (loggedIn) {
      setUserName(getUserName());
      dbGetProgress(getUserKey()).then(slugs => setProgress(slugs));
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (validateKey(code)) {
      const key = code.trim().toUpperCase();
      localStorage.setItem(LS_USER_KEY, key);
      if (name.trim()) localStorage.setItem(LS_USER_NAME, name.trim());
      await dbUpsertUser(key, name.trim());
      setAuthed(true);
      setUserName(name.trim());
      const slugs = await dbGetProgress(key);
      setProgress(slugs);
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  }

  if (!mounted) return <Layout title="Curso"><main /></Layout>;

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <Layout title="Curso — EmpresaIQ" description="Curso completo sobre agentes IA locais">
        <main className={styles.main}>
          <div className={styles.authGate}>
            <div className={styles.authCard}>
              <div className={styles.authIcon}>🎓</div>
              <h1 className={styles.authTitle}>Curso: Agentes IA Locais</h1>
              <p className={styles.authSub}>
                Este curso é exclusivo para compradores do eBook EmpresaIQ.<br />
                Introduz a tua chave de acesso para continuar.
              </p>
              <form onSubmit={handleLogin} className={styles.authForm}>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="O teu nome (opcional)"
                  className={styles.authInput}
                />
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value); setCodeError(false); }}
                  placeholder="Chave de acesso (ex: EIQ-A1B2C3-D4E5F6)"
                  className={`${styles.authInput} ${codeError ? styles.inputError : ''}`}
                  autoComplete="off"
                  spellCheck={false}
                />
                {codeError && (
                  <p className={styles.authError}>❌ Chave inválida. Verifica o email de confirmação.</p>
                )}
                <button type="submit" className={styles.authBtn}>Aceder ao Curso →</button>
              </form>
              <p className={styles.authFooter}>
                Ainda não tens o eBook?{' '}
                <Link to="/comprar">Comprar por €10 →</Link>
              </p>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  const completedCount = progress.length;
  const pct = Math.round((completedCount / TOTAL_LICOES) * 100);

  return (
    <Layout title="Curso — EmpresaIQ" description="Curso completo sobre agentes IA locais">
      <main className={styles.main}>
        <div className={styles.dashboard}>

          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                🎓 Curso: Agentes Inteligentes Locais
              </h1>
              <p className={styles.heroSub}>
                {userName ? `Bem-vindo, ${userName}!` : 'Bem-vindo!'} Aprende a construir agentes IA locais do zero com hardware acessível.
              </p>
            </div>
            <div className={styles.progressCard}>
              <div className={styles.progressLabel}>Progresso geral</div>
              <div className={styles.progressNum}>{completedCount}/{TOTAL_LICOES}</div>
              <div className={styles.progressBarWrap}>
                <div className={styles.progressBar} style={{ width: `${pct}%` }} />
              </div>
              <div className={styles.progressPct}>{pct}% concluído</div>
            </div>
          </div>

          {/* Modules grid */}
          {MODULOS.map(modulo => {
            const moduloProgress = modulo.licoes.filter(l => progress.includes(l.slug)).length;
            return (
              <div key={modulo.id} className={styles.moduloCard}>
                <div className={styles.moduloHeader}>
                  <span className={styles.moduloIcon}>{modulo.icon}</span>
                  <div className={styles.moduloMeta}>
                    <h2 className={styles.moduloTitle}>
                      Módulo {modulo.id} — {modulo.title}
                    </h2>
                    <p className={styles.moduloDesc}>{modulo.description}</p>
                  </div>
                  <div className={styles.moduloProgress}>
                    <span className={styles.moduloProgressNum}>
                      {moduloProgress}/{modulo.licoes.length}
                    </span>
                    <span className={styles.moduloProgressLabel}>lições</span>
                  </div>
                </div>

                <div className={styles.licoesList}>
                  {modulo.licoes.map((licao, i) => {
                    const done = progress.includes(licao.slug);
                    const isFirst = i === 0;
                    const prevDone = i === 0 || progress.includes(modulo.licoes[i - 1].slug);
                    const unlocked = done || prevDone || isFirst;
                    return (
                      <Link
                        key={licao.slug}
                        to={`/curso/licao?slug=${licao.slug}`}
                        className={`${styles.licaoItem} ${done ? styles.licaoDone : ''} ${!unlocked ? styles.licaoLocked : ''}`}
                      >
                        <span className={styles.licaoIcon}>
                          {done ? '✅' : unlocked ? licao.icon : '🔒'}
                        </span>
                        <span className={styles.licaoNum}>{licao.num}</span>
                        <span className={styles.licaoTitle}>{licao.title}</span>
                        <span className={styles.licaoDuracao}>{licao.duracao}</span>
                        {done && <span className={styles.licaoBadgeDone}>Concluída</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* CTA if all done */}
          {completedCount === TOTAL_LICOES && (
            <div className={styles.completedBanner}>
              <div className={styles.completedIcon}>🏆</div>
              <h2>Parabéns! Concluíste o curso completo!</h2>
              <p>Dominaste os fundamentos dos agentes IA locais. Partilha a tua conquista!</p>
              <Link to="/docs/introducao" className={styles.completedBtn}>
                Rever o eBook →
              </Link>
            </div>
          )}

        </div>
      </main>
    </Layout>
  );
}
