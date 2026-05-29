import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  ebookSidebar: [
    {
      type: 'category',
      label: '📖 Agentes Inteligentes Locais com IA',
      collapsible: false,
      items: [
        'introducao',
        'porque-ia-local',
        'limitacoes-hardware',
        'escolha-modelo',
        'gguf-quantizacao',
        {
          type: 'category',
          label: '⚙️ Instalação e Configuração',
          items: [
            'instalacao-ambiente',
            'configuracao-python',
            'instalacao-llamacpp',
            'download-modelo',
          ],
        },
        {
          type: 'category',
          label: '🤖 Construção do Agente',
          items: [
            'criacao-ferramentas',
            'construcao-agente',
            'optimizacoes-cpu',
          ],
        },
        {
          type: 'category',
          label: '🚀 Produção e Expansão',
          items: [
            'interface-chat',
            'automatizacao',
            'seguranca-privacidade',
            'melhorias-futuras',
          ],
        },
        'qwen-agente',
        'memoria-conversacional',
        'ontologias',
        'conclusao',
      ],
    },
  ],
};

export default sidebars;
