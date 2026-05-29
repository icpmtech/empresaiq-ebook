"""Capítulo 19 — Memória Conversacional com LangChain.

Demonstra os diferentes tipos de memória disponíveis:
- ConversationBufferMemory: guarda todo o histórico
- ConversationBufferWindowMemory: janela deslizante (últimos k turnos)
- ConversationSummaryMemory: resumo automático (poupa tokens)

Execute: python chapters/cap19_memoria.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain.agents import AgentExecutor, create_react_agent
from langchain.memory import (
    ConversationBufferMemory,
    ConversationBufferWindowMemory,
    ConversationSummaryMemory,
)
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

from config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_TEMPERATURE
from tools import TODAS_AS_FERRAMENTAS

# ─── LLM ──────────────────────────────────────────────────────────────────
llm = ChatOpenAI(
    base_url=LLM_BASE_URL,
    api_key=LLM_API_KEY,
    model=LLM_MODEL,
    temperature=LLM_TEMPERATURE,
    max_tokens=1024,
)

# ─── Prompt com histórico ─────────────────────────────────────────────────
PROMPT_COM_MEMORIA = PromptTemplate(
    input_variables=["tools", "tool_names", "chat_history", "input", "agent_scratchpad"],
    template="""\
És o EmpresaIQ. Respondes em português europeu sobre empresas portuguesas.
Usa as ferramentas disponíveis para obter informação actualizada.

Ferramentas:
{tools}

Nomes: {tool_names}

Histórico da conversa:
{chat_history}

Pergunta actual: {input}
{agent_scratchpad}""",
)


def criar_agente_com_memoria(tipo_memoria: str = "janela") -> AgentExecutor:
    """Cria um agente com o tipo de memória especificado.

    Args:
        tipo_memoria: "completa" | "janela" | "resumo"
    """
    if tipo_memoria == "completa":
        # Guarda todo o histórico — pode ficar muito longo
        memoria = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=False,
        )
        descricao = "Buffer completo (todo o histórico)"

    elif tipo_memoria == "janela":
        # Mantém apenas os últimos k=5 turnos (recomendado para modelos locais)
        memoria = ConversationBufferWindowMemory(
            k=5,
            memory_key="chat_history",
            return_messages=False,
        )
        descricao = "Janela deslizante (últimos 5 turnos)"

    elif tipo_memoria == "resumo":
        # Gera um resumo automático — economiza tokens mas usa o LLM a mais
        memoria = ConversationSummaryMemory(
            llm=llm,
            memory_key="chat_history",
            return_messages=False,
        )
        descricao = "Resumo automático (economiza tokens)"

    else:
        raise ValueError(f"Tipo de memória desconhecido: {tipo_memoria}")

    agente = create_react_agent(
        llm=llm,
        tools=TODAS_AS_FERRAMENTAS,
        prompt=PROMPT_COM_MEMORIA,
    )

    executor = AgentExecutor(
        agent=agente,
        tools=TODAS_AS_FERRAMENTAS,
        memory=memoria,
        verbose=False,
        max_iterations=5,
        handle_parsing_errors=True,
    )

    print(f"\n📝 Memória configurada: {descricao}")
    return executor


def demo_contexto_conversacional() -> None:
    """Demonstra como a memória mantém contexto entre turnos."""
    executor = criar_agente_com_memoria("janela")

    # Conversa multi-turno onde cada resposta depende do anterior
    conversa = [
        "Pesquisa empresas de tecnologia em Lisboa.",
        "Das que encontraste, qual tem mais risco? Verifica com a ferramenta.",
        "E quantas insolvências existem no total na base de dados?",
        "Devolve um resumo do que falámos até agora.",
    ]

    print("\n" + "=" * 60)
    print("Demo: Conversa com memória")
    print("=" * 60)

    for pergunta in conversa:
        print(f"\n👤 Utilizador: {pergunta}")
        try:
            resultado = executor.invoke({"input": pergunta})
            print(f"🤖 EmpresaIQ: {resultado['output']}")
        except Exception as exc:
            print(f"🤖 EmpresaIQ: [Erro] {exc}")


def demo_comparar_memorias() -> None:
    """Compara o comportamento com e sem memória."""
    print("\n" + "=" * 60)
    print("Demo: Com vs. Sem memória")
    print("=" * 60)

    # Agente SEM memória
    agente_sem_memoria = create_react_agent(
        llm=llm,
        tools=TODAS_AS_FERRAMENTAS,
        prompt=PromptTemplate(
            input_variables=["tools", "tool_names", "input", "agent_scratchpad"],
            template=(
                "És o EmpresaIQ. Ferramentas: {tools}\n"
                "Nomes: {tool_names}\n"
                "Pergunta: {input}\n{agent_scratchpad}"
            ),
        ),
    )
    executor_sem = AgentExecutor(
        agent=agente_sem_memoria,
        tools=TODAS_AS_FERRAMENTAS,
        verbose=False,
        max_iterations=4,
        handle_parsing_errors=True,
    )

    # Agente COM memória
    executor_com = criar_agente_com_memoria("janela")

    primeira_pergunta = "A minha empresa favorita chama-se TechLisboa Lda."
    segunda_pergunta = "Qual era o nome da empresa que mencionei?"

    for label, exec_ in [("SEM memória", executor_sem), ("COM memória", executor_com)]:
        print(f"\n── {label} ──")
        inputs_1 = {"input": primeira_pergunta}
        inputs_2 = {"input": segunda_pergunta}

        try:
            exec_.invoke(inputs_1)
            r2 = exec_.invoke(inputs_2)
            print(f"  Resposta: {r2['output']}")
        except Exception as exc:
            print(f"  Erro: {exc}")


if __name__ == "__main__":
    print("=" * 60)
    print("Capítulo 19 — Memória Conversacional")
    print("=" * 60)

    demo_contexto_conversacional()
    demo_comparar_memorias()
