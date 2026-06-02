import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'EmpresaIQ — Agentes Inteligentes Locais com IA Open Source',
  tagline: 'Guia completo para criar agentes IA locais em hardware com 8 GB RAM e apenas CPU',
  favicon: 'img/empresaiq-book-logo.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://empresa.market-pro.digital',
  baseUrl: '/',

  organizationName: 'EmpresaIQ',
  projectName: 'empresaiq-ebook',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'pt',
    locales: ['pt'],
    localeConfigs: {
      pt: {
        label: 'Português (Portugal)',
        direction: 'ltr',
        htmlLang: 'pt-PT',
      },
    },
  },

  markdown: {
    mermaid: true,
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'EmpresaIQ',
      logo: {
        alt: 'EmpresaIQ Logo',
        src: 'img/empresaiq-book-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'ebookSidebar',
          position: 'left',
          label: '📖 eBook',
        },
        {
          to: '/ler',
          label: '📚 Ler Online',
          position: 'left',
        },
        {
          to: '/comprar',
          label: '🛒 Comprar PDF — €10',
          position: 'left',
        },
        {
          to: '/aceder',
          label: '🔑 Aceder',
          position: 'right',
        },
        {
          href: 'https://empresa.market-pro.digital/',
          label: 'empresa.market-pro.digital',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'eBook',
          items: [
            { label: 'Introdução', to: '/docs/introducao' },
            { label: 'Porque IA Local', to: '/docs/porque-ia-local' },
            { label: 'Instalação do Ambiente', to: '/docs/instalacao-ambiente' },
            { label: 'Construção do Agente', to: '/docs/construcao-agente' },
          ],
        },
        {
          title: 'eBook PDF',
          items: [
            { label: '🛒 Comprar — €10', to: '/comprar' },
            { label: '🔑 Aceder com código', to: '/aceder' },
          ],
        },
        {
          title: 'EmpresaIQ',
          items: [
            { label: 'Website', href: 'https://empresa.market-pro.digital/' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} EmpresaIQ — Inteligência Empresarial & IA. Todos os direitos reservados.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'powershell', 'json'],
    },
  } satisfies Preset.ThemeConfig,
  themes: ['@docusaurus/theme-mermaid'],
};

export default config;
