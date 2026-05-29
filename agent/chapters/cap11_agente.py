"""Capítulo 11 — Construção do Agente ReAct com LangChain.

Demonstra o padrão ReAct (Reasoning + Acting) com as ferramentas
da EmpresaIQ API. O agente decide autonomamente qual ferramenta usar.

Execute: python chapters/cap11_agente.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

from config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_TEMPERATURE
from tools import TODAS_AS_FERRAMENTAS

# ─── 1. Modelo de Linguagem ────────────────────────────────────────────────
# Aponta para o servidor llama.cpp local (OpenAI-compatible)
llm = ChatOpenAI(
    base_url=LLM_BASE_URL,
    api_key=LLM_API_KEY,
    model=LLM_MODEL,
    temperature=LLM_TEMPERATURE,
    max_tokens=1024,
)

# ─── 2. Prompt ReAct ──────────────────────────────────────────────────────
# O formato Thought/Action/Action Input/Observation é obrigatório no ReAct
PROMPT = PromptTemplate(
    input_variables=["tools", "tool_names", "input", "agent_scratchpad"],
    template="""\
És o EmpresaIQ, um assistente especializado em empresas portuguesas.
Usa as ferramentas para obter informação actualizada.
Responde sempre em português europeu.

Ferramentas disponíveis:
{tools}

Nomes das ferramentas: {tool_names}

Pergunta: {input}
{agent_scratchpad}""",
)

# ─── 3. Agente ReAct ──────────────────────────────────────────────────────
agent = create_react_agent(
    llm=llm,
    tools=TODAS_AS_FERRAMENTAS,
    prompt=PROMPT,
)

executor = AgentExecutor(
    agent=agent,
    tools=TODAS_AS_FERRAMENTAS,
    verbose=True,          # mostra o raciocínio interno
    max_iterations=6,
    handle_parsing_errors=True,
)

# ─── 4. Demonstração do ciclo ReAct ───────────────────────────────────────

PERGUNTAS_DEMO = [
    "Pesquisa empresas de construção civil em Lisboa.",
    "Qual o nível de risco da empresa com NIF 500001234?",
    "Quantas empresas existem na base de dados?",
]

if __name__ == "__main__":
    print("=" * 60)
    print("Capítulo 11 — Agente ReAct EmpresaIQ")
    print("=" * 60)

    for pergunta in PERGUNTAS_DEMO:
        print(f"\n{'─'*60}")
        print(f"Pergunta: {pergunta}")
        print("─" * 60)

        try:
            resultado = executor.invoke({"input": pergunta})
            print(f"\nResposta: {resultado['output']}")
        except Exception as exc:
            print(f"Erro: {exc}")
