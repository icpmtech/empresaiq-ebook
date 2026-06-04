// Course module/lesson structure and quiz exercises

export interface LicaoMeta {
  slug: string;
  num: string;
  title: string;
  icon: string;
  duracao: string; // "15 min"
  modulo: number;
}

export interface ModuloMeta {
  id: number;
  title: string;
  description: string;
  icon: string;
  licoes: LicaoMeta[];
}

export interface QuizPergunta {
  pergunta: string;
  opcoes: string[];
  correta: number; // index 0-based
  explicacao: string;
}

// ── Quiz exercises — 3 per lesson ────────────────────────────────────────────

export const exerciciosBySlug: Record<string, QuizPergunta[]> = {
  'ai-impactos-custos-industria': [
    {
      pergunta: 'Qual é o principal impacto da IA generativa nos custos operacionais das empresas?',
      opcoes: [
        'Aumenta sempre os custos de infraestrutura',
        'Pode reduzir custos automatizando tarefas repetitivas',
        'Não tem impacto nos custos operacionais',
        'Só é relevante para grandes corporações',
      ],
      correta: 1,
      explicacao: 'A IA generativa pode reduzir significativamente custos ao automatizar tarefas repetitivas como triagem de emails, geração de relatórios e suporte básico ao cliente.',
    },
    {
      pergunta: 'O que distingue a IA local da IA cloud em termos de custos?',
      opcoes: [
        'A IA local é sempre mais cara',
        'A IA cloud não tem custos variáveis',
        'A IA local tem custo fixo (hardware) sem custo por utilização',
        'Ambas têm o mesmo modelo de preço',
      ],
      correta: 2,
      explicacao: 'Com IA local, pagas o hardware uma vez e usas sem custos adicionais por token/chamada. Em cloud, pagas por cada utilização (por token ou por request).',
    },
    {
      pergunta: 'Em que cenário a IA cloud é mais vantajosa do que a IA local?',
      opcoes: [
        'Quando há dados sensíveis que não podem sair da empresa',
        'Quando há picos esporádicos de utilização sem hardware dedicado',
        'Quando se precisa de velocidade máxima de inferência',
        'Quando a latência não é importante',
      ],
      correta: 1,
      explicacao: 'A IA cloud é mais vantajosa para picos de utilização esporádicos, pois evita o investimento em hardware que ficaria inativo a maior parte do tempo.',
    },
  ],

  introducao: [
    {
      pergunta: 'O que é um agente IA no contexto deste curso?',
      opcoes: [
        'Um robot físico com inteligência artificial',
        'Um programa que recebe uma tarefa, raciocina e usa ferramentas para a completar',
        'Uma API de linguagem que responde a perguntas',
        'Um chatbot simples sem capacidade de ação',
      ],
      correta: 1,
      explicacao: 'Um agente IA é um programa autónomo que recebe um objetivo, raciocina sobre ele (usando um LLM) e executa ações através de ferramentas para atingir esse objetivo.',
    },
    {
      pergunta: 'Qual é o requisito mínimo de hardware abordado neste eBook?',
      opcoes: [
        '32 GB RAM e GPU dedicada',
        '4 GB RAM e processador dual-core',
        '8 GB RAM e apenas CPU (sem GPU obrigatória)',
        '16 GB RAM e GPU com 8 GB VRAM',
      ],
      correta: 2,
      explicacao: 'Este curso foi desenhado para hardware acessível: basta ter 8 GB de RAM e um processador moderno, sem necessidade de GPU dedicada.',
    },
    {
      pergunta: 'Qual das seguintes é uma vantagem da IA open source vs proprietária?',
      opcoes: [
        'Os modelos open source são sempre mais precisos',
        'Não há custos de API, o código é auditável e podes modificar o modelo',
        'A IA open source não requer hardware',
        'Os modelos open source não têm limitações de contexto',
      ],
      correta: 1,
      explicacao: 'A IA open source permite zero custo de API, total controlo sobre os dados, código auditável para segurança e a possibilidade de fine-tuning.',
    },
  ],

  'porque-ia-local': [
    {
      pergunta: 'Qual a principal vantagem da IA local em termos de privacidade?',
      opcoes: [
        'Os modelos locais são mais precisos',
        'Os dados nunca saem do teu hardware',
        'É mais fácil de configurar',
        'Não requer ligação à internet',
      ],
      correta: 1,
      explicacao: 'Com IA local, todos os dados processados ficam no teu hardware — nenhuma informação sensível é enviada para servidores externos.',
    },
    {
      pergunta: 'Qual o custo típico de processar 1 milhão de tokens com GPT-4 em cloud?',
      opcoes: ['Gratuito', 'Cerca de €0.01', 'Entre €10 a €30', 'Mais de €1000'],
      correta: 2,
      explicacao: 'O GPT-4 custa entre $10-30 por milhão de tokens (input+output), o que pode ser significativo para uso intensivo.',
    },
    {
      pergunta: 'Qual das seguintes situações justifica mais fortemente o uso de IA local?',
      opcoes: [
        'Consultar o tempo meteorológico',
        'Processar contratos jurídicos confidenciais',
        'Fazer pesquisas na internet',
        'Enviar emails de marketing',
      ],
      correta: 1,
      explicacao: 'Contratos jurídicos contêm dados altamente sensíveis. A IA local garante que esses documentos nunca saem da infraestrutura da empresa.',
    },
  ],

  'limitacoes-hardware': [
    {
      pergunta: 'Qual é o mínimo de RAM para correr modelos de 7B parâmetros com qualidade razoável?',
      opcoes: ['4 GB', '8 GB', '16 GB', '32 GB'],
      correta: 1,
      explicacao: 'Com 8 GB de RAM e quantização Q4_K_M, é possível correr modelos de 7B parâmetros com qualidade razoável, embora seja recomendado mais para melhor desempenho.',
    },
    {
      pergunta: 'O que é quantização no contexto de modelos LLM?',
      opcoes: [
        'Um método de treinar modelos mais rapidamente',
        'Reduzir a precisão numérica dos pesos para diminuir o tamanho e acelerar a inferência',
        'Um protocolo de comunicação entre modelos',
        'O número de parâmetros do modelo',
      ],
      correta: 1,
      explicacao: 'Quantização reduz a precisão dos pesos (ex: de float32 para int4), diminuindo o tamanho do modelo e aumentando a velocidade de inferência com perda mínima de qualidade.',
    },
    {
      pergunta: 'Por que a velocidade da RAM é crítica para inferência de LLMs em CPU?',
      opcoes: [
        'Não é crítica, apenas a frequência do CPU importa',
        'Os pesos do modelo são transferidos da RAM para o CPU a cada token — largura de banda determina a velocidade',
        'A RAM não é usada durante a inferência',
        'Apenas a quantidade de RAM importa, não a velocidade',
      ],
      correta: 1,
      explicacao: 'Em inferência por CPU, os pesos do modelo são lidos da RAM para o processador a cada token gerado. A largura de banda da RAM (GB/s) é frequentemente o bottleneck principal.',
    },
  ],

  'escolha-modelo': [
    {
      pergunta: 'O que significa "7B" num modelo como Llama 3.1 7B?',
      opcoes: [
        '7 Bytes de tamanho de ficheiro',
        '7 Biliões de parâmetros',
        '7 Bits de precisão',
        '7 Versões do modelo',
      ],
      correta: 1,
      explicacao: '"7B" significa 7 Billion (7 mil milhões) de parâmetros. Mais parâmetros geralmente significa maior capacidade, mas também mais requisitos de hardware.',
    },
    {
      pergunta: 'Qual formato é mais eficiente para modelos locais em CPU?',
      opcoes: ['PyTorch (.pt)', 'SafeTensors (.safetensors)', 'GGUF (.gguf)', 'ONNX (.onnx)'],
      correta: 2,
      explicacao: 'GGUF é o formato nativo do llama.cpp, otimizado para inferência em CPU com suporte a múltiplos níveis de quantização e carregamento eficiente.',
    },
    {
      pergunta: 'Qual modelo é mais adequado para hardware com apenas 8 GB de RAM?',
      opcoes: [
        'Llama 3.1 70B Q4',
        'Mistral 7B Q4_K_M',
        'GPT-4 quantizado',
        'Llama 3.1 13B Q8',
      ],
      correta: 1,
      explicacao: 'Mistral 7B Q4_K_M cabe confortavelmente em 8 GB de RAM (≈4.4 GB), deixando espaço para o sistema operativo e outras aplicações.',
    },
  ],

  'gguf-quantizacao': [
    {
      pergunta: 'O que significa a sigla GGUF?',
      opcoes: [
        'General GPU Unified Format',
        'GPT-Generated Unified File',
        'GGML Unified Format (formato de ficheiro do ecossistema llama.cpp)',
        'Generative GPU Upscaling Function',
      ],
      correta: 2,
      explicacao: 'GGUF (GGML Unified Format) é o formato de ficheiro desenvolvido pelo ecossistema llama.cpp para armazenar modelos com metadados e suporte a quantização.',
    },
    {
      pergunta: 'O que representa Q4_K_M numa quantização GGUF?',
      opcoes: [
        'Versão 4 do modelo K com método M',
        'Quantização de 4 bits com método K-means de precisão média',
        'Quatro modelos em paralelo',
        'Quantização de 4 camadas do modelo',
      ],
      correta: 1,
      explicacao: 'Q4_K_M indica quantização de 4 bits usando o método K-means de qualidade "Medium" (M). Oferece bom balanço entre tamanho, velocidade e qualidade.',
    },
    {
      pergunta: 'Qual a principal diferença prática entre Q4 e Q8 em GGUF?',
      opcoes: [
        'Q8 é incompatível com CPU',
        'Q4 é 2x mais rápido e ocupa ~50% menos espaço, mas com ligeira perda de qualidade',
        'Q4 e Q8 têm exactamente a mesma qualidade',
        'Q8 requer GPU obrigatoriamente',
      ],
      correta: 1,
      explicacao: 'Q4 usa 4 bits por peso vs 8 bits em Q8, resultando em ~50% menos tamanho e maior velocidade de inferência, com uma pequena degradação de qualidade aceitável.',
    },
  ],

  'instalacao-ambiente': [
    {
      pergunta: 'Qual sistema operativo oferece melhor desempenho para inferência local com llama.cpp?',
      opcoes: [
        'Windows com WSL2 é equivalente a Linux nativo',
        'Linux nativo geralmente oferece melhor desempenho por overhead menor',
        'macOS é sempre o mais rápido',
        'O sistema operativo não tem impacto',
      ],
      correta: 1,
      explicacao: 'Linux nativo tem menos overhead do sistema e melhor suporte a otimizações de baixo nível (AVX, NUMA), resultando em melhor desempenho de inferência.',
    },
    {
      pergunta: 'Para que serve um ambiente virtual Python (venv)?',
      opcoes: [
        'Para correr código Python mais rapidamente',
        'Para isolar dependências de cada projeto, evitando conflitos entre versões',
        'Para instalar Python no sistema',
        'Para compilar código Python em binário',
      ],
      correta: 1,
      explicacao: 'O venv cria um ambiente Python isolado por projeto, onde as dependências instaladas não interferem com outros projetos ou com o Python do sistema.',
    },
    {
      pergunta: 'Qual a versão mínima de Python recomendada para este projeto?',
      opcoes: ['Python 2.7', 'Python 3.8', 'Python 3.10+', 'Python 4.0'],
      correta: 2,
      explicacao: 'Python 3.10 ou superior é recomendado para compatibilidade com as versões mais recentes das bibliotecas de IA e suporte a funcionalidades modernas da linguagem.',
    },
  ],

  'configuracao-python': [
    {
      pergunta: 'O que é o ficheiro requirements.txt num projeto Python?',
      opcoes: [
        'O código principal do projeto',
        'Uma lista de dependências e versões necessárias para o projeto funcionar',
        'A configuração do ambiente virtual',
        'O ficheiro de configuração do Python',
      ],
      correta: 1,
      explicacao: 'O requirements.txt lista todas as bibliotecas Python necessárias com versões específicas, permitindo replicar o ambiente com `pip install -r requirements.txt`.',
    },
    {
      pergunta: 'Como se ativa um ambiente virtual Python no Linux/macOS?',
      opcoes: [
        'python activate venv',
        'source venv/bin/activate',
        'venv --start',
        'activate.sh venv',
      ],
      correta: 1,
      explicacao: 'No Linux/macOS usa-se `source venv/bin/activate`. No Windows usa-se `venv\\Scripts\\activate` ou `venv\\Scripts\\Activate.ps1` no PowerShell.',
    },
    {
      pergunta: 'Para que serve o módulo `python-dotenv`?',
      opcoes: [
        'Para instalar dependências automaticamente',
        'Para carregar variáveis de ambiente de um ficheiro .env',
        'Para criar ambientes virtuais',
        'Para compilar código Python',
      ],
      correta: 1,
      explicacao: 'O `python-dotenv` lê um ficheiro `.env` e carrega as variáveis definidas nele como variáveis de ambiente, facilitando a configuração sem expor dados sensíveis no código.',
    },
  ],

  'instalacao-llamacpp': [
    {
      pergunta: 'O que é o llama.cpp?',
      opcoes: [
        'Um modelo de linguagem desenvolvido pela Meta',
        'Uma implementação em C/C++ para inferência eficiente de LLMs em CPU e GPU',
        'Uma interface gráfica para modelos de linguagem',
        'Um framework de treino de modelos',
      ],
      correta: 1,
      explicacao: 'llama.cpp é uma implementação de inferência de LLMs em C++ puro, altamente otimizada para CPU com suporte opcional a GPU, sem dependências pesadas.',
    },
    {
      pergunta: 'Qual a flag de compilação para ativar otimizações AVX2 no llama.cpp?',
      opcoes: ['-DLLAMA_AVX2=ON', '-DAVX2=true', '-O3 -mavx2', '-DGGML_AVX2=ON'],
      correta: 3,
      explicacao: 'A flag `-DGGML_AVX2=ON` ativa as instruções SIMD AVX2 durante a compilação do llama.cpp, melhorando significativamente o desempenho em CPUs que suportam AVX2.',
    },
    {
      pergunta: 'O que é o servidor HTTP integrado no llama.cpp?',
      opcoes: [
        'Um servidor web para hospedar o código do projeto',
        'Um servidor compatível com a API OpenAI que expõe o modelo localmente via HTTP',
        'Um proxy para serviços cloud de IA',
        'Uma ferramenta de monitorização do modelo',
      ],
      correta: 1,
      explicacao: 'O `llama-server` expõe uma API compatível com OpenAI em localhost, permitindo que qualquer ferramenta que suporte a API OpenAI use o modelo local como backend.',
    },
  ],

  'download-modelo': [
    {
      pergunta: 'Qual plataforma é a principal fonte de modelos GGUF gratuitos?',
      opcoes: ['GitHub', 'Hugging Face Hub (huggingface.co)', 'Google Drive', 'npm registry'],
      correta: 1,
      explicacao: 'O Hugging Face Hub é a principal plataforma para descarregar modelos de linguagem, incluindo milhares de modelos em formato GGUF prontos para uso local.',
    },
    {
      pergunta: 'Qual o tamanho aproximado de um modelo 7B em quantização Q4_K_M?',
      opcoes: ['~700 MB', '~4.4 GB', '~14 GB', '~28 GB'],
      correta: 1,
      explicacao: 'Um modelo 7B em Q4_K_M ocupa aproximadamente 4.4 GB (7 × 10⁹ parâmetros × ~0.5 bytes/parâmetro para Q4 + overhead).',
    },
    {
      pergunta: 'Qual ferramenta de linha de comandos permite descarregar modelos do Hugging Face?',
      opcoes: ['git clone', 'huggingface-cli download', 'pip install model', 'wget model.gguf'],
      correta: 1,
      explicacao: 'O `huggingface-cli download` (do pacote `huggingface_hub`) permite descarregar modelos de forma eficiente com suporte a retomas e cache automático.',
    },
  ],

  'criacao-ferramentas': [
    {
      pergunta: 'O que é uma "tool" (ferramenta) num agente IA?',
      opcoes: [
        'Um modelo de linguagem auxiliar',
        'Uma função Python que o agente pode chamar para executar ações no mundo real',
        'Um plugin de interface gráfica',
        'Um ficheiro de configuração do agente',
      ],
      correta: 1,
      explicacao: 'Uma "tool" é uma função Python com uma assinatura clara que o LLM pode invocar para realizar ações — como pesquisar na web, ler ficheiros, ou consultar APIs.',
    },
    {
      pergunta: 'Como é que o LLM sabe que ferramentas existem e como usá-las?',
      opcoes: [
        'O LLM deteta automaticamente as ferramentas no código',
        'Através de descrições em linguagem natural incluídas no system prompt ou como schemas JSON',
        'Por configuração numa base de dados',
        'O LLM não sabe — o programador decide qual chamar',
      ],
      correta: 1,
      explicacao: 'As ferramentas são descritas ao LLM via system prompt (lista de ferramentas com descrição e parâmetros) ou como schemas JSON no formato de function calling.',
    },
    {
      pergunta: 'O que é o padrão ReAct num agente IA?',
      opcoes: [
        'Um framework de React para interfaces de IA',
        'Reason + Act: o agente raciocina sobre o objetivo, age com uma ferramenta, observa o resultado e repete',
        'Um protocolo de comunicação entre agentes',
        'Uma técnica de treino de modelos por reforço',
      ],
      correta: 1,
      explicacao: 'ReAct (Reasoning + Acting) é um padrão onde o agente alterna entre raciocínio (Thought), ação (Action/tool call), e observação do resultado, numa loop iterativa.',
    },
  ],

  'construcao-agente': [
    {
      pergunta: 'O que é o "loop do agente"?',
      opcoes: [
        'Um loop infinito que trava o programa',
        'O ciclo repetitivo: receber input → raciocinar → chamar ferramenta → observar → responder ou repetir',
        'Uma função recursiva no código Python',
        'O processo de treino do modelo',
      ],
      correta: 1,
      explicacao: 'O loop do agente é o ciclo principal: o LLM raciocina sobre o objetivo, decide usar uma ferramenta, executa-a, observa o resultado, e repete até ter uma resposta final.',
    },
    {
      pergunta: 'O que é o "system prompt" de um agente?',
      opcoes: [
        'O prompt do utilizador',
        'Instruções persistentes que definem o comportamento, personalidade e ferramentas disponíveis ao agente',
        'O log do sistema operativo',
        'O histórico de conversas anteriores',
      ],
      correta: 1,
      explicacao: 'O system prompt é a primeira mensagem (papel "system") que define quem é o agente, o que pode fazer, que ferramentas tem, e como deve comportar-se.',
    },
    {
      pergunta: 'Como o agente decide qual ferramenta usar para uma tarefa?',
      opcoes: [
        'Por ordem alfabética das ferramentas',
        'O LLM raciocina sobre qual ferramenta é mais relevante com base nas descrições e no contexto',
        'Por aleatoriedade',
        'Sempre usa todas as ferramentas disponíveis',
      ],
      correta: 1,
      explicacao: 'O LLM lê as descrições de cada ferramenta e, com base no objetivo atual, decide qual é mais relevante para o próximo passo — imitando o raciocínio humano.',
    },
  ],

  'optimizacoes-cpu': [
    {
      pergunta: 'O que é o parâmetro `n_threads` no llama.cpp?',
      opcoes: [
        'O número de conversas simultâneas',
        'O número de threads de CPU usadas para inferência — idealmente igual aos núcleos físicos',
        'O número de camadas do modelo carregadas',
        'A velocidade de geração em tokens por segundo',
      ],
      correta: 1,
      explicacao: '`n_threads` define quantos threads de CPU são usados. O valor ideal é geralmente igual ao número de núcleos físicos (não lógicos/hyperthreading) para melhor desempenho.',
    },
    {
      pergunta: 'Por que reduzir o `--ctx-size` melhora o desempenho?',
      opcoes: [
        'Não melhora — só piora a qualidade',
        'Um contexto menor reduz o tamanho do KV cache, diminuindo uso de RAM e aumentando velocidade',
        'Aumenta o número de tokens gerados por segundo indefinidamente',
        'Permite usar mais ferramentas em simultâneo',
      ],
      correta: 1,
      explicacao: 'O KV cache cresce com o tamanho do contexto. Reduzir o ctx-size (ex: de 4096 para 2048) diminui o uso de memória e pode melhorar a velocidade de inferência.',
    },
    {
      pergunta: 'O que é o KV cache no contexto dos LLMs?',
      opcoes: [
        'Um sistema de cache do sistema operativo',
        'Matrizes de Keys e Values calculadas para tokens anteriores, guardadas para evitar recálculo',
        'O cache de modelos descarregados do HuggingFace',
        'Uma base de dados de respostas pré-calculadas',
      ],
      correta: 1,
      explicacao: 'O KV cache armazena os vetores Key-Value das camadas de atenção para todos os tokens anteriores no contexto, evitando recalculá-los a cada novo token gerado.',
    },
  ],

  'interface-chat': [
    {
      pergunta: 'O que é o Open WebUI?',
      opcoes: [
        'Um modelo de linguagem open source',
        'Uma interface web open source compatível com a API Ollama e OpenAI para chat local',
        'Um servidor web para hospedar o llama.cpp',
        'Uma extensão do VS Code para IA',
      ],
      correta: 1,
      explicacao: 'Open WebUI é uma interface de chat web open source semelhante ao ChatGPT, que se conecta ao Ollama ou a qualquer API compatível com OpenAI, incluindo llama.cpp server.',
    },
    {
      pergunta: 'O que é streaming de tokens numa resposta do LLM?',
      opcoes: [
        'Enviar o modelo por partes para download',
        'Receber a resposta token a token em tempo real, sem esperar pela resposta completa',
        'Uma técnica de quantização progressiva',
        'O processo de tokenização do input',
      ],
      correta: 1,
      explicacao: 'Streaming envia cada token gerado imediatamente para o cliente, permitindo que a resposta apareça progressivamente (como no ChatGPT) sem aguardar a geração completa.',
    },
    {
      pergunta: 'Qual a principal vantagem de uma interface web local para o agente?',
      opcoes: [
        'Melhora a qualidade das respostas do modelo',
        'Facilita a interação, elimina necessidade de linha de comandos e pode ser partilhada em rede local',
        'Aumenta a velocidade de inferência',
        'Permite usar modelos maiores',
      ],
      correta: 1,
      explicacao: 'Uma interface web torna o agente acessível a utilizadores não técnicos, funciona em qualquer browser, e pode ser servida em rede local para toda a equipa.',
    },
  ],

  automatizacao: [
    {
      pergunta: 'Como se podem agendar tarefas automáticas em Python no Linux?',
      opcoes: [
        'Usando o módulo `threading` do Python',
        'Com cron (Linux) ou Task Scheduler (Windows) para executar scripts Python periodicamente',
        'Apenas com serviços cloud como AWS Lambda',
        'Python não suporta agendamento de tarefas',
      ],
      correta: 1,
      explicacao: 'O cron (Linux/macOS) permite agendar scripts Python a horas específicas. No Windows usa-se o Task Scheduler. Para agendamento dentro do Python, existe o módulo `schedule`.',
    },
    {
      pergunta: 'O que é um webhook no contexto de automação com agentes IA?',
      opcoes: [
        'Um plugin de browser',
        'Um endpoint HTTP que recebe notificações de eventos externos para desencadear ações do agente',
        'Uma ferramenta de debug do agente',
        'Um ficheiro de configuração do servidor',
      ],
      correta: 1,
      explicacao: 'Um webhook é um endpoint HTTP que outros sistemas chamam quando ocorre um evento (ex: novo email, nova encomenda), permitindo que o agente reaja a eventos em tempo real.',
    },
    {
      pergunta: 'Para que serve o padrão de pipeline de tarefas num agente de automação?',
      opcoes: [
        'Para limitar o número de respostas do LLM',
        'Para encadear múltiplas tarefas onde o output de uma é o input da seguinte, de forma estruturada',
        'Para paralelizar o treino do modelo',
        'Para gerir versões do modelo',
      ],
      correta: 1,
      explicacao: 'Um pipeline encadeia tarefas sequenciais (ex: ler email → extrair info → consultar base de dados → redigir resposta → enviar), tornando o fluxo de automação previsível e manutenível.',
    },
  ],

  'seguranca-privacidade': [
    {
      pergunta: 'Qual é a principal vantagem de privacidade da IA local sobre cloud?',
      opcoes: [
        'Os modelos locais são mais seguros contra hacking',
        'Todos os dados processados permanecem no hardware local — nunca saem para servidores externos',
        'A IA local não tem vulnerabilidades',
        'Os modelos locais são encriptados por defeito',
      ],
      correta: 1,
      explicacao: 'Com IA local, documentos confidenciais, dados pessoais e propriedade intelectual são processados inteiramente no teu hardware, eliminando o risco de exposição a terceiros.',
    },
    {
      pergunta: 'O que significa um sistema "air-gapped"?',
      opcoes: [
        'Um sistema com muito espaço em disco',
        'Um sistema completamente isolado de redes externas, sem ligação à internet',
        'Um sistema com múltiplas camadas de firewall',
        'Um sistema com encriptação de disco completa',
      ],
      correta: 1,
      explicacao: 'Air-gapped refere-se a sistemas fisicamente isolados de qualquer rede externa. A IA local pode funcionar nestas condições, o que é impossível com soluções cloud.',
    },
    {
      pergunta: 'Qual prática de segurança é recomendada para a API local do agente?',
      opcoes: [
        'Expor a API publicamente para acesso remoto fácil',
        'Restringir o acesso a localhost ou rede local, com autenticação se exposto além do localhost',
        'Não usar autenticação pois é local',
        'Usar apenas HTTPS com certificados de terceiros',
      ],
      correta: 1,
      explicacao: 'A API do agente local deve ser restrita a localhost (127.0.0.1) por defeito. Se precisar de acesso em rede local, usar firewall + autenticação. Nunca expor diretamente à internet.',
    },
  ],

  'melhorias-futuras': [
    {
      pergunta: 'O que é RAG (Retrieval-Augmented Generation)?',
      opcoes: [
        'Um método de treino de modelos por reforço',
        'Uma técnica que combina pesquisa em base de dados com geração do LLM para respostas baseadas em factos',
        'Um formato de quantização de modelos',
        'Um tipo de interface gráfica para LLMs',
      ],
      correta: 1,
      explicacao: 'RAG recupera documentos relevantes de uma base de dados (ex: empresa, manual técnico) e fornece-os como contexto ao LLM, reduzindo alucinações e permitindo respostas atualizadas.',
    },
    {
      pergunta: 'Para que serve uma base de dados vetorial no contexto de RAG?',
      opcoes: [
        'Para armazenar imagens em formato vetorial',
        'Para armazenar embeddings de documentos e permitir pesquisa semântica por similaridade',
        'Para gerir versões de modelos LLM',
        'Para acelerar a inferência do LLM',
      ],
      correta: 1,
      explicacao: 'Uma base de dados vetorial (ex: ChromaDB, Qdrant) armazena representações numéricas (embeddings) de textos e permite encontrar os documentos mais semanticamente similares a uma query.',
    },
    {
      pergunta: 'O que é fine-tuning de um modelo LLM?',
      opcoes: [
        'Ajustar os parâmetros de quantização do modelo',
        'Treinar adicionalmente um modelo pré-treinado em dados específicos para especializar o seu comportamento',
        'Otimizar a velocidade de inferência',
        'Atualizar os pesos do modelo em tempo real durante a conversa',
      ],
      correta: 1,
      explicacao: 'Fine-tuning continua o treino de um modelo base usando dados específicos do domínio (ex: documentos da empresa, estilo de escrita), adaptando-o sem treinar do zero.',
    },
  ],

  'qwen-agente': [
    {
      pergunta: 'Qual é a empresa de origem do modelo Qwen?',
      opcoes: ['Meta (Facebook)', 'Google DeepMind', 'Alibaba Cloud', 'Microsoft Research'],
      correta: 2,
      explicacao: 'Os modelos Qwen (Qianwen) são desenvolvidos pela Alibaba Cloud, sendo uma das séries de modelos open source mais competitivas do mercado.',
    },
    {
      pergunta: 'O que são "tool calls" no Qwen e outros modelos modernos?',
      opcoes: [
        'Chamadas de API para serviços externos da Alibaba',
        'Uma capacidade nativa do modelo para invocar funções Python de forma estruturada em JSON',
        'Ferramentas de debugging do modelo',
        'Plugins de interface do Qwen',
      ],
      correta: 1,
      explicacao: 'Tool calls permitem que o modelo invoque funções definidas pelo programador de forma estruturada, retornando JSON com o nome da função e os argumentos — base dos agentes modernos.',
    },
    {
      pergunta: 'Qual versão do Qwen é mais adequada para hardware com 8 GB RAM?',
      opcoes: ['Qwen2.5-72B', 'Qwen2.5-7B Q4_K_M', 'Qwen2.5-32B Q8', 'Qwen3-14B Q6'],
      correta: 1,
      explicacao: 'Qwen2.5-7B em Q4_K_M ocupa ~4.5 GB, adequado para 8 GB de RAM. As versões maiores (14B, 32B, 72B) requerem muito mais memória.',
    },
  ],

  'memoria-conversacional': [
    {
      pergunta: 'O que é memória conversacional num agente IA?',
      opcoes: [
        'A RAM física usada durante a inferência',
        'A capacidade do agente de lembrar e usar informação de interações anteriores na mesma conversa',
        'Um sistema de log de todas as conversas',
        'A base de dados de conhecimento do agente',
      ],
      correta: 1,
      explicacao: 'Memória conversacional permite ao agente recordar o que foi dito anteriormente na conversa (curto prazo) e, opcionalmente, factos importantes de sessões anteriores (longo prazo).',
    },
    {
      pergunta: 'Como se implementa memória de curto prazo num agente?',
      opcoes: [
        'Guardando tudo numa base de dados SQL',
        'Incluindo o histórico de mensagens anteriores no contexto enviado ao LLM',
        'Usando embeddings vetoriais para cada mensagem',
        'Não é possível implementar memória de curto prazo',
      ],
      correta: 1,
      explicacao: 'A forma mais simples é manter uma lista de mensagens (pares user/assistant) e incluí-la no contexto de cada chamada ao LLM, dentro do limite do contexto disponível.',
    },
    {
      pergunta: 'O que são embeddings no contexto de memória de longo prazo?',
      opcoes: [
        'Ficheiros de configuração do modelo',
        'Representações numéricas densas de texto que capturam o significado semântico para pesquisa por similaridade',
        'Compressão de texto para reduzir o tamanho',
        'Marcadores de posição no histórico de conversa',
      ],
      correta: 1,
      explicacao: 'Embeddings convertem texto em vetores numéricos que capturam significado. Permitem pesquisa semântica: encontrar memórias relevantes mesmo que as palavras exatas sejam diferentes.',
    },
  ],

  ontologias: [
    {
      pergunta: 'O que é uma ontologia no contexto de IA e sistemas de conhecimento?',
      opcoes: [
        'Um tipo de base de dados relacional',
        'Uma representação formal de conceitos, entidades e as relações entre eles num domínio',
        'Um algoritmo de machine learning',
        'Um formato de ficheiro para modelos de linguagem',
      ],
      correta: 1,
      explicacao: 'Uma ontologia define formalmente os conceitos de um domínio (ex: empresa, produto, cliente) e as relações entre eles (ex: empresa EMPREGA funcionário), estruturando o conhecimento.',
    },
    {
      pergunta: 'Para que serve OWL (Web Ontology Language)?',
      opcoes: [
        'Para criar interfaces web para agentes IA',
        'Para definir ontologias formais com lógica de descrição, permitindo raciocínio automático',
        'Para formatar documentos HTML de forma semântica',
        'Para encriptar comunicações entre agentes',
      ],
      correta: 1,
      explicacao: 'OWL é uma linguagem W3C para definir ontologias com axiomas lógicos. Permite inferências automáticas — se A é subclasse de B e X pertence a A, o reasoner infere que X pertence a B.',
    },
    {
      pergunta: 'Como ontologias melhoram o raciocínio de agentes IA?',
      opcoes: [
        'Aumentam a velocidade de inferência do LLM',
        'Fornecem estrutura de conhecimento formal que reduz alucinações e permite raciocínio consistente',
        'Substituem o modelo de linguagem em tarefas complexas',
        'Não têm impacto no raciocínio dos agentes',
      ],
      correta: 1,
      explicacao: 'Ontologias fornecem um "esqueleto de conhecimento" verificável. O agente pode consultar relações formais em vez de depender do LLM para tudo, reduzindo erros em domínios específicos.',
    },
  ],

  'openclaw-agentes-locais': [
    {
      pergunta: 'Qual é o foco principal do projeto OpenClaw?',
      opcoes: [
        'Treino de modelos de linguagem',
        'Framework para orquestração de agentes IA com foco em fluxos de trabalho estruturados',
        'Interface gráfica para modelos locais',
        'Servidor de inferência de alta performance',
      ],
      correta: 1,
      explicacao: 'OpenClaw foca na orquestração de fluxos multi-agente estruturados, facilitando a criação de pipelines complexas onde múltiplos agentes especializados colaboram.',
    },
    {
      pergunta: 'Qual a diferença principal entre OpenClaw e llama.cpp na stack local?',
      opcoes: [
        'Fazem exatamente a mesma coisa',
        'llama.cpp faz inferência (corre o modelo); OpenClaw orquestra agentes (coordena o fluxo)',
        'OpenClaw é mais rápido para inferência',
        'llama.cpp suporta mais modelos do que OpenClaw',
      ],
      correta: 1,
      explicacao: 'llama.cpp é o motor de inferência (roda o LLM). OpenClaw é um orquestrador de alto nível que coordena múltiplos agentes, ferramentas e fluxos de trabalho, usando o llama.cpp como backend.',
    },
    {
      pergunta: 'Para que tipo de projeto o OpenClaw é mais adequado?',
      opcoes: [
        'Projetos simples com um único agente e poucas ferramentas',
        'Pipelines complexas com múltiplos agentes especializados que colaboram em tarefas empresariais',
        'Treino de modelos de linguagem em GPU',
        'Interfaces de chat ao utilizador',
      ],
      correta: 1,
      explicacao: 'OpenClaw brilha em cenários complexos: agente de triagem de emails → agente de análise → agente de resposta, cada um especializado, trabalhando em pipeline coordenada.',
    },
  ],

  'alucinacoes-fiabilidade-agentes': [
    {
      pergunta: 'O que são "alucinações" num modelo de linguagem?',
      opcoes: [
        'Erros de sintaxe no código gerado',
        'Factos inventados pelo modelo que soam plausíveis mas são incorretos ou falsos',
        'Respostas muito lentas do modelo',
        'Falhas de hardware durante a inferência',
      ],
      correta: 1,
      explicacao: 'Alucinações ocorrem quando o LLM gera informação incorreta com aparente confiança — citações falsas, factos inventados, código que não funciona — por não ter mecanismo de verificação de veracidade.',
    },
    {
      pergunta: 'Qual técnica reduz mais efetivamente as alucinações factual num agente?',
      opcoes: [
        'Usar modelos maiores com mais parâmetros',
        'RAG — fornecer documentos verificados como contexto para que o modelo baseie as respostas em factos reais',
        'Pedir ao modelo que seja "mais cuidadoso"',
        'Usar temperatura 0 em todas as respostas',
      ],
      correta: 1,
      explicacao: 'RAG ancora as respostas em documentos reais fornecidos no contexto, forçando o modelo a basear-se em factos verificáveis em vez de "inventar" a partir do treino.',
    },
    {
      pergunta: 'O que é "grounding" no contexto de fiabilidade de agentes IA?',
      opcoes: [
        'Conectar o agente à terra elétrica para segurança',
        'Ancorar as respostas do modelo em fontes verificáveis de informação (documentos, bases de dados, APIs)',
        'Limitar o tamanho das respostas',
        'Usar múltiplos modelos em paralelo',
      ],
      correta: 1,
      explicacao: 'Grounding refere-se a conectar o LLM a fontes de verdade externas (documentos, APIs, base de dados), reduzindo a dependência do conhecimento de treino e aumentando a fiabilidade factual.',
    },
  ],

  'ollama-ecossistema-inferencia-local': [
    {
      pergunta: 'O que é o Ollama e qual o seu principal diferencial?',
      opcoes: [
        'Um modelo de linguagem desenvolvido pelo projeto Llama',
        'Uma plataforma que simplifica radicalmente o download, gestão e execução de modelos LLM localmente',
        'Uma API cloud para modelos de linguagem',
        'Um servidor web para hospedar modelos em produção',
      ],
      correta: 1,
      explicacao: 'Ollama abstrai toda a complexidade da inferência local — um único comando `ollama run llama3.2` descarrega e executa o modelo, sem compilação ou configuração manual.',
    },
    {
      pergunta: 'Qual a principal diferença entre Ollama e vLLM em cenário de produção?',
      opcoes: [
        'Ollama suporta mais modelos',
        'vLLM oferece throughput muito superior para múltiplos utilizadores simultâneos com PagedAttention; Ollama é mais simples para uso individual',
        'vLLM funciona sem GPU',
        'Não há diferença significativa',
      ],
      correta: 1,
      explicacao: 'vLLM usa PagedAttention e batching contínuo para servir centenas de requests simultâneos com alta eficiência. Ollama foca em simplicidade para uso individual ou pequenas equipas.',
    },
    {
      pergunta: 'O que é o Open WebUI no ecossistema Ollama?',
      opcoes: [
        'A interface de linha de comandos do Ollama',
        'Uma interface web self-hosted semelhante ao ChatGPT que se conecta ao Ollama para chat local',
        'O repositório online de modelos do Ollama',
        'Um plugin do VS Code para o Ollama',
      ],
      correta: 1,
      explicacao: 'Open WebUI é uma interface de chat web open source que se conecta ao Ollama (ou qualquer API OpenAI-compatible), oferecendo uma experiência semelhante ao ChatGPT completamente local.',
    },
  ],

  conclusao: [
    {
      pergunta: 'Qual é o principal aprendizado prático deste curso?',
      opcoes: [
        'Que a IA local é inferior à cloud em todos os aspectos',
        'Que é possível criar agentes IA funcionais e privados com hardware acessível e software open source',
        'Que só grandes empresas podem usar IA de forma produtiva',
        'Que o fine-tuning é obrigatório para qualquer aplicação prática',
      ],
      correta: 1,
      explicacao: 'O curso demonstra que qualquer pessoa com um PC moderno (8 GB RAM, CPU decente) pode criar agentes IA funcionais, privados e sem custos de API usando ferramentas open source.',
    },
    {
      pergunta: 'Qual seria um bom projeto para consolidar os conhecimentos deste curso?',
      opcoes: [
        'Treinar um modelo de linguagem do zero',
        'Criar um agente de análise de documentos da empresa que responda a perguntas sobre os ficheiros locais',
        'Replicar o GPT-4 em hardware doméstico',
        'Criar uma base de dados vetorial vazia sem dados',
      ],
      correta: 1,
      explicacao: 'Um agente de Q&A sobre documentos locais combina todos os conceitos: llama.cpp, ferramentas, RAG, interface web — sendo imediatamente útil e aplicável no contexto empresarial.',
    },
    {
      pergunta: 'Qual é o próximo passo natural após dominar os conteúdos deste curso?',
      opcoes: [
        'Abandonar IA local e migrar tudo para cloud',
        'Especializar em RAG, fine-tuning ou multi-agente para casos de uso específicos do negócio',
        'Esperar por hardware melhor para começar projetos reais',
        'Limitar o uso de IA a tarefas triviais',
      ],
      correta: 1,
      explicacao: 'Com a base sólida deste curso, o próximo passo é especializar: implementar RAG para documentos da empresa, fazer fine-tuning para o domínio específico, ou criar pipelines multi-agente complexas.',
    },
  ],
};

