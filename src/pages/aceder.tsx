import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './aceder.module.css';
import {
  validateKey,
  isLoggedIn,
  getUserName,
  getUserKey,
  logout,
  LS_USER_KEY,
  LS_USER_NAME,
} from '../utils/keyUtils';
import { dbUpsertUser } from '../utils/db';

const PDF_URL = '/downloads/empresaiq-ebook.pdf';

export default function Aceder(): React.JSX.Element {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [savedName, setSavedName] = useState('');

  useEffect(() => {
    if (isLoggedIn()) {
      setAlreadyLoggedIn(true);
      setSavedName(getUserName());
    }
  }, []);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (validateKey(code)) {
      const key = code.trim().toUpperCase();
      localStorage.setItem(LS_USER_KEY, key);
      if (name.trim()) localStorage.setItem(LS_USER_NAME, name.trim());
      await dbUpsertUser(key, name.trim());
      setStatus('ok');
    } else {
      setStatus('error');
    }
  }

  function handleLogout() {
    logout();
    setAlreadyLoggedIn(false);
    setStatus('idle');
    setCode('');
    setName('');
  }

  return (
    <Layout
      title="Aceder ao eBook"
      description="Introduz o teu código de acesso para descarregar o eBook EmpresaIQ"
    >
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.icon}>🔑</div>
            <h1 className={styles.title}>Aceder ao eBook</h1>
            <p className={styles.sub}>
              Introduz a chave de acesso que recebeste após a compra.
            </p>

            {/* ── Already logged in banner ── */}
            {alreadyLoggedIn && status !== 'ok' && (
              <div className={styles.loggedInBanner}>
                <span>✅ Já estás registado{savedName ? `, ${savedName}` : ''}!</span>
                <div className={styles.bannerActions}>
                  <a href={PDF_URL} download="EmpresaIQ-eBook.pdf" className={styles.bannerBtn}>
                    📥 Descarregar eBook
                  </a>
                  <Link to="/curso" className={styles.bannerBtnSecondary}>
                    🎓 Ir para o Curso
                  </Link>
                  <button onClick={handleLogout} className={styles.bannerLogout}>
                    Sair
                  </button>
                </div>
              </div>
            )}

            {status === 'ok' ? (
              /* ── Success ── */
              <div className={styles.success}>
                <div className={styles.successIcon}>✅</div>
                <h2>Chave válida! Bem-vindo{name ? `, ${name}` : ''}!</h2>
                <p>O teu eBook está pronto para descarregar.</p>
                <a
                  href={PDF_URL}
                  download="EmpresaIQ-eBook.pdf"
                  className={styles.downloadBtn}
                >
                  📥 Descarregar EmpresaIQ-eBook.pdf
                </a>
                <Link to="/curso" className={styles.courseBtn}>
                  🎓 Aceder ao Curso →
                </Link>
                <p className={styles.tip}>
                  A tua chave fica guardada neste browser — podes voltar a qualquer momento.
                </p>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={verify} className={styles.form}>
                <label htmlFor="name" className={styles.label}>
                  O teu nome (opcional)
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: João Silva"
                  autoComplete="name"
                  className={styles.input}
                />
                <label htmlFor="code" className={styles.label}>
                  Chave de acesso
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setStatus('idle');
                  }}
                  placeholder="Ex: EIQ-A1B2C3-D4E5F6"
                  autoComplete="off"
                  spellCheck={false}
                  className={`${styles.input} ${status === 'error' ? styles.inputError : ''}`}
                />
                {status === 'error' && (
                  <p className={styles.errorMsg}>
                    ❌ Chave inválida. Verifica o email de confirmação ou <Link to="/comprar">adquire o eBook</Link>.
                  </p>
                )}
                <button type="submit" className={styles.submitBtn}>
                  Verificar chave →
                </button>
              </form>
            )}

            <hr className={styles.divider} />

            <div className={styles.footer}>
              <p>Ainda não tens o eBook?</p>
              <Link to="/comprar" className={styles.buyLink}>
                Comprar por €10 →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
