import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './comprar.module.css';

const PAYPAL_URL = 'https://www.paypal.com/ncp/payment/6TSXLY9DJPM3L';
const RETURN_URL = 'https://empresaiq-ebook.vercel.app/codigo';
const QR_IMG = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fwww.paypal.com%2Fncp%2Fpayment%2F6TSXLY9DJPM3L&bgcolor=ffffff&color=1d2951&margin=10';

export default function Comprar(): React.JSX.Element {
  return (
    <Layout
      title="Comprar eBook — €10"
      description="Adquira o eBook EmpresaIQ — Agentes Inteligentes Locais com IA Open Source por apenas €10"
    >
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>eBook PDF · Edição 2026</span>
          <h1 className={styles.heroTitle}>
            Agentes Inteligentes Locais<br />com IA Open Source
          </h1>
          <p className={styles.heroSub}>
            20 capítulos práticos para iniciantes · Código completo · Sem GPU · Sem cloud
          </p>
        </div>
      </div>

      {/* ── Main ── */}
      <main className={styles.main}>
        <div className={styles.container}>

          {/* ── Card ── */}
          <div className={styles.card}>

            {/* LEFT — features */}
            <div className={styles.left}>
              <h2 className={styles.cardTitle}>O que vais aprender</h2>
              <ul className={styles.features}>
                <li>✅ Instalar IA local em CPU, sem subscrições</li>
                <li>✅ Usar Phi-3-mini e Qwen2.5 em 8 GB RAM</li>
                <li>✅ Criar ferramentas e agentes com LangChain</li>
                <li>✅ Interface de chat com memória conversacional</li>
                <li>✅ Automatizar tarefas com cron e PowerShell</li>
                <li>✅ Segurança e conformidade RGPD</li>
                <li>✅ RAG com ChromaDB e FastAPI</li>
                <li>✅ Ontologias para estruturar conhecimento</li>
              </ul>

              <div className={styles.specs}>
                <div className={styles.spec}>
                  <strong>20</strong>
                  <span>Capítulos</span>
                </div>
                <div className={styles.spec}>
                  <strong>PDF</strong>
                  <span>Formato</span>
                </div>
                <div className={styles.spec}>
                  <strong>PT</strong>
                  <span>Idioma</span>
                </div>
                <div className={styles.spec}>
                  <strong>∞</strong>
                  <span>Acesso</span>
                </div>
              </div>

              <div className={styles.preview}>
                <Link to="/docs/introducao" className={styles.previewLink}>
                  👁️ Ler capítulo 1 grátis →
                </Link>
              </div>
            </div>

            {/* RIGHT — payment */}
            <div className={styles.right}>
              <div className={styles.priceTag}>
                <span className={styles.price}>€10</span>
                <span className={styles.priceSub}>pagamento único</span>
              </div>

              {/* QR Code */}
              <div className={styles.qrBox}>
                <p className={styles.qrLabel}>📱 Pagar com telemóvel</p>
                <img
                  src={QR_IMG}
                  alt="QR Code PayPal — pagar €10 pelo eBook EmpresaIQ"
                  className={styles.qrImage}
                  width={220}
                  height={220}
                  loading="lazy"
                />
                <p className={styles.qrCaption}>Aponta a câmara e paga com PayPal</p>
              </div>

              <div className={styles.orDivider}><span>ou</span></div>

              {/* PayPal Button */}
              <a
                href={PAYPAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.paypalBtn}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: 8, verticalAlign: 'middle'}}>
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 4.643-5.813 4.643H12.58c-.524 0-.967.382-1.049.9l-1.39 8.816H8.16l-.142.898c-.05.317.19.605.513.605h3.603c.458 0 .85-.333.92-.785l.038-.196.73-4.629.047-.254c.07-.452.46-.785.919-.785h.578c3.75 0 6.686-1.524 7.541-5.934.358-1.845.172-3.385-.786-4.292z"/>
                </svg>
                Pagar €10 com PayPal
              </a>

              <p className={styles.secureNote}>
                🔒 Pagamento seguro · Após pagar és redirecionado para{' '}
                <a href={RETURN_URL} style={{color: 'inherit', fontWeight: 700}}>/codigo</a>{' '}
                com o teu download imediato
              </p>

              <div className={styles.alreadyHave}>
                <Link to="/codigo">Já paguei — ver o meu código →</Link>
              </div>
              <div className={styles.alreadyHave}>
                <Link to="/aceder">Tenho código de acesso →</Link>
              </div>
            </div>
          </div>

          {/* ── Guarantee ── */}
          <div className={styles.guarantee}>
            <span className={styles.guaranteeIcon}>📘</span>
            <div>
              <strong>Acesso imediato após pagamento</strong>
              <p>
                O PayPal redireciona-te automaticamente para{' '}
                <a href={RETURN_URL} style={{fontWeight: 700}}>empresaiq-ebook.vercel.app/codigo</a>{' '}
                com o botão de download e o teu código de acesso permanente.
              </p>
            </div>
          </div>

        </div>
      </main>
    </Layout>
  );
}
