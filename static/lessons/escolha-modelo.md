---
sidebar_position: 4
title: "4. Escolha do Modelo Ideal"
description: "Escolher o modelo certo é a decisão mais importante do EmpresaIQ"
---

# Escolha do Modelo Ideal

> *"Escolher o modelo certo é como contratar o colaborador certo: não precisa do mais famoso — precisa do que melhor se adapta ao trabalho e ao orçamento disponível."*

## A pergunta certa a fazer

Há centenas de modelos de linguagem disponíveis gratuitamente na biblioteca do Ollama. A maioria das pessoas comete o mesmo erro: tenta usar o maior modelo possível, fica com o computador bloqueado, e desiste.

A pergunta certa não é *"qual é o melhor modelo do mundo?"* — é **"qual é o melhor modelo para o meu hardware e para as tarefas do EmpresaIQ?"**

A resposta, para um PC com 8 GB de RAM sem GPU, leva-nos sempre ao mesmo destino: o **Qwen2.5-3B**.

---

## O processo de decisão

```mermaid
flowchart TD
    A["🖥️ Ponto de partida\n8 GB RAM · Apenas CPU"] --> B{"Qual é a prioridade?"}
    B -->|"Máxima velocidade\n(4–6 GB RAM)" | E["Qwen2.5-1.5B\n⚡ Muito rápido"]
    B -->|"Equilíbrio ideal\n(8 GB RAM)" | F["Qwen2.5-3B\n⭐ EmpresaIQ (recomendado)"]
    B -->|"Máxima qualidade\n(16 GB RAM)" | G["Qwen2.5-7B\n🐢 Mais lento, mais capaz"]
    style F fill:#E8720C,color:#fff
    style E fill:#1D2951,color:#fff
```

Para o EmpresaIQ, **o Qwen2.5-3B é a escolha principal** — o ponto óptimo entre qualidade, velocidade e eficiência de memória para hardware de escritório.

---

## O modelo escolhido: Qwen2.5-3B da Alibaba

O **Qwen2.5** é uma família de modelos de linguagem desenvolvida pela Alibaba Cloud. A variante de **3 mil milhões de parâmetros** (3B) é excepcionalmente capaz para o seu tamanho, com forte suporte multilingue — incluindo português europeu.

### Porque é que foi escolhido para o EmpresaIQ?

A Alibaba treinou o Qwen2.5 com dados de alta qualidade em mais de 29 línguas, dando especial atenção ao raciocínio, código e seguimento de instruções. O resultado é um modelo que:

- **Raciocina bem** — segue instruções complexas com precisão
- **Português nativo** — compreende e escreve em português europeu com qualidade
- **Eficiência em CPU** — desenhado para hardware limitado, mesmo sem GPU
- **Seguimento de ferramentas** — responde bem ao padrão ReAct que o agente usa (ver Cap. 11)
- **Base do EmpresaIQ** — personalizado via Modelfile para a identidade e contexto da empresa

---

## Comparação com alternativas

| Modelo | Ollama Tag | RAM | Qualidade PT | Velocidade CPU | Raciocínio | Conclusão |
|---|---|---|---|---|---|---|
| **Qwen2.5-3B** | **`qwen2.5:3b`** | **~2.0 GB** | **✅ Muito bom** | **⚡ Rápido** | **⭐⭐⭐⭐** | **✅ Escolha EmpresaIQ** |
| TinyLlama 1.1B | `tinyllama` | 0.8 GB | ⚠️ Fraco | ⚡⚡ Muito rápido | ⭐⭐ | ❌ Demasiado fraco |
| Phi-3-mini 3.8B | `phi3:mini` | 2.2 GB | ✅ Excelente | ⚡ Rápido | ⭐⭐⭐⭐⭐ | ✅ Boa alternativa |
| Llama 3.2 3B | `llama3.2:3b` | 2.0 GB | ✅ Bom | ⚡ Rápido | ⭐⭐⭐⭐ | ✅ Boa alternativa |
| Qwen2.5-7B | `qwen2.5:7b` | 4.7 GB | ✅ Excelente | 🐢 Lento em 8 GB | ⭐⭐⭐⭐⭐ | ⚠️ Para 16 GB RAM |
| Mistral 7B | `mistral:7b` | 4.1 GB | ✅ Bom | 🐢 Lento | ⭐⭐⭐⭐ | ⚠️ Pesado para 8 GB |

O Qwen2.5-3B é o **ponto óptimo** entre qualidade, velocidade e consumo de memória para o nosso caso de uso.

---

## Quanto RAM vai usar no total?

Com o Qwen2.5-3B via Ollama, a distribuição de memória é confortável:

