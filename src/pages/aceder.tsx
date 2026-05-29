import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './aceder.module.css';

// The valid access code — change this to rotate access
const VALID_CODE = 'EMPRESAIQ2026';
const PDF_URL = '/downloads/empresaiq-ebook.pdf';

export default function Aceder(): React.JSX.Element {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  function verify(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().toUpperCase() === VALID_CODE) {
      setStatus('ok');
    } else {
      setStatus('error');
    }
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
              Introduz o código de acesso que recebeste após o pagamento.
            </p>

            {status === 'ok' ? (
              /* ── Success ── */
              <div className={styles.success}>
                <div className={styles.successIcon}>✅</div>
                <h2>Código válido!</h2>
                <p>O teu eBook está pronto para descarregar.</p>
                <a
                  href={PDF_URL}
                  download="EmpresaIQ-eBook.pdf"
                  className={styles.downloadBtn}
                >
                  📥 Descarregar EmpresaIQ-eBook.pdf
                </a>
                <p className={styles.tip}>
                  Guarda o ficheiro — o código pode ser usado a qualquer momento.
                </p>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={verify} className={styles.form}>
                <label htmlFor="code" className={styles.label}>
                  Código de acesso
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setStatus('idle');
                  }}
                  placeholder="Ex: EMPRESAIQ2026"
                  autoComplete="off"
                  spellCheck={false}
                  className={`${styles.input} ${status === 'error' ? styles.inputError : ''}`}
                />
                {status === 'error' && (
                  <p className={styles.errorMsg}>
                    ❌ Código inválido. Verifica o email de confirmação do PayPal ou <Link to="/comprar">adquire o eBook</Link>.
                  </p>
                )}
                <button type="submit" className={styles.submitBtn}>
                  Verificar código →
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
