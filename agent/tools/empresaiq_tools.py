"""Ferramentas LangChain para o agente EmpresaIQ.

Capítulo 10 — Criação das Ferramentas
Cada @tool é uma função Python que o agente pode invocar autonomamente.
A descrição de cada ferramenta guia o LLM a escolher a correcta.
"""

from __future__ import annotations

import json
import re

from langchain_core.tools import tool

from api_client import get_client

# ─── Validação ────────────────────────────────────────────────────────────

_NIF_RE = re.compile(r"^\d{9}$")


def _validar_nif(nif: str) -> str:
    """Valida e normaliza um NIF (9 dígitos)."""
    nif = nif.strip().replace(" ", "").replace("-", "")
    if not _NIF_RE.match(nif):
        raise ValueError(f"NIF inválido: '{nif}'. Deve ter exactamente 9 dígitos.")
    return nif


# ─── Formatadores ─────────────────────────────────────────────────────────

def _fmt_empresa(e: dict) -> str:
    partes = [
        f"**{e.get('nome', '—')}** (NIF: {e.get('nif', '—')})",
        f"  Estado: {e.get('estado', '—')} | Forma jurídica: {e.get('forma_juridica', '—')}",
        f"  CAE: {e.get('cae', '—')} — {e.get('cae_descricao', '')}",
        f"  Localização: {e.get('municipio', '—')}, {e.get('distrito', '—')}",
        f"  Insolvências registadas: {e.get('n_insolvencias', 0)}",
    ]
    return "\n".join(partes)


def _fmt_insolvencia(i: dict) -> str:
    return (
        f"  {i.get('insolvente', '—')} (NIF: {i.get('nif_insolvente', '—')}) | "
        f"Tribunal: {i.get('tribunal', '—')} | Ano: {i.get('ano', '—')} | "
        f"Estado: {i.get('estado', '—')}"
    )


def _fmt_execucao(e: dict) -> str:
    return (
        f"  {e.get('nome_executado', '—')} | Processo: {e.get('n_processo', '—')} | "
        f"Tribunal: {e.get('tribunal', '—')} | Estado: {e.get('estado', '—')} | "
        f"Data: {e.get('data_inscricao', '—')}"
    )


# ─── Ferramentas ──────────────────────────────────────────────────────────

@tool
def pesquisar_empresas(query: str) -> str:
    """Pesquisa empresas portuguesas pelo nome, actividade (CAE), morada ou NIF.

    Parâmetros aceites no query (separados por vírgula):
    - termo de pesquisa (ex: "construção civil", "Lisboa")
    - estado=Ativa|Cessada  (opcional)
    - distrito=Lisboa|Porto  (opcional)
    - max=N  (máx. resultados, default 5)

    Exemplos: "ACME" | "construção, distrito=Porto" | "software, estado=Ativa, max=3"
    """
    client = get_client()

    # Parse simples de parâmetros opcionais
    parts = [p.strip() for p in query.split(",")]
    q = parts[0] if parts else None
    estado = next((p.split("=")[1] for p in parts if p.startswith("estado=")), None)
    distrito = next((p.split("=")[1] for p in parts if p.startswith("distrito=")), None)
    per = int(next((p.split("=")[1] for p in parts if p.startswith("max=")), "5"))

    try:
        data = client.pesquisar_empresas(q=q, estado=estado, distrito=distrito, per=per)
    except Exception as exc:
        return f"Erro ao pesquisar empresas: {exc}"

    results = data.get("results", [])
    total = data.get("total", 0)
    if not results:
        return "Nenhuma empresa encontrada com esses critérios."

    linhas = [f"Encontradas {total} empresas (a mostrar {len(results)}):\n"]
    for emp in results:
        linhas.append(_fmt_empresa(emp))
        linhas.append("")
    return "\n".join(linhas)


@tool
def detalhe_empresa_nif(nif: str) -> str:
    """Obtém o perfil completo de uma empresa pelo NIF (9 dígitos).

    Retorna: nome, estado, forma jurídica, CAE, morada,
    capital social, insolvências e processos de execução associados.
    """
    try:
        nif = _validar_nif(nif)
    except ValueError as exc:
        return str(exc)

    client = get_client()
    try:
        data = client.detalhe_empresa(nif)
    except Exception as exc:
        return f"Erro ao obter detalhe da empresa: {exc}"

    if not data.get("found"):
        return f"Empresa com NIF {nif} não encontrada na base de dados."

    emp = data.get("company", {})
    linhas = [_fmt_empresa(emp), ""]

    insolvencias = data.get("insolvencias", [])
    if insolvencias:
        linhas.append(f"Insolvências ({len(insolvencias)}):")
        linhas.extend(_fmt_insolvencia(i) for i in insolvencias)
        linhas.append("")

    execucoes = data.get("execucoes", [])
    if execucoes:
        linhas.append(f"Processos de execução ({len(execucoes)}):")
        linhas.extend(_fmt_execucao(e) for e in execucoes)

    return "\n".join(linhas)


