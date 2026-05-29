---
sidebar_position: 17
title: "17. Qwen2.5 no Agente EmpresaIQ"
description: "Como utilizar o modelo Qwen2.5 no agente EmpresaIQ em hardware com 8 GB RAM"
---

# Capítulo 17 — Utilização do Modelo Qwen2.5 no Agente EmpresaIQ

```mermaid
flowchart TD
    A[Escolher modelo] --> B{Recursos?}
    B -->|4 GB RAM| C[Qwen2.5-1.5B Q4]
    B -->|8 GB RAM| D[Qwen2.5-3B Q4 - Recomendado]
    B -->|16 GB RAM| E[Qwen2.5-7B Q4]
    D --> F[Excelente Portugues]
    D --> G[Instrucoes seguidas]
    D --> H[Velocidade aceitavel]
    style D fill:#E8720C,color:#fff
```
## 17.1 Introdução ao Qwen

O Qwen2.5 é uma família de modelos de linguagem Open Source desenvolvida para desempenho elevado em tarefas de raciocínio, seguimento de instruções e utilização de ferramentas (tool use).

Em cenários de hardware limitado, como máquinas com 8 GB de RAM e execução apenas em CPU, o Qwen destaca-se como uma das melhores alternativas disponíveis atualmente.

Este modelo foi desenhado para ser eficiente, consistente e especialmente forte em tarefas estruturadas — tornando-o ideal para agentes inteligentes empresariais como o EmpresaIQ.

---

## 17.2 Vantagens do Qwen para Agentes Locais

Ao contrário de modelos mais antigos ou menos otimizados, o Qwen2.5 apresenta várias vantagens críticas:

- Excelente compreensão de instruções complexas
- Elevada estabilidade em fluxos ReAct (Reason + Act)
- Melhor consistência em respostas estruturadas (JSON e tool calling)
- Forte desempenho multilingue (Português, Inglês e Espanhol)
- Menor taxa de alucinação em tarefas com ferramentas externas

Estas características tornam-no particularmente adequado para sistemas de automação empresarial e agentes de decisão.

---

## 17.3 Versão Recomendada para 8 GB RAM

Para sistemas com recursos limitados, a versão ideal é:

**Qwen2.5-3B-Instruct (GGUF Q4\_K\_M)**

### Consumo estimado

| Recurso | Valor |
|---|---|
| RAM utilizada | ~2.5 GB a 3.5 GB |
| CPU | Moderado |
| Performance | Fluida em tempo real (dependendo do processador) |

### Alternativas

| Modelo | Velocidade | Inteligência | Indicado para |
|---|---|---|---|
| Qwen2.5-1.5B | ⚡ Muito rápido | ⭐⭐ | Hardware muito limitado |
| Qwen2.5-3B Q4\_K\_M | ⚡ Rápido | ⭐⭐⭐ | **Recomendado** |
| Qwen2.5-7B Q4 | 🐢 Moderado | ⭐⭐⭐⭐ | Próximo do limite de RAM |

---

## 17.4 Integração com Llama.cpp

O Qwen pode ser facilmente executado através da biblioteca `llama-cpp-python`, mantendo compatibilidade total com arquiteturas de agentes baseadas em LangChain.

A substituição do modelo é direta:

```python
model_path = "./qwen2.5-3b-instruct-q4_k_m.gguf"
```

O restante pipeline permanece inalterado, incluindo ferramentas e agente ReAct.

### Exemplo completo de carregamento

```python
from llama_cpp import Llama

llm = Llama(
    model_path="./qwen2.5-3b-instruct-q4_k_m.gguf",
    n_ctx=4096,
    n_threads=4,
    n_batch=256,
    verbose=False,
)
```

---

## 17.5 Ajustes Recomendados para Melhor Performance

Para garantir estabilidade e rapidez no CPU, recomenda-se:

- Definir contexto (`n_ctx`) entre 2048 e 4096
- Ajustar threads ao número de núcleos físicos do CPU
- Utilizar `temperature` entre 0.1 e 0.3
- Limitar iterações do agente (max 3 a 4 loops)
- Reduzir o tamanho das respostas das ferramentas

### Configuração otimizada recomendada

```python
llm = Llama(
    model_path="./qwen2.5-3b-instruct-q4_k_m.gguf",
    n_ctx=4096,
    n_threads=4,      # Ajustar ao número de núcleos físicos
    n_batch=256,
    temperature=0.2,
    verbose=False,
)
```

---

## 17.6 Melhorias no Prompt para Qwen

O Qwen responde melhor a prompts diretos e estruturados.

Ao contrário de outros modelos, não necessita de prompts excessivamente longos.

### Boas práticas

- Linguagem simples e directa
- Estrutura clara de Thought / Action / Observation
- Indicação explícita de resposta final em português

### Exemplo de prompt eficaz

```
Você é um assistente empresarial. Responda sempre em português de Portugal.
Quando usar ferramentas, siga exactamente o formato:
Thought: [raciocínio]
Action: [nome_ferramenta]
Action Input: [parâmetro]
Observation: [resultado]
Final Answer: [resposta ao utilizador]
```

---

## 17.7 Impacto no Agente EmpresaIQ

A adoção do Qwen2.5 no agente EmpresaIQ resulta em:

- Maior precisão em decisões automatizadas
- Melhor integração com ferramentas externas (APIs e bases de dados)
- Redução de erros de interpretação
- Melhor experiência conversacional
- Maior robustez em ambientes de produção locais

---

## 17.8 Conclusão

O Qwen2.5 representa um salto significativo na construção de agentes inteligentes leves.

Quando combinado com Llama.cpp e uma arquitetura de ferramentas bem definida, permite criar sistemas de IA locais altamente eficientes mesmo em hardware modesto.

Para o EmpresaIQ, isto significa:

- Independência total de cloud
- Custos reduzidos
- Controlo total dos dados
- Capacidade de escalar automação empresarial localmente

Este modelo torna possível aproximar agentes inteligentes de nível empresarial a qualquer computador pessoal moderno.