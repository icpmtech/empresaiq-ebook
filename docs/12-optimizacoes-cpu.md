---
sidebar_position: 12
title: "12. Optimizações para CPU"
description: "Tirar o máximo do EmpresaIQ em qualquer PC — configurações práticas de desempenho"
---

# Optimizações para CPU

> *"O EmpresaIQ já funciona. Agora vamos fazê-lo funcionar melhor — sem gastar mais um cêntimo em hardware."*

---

## Porque é que a optimização importa?

Num PC com 8 GB de RAM a correr um modelo em CPU, cada segundo conta. A diferença entre uma configuração optimizada e uma não optimizada pode ser de 2x a 4x na velocidade de resposta — sem mudar uma linha de código funcional, apenas ajustando parâmetros.

```mermaid
graph LR
    A["🐢 Configuração Padrão\n~60 seg/resposta"] -->|"Optimizações"| B["⚡ Configuração Optimizada\n~20 seg/resposta"]
    B --> C["✅ EmpresaIQ produtivo"]
    style C fill:#2E7D32,color:#fff
    style A fill:#c62828,color:#fff
```

---

## Optimização 1 — Acertar o número de threads

Esta é a configuração com **maior impacto** na velocidade. O `n_threads` define quantos núcleos do CPU o llama.cpp usa para gerar cada resposta.

```python title="agente_local.py (ajuste este valor)"
llm = LlamaCpp(
    model_path="./Phi-3-mini-4k-instruct-Q4_K_M.gguf",
    n_threads=4,   # ← AJUSTE AQUI
    ...
)
```

### Como saber quantos núcleos tem o seu CPU:

```bash
# Windows (PowerShell)
(Get-WmiObject Win32_Processor).NumberOfLogicalProcessors
# Resultado: 8 = 8 núcleos lógicos (use n_threads = 4 a 6)

# Linux
nproc

# macOS
sysctl -n hw.logicalcpu
```

| CPU (exemplos) | Núcleos Lógicos | n_threads recomendado |
|---|---|---|
| Intel Core i3 (2 cores) | 4 | 2 |
| Intel Core i5 (4 cores) | 8 | 4 |
| Intel Core i7 (6 cores) | 12 | 6 |
| AMD Ryzen 5 (6 cores) | 12 | 6 |
| AMD Ryzen 7 (8 cores) | 16 | 6-8 |

:::tip Regra prática
Use os **núcleos físicos** (metade dos lógicos em CPUs com Hyper-Threading), ou núcleos lógicos - 2. Deixe sempre 1-2 núcleos livres para o sistema operativo.
:::

---

## Optimização 2 — Ajustar o contexto ao mínimo necessário

O `n_ctx` (tamanho do contexto) afecta directamente a RAM usada e a velocidade. Quanto maior o contexto, mais lento e mais RAM consome.

```python
n_ctx=1024   # ⚡⚡ Máxima velocidade — para perguntas curtas e directas
n_ctx=2048   # ✅ Recomendado — equilíbrio ideal
n_ctx=4096   # ⚠️ Mais lento — apenas para documentos longos
n_ctx=8192   # 🐢 Muito lento — evitar em 8 GB RAM
```

Para o EmpresaIQ em uso normal, `n_ctx=2048` cobre a maioria das tarefas empresariais.

---

## Optimização 3 — Temperature para agentes empresariais

A `temperature` controla a "criatividade" do modelo. Para um agente empresarial que precisa de responder com precisão:

```python
temperature=0.05  # Máxima precisão — ideal para dados e números
temperature=0.1   # ✅ Recomendado — preciso mas natural
temperature=0.3   # Ligeiramente mais criativo — para texto narrativo
temperature=0.7   # Alta criatividade — para brainstorming
```

Com `temperature` baixa, o agente:
- Segue instruções com mais rigor
- Usa ferramentas de forma mais consistente
- Produz menos "alucinações" (informação incorrecta inventada)

---

## Optimização 4 — Libertar RAM antes de correr o agente