@tool
def detalhe_completo_nif(nif: str) -> str:
    """Obtém todos os dados agregados de um NIF: empresa, risco, insolvências,
    execuções, finanças e Seg. Social. Use quando precisa do quadro completo.
    """
    try:
        nif = _validar_nif(nif)
    except ValueError as exc:
        return str(exc)

    client = get_client()
    try:
        data = client.detalhe_nif(nif)
    except Exception as exc:
        return f"Erro ao obter detalhe completo do NIF: {exc}"

    if not data.get("found"):
        return f"NIF {nif} não encontrado."

    secoes = []

    emp = data.get("company")
    if emp:
        secoes.append("## Empresa\n" + _fmt_empresa(emp))

    risk = data.get("risk")
    if risk:
        secoes.append(
            f"## Risco\n  Score: {risk.get('risk_score', '—')} | "
            f"Nível: {risk.get('risk_level', '—')}"
        )

    insolv = data.get("insolvencias", [])
    if insolv:
        secoes.append(
            f"## Insolvências ({len(insolv)})\n"
            + "\n".join(_fmt_insolvencia(i) for i in insolv)
        )

    exec_ = data.get("execucoes", [])
    if exec_:
        secoes.append(
            f"## Execuções ({len(exec_)})\n"
            + "\n".join(_fmt_execucao(e) for e in exec_)
        )

    return "\n\n".join(secoes) if secoes else f"Sem dados detalhados para NIF {nif}."


@tool
def pesquisar_insolvencias(query: str) -> str:
    """Pesquisa processos de insolvência (CIRE) pelo nome do insolvente,
    NIF, tribunal ou ano.

    Parâmetros aceites (separados por vírgula):
    - termo de pesquisa (nome ou NIF)
    - tribunal=Lisboa|Porto  (opcional)
    - ano=2023  (opcional)
    - max=N  (default 5)

    Exemplos: "ACME LDA" | "500001234" | "construção, tribunal=Porto, ano=2022"
    """
    client = get_client()
    parts = [p.strip() for p in query.split(",")]
    q = parts[0] if parts else None
    tribunal = next((p.split("=")[1] for p in parts if p.startswith("tribunal=")), None)
    ano_str = next((p.split("=")[1] for p in parts if p.startswith("ano=")), None)
    ano = int(ano_str) if ano_str else None
    per = int(next((p.split("=")[1] for p in parts if p.startswith("max=")), "5"))

    # Se o query parecer um NIF, pesquisa por NIF exacto
    nif = q if q and _NIF_RE.match(q.strip()) else None
    if nif:
        q = None

    try:
        data = client.pesquisar_insolvencias(q=q, nif=nif, tribunal=tribunal, ano=ano, per=per)
    except Exception as exc:
        return f"Erro ao pesquisar insolvências: {exc}"

    results = data.get("results", [])
    total = data.get("total", 0)
    if not results:
        return "Nenhum processo de insolvência encontrado."

    linhas = [f"Encontrados {total} processos de insolvência (a mostrar {len(results)}):\n"]
    linhas.extend(_fmt_insolvencia(i) for i in results)
    return "\n".join(linhas)


@tool
def pesquisar_execucoes(query: str) -> str:
    """Pesquisa processos de execução (Citius) pelo nome do executado,
    número de processo ou tribunal.

    Parâmetros aceites (separados por vírgula):
    - termo de pesquisa
    - entity_type=empresa|pessoa  (opcional)
    - tribunal=Lisboa|Porto  (opcional)
    - periodo=7d|1m|3m|6m|1y|2y|5y  (opcional)
    - max=N  (default 5)

    Exemplos: "João Silva" | "ACME" | "empresa, tribunal=Porto, periodo=1y"
    """
    client = get_client()
    parts = [p.strip() for p in query.split(",")]
    q = parts[0] if parts else None
    entity_type = next((p.split("=")[1] for p in parts if p.startswith("entity_type=")), None)
    tribunal = next((p.split("=")[1] for p in parts if p.startswith("tribunal=")), None)
    periodo = next((p.split("=")[1] for p in parts if p.startswith("periodo=")), None)
    per = int(next((p.split("=")[1] for p in parts if p.startswith("max=")), "5"))

    try:
        data = client.pesquisar_execucoes(
            q=q, entity_type=entity_type, tribunal=tribunal, periodo=periodo, per=per
        )
    except Exception as exc:
        return f"Erro ao pesquisar execuções: {exc}"

    results = data.get("results", [])
    total = data.get("total", 0)
    if not results:
        return "Nenhum processo de execução encontrado."

    linhas = [f"Encontrados {total} processos de execução (a mostrar {len(results)}):\n"]
    linhas.extend(_fmt_execucao(e) for e in results)
    return "\n".join(linhas)


