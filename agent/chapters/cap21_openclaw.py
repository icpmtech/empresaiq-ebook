"""Capítulo 21 — OpenCLAW: Orquestração de Agentes Locais.

Demonstra uma integração incremental com o agente existente:
- Router por fluxo (risco, judicial, geral)
- Guardrails simples por domínio
- Execução local com memória por thread_id

Execute: python chapters/cap21_openclaw.py
"""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from agent import criar_agente, conversar


@dataclass
class Fluxo:
    nome: str
    instrucao_prefixo: str


class OpenClawOrchestrator:
    """Orquestrador local simples para agentes EmpresaIQ."""

    def __init__(self) -> None:
        self._executor = criar_agente(verbose=False)
        self._fluxos: dict[str, Fluxo] = {
            "fluxo_risco": Fluxo(
                nome="fluxo_risco",
                instrucao_prefixo="[FOCO: análise de risco empresarial]",
            ),
            "fluxo_judicial": Fluxo(
                nome="fluxo_judicial",
                instrucao_prefixo="[FOCO: insolvências e execuções]",
            ),
            "fluxo_geral": Fluxo(
                nome="fluxo_geral",
                instrucao_prefixo="",
            ),
        }

    def _route(self, pergunta: str) -> Fluxo:
        texto = pergunta.lower()
        if "risco" in texto or "score" in texto:
            return self._fluxos["fluxo_risco"]
        if "insolv" in texto or "execu" in texto or "tribunal" in texto:
            return self._fluxos["fluxo_judicial"]
        return self._fluxos["fluxo_geral"]

    def responder(self, pergunta: str, thread_id: str = "openclaw-local") -> str:
        fluxo = self._route(pergunta)
        prompt = (
            f"{fluxo.instrucao_prefixo} {pergunta}".strip()
            if fluxo.instrucao_prefixo
            else pergunta
        )
        return conversar(self._executor, prompt, thread_id=thread_id)


def demo() -> None:
    orchestrator = OpenClawOrchestrator()

    perguntas = [
        "Pesquisa empresas de tecnologia no Porto.",
        "Qual o risco da empresa com NIF 500001234?",
        "Mostra insolvências no tribunal de Lisboa.",
    ]

    print("=" * 64)
    print("Capítulo 21 — OpenCLAW e Agentes Locais")
    print("=" * 64)

    for pergunta in perguntas:
        print(f"\nUtilizador: {pergunta}")
        resposta = orchestrator.responder(pergunta)
        print(f"EmpresaIQ/OpenCLAW: {resposta}")


if __name__ == "__main__":
    demo()
