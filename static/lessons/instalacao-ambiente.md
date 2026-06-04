---
sidebar_position: 6
title: "6. Instalação do Ambiente"
description: "Preparar o computador para o EmpresaIQ — passo a passo para todos os sistemas operativos"
---

# Instalação do Ambiente

> *"Antes de construir uma casa, prepara-se o terreno. Neste capítulo, preparamos o computador para receber o EmpresaIQ."*

---

## O que vamos instalar neste capítulo

Este é o primeiro capítulo prático. Vamos instalar e configurar tudo o que o EmpresaIQ precisa para existir no seu computador. No final, terá um ambiente Python pronto a usar, organizado e isolado.

```mermaid
flowchart LR
    A["🖥️ PC Limpo"] --> B["🐍 Python 3.11\nInstalar"]
    B --> C["📂 Pasta do Projecto\nCriar"]
    C --> D["🔒 Ambiente Virtual\nActivar"]
    D --> E["✅ Ambiente Pronto"]
    style E fill:#2E7D32,color:#fff
    style A fill:#1D2951,color:#fff
```

---

## Passo 1 — Instalar o Python 3.11

O Python é a linguagem de programação que dá vida ao EmpresaIQ. Se já o tem instalado, verifique a versão antes de continuar.

```bash
python --version
# ou, em Linux/macOS:
python3 --version
```

Se mostrar `Python 3.11.x`, avance para o Passo 2. Caso contrário, instale:

### Windows

1. Aceda a **python.org/downloads**
2. Clique em **"Download Python 3.11.x"** (a versão mais recente da série 3.11)
3. Execute o instalador descarregado
4. **CRÍTICO** — na primeira janela do instalador, marque a opção **"Add Python to PATH"** antes de clicar em *Install Now*

:::danger Não esqueça o "Add Python to PATH"
Sem esta opção marcada, o Python fica instalado mas o Windows não o consegue encontrar. Se se esquecer, terá de reinstalar.
:::

### Linux (Ubuntu / Debian)

```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-pip -y
```

### macOS

```bash
brew install python@3.11
```

Se não tiver o Homebrew instalado, siga as instruções em **brew.sh**.

---

## Passo 2 — Criar a pasta do projecto

Vamos criar uma pasta dedicada ao EmpresaIQ. Abra o terminal (PowerShell no Windows, Terminal no macOS/Linux) e execute:

```bash
mkdir empresaiq-agent
cd empresaiq-agent
```

Estas duas linhas criam a pasta e entram dentro dela. A partir daqui, todos os comandos deste livro devem ser executados dentro desta pasta.

---

## Passo 3 — Criar um ambiente virtual Python

Um **ambiente virtual** é uma instalação Python isolada para o nosso projecto. Pense nele como uma "caixa de ferramentas" dedicada ao EmpresaIQ, separada do Python global do sistema.

Porquê usar um ambiente virtual?
- Os pacotes instalados para o EmpresaIQ não interferem com outros projectos
- Facilita actualizações e resolução de problemas
- É a prática padrão em Python profissional

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3.11 -m venv venv
source venv/bin/activate
```

Quando o ambiente estiver activo, o terminal muda de aspecto — aparece `(venv)` no início da linha:

```
(venv) C:\empresaiq-agent>    ← Windows
(venv) user@pc:~/empresaiq-agent$  ← Linux/macOS
```

:::warning Lembre-se sempre de activar o ambiente
Sempre que abrir um novo terminal para trabalhar no EmpresaIQ, precisará de activar o ambiente virtual primeiro. Se instalar pacotes sem o ambiente activo, eles não ficam disponíveis para o projecto.
:::

---

## Passo 4 — Verificar tudo

Com o ambiente activo, confirme que tudo está em ordem:

```bash
# Verificar Python
python --version
# Esperado: Python 3.11.x

# Verificar pip (o gestor de pacotes Python)
pip --version
# Esperado: pip XX.X.X from ...venv...

# Verificar espaço em disco (precisa de ~6 GB livres)
# Windows (PowerShell)
Get-PSDrive C | Select-Object Name, Free

# Linux / macOS
df -h .
```

---

## A estrutura que vamos construir

Ao longo dos próximos capítulos, a pasta do EmpresaIQ vai crescer assim:

```
empresaiq-agent/
│
├── venv/                                       ← Ambiente virtual (Cap. 6 — já existe)
├── requirements.txt                            ← Lista de dependências (Cap. 7)
├── tools.py                                    ← Ferramentas do agente (Cap. 10)
├── agente_local.py                             ← Agente principal (Cap. 11)
└── Phi-3-mini-4k-instruct-Q4_K_M.gguf         ← Modelo de IA (Cap. 9)
```

---

## Resumo

Neste capítulo:
- Instalou o Python 3.11
- Criou a pasta `empresaiq-agent`
- Criou e activou um ambiente virtual Python

No próximo capítulo, vamos configurar as dependências Python — os pacotes que o EmpresaIQ precisa para funcionar.

---

*Capítulo seguinte: [7. Configuração do Python →](./configuracao-python)*