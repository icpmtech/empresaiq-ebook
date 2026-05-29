---
sidebar_position: 3
title: "3. Limitações de Hardware e Estratégia"
description: "Como o EmpresaIQ corre num PC normal de escritório com apenas 8 GB de RAM"
---

# Limitações de Hardware e Estratégia

> *"A pergunta não é 'tenho hardware suficiente para correr IA?'. A pergunta certa é 'estou a escolher o modelo certo para o meu hardware?'."*

---

## O mito da GPU obrigatória

Quando a maioria das pessoas ouve "inteligência artificial", pensa automaticamente em servidores enormes, GPUs caras e centros de dados. Esta ideia faz sentido para treinar modelos de IA — esse processo é realmente exigente. Mas **correr** um modelo (o que os técnicos chamam de "inferência") é uma história diferente.

Nos últimos dois anos, houve uma revolução silenciosa: surgiram modelos de linguagem compactos e técnicas de compressão que permitem correr IA genuinamente útil num portátil normal. O EmpresaIQ aproveita exactamente esta revolução.

---

## Porquê alguns modelos são impossíveis num PC normal

Para perceber a estratégia do EmpresaIQ, precisamos de entender brevemente porque é que alguns modelos de IA são tão grandes.

Um modelo de linguagem é essencialmente um conjunto gigantesco de números — chamados "parâmetros" — que representam o conhecimento do modelo. Cada parâmetro precisa de espaço em memória.

| Modelo | Parâmetros | RAM Necessária | GPU |
|---|---|---|---|
| Llama 3 70B | 70 mil milhões | 128 GB | Obrigatória |
| Mixtral 8x7B | 56 mil milhões | 64 GB | Obrigatória |
| DeepSeek V3 | 37 mil milhões | 32 GB+ | Obrigatória |
| Llama 3 8B (formato completo) | 8 mil milhões | 16 GB | Recomendada |
| **Phi-3-mini Q4 (EmpresaIQ)** | **3,8 mil milhões** | **2,2 GB** | **❌ Não precisa** |

Estes modelos grandes estão completamente **fora de alcance** para um computador de escritório. Mas os modelos que usamos no EmpresaIQ cabem confortavelmente em 8 GB de RAM.

:::info O que são "parâmetros"?
Pense nos parâmetros como os neurónios de um cérebro artificial. Mais parâmetros = mais capacidade. Mas, tal como um médico especialista nem sempre é melhor que um médico de clínica geral para uma consulta de rotina, um modelo menor pode ser a escolha certa para tarefas do dia-a-dia.
:::

---

## A estratégia em três pilares

O EmpresaIQ resolve o problema do hardware com três decisões inteligentes, usadas em conjunto:

### Pilar 1 — Modelos compactos e especializados

Em vez de tentar correr modelos gigantes, escolhemos modelos entre **2B e 4B parâmetros** que foram especialmente optimizados para raciocínio e seguimento de instruções. O **Phi-3-mini** da Microsoft e o **Qwen2.5** da Alibaba são dois exemplos excelentes.

Para as tarefas que o EmpresaIQ precisa de realizar, estes modelos são **mais do que suficientes**:

- ✅ Analisar e resumir documentos
- ✅ Responder perguntas sobre conteúdo
- ✅ Redigir emails, relatórios e propostas
- ✅ Executar ferramentas e automatizar tarefas
- ✅ Manter contexto de conversação

### Pilar 2 — Quantização (compressão do modelo)

A quantização é uma técnica que comprime o modelo sem perder demasiada qualidade. É como comprimir uma fotografia: o ficheiro fica muito mais pequeno, e a imagem continua perfeitamente reconhecível.

Na prática:

```
Phi-3-mini formato completo (FP16):   ~7.2 GB  ❌ Não cabe em 8 GB RAM
Phi-3-mini quantizado Q4_K_M:          ~2.2 GB  ✅ Cabe, sobra espaço
```

