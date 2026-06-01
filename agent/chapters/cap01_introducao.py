"""Capítulo 1 — Introdução ao EmpresaIQ.

Demonstra o conceito central do livro: um agente de IA que corre
localmente, sem cloud, usando a EmpresaIQ REST API para obter
informação sobre empresas portuguesas.

Execute: python chapters/cap01_introducao.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from api_client import get_client


def mostrar_visao_geral() -> None:
    """Capítulo 1 — visão geral do sistema e verificação de ligação."""

    print("=" * 60)
    print("  EmpresaIQ — Agente de IA Local")
    print("  Capítulo 1: Introdução")
    print("=" * 60)
    print()

    print("Este agente corre inteiramente no seu computador:")
    print("  • Modelo de linguagem local (llama.cpp / GGUF)")
    print("  • API REST EmpresaIQ para dados de empresas portuguesas")
    print("  • LangChain para orquestração ReAct")
    print("  • Gradio para a interface de chat")
    print()

    # ── Verificar ligação à API ────────────────────────────────────────────
    print("A verificar ligação à EmpresaIQ API…")
    client = get_client()

    try:
        saude = client.health()
        es_ok = "✅" if saude.get("elasticsearch") else "❌"
        print(f"  API: ✅  |  Elasticsearch: {es_ok}")
        print(f"  Timestamp: {saude.get('timestamp', '—')}")
    except Exception as exc:
        print(f"  ❌ Não foi possível ligar à API: {exc}")
        print("  Certifique-se de que o servidor EmpresaIQ está em execução.")
        return

    print()

    # ── Estatísticas rápidas ───────────────────────────────────────────────
    try:
        stats = client.stats()
        print("Índices disponíveis na base de dados:")
        for indice, contagem in stats.items():
            if isinstance(contagem, int):
                print(f"  {indice:<30} {contagem:>10} documentos")
    except Exception as exc:
        print(f"  Não foi possível obter estatísticas: {exc}")

    print()
    print("Sistema pronto. Avance para o capítulo 2.")


if __name__ == "__main__":
    mostrar_visao_geral()
