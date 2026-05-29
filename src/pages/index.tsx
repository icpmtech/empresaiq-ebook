import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const chapters = [
  { num: '01', title: 'Introdução', icon: '📘', slug: 'introducao' },
  { num: '02', title: 'Porque usar IA Local', icon: '🔒', slug: 'porque-ia-local' },
  { num: '03', title: 'Limitações de Hardware', icon: '💻', slug: 'limitacoes-hardware' },
  { num: '04', title: 'Escolha do Modelo', icon: '🎯', slug: 'escolha-modelo' },
  { num: '05', title: 'GGUF e Quantização', icon: '⚡', slug: 'gguf-quantizacao' },
  { num: '06', title: 'Instalação do Ambiente', icon: '⚙️', slug: 'instalacao-ambiente' },
  { num: '07', title: 'Configuração do Python', icon: '🐍', slug: 'configuracao-python' },
  { num: '08', title: 'Instalação do Llama.cpp', icon: '🦙', slug: 'instalacao-llamacpp' },
  { num: '09', title: 'Download do Modelo', icon: '📥', slug: 'download-modelo' },
  { num: '10', title: 'Criação das Ferramentas', icon: '🔧', slug: 'criacao-ferramentas' },
  { num: '11', title: 'Construção do Agente', icon: '🤖', slug: 'construcao-agente' },
  { num: '12', title: 'Optimizações CPU', icon: '🚀', slug: 'optimizacoes-cpu' },
  { num: '13', title: 'Interface de Chat', icon: '💬', slug: 'interface-chat' },
  { num: '14', title: 'Automatização', icon: '⏰', slug: 'automatizacao' },
  { num: '15', title: 'Segurança e Privacidade', icon: '🛡️', slug: 'seguranca-privacidade' },
  { num: '16', title: 'Melhorias Futuras', icon: '🌟', slug: 'melhorias-futuras' },
  { num: '17', title: 'Qwen2.5 no Agente EmpresaIQ', icon: '🧠', slug: 'qwen-agente' },
  { num: '18', title: 'Memória Conversacional', icon: '💭', slug: 'memoria-conversacional' },
  { num: '19', title: 'Conclusão', icon: '🏁', slug: 'conclusao' },
];

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Agentes Inteligentes Locais<br/>com IA Open Source
        </Heading>
        <p className="hero__subtitle">
          Guia Completo EmpresaIQ para PCs com 8 GB RAM e Apenas CPU
        </p>
        <p style={{color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '2rem'}}>
          17 capítulos • Código completo • Sem GPU • Sem cloud • Sem custos mensais
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introducao">
            📖 Começar a Ler
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureBadges() {
  const badges = [
    { label: '8 GB RAM', desc: 'Hardware acessível' },
    { label: 'CPU Only', desc: 'Sem GPU necessária' },
    { label: 'Custo Zero', desc: 'Sem APIs pagas' },
    { label: '100% Local', desc: 'Dados nunca saem' },
    { label: 'RGPD Nativo', desc: 'Conformidade total' },
    { label: 'Open Source', desc: 'Modelos livres' },
  ];
  return (
    <section style={{padding: '3rem 0', background: 'var(--ifm-color-emphasis-100)'}}>
      <div className="container">
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center'}}>
          {badges.map((b) => (
            <div key={b.label} style={{
              background: 'var(--ifm-background-color)',
              border: '2px solid var(--ifm-color-primary)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              textAlign: 'center',
              minWidth: '130px',
            }}>
              <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--ifm-color-primary)'}}>{b.label}</div>
              <div style={{fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)'}}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChapterGrid() {
  return (
    <section style={{padding: '3rem 0'}}>
      <div className="container">
        <Heading as="h2" style={{textAlign: 'center', marginBottom: '2rem'}}>
          Índice de Capítulos
        </Heading>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {chapters.map((c) => (
            <Link key={c.slug} to={`/docs/${c.slug}`} style={{textDecoration: 'none'}}>
              <div style={{
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--ifm-color-primary)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)')}
              >
                <span style={{fontSize: '1.5rem'}}>{c.icon}</span>
                <div>
                  <div style={{fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-500)'}}>Cap. {c.num}</div>
                  <div style={{fontWeight: '600'}}>{c.title}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="eBook — Agentes Inteligentes Locais com IA Open Source"
      description="Guia completo EmpresaIQ para criar agentes IA locais em hardware com 8 GB RAM e apenas CPU">
      <HomepageHeader />
      <FeatureBadges />
      <ChapterGrid />
      <section style={{padding: '3rem 0', background: 'var(--ifm-color-emphasis-100)', textAlign: 'center'}}>
        <div className="container">
          <Heading as="h3">Produzido por EmpresaIQ</Heading>
          <p>Inteligência Empresarial &amp; IA — Portugal</p>
          <Link className="button button--primary button--lg" to="/docs/introducao">
            📖 Começar a Ler
          </Link>
        </div>
      </section>
    </Layout>
  );
}
