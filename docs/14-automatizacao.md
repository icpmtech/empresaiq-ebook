---
sidebar_position: 14
title: "14. Automatização por Hora"
description: "Agendar o EmpresaIQ para correr automaticamente — relatórios, alertas e monitorização sem intervenção humana"
---

# Automatização por Hora

> *"Um agente que precisa de um humano para cada tarefa ainda é uma ferramenta. Um agente que trabalha sozinho é um colaborador."*

---

## O que vamos construir

Neste capítulo, o EmpresaIQ aprende a trabalhar sem que ninguém o inicie manualmente:

- De hora a hora, gera relatórios e guarda-os em ficheiro
- Todas as manhãs, prepara um resumo para a equipa
- Monitoriza dados e gera alertas automaticamente

```mermaid
flowchart TD
    A["⏰ Tarefa Agendada\n(Cron / Task Scheduler)"] --> B["🤖 EmpresaIQ\nAgente automático"]
    B --> C{"📊 Tipo de tarefa"}
    C -->|"Relatório"| D["📄 Gerar ficheiro\n.jsonl / .txt"]
    C -->|"Monitorização"| E["🔍 Verificar dados\ne gerar alerta"]
    C -->|"Resumo"| F["📝 Resumo diário\npara a equipa"]
    D & E & F --> G["💾 Log de actividade"]
    style B fill:#1D2951,color:#fff
    style G fill:#E8720C,color:#fff
```

---

## Passo 1 — Criar o script automático

Primeiro, crie um script que o agente possa executar sem interação humana:

```python title="agente_automatico.py"
import sys
from agente_local import agent_executor
from datetime import datetime
import json

def executar_tarefa(pergunta: str, ficheiro_output: str = "log_agente.jsonl"):
    """Executa uma tarefa no agente e guarda o resultado."""

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    print(f"[{timestamp}] A processar: {pergunta}")

    try:
        resultado = agent_executor.invoke({"input": pergunta})
        resposta = resultado["output"]
    except Exception as e:
        resposta = f"ERRO: {str(e)}"

    print(f"Resposta: {resposta}")

    # Guardar em ficheiro JSON Lines (uma linha por registo)
    entrada = {
        "timestamp": datetime.now().isoformat(),
        "pergunta": pergunta,
        "resposta": resposta
    }

    with open(ficheiro_output, 'a', encoding='utf-8') as f:
        f.write(json.dumps(entrada, ensure_ascii=False) + "\n")

    return resposta


if __name__ == "__main__":
    # Tarefa padrão ou argumento da linha de comandos
    tarefa = sys.argv[1] if len(sys.argv) > 1 else "Quais os serviços disponíveis da EmpresaIQ e os seus preços?"
    executar_tarefa(tarefa)
```

**Testar manualmente:**

```bash
python agente_automatico.py "Gera um resumo dos serviços EmpresaIQ"
# O resultado é guardado em log_agente.jsonl
```

---

## Passo 2 — Agendar no Linux (Cron)

```bash
# Abrir o editor de cron
crontab -e
```

Adicione as linhas necessárias:

```cron
# Correr de hora a hora
0 * * * * cd /home/user/empresaiq-agent && source venv/bin/activate && python agente_automatico.py >> /var/log/agente.log 2>&1

# Correr todos os dias às 08:00
0 8 * * * cd /home/user/empresaiq-agent && source venv/bin/activate && python agente_automatico.py "Gera relatório diário de serviços" >> /var/log/agente.log 2>&1

# Correr às 2ª feira às 09:00
0 9 * * 1 cd /home/user/empresaiq-agent && source venv/bin/activate && python agente_automatico.py "Resumo semanal do portfolio" >> /var/log/agente.log 2>&1
```

**Sintaxe do Cron:**

```
┌─────────────────── minuto (0-59)
│ ┌───────────────── hora (0-23)
│ │ ┌─────────────── dia do mês (1-31)
│ │ │ ┌───────────── mês (1-12)
│ │ │ │ ┌─────────── dia da semana (0-7)
│ │ │ │ │
* * * * * comando
```

---

## Passo 2 (alternativa) — Agendar no Windows

### Via PowerShell

```powershell
# Criar tarefa para correr de hora a hora
$Acao = New-ScheduledTaskAction `
    -Execute "$env:USERPROFILE\empresaiq-agent\venv\Scripts\python.exe" `
    -Argument "agente_automatico.py" `
    -WorkingDirectory "$env:USERPROFILE\empresaiq-agent"

$Gatilho = New-ScheduledTaskTrigger `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -Once -At (Get-Date)

Register-ScheduledTask `
    -TaskName "EmpresaIQ-Automatico" `
    -Action $Acao `
    -Trigger $Gatilho `
    -Description "EmpresaIQ — agente automático"
```

### Via interface gráfica

1. Abra o **Agendador de Tarefas** (`taskschd.msc`)
2. Clique **Criar Tarefa Básica...**
3. Nome: `EmpresaIQ Automático`
4. Trigger: **Diariamente** às 08:00
5. Acção: **Iniciar um programa**
   - Programa: `C:\empresaiq-agent\venv\Scripts\python.exe`
   - Argumentos: `agente_automatico.py "Relatório diário"`
   - Iniciar em: `C:\empresaiq-agent`

---

## Casos de uso reais