@tool
def risco_empresa(nif: str) -> str:
    """Obtém a pontuação e nível de risco de uma empresa pelo NIF.

    Retorna: score (0-100), nível (Baixo/Médio/Alto/Crítico),
    número de insolvências e execuções.
    Use para avaliar a solidez financeira de um parceiro ou fornecedor.
    """
    try:
        nif = _validar_nif(nif)
    except ValueError as exc:
        return str(exc)

    client = get_client()
    try:
        data = client.risco_empresa(nif)
    except Exception as exc:
        # Se o risco não existe ainda, calculá-lo
        try:
            data = client.calcular_risco(nif)
        except Exception as exc2:
            return f"Erro ao obter risco da empresa: {exc2}"

    if not data:
        return f"Dados de risco não disponíveis para NIF {nif}."

    return (
        f"Risco para NIF {data.get('nif', nif)} — {data.get('company_name', '—')}\n"
        f"  Score: {data.get('risk_score', '—')} / 100\n"
        f"  Nível: {data.get('risk_level', '—')}\n"
        f"  Estado: {data.get('estado', '—')}\n"
        f"  Insolvências: {data.get('n_insolvencias', 0)}\n"
        f"  Execuções: {data.get('n_execucoes', 0)}"
    )


@tool
def analytics_global() -> str:
    """Obtém estatísticas agregadas da base de dados EmpresaIQ:
    total de empresas, insolvências, execuções, distribuição por distrito
    e por forma jurídica. Use para perguntas do tipo 'quantas empresas existem'.
    """
    client = get_client()
    try:
        data = client.analytics()
    except Exception as exc:
        return f"Erro ao obter analytics: {exc}"

    linhas = [
        f"Total de empresas: {data.get('n_companies', '—')}",
        f"Total de insolvências: {data.get('n_insolvencias', '—')}",
        f"Total de execuções: {data.get('n_execucoes', '—')}",
        f"Empresas com insolvência: {data.get('n_matched', '—')}",
    ]

    by_distrito = data.get("by_distrito", [])[:5]
    if by_distrito:
        linhas.append("\nTop 5 distritos:")
        for d in by_distrito:
            linhas.append(f"  {d.get('distrito', '—')}: {d.get('n', 0)} empresas")

    return "\n".join(linhas)


@tool
def pesquisa_global(query: str) -> str:
    """Pesquisa global em todos os índices (empresas, insolvências, execuções, InformaDB).

    Parâmetros aceites (separados por vírgula):
    - termo de pesquisa (obrigatório)
    - source=empresa|informadb|insolvencia  (opcional, filtra por tipo)
    - distrito=Lisboa|Porto  (opcional)
    - max=N  (default 5)

    Exemplos: "ACME" | "construção civil, source=empresa, distrito=Lisboa"
    """
    client = get_client()
    parts = [p.strip() for p in query.split(",")]
    q = parts[0] if parts else ""
    source = next((p.split("=")[1] for p in parts if p.startswith("source=")), "")
    distrito = next((p.split("=")[1] for p in parts if p.startswith("distrito=")), None)
    per = int(next((p.split("=")[1] for p in parts if p.startswith("max=")), "5"))

    if not q:
        return "Forneça um termo de pesquisa."

    try:
        data = client.pesquisa_global(q=q, source=source, distrito=distrito, per=per)
    except Exception as exc:
        return f"Erro na pesquisa global: {exc}"

    results = data.get("results", [])
    total = data.get("total", 0)
    counts = data.get("counts", {})

    if not results:
        return f"Nenhum resultado para '{q}'."

    linhas = [f"Resultados para '{q}' — total: {total}"]
    if counts:
        linhas.append("  Por tipo: " + ", ".join(f"{k}={v}" for k, v in counts.items()))
    linhas.append("")

    for r in results:
        source_type = r.get("_source_type") or r.get("source", "—")
        nome = r.get("nome") or r.get("insolvente") or r.get("nome_executado") or "—"
        nif = r.get("nif") or r.get("nif_insolvente") or "—"
        linhas.append(f"  [{source_type}] {nome} (NIF: {nif})")

    return "\n".join(linhas)


@tool
def cross_stats_nif(nif: str) -> str:
    """Obtém estatísticas cruzadas de um NIF em todos os índices:
    empresa, insolvências, execuções e InformaDB.
    Ideal para uma visão panorâmica rápida de uma empresa.
    """
    try:
        nif = _validar_nif(nif)
    except ValueError as exc:
        return str(exc)

    client = get_client()
    try:
        data = client.cross_stats(nif=nif)
    except Exception as exc:
        return f"Erro ao obter cross-stats: {exc}"

    results = data.get("results", [])
    if not results:
        return f"Sem dados cruzados para NIF {nif}."

    linhas = [f"Dados cruzados para NIF {nif}:\n"]
    for item in results:
        linhas.append(
            f"  [{item.get('index', '—')}] {item.get('nome', '—')} — "
            f"{json.dumps(item.get('summary', {}), ensure_ascii=False)}"
        )
    return "\n".join(linhas)


# Lista de todas as ferramentas disponíveis para o agente
TODAS_AS_FERRAMENTAS = [
    pesquisar_empresas,
    detalhe_empresa_nif,
    detalhe_completo_nif,
    pesquisar_insolvencias,
    pesquisar_execucoes,
    risco_empresa,
    analytics_global,
    pesquisa_global,
    cross_stats_nif,
]