Antes de executar o EmpresaIQ, feche aplicações que consomem muita RAM:

```
🚫 Fechar (maior impacto):
   • Browser com muitos separadores (Chrome/Edge pode usar 2-4 GB)
   • Docker Desktop
   • Adobe Creative Suite
   • Microsoft Teams / Slack (em segundo plano)

✅ Pode manter aberto:
   • Terminal / PowerShell
   • Editor de código (VS Code)
   • Explorador de ficheiros
```

### Ver o que está a consumir mais RAM:

```bash
# Windows (PowerShell)
Get-Process | Sort-Object WorkingSet -Descending | `
  Select-Object -First 10 Name, @{N='RAM(MB)';E={[math]::Round($_.WorkingSet/1MB,0)}}

# Linux
ps aux --sort=-%mem | head -10
```

---

## Optimização 5 — Recompilar com AVX2 (30-50% mais rápido)

Se ainda não fez isto no Capítulo 8, aqui está o impacto e como fazer:

**Verificar suporte AVX2:**

```bash
# Linux
grep -m1 avx2 /proc/cpuinfo && echo "AVX2 suportado!" || echo "AVX2 não disponível"

# Windows — a maioria dos Core i3/i5/i7/i9 e Ryzen suportam
```

**Recompilar:**

```bash
# Windows
$env:CMAKE_ARGS = "-DLLAMA_AVX2=on -DLLAMA_AVX=on"
pip install llama-cpp-python==0.2.76 --force-reinstall --no-cache-dir

# Linux / macOS
CMAKE_ARGS="-DLLAMA_AVX2=on -DLLAMA_AVX=on" \
pip install llama-cpp-python==0.2.76 --force-reinstall --no-cache-dir
```

---

## Configuração final recomendada

Juntando todas as optimizações, o `agente_local.py` optimizado fica assim:

```python title="agente_local.py (configuração optimizada)"
llm = LlamaCpp(
    model_path="./Phi-3-mini-4k-instruct-Q4_K_M.gguf",
    n_ctx=2048,          # Contexto suficiente para tarefas empresariais
    n_threads=4,         # Substitua pelo número de núcleos físicos do seu CPU
    n_batch=512,         # Processa 512 tokens de cada vez (melhora throughput)
    temperature=0.1,     # Precisão máxima para uso empresarial
    repeat_penalty=1.1,  # Reduz repetições nas respostas
    verbose=False
)
```

---

## Medir a velocidade do EmpresaIQ

Se quiser medir a melhoria antes e depois das optimizações:

```python title="benchmark_simples.py"
import time
from llama_cpp import Llama

llm = Llama(
    model_path="./Phi-3-mini-4k-instruct-Q4_K_M.gguf",
    n_ctx=512,
    n_threads=4,
    verbose=False
)

start = time.time()
resposta = llm("Responde apenas: olá", max_tokens=10)
elapsed = time.time() - start

print(f"Tempo de resposta: {elapsed:.1f} segundos")
print(f"Velocidade: ~{10/elapsed:.0f} tokens/segundo")
```

---

## Resumo

As 5 optimizações por ordem de impacto:

| Optimização | Impacto Esperado | Dificuldade |
|---|---|---|
| 1. Acertar `n_threads` | ⭐⭐⭐⭐⭐ muito alto | Trivial |
| 2. Ajustar `n_ctx` | ⭐⭐⭐ alto | Trivial |
| 3. Recompilar com AVX2 | ⭐⭐⭐⭐ alto | Fácil |
| 4. Libertar RAM | ⭐⭐⭐ médio | Manual |
| 5. `temperature` baixa | ⭐⭐ qualidade | Trivial |

Com estas configurações, o EmpresaIQ já é um agente produtivo em qualquer PC de escritório.

---

*Capítulo seguinte: [13. Interface de Chat Local →](./interface-chat)*
## 1. Ajustar Threads ao CPU

A configuração mais impactante é o número de threads:

```python
llm = LlamaCpp(
    model_path="./modelo.gguf",
    n_threads=4,    # ← Ajuste aqui
    ...
)
```

| CPU | n_threads recomendado |
|---|---|
| Dual-core (2C/4T) | `2` |
| Quad-core (4C/8T) | `4` |
| Hexa-core (6C/12T) | `6` |
| Octa-core (8C/16T) | `8` |

### Como saber quantos núcleos tem

```bash
# Windows PowerShell
(Get-WmiObject Win32_Processor).NumberOfLogicalProcessors

