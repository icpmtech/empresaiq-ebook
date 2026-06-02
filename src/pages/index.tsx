import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './capa.module.css';

export default function Home(): ReactNode {
  return (
    <Layout
      title="EmpresaIQ — Agentes Inteligentes Locais com IA Open Source"
      description="Guia completo para criar agentes IA locais com Ollama e Qwen2.5-3B em hardware com 8 GB RAM e apenas CPU">
      <div className={styles.cover}>
        <div className={styles.spine}>
          <span className={styles.spineText}>EmpresaIQ • IA Local com Ollama • 2026</span>
        </div>
        <div className={styles.main}>
          <div className={styles.topBar}>
            <span className={styles.publisher}>EmpresaIQ — Inteligência Empresarial &amp; IA</span>
            <span className={styles.edition}>Versão 2.0 · 2026</span>
          </div>
          <div className={styles.hero}>
            <span className={styles.category}>Guia Técnico Prático</span>
            <h1 className={styles.title}>
              Agentes Inteligentes
              <span className={styles.titleAccent}>com IA Local</span>
            </h1>
            <p className={styles.subtitle}>
              Construa um agente empresarial completo com Ollama e modelos Open Source —
              sem GPU, sem cloud, sem custos mensais. Apenas o seu PC e 8 GB de RAM.
            </p>
            <div className={styles.techStack}>
              <span className={`${styles.tech} ${styles.highlight}`}>Ollama</span>
              <span className={`${styles.tech} ${styles.highlight}`}>Qwen2.5-3B</span>
              <span className={styles.tech}>Python 3.11</span>
              <span className={styles.tech}>LangChain</span>
              <span className={styles.tech}>ReAct Agent</span>
              <span className={styles.tech}>FastAPI</span>
              <span className={styles.tech}>ChromaDB</span>
              <span className={styles.tech}>RGPD ✓</span>
            </div>
            <div className={styles.ctas}>
              <Link className={styles.btnPrimary} to="/docs/introducao">
                📖 Começar a Ler
              </Link>
              <Link className={styles.btnSecondary} to="/comprar">
                🛒 Comprar PDF — €10
              </Link>
            </div>
          </div>
          <div className={styles.statsRow}>
            {[
              { n: '20', l: 'Capítulos' },
              { n: '8 GB', l: 'RAM suficiente' },
              { n: '0€', l: 'Custo mensal' },
              { n: '100%', l: 'Local & Privado' },
              { n: '3B', l: 'Parâmetros' },
            ].map(s => (
              <div key={s.l} className={styles.stat}>
                <span className={styles.statNumber}>{s.n}</span>
                <span className={styles.statLabel}>{s.l}</span>
              </div>
            ))}
          </div>
          <div className={styles.bottomBar}>
            <div className={styles.brandLogo}>
              <div className={styles.brandIcon}>EQ</div>
              <div>
                <div className={styles.brandName}>EmpresaIQ</div>
                <div className={styles.brandTagline}>Inteligência Empresarial &amp; IA · Portugal</div>
              </div>
            </div>
            <div className={styles.price}>
              <span className={styles.priceLabel}>eBook PDF</span>
              <span className={styles.priceValue}>€10</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
