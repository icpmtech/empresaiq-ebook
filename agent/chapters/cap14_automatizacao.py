"""Capítulo 14 — Automação: Relatórios, Alertas e Tarefas Programadas.

Demonstra como automatizar tarefas com a EmpresaIQ API:
- Gerar relatório de risco para uma lista de NIFs
- Detectar empresas com insolvências recentes
- Exportar resultados para ficheiro Markdown

Execute: python chapters/cap14_automatizacao.py
"""

import sys
import os
import json
from datetime import datetime
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from api_client import get_client


# ─── Gerador de relatório de risco ────────────────────────────────────────

def gerar_relatorio_risco(nifs: list[str], caminho_saida: str | None = None) -> str:
    """Gera um relatório de risco para uma lista de NIFs.

    Args:
        nifs: Lista de NIFs a analisar.
        caminho_saida: Caminho do ficheiro de saída (Markdown). Opcional.

    Returns:
        Conteúdo do relatório em Markdown.
    """
    client = get_client()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    linhas = [
        f"# Relatório de Risco EmpresaIQ",
        f"**Gerado em:** {timestamp}",
        f"**Total de empresas analisadas:** {len(nifs)}",
        "",
        "| Empresa | NIF | Estado | Score | Nível | Insolvências | Execuções |",
        "|---------|-----|--------|-------|-------|:------------:|:---------:|",
    ]

    resumo = {"Baixo": 0, "Médio": 0, "Alto": 0, "Crítico": 0}
    erros = []

    for nif in nifs:
        try:
            # Tenta ler risco já calculado; se não existir, calcula
            try:
                dados = client.risco_empresa(nif)
            except Exception:
                dados = client.calcular_risco(nif)

            nome = dados.get("company_name", "—")
            estado = dados.get("estado", "—")
            score = dados.get("risk_score", "—")
            nivel = dados.get("risk_level", "—")
            n_insolv = dados.get("n_insolvencias", 0)
            n_exec = dados.get("n_execucoes", 0)

            if nivel in resumo:
                resumo[nivel] += 1

            linhas.append(
                f"| {nome} | {nif} | {estado} | {score} | {nivel} | {n_insolv} | {n_exec} |"
            )
        except Exception as exc:
            erros.append(f"NIF {nif}: {exc}")
            linhas.append(f"| — | {nif} | ERRO | — | — | — | — |")

    linhas += [
        "",
        "## Resumo por Nível de Risco",
        "",
    ]
    for nivel, contagem in resumo.items():
        emoji = {"Baixo": "🟢", "Médio": "🟡", "Alto": "🟠", "Crítico": "🔴"}.get(nivel, "")
        linhas.append(f"- {emoji} **{nivel}**: {contagem}")

    if erros:
        linhas += ["", "## Erros", ""] + [f"- {e}" for e in erros]

    conteudo = "\n".join(linhas)

    if caminho_saida:
        Path(caminho_saida).write_text(conteudo, encoding="utf-8")
        print(f"Relatório guardado em: {caminho_saida}")

    return conteudo


# ─── Monitor de insolvências recentes ────────────────────────────────────

def monitorizar_insolvencias_recentes(
    tribunal: str | None = None,
    ano: int | None = None,
    max_resultados: int = 10,
) -> list[dict]:
    """Obtém e mostra os processos de insolvência mais recentes.

    Args:
        tribunal: Filtrar por tribunal (ex: "Lisboa").
        ano: Filtrar por ano (ex: 2024).
        max_resultados: Número máximo de resultados.
    """
    client = get_client()
    dados = client.pesquisar_insolvencias(
        tribunal=tribunal,
        ano=ano,
        per=max_resultados,
    )
    return dados.get("results", [])


# ─── Pesquisa em lote ─────────────────────────────────────────────────────

def pesquisa_lote(termos: list[str], per: int = 3) -> dict[str, list]:
    """Pesquisa múltiplos termos em paralelo (sequencial nesta versão).

    Args:
        termos: Lista de termos a pesquisar.
        per: Resultados por termo.
    """
    client = get_client()
    resultados = {}

    for termo in termos:
        try:
            dados = client.pesquisar_empresas(q=termo, per=per)
            resultados[termo] = dados.get("results", [])
        except Exception as exc:
            resultados[termo] = [{"erro": str(exc)}]

    return resultados


# ─── Exportar analytics para JSON ────────────────────────────────────────

def exportar_analytics(caminho: str = "analytics_export.json") -> None:
    """Exporta as estatísticas globais para um ficheiro JSON."""
    client = get_client()
    dados = client.analytics()
    Path(caminho).write_text(
        json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Analytics exportados para: {caminho}")


# ─── Demo ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("Capítulo 14 — Automação")
    print("=" * 60)

    # Demo 1: Monitorizar insolvências recentes
    print("\n1. Insolvências recentes:")
    insolvencias = monitorizar_insolvencias_recentes(max_resultados=5)
    for i in insolvencias:
        print(
            f"   • {i.get('insolvente', '—')} | "
            f"Tribunal: {i.get('tribunal', '—')} | "
            f"Ano: {i.get('ano', '—')}"
        )

    # Demo 2: Pesquisa em lote
    print("\n2. Pesquisa em lote:")
    termos = ["tecnologia", "construção", "restauração"]
    resultados = pesquisa_lote(termos, per=2)
    for termo, empresas in resultados.items():
        nomes = [e.get("nome", "?") for e in empresas if "nome" in e]
        print(f"   '{termo}': {', '.join(nomes) or 'sem resultados'}")

    # Demo 3: Relatório de risco (NIFs de exemplo)
    print("\n3. Relatório de risco:")
    nifs_exemplo = ["500001234", "501234567", "502345678"]
    relatorio = gerar_relatorio_risco(
        nifs_exemplo,
        caminho_saida="relatorio_risco.md",
    )
    # Mostra as primeiras 10 linhas
    for linha in relatorio.split("\n")[:10]:
        print("  ", linha)
    print("  [… continua no ficheiro relatorio_risco.md]")