```
Sistema Operativo (Windows/Linux):   ~2.0 GB
Qwen2.5-3B via Ollama (Q4):          ~2.0 GB
Python + LangChain + ferramentas:    ~0.5 GB
─────────────────────────────────────────────
Total utilizado:                     ~4.5 GB
Disponível (buffer do SO):           ~3.5 GB  ✅
```

Sobra espaço suficiente para o sistema operativo e outras aplicações continuarem a funcionar normalmente.

---

## Como obter o modelo

Com o Ollama instalado (Cap. 8), o download é um único comando:

```bash
ollama pull qwen2.5:3b
```

O Ollama descarrega automaticamente a versão quantizada optimizada (~2.0 GB) e gere o ficheiro internamente — não precisa de procurar no Hugging Face nem de escolher ficheiros GGUF manualmente.

:::tip Uso comercial
O Qwen2.5 tem licença Apache 2.0 — pode usá-lo livremente em produtos comerciais, incluindo o EmpresaIQ da sua empresa, sem pagar royalties.
:::

---

## Como o Ollama gere os modelos

O Ollama simplifica radicalmente a gestão de modelos. Com o Ollama, basta:

```bash
ollama pull qwen2.5:3b   # Descarregar
ollama run qwen2.5:3b    # Testar interactivamente
ollama list              # Ver modelos instalados
```

O Ollama gere tudo o resto: quantização, localização dos ficheiros, API de inferência.

---

## O modelo EmpresaIQ personalizado

No Capítulo 9, vamos ir além do modelo base e criar o **modelo empresaiq** — uma versão personalizada do Qwen2.5-3B com:

- **Identidade**: sabe que é o assistente da EmpresaIQ
- **Língua**: responde sempre em português de Portugal
- **Temperatura optimizada**: respostas precisas e consistentes
- **Contexto empresarial**: orientado para tarefas de negócio

Esse modelo personalizado é criado com um simples ficheiro de configuração chamado **Modelfile** — sem código, sem treino adicional.

---

## Resumo

- Escolhemos o **Qwen2.5-3B** para o EmpresaIQ, disponível via `ollama pull qwen2.5:3b`
- É o melhor equilíbrio entre qualidade, velocidade e consumo de RAM (apenas 2.0 GB)
- O Ollama gere a quantização e os ficheiros automaticamente
- No Cap. 9, personalizamos o modelo para criar o **empresaiq** com identidade e comportamento próprios
- Tem licença Apache 2.0 — pode ser usado em contexto empresarial

---

*Capítulo seguinte: [5. Como o Ollama Gere os Modelos →](./gguf-quantizacao)*

A pergunta certa não é *"qual é o melhor modelo do mundo?"* — é **"qual é o melhor modelo para o meu hardware e para as tarefas do EmpresaIQ?"**

A resposta, para um PC com 8 GB de RAM sem GPU, leva-nos sempre ao mesmo destino.

---

## O processo de decisão

```mermaid
flowchart TD
    A["🖥️ Ponto de partida\n8 GB RAM · Apenas CPU"] --> B{"Precisa de boa\ncompreensão de Português?"}
    B -->|"Sim — contexto empresarial PT"| C{"Qual é a prioridade?"}
    B -->|"Não — apenas Inglês"| D["Phi-3-mini\n✅ Boa escolha"]
    C -->|"Máxima velocidade"| E["Qwen2.5-1.5B\n⚡ Muito rápido"]
    C -->|"Equilíbrio ideal"| F["Phi-3-mini Q4_K_M\n⭐ Recomendado EmpresaIQ"]
    C -->|"Máxima qualidade"| G["Qwen2.5-7B Q4\n🐢 Mais lento, mais capaz"]
    style F fill:#E8720C,color:#fff
    style D fill:#1D2951,color:#fff
```

Para o EmpresaIQ, **o Phi-3-mini Q4_K_M é a escolha principal**. O Qwen2.5 é abordado no Capítulo 17 como alternativa avançada.

---

## O modelo escolhido: Phi-3-mini da Microsoft

O **Phi-3-mini-4k-instruct** é um modelo de linguagem desenvolvido pela Microsoft Research. Tem 3.8 mil milhões de parâmetros — pequeno para os padrões da indústria, mas extraordinariamente capaz para o seu tamanho.

### Porque é que a Microsoft o criou?

A Microsoft investiu deliberadamente em criar modelos pequenos de alta qualidade, ao contrário da tendência de tornar os modelos cada vez maiores. O resultado foi o Phi-3-mini: um modelo que foi treinado com dados de altíssima qualidade (livros de texto, código, raciocínio estruturado) em vez de simplesmente usar mais dados.

