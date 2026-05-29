import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './obrigado.module.css';

const PDF_URL = '/downloads/empresaiq-ebook.pdf';
const ACCESS_CODE = 'EMPRESAIQ2026';

export default function Obrigado(): React.JSX.Element {
  return (
    <Layout
      title="Obrigado pela compra!"
      description="Obrigado! O teu eBook EmpresaIQ está pronto para descarregar."
    >
      <main className={styles.main}>
        <div className={styles.container}>

          {/* ── Header ── */}
          <div className={styles.header}>
            <div className={styles.checkIcon}>🎉</div>
            <h1 className={styles.title}>Obrigado pela compra!</h1>
            <p className={styles.sub}>
              O pagamento foi confirmado. O teu eBook está pronto.
            </p>
          </div>

          {/* ── Download Card ── */}
          <div className={styles.downloadCard}>
            <h2 className={styles.cardTitle}>📥 Descarregar o eBook</h2>
            <p className={styles.cardSub}>
              Clica no botão abaixo para descarregar o PDF imediatamente.
            </p>
            <a
              href={PDF_URL}
              download="EmpresaIQ-eBook.pdf"
              className={styles.downloadBtn}
            >
              📥 Descarregar EmpresaIQ-eBook.pdf
            </a>
          </div>

          {/* ── Access Code Card ── */}
          <div className={styles.codeCard}>
            <h2 className={styles.codeTitle}>🔑 O teu código de acesso</h2>
            <p className={styles.codeSub}>
              Guarda este código — podes usá-lo em qualquer momento para voltar a descarregar o eBook.
            </p>
            <div className={styles.codeBox}>
              <code className={styles.code}>{ACCESS_CODE}</code>
            </div>
            <p className={styles.codeHint}>
              Acede a <Link to="/aceder"><strong>/aceder</strong></Link> e introduz este código sempre que precisares.
            </p>
          </div>

          {/* ── What's inside ── */}
          <div className={styles.included}>
            <h3 className={styles.includedTitle}>O que tens no eBook</h3>
            <div className={styles.includedGrid}>
              <div className={styles.includedItem}>
                <strong>20 capítulos</strong>
                <span>Do zero ao agente completo</span>
              </div>
              <div className={styles.includedItem}>
                <strong>Código completo</strong>
                <span>Python pronto a usar</span>
              </div>
              <div className={styles.includedItem}>
                <strong>Sem GPU</strong>
                <span>Funciona em CPU com 8 GB RAM</span>
              </div>
              <div className={styles.includedItem}>
                <strong>RGPD</strong>
                <span>Dados 100% locais, sem cloud</span>
              </div>
            </div>
          </div>

          {/* ── Read online ── */}
          <div className={styles.readOnline}>
            <p>Também podes ler online →</p>
            <Link to="/docs/introducao" className={styles.readLink}>
              📖 Ler o eBook no site
            </Link>
          </div>

        </div>
      </main>
    </Layout>
  );
}
