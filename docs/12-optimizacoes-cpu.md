---
sidebar_position: 12
title: "12. Optimizações de Desempenho"
description: "Tirar o máximo do EmpresaIQ em qualquer PC — configurações práticas de desempenho com Ollama"
---

# Optimizações de Desempenho

> *"O EmpresaIQ já funciona. Agora vamos fazê-lo funcionar melhor — sem gastar mais um cêntimo em hardware."*

---

## Porque é que a optimização importa?

Num PC com 8 GB de RAM a correr um modelo em CPU, cada segundo conta. A diferença entre uma configuração optimizada e uma não optimizada pode ser de 2x a 3x na velocidade de resposta — sem mudar uma linha de código funcional, apenas ajustando parâmetros do Ollama.

```mermaid
graph LR
    A["🐢 Configuração Padrão\n~60 seg/resposta"] -->|"Optimizações Ollama"| B["⚡ Configuração Optimizada\n~25 seg/resposta"]
    B --> C["✅ EmpresaIQ produtivo"]
    style C fill:#2E7D32,color:#fff
    style A fill:#c62828,color:#fff
```

---

## Optimização 1 — Manter o modelo em memória (OLLAMA_KEEP_ALIVE)

Por padrão, o Ollama descarrega o modelo da RAM após 5 minutos de inactividade. Quando o agente é chamado de novo, precisa de carregar o modelo outra vez — o que demora 10-30 segundos.

Para respostas imediatas em produção, aumente o tempo de retenção:

```bash
# Windows (PowerShell) — definir antes de iniciar o Ollama
$env:OLLAMA_KEEP_ALIVE = "30m"   # Manter 30 minutos em memória
ollama serve

# Linux / macOS
OLLAMA_KEEP_ALIVE=30m ollama serve
```

Ou defina permanentemente no sistema:

```bash
# Linux — adicionar ao /etc/environment ou ~/.profile
export OLLAMA_KEEP_ALIVE=30m

# Windows — nas Definições do Sistema > Variáveis de Ambiente
OLLAMA_KEEP_ALIVE = 30m
```

| Valor | Quando usar |
|---|---|
| `5m` (padrão) | PC pessoal com pouca RAM |
| `30m` | Uso empresarial durante o dia |
| `60m` | Servidor sempre ligado |
| `-1` | Nunca descarregar (sempre em RAM) |

---

## Optimização 2 — Ajustar o contexto no Modelfile

O `num_ctx` (tamanho do contexto) define quantos tokens o modelo "lembra" de uma vez. Quanto maior, mais RAM consome. No Modelfile do EmpresaIQ (Cap. 9), configure conforme o hardware:

```dockerfile title="Modelfile"
# Para 8 GB RAM — equilíbrio ideal
PARAMETER num_ctx 4096

# Para 4-6 GB RAM — mais rápido
PARAMETER num_ctx 2048

# Para 16 GB RAM — análise de documentos longos
PARAMETER num_ctx 8192
```

Após alterar o Modelfile, recrie o modelo:

```bash
ollama create empresaiq -f Modelfile
```

---

## Optimização 3 — Temperature para agentes empresariais

A `temperature` controla a "criatividade" do modelo. Para um agente empresarial que precisa de responder com precisão:

```dockerfile title="Modelfile"
PARAMETER temperature 0.05  # Máxima precisão — ideal para dados e números
PARAMETER temperature 0.1   # ✅ Recomendado — preciso mas natural
PARAMETER temperature 0.3   # Ligeiramente mais criativo — para texto narrativo
PARAMETER temperature 0.7   # Alta criatividade — para brainstorming
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

## Optimização 5 — Paralelismo para múltiplos utilizadores

Se o EmpresaIQ servir múltiplos utilizadores simultaneamente (ex: via API web), configure o Ollama para processar pedidos em paralelo:

```bash
# Permitir 2 pedidos simultâneos
$env:OLLAMA_NUM_PARALLEL = "2"

# Manter 2 modelos carregados em RAM (útil para múltiplos modelos)
$env:OLLAMA_MAX_LOADED_MODELS = "2"
```

:::caution Para uso individual
Para uso de uma única pessoa, mantenha `OLLAMA_NUM_PARALLEL=1`. O paralelismo divide os recursos de CPU entre pedidos e pode tornar cada resposta individual mais lenta.
:::

---

## Configuração final recomendada

Para um PC de escritório com 8 GB RAM usado por uma pessoa:

```bash title="iniciar_empresaiq.ps1 (Windows)"
# Script de arranque optimizado
$env:OLLAMA_KEEP_ALIVE = "30m"
$env:OLLAMA_NUM_PARALLEL = "1"
Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
Write-Host "✅ Ollama iniciado — EmpresaIQ pronto!"
```

```bash title="iniciar_empresaiq.sh (Linux/macOS)"
#!/bin/bash
export OLLAMA_KEEP_ALIVE=30m
export OLLAMA_NUM_PARALLEL=1
ollama serve &
echo "✅ Ollama iniciado — EmpresaIQ pronto!"
```

E o Modelfile optimizado:

```dockerfile title="Modelfile (configuração optimizada)"
FROM qwen2.5:3b

SYSTEM """
És o EmpresaIQ...
"""

PARAMETER temperature 0.1
PARAMETER top_p 0.9
PARAMETER num_ctx 4096        # Ajuste conforme RAM disponível
PARAMETER repeat_penalty 1.1
```

---

## Medir a velocidade do EmpresaIQ

Se quiser medir a velocidade de resposta antes e depois das optimizações:

```python title="benchmark_simples.py"
import time
import ollama

start = time.time()
resposta = ollama.chat(
    model='empresaiq',
    messages=[{'role': 'user', 'content': 'Responde apenas: olá'}]
)
elapsed = time.time() - start

tokens = len(resposta['message']['content'].split())
print(f"Tempo de resposta: {elapsed:.1f} segundos")
print(f"Velocidade: ~{tokens/elapsed:.0f} palavras/segundo")
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