### O que o torna especial para o EmpresaIQ?

- **Raciocínio** — segue instruções complexas com precisão
- **Português** — compreende e escreve em português europeu com qualidade
- **Eficiência** — foi desenhado explicitamente para hardware limitado
- **Seguimento de ferramentas** — responde bem ao padrão ReAct que o agente usa (ver Cap. 11)

---

## Comparação com alternativas

| Modelo | RAM (Q4) | Qualidade PT | Velocidade CPU | Raciocínio | Conclusão |
|---|---|---|---|---|---|
| **Phi-3-mini Q4_K_M** | **2.2 GB** | **✅ Excelente** | **⚡ Rápido** | **⭐⭐⭐⭐⭐** | **✅ Escolha EmpresaIQ** |
| TinyLlama 1.1B | 0.8 GB | ⚠️ Fraco | ⚡⚡ Muito rápido | ⭐⭐ | ❌ Demasiado fraco |
| Llama 3 8B Q2 | 3.5 GB | ✅ Bom | 🐢 Lento | ⭐⭐⭐⭐ | ⚠️ Pesado para 8 GB |
| Mistral 7B Q2 | 3.0 GB | ✅ Bom | 🐢 Lento | ⭐⭐⭐⭐ | ⚠️ Lento em CPU |
| Gemma 2B | 1.5 GB | ⚠️ Médio | ⚡ Rápido | ⭐⭐⭐ | ⚠️ Qualidade inferior |
| Qwen2.5-3B | 2.0 GB | ✅ Muito bom | ⚡ Rápido | ⭐⭐⭐⭐ | ✅ Alternativa (Cap. 17) |

O Phi-3-mini é o **ponto óptimo** entre qualidade, velocidade e consumo de memória para o nosso caso de uso.

---

## Quanto RAM vai usar no total?

Com o Phi-3-mini Q4_K_M, a distribuição de memória é confortável:

```
Sistema Operativo (Windows/Linux):   ~2.0 GB
Phi-3-mini Q4_K_M (modelo GGUF):     ~2.2 GB
Python + LangChain + ferramentas:    ~0.5 GB
─────────────────────────────────────────────
Total utilizado:                     ~4.7 GB
Disponível (buffer do SO):           ~3.3 GB  ✅
```

Sobra espaço suficiente para o sistema operativo e outras aplicações continuarem a funcionar normalmente.

---

## Dois sabores do Phi-3-mini

O modelo existe em duas variantes com tamanhos de contexto diferentes. O "contexto" define quantos tokens (pedaços de texto) o modelo consegue processar de uma vez:

| Variante | Contexto máximo | Quando usar |
|---|---|---|
| `phi-3-mini-4k-instruct` | 4.096 tokens (~3.000 palavras) | **Recomendado** — tarefas do dia-a-dia |
| `phi-3-mini-128k-instruct` | 128.000 tokens (~96.000 palavras) | Análise de documentos muito longos |

:::warning Use sempre a versão 4k para começar
A versão 128k precisa de muito mais RAM durante a inferência e é significativamente mais lenta em CPU. Para o EmpresaIQ, comece sempre com a versão **4k**. Pode sempre trocar depois.
:::

---

## Onde está o ficheiro que vamos descarregar?

O modelo está disponível gratuitamente no **Hugging Face** — a maior plataforma de modelos de IA open source do mundo:

```
Repositório : bartowski/Phi-3-mini-4k-instruct-GGUF
Ficheiro    : Phi-3-mini-4k-instruct-Q4_K_M.gguf
Tamanho     : ~2.2 GB
Licença     : MIT (uso comercial permitido)
```

:::tip Uso comercial
O Phi-3-mini tem licença MIT — pode usá-lo livremente em produtos comerciais, incluindo o EmpresaIQ da sua empresa, sem pagar royalties.
:::

As instruções exactas de download estão no Capítulo 9. Mas antes de descarregar qualquer coisa, precisamos de perceber o formato GGUF e a quantização — o próximo capítulo explica isso.

---

## Resumo

- Escolhemos o **Phi-3-mini Q4_K_M** para o EmpresaIQ
- É o melhor equilíbrio entre qualidade, velocidade e consumo de RAM
- Usa apenas 2.2 GB do modelo, deixando RAM suficiente para tudo o resto
- Tem licença MIT — pode ser usado em contexto empresarial
- Uma alternativa (Qwen2.5) é explorada no Capítulo 17

---

*Capítulo seguinte: [5. O que é GGUF e Quantização →](./gguf-quantizacao)*