O sufixo **Q4_K_M** indica o nível de quantização. Vamos aprender mais sobre isto no Capítulo 5. Por agora, o importante é saber que existe, funciona, e é o que o EmpresaIQ usa.

### Pilar 3 — llama.cpp como motor de execução

O **llama.cpp** é uma ferramenta open source que serve de motor para correr modelos GGUF no CPU. Foi escrito em C++ e é extremamente eficiente — usa todos os núcleos disponíveis do processador e gere a memória de forma inteligente.

Sem o llama.cpp, correr um modelo GGUF no CPU seria lento ou impossível. Com ele, a velocidade é muito aceitável para uso profissional.

---

## Como fica a memória no EmpresaIQ

Com esta estratégia, num PC com 8 GB de RAM, a distribuição típica é:

```mermaid
graph TD
    subgraph PC["🖥️ PC com 8 GB RAM — Distribuição Típica"]
        direction LR
        OS["🖥️ Sistema Operativo\n~2 GB"]
        APP["📱 Aplicações abertas\n~1.5 GB"]
        M["🧠 Modelo GGUF Q4\n~2.2 GB"]
        PY["🐍 Python + LangChain\n~0.5 GB"]
        FREE["✅ RAM Livre\n~1.8 GB"]
    end
    style M fill:#E8720C,color:#fff
    style FREE fill:#2E7D32,color:#fff
    style PC fill:#FFFDF5,stroke:#1D2951,stroke-width:2px
```

O EmpresaIQ usa cerca de 2.7 GB para o modelo e o Python — deixando RAM disponível para o sistema operativo e outras aplicações.

:::tip Maximizar a performance disponível
Antes de correr o EmpresaIQ, feche o browser (especialmente se tiver muitos separadores abertos) e outras aplicações pesadas. Cada GB de RAM livre traduz-se em respostas mais rápidas.
:::

---

## A arquitectura completa do EmpresaIQ

Juntando os três pilares, fica assim:

```mermaid
graph TD
    subgraph PC["🖥️ O Seu PC com 8 GB RAM"]
        direction TB
        M["Phi-3-mini Q4_K_M\nModelo GGUF — 2.2 GB"]
        LC["llama.cpp\nMotor CPU — 4+ threads"]
        PY["Python + LangChain\nCérebro do Agente"]
        T["Ferramentas\nFicheiros · Web · BD"]

        M -->|carrega para RAM| LC
        PY -->|chama| LC
        PY --> T
    end

    U["👤 Utilizador"] -->|pergunta| PY
    PY -->|resposta| U

    style PC fill:#FFFDF5,stroke:#1D2951,stroke-width:2px
    style M fill:#E8720C,color:#fff
    style LC fill:#1D2951,color:#fff
    style PY fill:#1D2951,color:#fff
```

---

## O que acontece se tiver mais hardware?

O EmpresaIQ foi desenhado para o mínimo — 8 GB RAM, sem GPU. Mas se tiver mais recursos, o sistema fica ainda melhor:

| Hardware | Impacto no EmpresaIQ |
|---|---|
| 16 GB RAM | Pode usar modelos maiores (7B Q4) com mais contexto |
| 32 GB RAM | Modelos 13B sem problema |
| GPU NVIDIA (VRAM ≥ 8 GB) | Velocidade 5–10x superior |
| CPU com mais núcleos | Respostas mais rápidas |

Mas para a maioria das tarefas empresariais, 8 GB RAM é perfeitamente suficiente.

---

## Resumo

Conseguimos correr o EmpresaIQ num PC normal porque combinamos:

1. **Modelos compactos** (Phi-3-mini, Qwen2.5) — capazes, mas eficientes
2. **Quantização Q4** — reduz o tamanho do modelo de 7 GB para 2.2 GB
3. **llama.cpp** — motor de inferência optimizado para CPU

No próximo capítulo, vamos escolher exactamente qual o modelo certo para o EmpresaIQ — e perceber porque o Phi-3-mini é a nossa escolha de eleição.

---

*Capítulo seguinte: [4. Escolha do Modelo Ideal →](./escolha-modelo)*