import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './offline.module.css';

export default function OfflinePage(): ReactNode {
  return (
    <Layout title="Offline — EmpresaIQ" description="Página offline da app EmpresaIQ">
      <main className={styles.offlinePage}>
        <div className={styles.offlineCard}>
          <div className={styles.offlineIcon}>📖</div>
          <h1 className={styles.offlineTitle}>Está offline</h1>
          <p className={styles.offlineText}>
            A app mantém uma versão em cache do leitor e dos principais recursos.
            Quando a ligação voltar, o conteúdo completo volta a sincronizar.
          </p>
          <div className={styles.offlineActions}>
            <Link className="button button--primary" to="/ler">Abrir leitor</Link>
            <Link className="button button--secondary button--outline" to="/">Ir para a capa</Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
