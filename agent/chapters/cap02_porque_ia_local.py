"""Capítulo 2 — Porquê IA Local?

Demonstra as vantagens práticas de correr IA no seu próprio servidor:
privacidade, custo zero por token e latência controlada.
Compara chamadas locais com chamadas a serviços cloud (quando disponíveis).

Execute: python chapters/cap02_porque_ia_local.py
"""

import sys
import os
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from api_client import get_client


def demonstrar_privacidade() -> None:
    """Mostra que todos os dados ficam no servidor local."""

    print("=" * 60)
    print("  Capítulo 2: Porquê IA Local?")
    print("=" * 60)
    print()

    print("Vantagem 1 — PRIVACIDADE")
    print("-" * 40)
    print("A pesquisa abaixo envia dados APENAS para o servidor local.")
    print("Nenhum byte sai para a internet.\n")

    client = get_client()

    t0 = time.perf_counter()
    try:
        resultado = client.pesquisar_empresas(q="tecnologia", per=3)
        latencia_ms = (time.perf_counter() - t0) * 1000

        empresas = resultado.get("results", [])
        total = resultado.get("total", 0)

        print(f"  Pesquisa 'tecnologia': {total} resultados em {latencia_ms:.0f} ms")
        for emp in empresas:
            print(f"  • {emp.get('nome', '—')} (NIF: {emp.get('nif', '—')})")

    except Exception as exc:
        print(f"  Erro (API local indisponível?): {exc}")
        return

    print()
    print("Vantagem 2 — CUSTO")
    print("-" * 40)
    print("  Cloud (GPT-4o-mini): ~$0.15 / 1M tokens de entrada")
    print("  Local (Phi-3-mini via llama.cpp): $0.00 / token")
    print("  Para 1 000 consultas/dia → poupança: ~$50/mês")

    print()
    print("Vantagem 3 — LATÊNCIA CONTROLADA")
    print("-" * 40)
    print("  Sem rate limits impostos por terceiros.")
    print("  Sem indisponibilidades de serviços externos.")
    print("  Desempenho determinístico no seu hardware.")

    print()
    print("Conclusão: dados sensíveis nunca abandonam o seu perímetro.")


if __name__ == "__main__":
    demonstrar_privacidade()