# Linux
nproc

# macOS
sysctl -n hw.logicalcpu
```

:::tip
Não use **todos** os threads disponíveis — deixe 1-2 para o sistema operativo funcionar sem lentidão.
:::

---

## 2. Limitar o Contexto

O contexto (n_ctx) afecta directamente a RAM e velocidade:

```python
n_ctx=2048   # ✅ Recomendado para 8 GB RAM — rápido
n_ctx=4096   # ⚠️ Aceitável — mais lento
n_ctx=8192   # ❌ Evitar — muito lento e consome RAM
```

Regra prática: **use o contexto mínimo** necessário para a tarefa.

---

## 3. Temperature Baixa para Agentes

```python
temperature=0.1   # ✅ Precisão máxima — ideal para agentes
temperature=0.5   # Criatividade moderada
temperature=0.9   # Alta criatividade — respostas variadas
```

Para agentes empresariais, **temperature baixa** é sempre melhor:
- Respostas mais previsíveis e consistentes
- Seguimento de instruções mais rigoroso
- Menos "alucinações"

---

## 4. Fechar Aplicações que Consomem RAM

Antes de executar o agente:

```
❌ Fechar:
   - Chrome / Edge com muitos separadores
   - Discord / Teams / Slack
   - Docker Desktop
   - Adobe Creative Suite
   - Jogos

✅ Manter aberto:
   - Terminal / PowerShell
   - VS Code (se necessário)
```

### Ver consumo de RAM actual

```bash
# Windows PowerShell
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 Name, @{N='RAM(MB)';E={[math]::Round($_.WorkingSet/1MB,0)}}

# Linux
ps aux --sort=-%mem | head -10
```

---

## 5. Activar AVX2 (CPU moderno)

Se o seu CPU suporta AVX2 (Intel desde 2013, AMD Ryzen), recompile o llama-cpp-python com esta optimização:

```bash
# Windows
set CMAKE_ARGS="-DLLAMA_AVX2=on -DLLAMA_AVX=on"
pip install llama-cpp-python==0.2.76 --force-reinstall --no-cache-dir

# Linux / macOS
CMAKE_ARGS="-DLLAMA_AVX2=on -DLLAMA_AVX=on" \
pip install llama-cpp-python==0.2.76 --force-reinstall --no-cache-dir
```

**Melhoria esperada: 30-50% mais rápido.**

---

## 6. Configuração Completa Optimizada

```python title="llm optimizado"
llm = LlamaCpp(
    model_path="./Phi-3-mini-4k-instruct-Q4_K_M.gguf",
    n_ctx=2048,
    n_threads=4,         # Ajuste ao seu CPU
    n_batch=512,         # Tamanho do batch de processamento
    temperature=0.1,
    repeat_penalty=1.1,  # Evita repetições nas respostas
    top_p=0.9,
    verbose=False,
    use_mmap=True,       # Memory-mapped file — carregamento mais rápido
    use_mlock=False,     # Não bloqueia RAM — deixa OS gerir
)
```

---

## Comparação de Velocidade

Com as optimizações aplicadas num PC típico (Intel i5, 8 GB RAM):

| Configuração | Tokens/segundo |
|---|---|
| Base (sem optimizações) | ~5-8 tok/s |
| + n_threads correcto | ~10-15 tok/s |
| + AVX2 compilado | ~15-25 tok/s |
| + n_ctx reduzido | ~20-30 tok/s |

Para uma resposta de 100 tokens:
- Sem optimizações: **~15 segundos**
- Com optimizações: **~4-5 segundos**