"""Agente EmpresaIQ com LangGraph ReAct e memória conversacional.

Capítulo 11 — Construção do Agente
Capítulo 19 — Memória Conversacional

Nota: LangChain 1.x usa LangGraph em vez do AgentExecutor legado.
"""

from __future__ import annotations

import logging
import sys
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

from config import (
    LLM_API_KEY,
    LLM_BASE_URL,
    LLM_MAX_TOKENS,
    LLM_MODEL,
    LLM_TEMPERATURE,
)
from tools import TODAS_AS_FERRAMENTAS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)

# ─── System prompt ────────────────────────────────────────────────────────
SYSTEM_PROMPT = (
    "És o EmpresaIQ, um assistente inteligente especializado em informação "
    "sobre empresas portuguesas. Tens acesso a ferramentas que consultam uma "
    "base de dados de empresas, insolvências, execuções e análise de risco.\n\n"
    "Regras:\n"
    "- Responde sempre em português europeu\n"
    "- Usa as ferramentas disponíveis para obter informação actualizada\n"
    "- Para pesquisar empresas usa pesquisar_empresas\n"
    "- Para detalhe de empresa usa detalhe_empresa_nif (precisa de NIF 9 dígitos)\n"
    "- Para análise de risco usa risco_empresa\n"
    "- Para insolvências usa pesquisar_insolvencias\n"
    "- Para execuções usa pesquisar_execucoes\n"
    "- Para visão global usa analytics_global\n"
    "- Sê conciso mas informativo; usa listas quando apresentas múltiplos resultados\n"
    "- Se não encontrares informação, diz-o claramente"
)


def criar_llm() -> ChatOpenAI:
    """Cria o LLM configurado para llama.cpp server ou OpenAI."""
    logger.info("A ligar ao LLM em %s (modelo: %s)", LLM_BASE_URL, LLM_MODEL)
    return ChatOpenAI(
        base_url=LLM_BASE_URL,
        api_key=LLM_API_KEY,
        model=LLM_MODEL,
        temperature=LLM_TEMPERATURE,
        max_tokens=LLM_MAX_TOKENS,
    )


def criar_agente(
    llm: ChatOpenAI | None = None,
    k_mensagens: int = 10,
    verbose: bool = False,
) -> Any:
    """Cria e devolve o grafo ReAct (LangGraph) com memória persistente.

    Args:
        llm: LLM a usar (cria um novo se None).
        k_mensagens: não usado directamente — LangGraph guarda todo o histórico
                     na thread; o LLM é invocado apenas com o contexto recente.
        verbose: reservado para compatibilidade futura.
    """
    if llm is None:
        llm = criar_llm()

    # MemorySaver mantém o histórico em RAM por thread_id (cap. 19)
    memory = MemorySaver()

    # create_react_agent do LangGraph substitui o AgentExecutor
    agente = create_react_agent(
        model=llm,
        tools=TODAS_AS_FERRAMENTAS,
        prompt=SystemMessage(content=SYSTEM_PROMPT),
        checkpointer=memory,
    )

    logger.info("Agente EmpresaIQ (LangGraph) pronto com %d ferramentas.", len(TODAS_AS_FERRAMENTAS))
    return agente


# thread_id por defeito para a sessão de linha de comandos / Gradio
_DEFAULT_THREAD = "default"


def conversar(agente: Any, mensagem: str, thread_id: str = _DEFAULT_THREAD) -> str:
    """Envia uma mensagem ao agente LangGraph e devolve a resposta em texto.

    O thread_id identifica a conversa — mensagens com o mesmo thread_id
    partilham histórico (memória conversacional, cap. 19).
    """
    config = {"configurable": {"thread_id": thread_id}}
    try:
        resultado = agente.invoke(
            {"messages": [HumanMessage(content=mensagem)]},
            config=config,
        )
        msgs = resultado.get("messages", [])
        if msgs:
            ultima = msgs[-1]
            return getattr(ultima, "content", str(ultima))
        return "Sem resposta."
    except Exception as exc:
        logger.exception("Erro no agente")
        return f"Ocorreu um erro: {exc}"


# ─── Execução directa (linha de comandos) ─────────────────────────────────
if __name__ == "__main__":
    agente = criar_agente(verbose=True)
    print("EmpresaIQ — Agente Inteligente (escreva 'sair' para terminar)\n")

    while True:
        try:
            pergunta = input("Você: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nAté logo!")
            raise SystemExit(0)

        if pergunta.lower() in {"sair", "exit", "quit"}:
            print("Até logo!")
            break

        if not pergunta:
            continue

        resposta = conversar(agente, pergunta)
        print(f"\nEmpresaIQ: {resposta}\n")