| Tarefa | Agendamento | Ficheiro de saída |
|---|---|---|
| Relatório diário de portfolio | Todos os dias 08:00 | `relatorio_diario.jsonl` |
| Verificação de contratos públicos | De 2 em 2 horas | `contratos_alerta.jsonl` |
| Resumo semanal | 2ª feira 09:00 | `resumo_semanal.jsonl` |
| Cálculo de IVA em lote | Mensalmente | `iva_mensal.jsonl` |

:::tip Ver os resultados
Leia o ficheiro `log_agente.jsonl` para ver todos os resultados:

```python
import json
with open('log_agente.jsonl') as f:
    for linha in f:
        entrada = json.loads(linha)
        print(f"[{entrada['timestamp']}] {entrada['resposta'][:100]}")
```
:::

---

## Resumo

Neste capítulo:
- Criou o `agente_automatico.py` que corre sem intervenção humana
- Aprendeu a agendar tarefas com Cron (Linux) e Agendador de Tarefas (Windows)
- Definiu casos de uso reais para automatização empresarial

No próximo capítulo, abordamos um tema crítico para qualquer empresa: segurança e privacidade dos dados tratados pelo EmpresaIQ.

---

*Capítulo seguinte: [15. Segurança e Privacidade →](./seguranca-privacidade)*
## Criar um Script Automatizável

Primeiro, transforme o agente num script não-interactivo:

```python title="agente_automatico.py"
import sys
from agente_local import agent_executor
from datetime import datetime
import json

def executar_tarefa(pergunta: str, ficheiro_output: str = None):
    """Executa uma tarefa no agente e guarda o resultado."""
    
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M')}] A processar: {pergunta}")
    
    resultado = agent_executor.invoke({"input": pergunta})
    resposta = resultado["output"]
    
    print(f"Resposta: {resposta}")
    
    if ficheiro_output:
        with open(ficheiro_output, 'a', encoding='utf-8') as f:
            entrada = {
                "timestamp": datetime.now().isoformat(),
                "pergunta": pergunta,
                "resposta": resposta
            }
            f.write(json.dumps(entrada, ensure_ascii=False) + "\n")
    
    return resposta


if __name__ == "__main__":
    # Tarefa padrão ou argumento da linha de comandos
    tarefa = sys.argv[1] if len(sys.argv) > 1 else "Resume os serviços disponíveis da EmpresaIQ"
    executar_tarefa(tarefa, ficheiro_output="log_agente.jsonl")
```

---

## Linux — Cron

```bash
# Abrir editor de cron
crontab -e
```

### Exemplos de agendamento

```cron
# Correr a cada hora
0 * * * * cd /home/user/empresaiq-agent && source venv/bin/activate && python agente_automatico.py >> /var/log/agente.log 2>&1

# Correr todos os dias às 08:00
0 8 * * * cd /home/user/empresaiq-agent && source venv/bin/activate && python agente_automatico.py "Gera relatório diário de serviços" >> /var/log/agente.log 2>&1

# Correr às 2ª feira às 09:00
0 9 * * 1 cd /home/user/empresaiq-agent && source venv/bin/activate && python agente_automatico.py "Resumo semanal do portfolio" >> /var/log/agente.log 2>&1
```

### Sintaxe Cron

```
┌───────────── minuto (0-59)
│ ┌───────────── hora (0-23)
│ │ ┌───────────── dia do mês (1-31)
│ │ │ ┌───────────── mês (1-12)
│ │ │ │ ┌───────────── dia da semana (0-7, 0 e 7 = Domingo)
│ │ │ │ │
* * * * * comando
```

---

## Windows — Agendador de Tarefas

### Via PowerShell (linha de comandos)

```powershell
# Criar tarefa agendada para correr de hora a hora
$Action = New-ScheduledTaskAction `
    -Execute "python" `
    -Argument "C:\empresaiq-agent\agente_automatico.py" `
    -WorkingDirectory "C:\empresaiq-agent"

$Trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Hours 1) -Once -At (Get-Date)

Register-ScheduledTask `
    -TaskName "EmpresaIQ-Agente-Automatico" `
    -Action $Action `
    -Trigger $Trigger `
    -Description "Agente IA EmpresaIQ — execução automática"
```

### Via Interface Gráfica

1. Abra **Agendador de Tarefas** (Task Scheduler)
2. Clique em **Criar Tarefa Básica...**
3. Nome: `EmpresaIQ Agente`
4. Trigger: **Diariamente** ou **Quando o computador iniciar**
5. Acção: **Iniciar um programa**
   - Programa: `C:\empresaiq-agent\venv\Scripts\python.exe`
   - Argumentos: `agente_automatico.py "Tarefa a executar"`
   - Iniciar em: `C:\empresaiq-agent`

---

## Casos de Uso Automáticos

| Tarefa | Agendamento | Benefício |
|---|---|---|
| Relatório diário de portfolio | Todos os dias 08:00 | Preparação para reuniões |
| Verificação de contratos públicos | De 2 em 2 horas | Monitorização contínua |
| Resumo semanal | Segunda às 09:00 | Visão geral da semana |
| Alerta de novos concursos | Cada 30 minutos | Oportunidades em tempo real |

:::tip
Guarde os resultados em ficheiros `.jsonl` (JSON Lines) — são fáceis de analisar com Python ou importar para Excel/Power BI.
:::