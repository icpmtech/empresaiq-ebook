"""Agente EmpresaIQ com LangChain ReAct e memória conversacional.

Capítulo 11 — Construção do Agente
Capítulo 19 — Memória Conversacional
"""

from __future__ import annotations

import logging
import sys

from langchain.agents import AgentExecutor, create_react_agent
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.messages import SystemMessage
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

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

# ─── Prompt ReAct ─────────────────────────────────────────────────────────
# O formato ReAct exige: Thought / Action / Action Input / Observation / Final Answer
REACT_PROMPT_TEMPLATE = """\
És o EmpresaIQ, um assistente inteligente especializado em informação \
sobre empresas portuguesas. Tens acesso a ferramentas que consultam uma base \
de dados de empresas, insolvências, execuções e análise de risco.

Regras:
- Responde sempre em português europeu
- Usa as ferramentas disponíveis para obter informação actualizada
- Para pesquisar empresas usa pesquisar_empresas
- Para detalhe de empresa usa detalhe_empresa_nif (precisa de NIF 9 dígitos)
- Para análise de risco usa risco_empresa
- Para insolvências usa pesquisar_insolvencias
- Para execuções usa pesquisar_execucoes
- Para visão global usa analytics_global
- Sê conciso mas informativo; usa listas quando apresentas múltiplos resultados
- Se não encontrares informação, diz-o claramente

Ferramentas disponíveis:
{tools}

Nomes das ferramentas: {tool_names}

Histórico da conversa:
{chat_history}

Pergunta: {input}
{agent_scratchpad}"""

REACT_PROMPT = PromptTemplate(
    input_variables=["tools", "tool_names", "chat_history", "input", "agent_scratchpad"],
    template=REACT_PROMPT_TEMPLATE,
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
) -> AgentExecutor:
    """Cria e devolve o AgentExecutor com memória de janela deslizante.

    Args:
        llm: LLM a usar (cria um novo se None).
        k_mensagens: Número de turnos de conversa a manter em memória.
        verbose: Se True, mostra o raciocínio interno do agente.
    """
    if llm is None:
        llm = criar_llm()

    # Memória de janela — mantém os últimos k_mensagens turnos (cap. 19)
    memory = ConversationBufferWindowMemory(
        k=k_mensagens,
        memory_key="chat_history",
        return_messages=False,
    )

    agent = create_react_agent(
        llm=llm,
        tools=TODAS_AS_FERRAMENTAS,
        prompt=REACT_PROMPT,
    )

    executor = AgentExecutor(
        agent=agent,
        tools=TODAS_AS_FERRAMENTAS,
        memory=memory,
        verbose=verbose,
        max_iterations=8,
        handle_parsing_errors=True,
        early_stopping_method="generate",
    )

    logger.info("Agente EmpresaIQ pronto com %d ferramentas.", len(TODAS_AS_FERRAMENTAS))
    return executor


def conversar(executor: AgentExecutor, mensagem: str) -> str:
    """Envia uma mensagem ao agente e devolve a resposta."""
    try:
        resultado = executor.invoke({"input": mensagem})
        return resultado.get("output", "Sem resposta.")
    except Exception as exc:
        logger.exception("Erro no agente")
        return f"Ocorreu um erro: {exc}"


# ─── Execução directa (linha de comandos) ─────────────────────────────────
if __name__ == "__main__":
    import sys

    executor = criar_agente(verbose=True)
    print("EmpresaIQ — Agente Inteligente (escreva 'sair' para terminar)\n")

    while True:
        try:
            pergunta = input("Você: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nAté logo!")
            sys.exit(0)

        if pergunta.lower() in {"sair", "exit", "quit"}:
            print("Até logo!")
            break

        if not pergunta:
            continue

        resposta = conversar(executor, pergunta)
        print(f"\nEmpresaIQ: {resposta}\n")