// ── Module & Lesson Metadata ──────────────────────────────────────────────────

export const MODULOS: ModuloMeta[] = [
  {
    id: 1,
    title: 'Fundamentos',
    description: 'Compreende o impacto da IA, o que são agentes e por que a IA local é uma escolha estratégica.',
    icon: '🧠',
    licoes: [
      { slug: 'ai-impactos-custos-industria', num: '00', title: 'IA: Impactos e Custos na Indústria', icon: '💼', duracao: '12 min', modulo: 1 },
      { slug: 'introducao', num: '01', title: 'Introdução aos Agentes IA Locais', icon: '🚀', duracao: '10 min', modulo: 1 },
      { slug: 'porque-ia-local', num: '02', title: 'Porque Usar IA Local?', icon: '🔒', duracao: '15 min', modulo: 1 },
      { slug: 'limitacoes-hardware', num: '03', title: 'Limitações de Hardware', icon: '💻', duracao: '12 min', modulo: 1 },
      { slug: 'escolha-modelo', num: '04', title: 'Escolha do Modelo LLM', icon: '🤖', duracao: '18 min', modulo: 1 },
      { slug: 'gguf-quantizacao', num: '05', title: 'GGUF e Quantização', icon: '⚙️', duracao: '20 min', modulo: 1 },
    ],
  },
  {
    id: 2,
    title: 'Preparação do Ambiente',
    description: 'Instala e configura todo o ambiente de desenvolvimento para correr modelos locais.',
    icon: '🔧',
    licoes: [
      { slug: 'instalacao-ambiente', num: '06', title: 'Instalação do Ambiente', icon: '📦', duracao: '20 min', modulo: 2 },
      { slug: 'configuracao-python', num: '07', title: 'Configuração Python', icon: '🐍', duracao: '15 min', modulo: 2 },
      { slug: 'instalacao-llamacpp', num: '08', title: 'Instalação do llama.cpp', icon: '⚡', duracao: '25 min', modulo: 2 },
      { slug: 'download-modelo', num: '09', title: 'Download do Modelo', icon: '⬇️', duracao: '12 min', modulo: 2 },
    ],
  },
  {
    id: 3,
    title: 'Construção do Agente',
    description: 'Cria ferramentas personalizadas, constrói o agente e otimiza a performance em CPU.',
    icon: '🏗️',
    licoes: [
      { slug: 'criacao-ferramentas', num: '10', title: 'Criação de Ferramentas', icon: '🛠️', duracao: '25 min', modulo: 3 },
      { slug: 'construcao-agente', num: '11', title: 'Construção do Agente', icon: '🤖', duracao: '30 min', modulo: 3 },
      { slug: 'optimizacoes-cpu', num: '12', title: 'Otimizações para CPU', icon: '🚀', duracao: '20 min', modulo: 3 },
    ],
  },
  {
    id: 4,
    title: 'Interface, Automação e Segurança',
    description: 'Adiciona interface de chat, automatiza fluxos de trabalho e implementa boas práticas de segurança.',
    icon: '🔐',
    licoes: [
      { slug: 'interface-chat', num: '13', title: 'Interface de Chat', icon: '💬', duracao: '20 min', modulo: 4 },
      { slug: 'automatizacao', num: '14', title: 'Automatização de Tarefas', icon: '⚙️', duracao: '25 min', modulo: 4 },
      { slug: 'seguranca-privacidade', num: '15', title: 'Segurança e Privacidade', icon: '🛡️', duracao: '18 min', modulo: 4 },
    ],
  },
  {
    id: 5,
    title: 'Expansão e Ecossistema',
    description: 'Explora melhorias avançadas, modelos alternativos, memória, ontologias e o ecossistema de inferência.',
    icon: '🌐',
    licoes: [
      { slug: 'melhorias-futuras', num: '16', title: 'Melhorias Futuras (RAG, Fine-tuning)', icon: '🔬', duracao: '22 min', modulo: 5 },
      { slug: 'qwen-agente', num: '18', title: 'Qwen como Agente', icon: '🧬', duracao: '18 min', modulo: 5 },
      { slug: 'memoria-conversacional', num: '19', title: 'Memória Conversacional', icon: '🧠', duracao: '20 min', modulo: 5 },
      { slug: 'ontologias', num: '20', title: 'Ontologias e Conhecimento Estruturado', icon: '🕸️', duracao: '22 min', modulo: 5 },
      { slug: 'openclaw-agentes-locais', num: '21', title: 'OpenClaw — Agentes Locais', icon: '🦾', duracao: '20 min', modulo: 5 },
      { slug: 'alucinacoes-fiabilidade-agentes', num: '22', title: 'Alucinações e Fiabilidade', icon: '⚠️', duracao: '18 min', modulo: 5 },
      { slug: 'ollama-ecossistema-inferencia-local', num: '23', title: 'Ollama e Alternativas', icon: '🦙', duracao: '25 min', modulo: 5 },
    ],
  },
  {
    id: 6,
    title: 'Conclusão',
    description: 'Consolida os conhecimentos, revê os próximos passos e celebra a jornada completa.',
    icon: '🏆',
    licoes: [
      { slug: 'conclusao', num: '17', title: 'Conclusão e Próximos Passos', icon: '🎯', duracao: '10 min', modulo: 6 },
    ],
  },
];

/** Flat ordered list of all lessons */
export const ALL_LICOES: LicaoMeta[] = MODULOS.flatMap(m => m.licoes);

/** Total lessons count */
export const TOTAL_LICOES = ALL_LICOES.length;

/** Get previous/next lesson */
export function getPrevNext(slug: string): { prev: LicaoMeta | null; next: LicaoMeta | null } {
  const idx = ALL_LICOES.findIndex(l => l.slug === slug);
  return {
    prev: idx > 0 ? ALL_LICOES[idx - 1] : null,
    next: idx < ALL_LICOES.length - 1 ? ALL_LICOES[idx + 1] : null,
  };
}

/** Get the module for a given lesson slug */
export function getModuloForLicao(slug: string): ModuloMeta | null {
  return MODULOS.find(m => m.licoes.some(l => l.slug === slug)) ?? null;
}
