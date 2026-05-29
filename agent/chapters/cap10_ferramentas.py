"""Capítulo 10 — Criação das Ferramentas com a EmpresaIQ API.

Demonstra como criar ferramentas Python simples (sem framework)
que chamam a API REST e devolvem texto estruturado para o agente.

Execute: python chapters/cap10_ferramentas.py
"""

import sys
import os

# Adiciona o directório pai ao PYTHONPATH
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from api_client import get_client


# ─── Ferramentas como funções Python puras ────────────────────────────────

def ferramenta_pesquisar_empresas(q: str, max_resultados: int = 5) -> str:
    """Ferramenta: pesquisa empresas pelo nome ou actividade."""
    client = get_client()
    dados = client.pesquisar_empresas(q=q, per=max_resultados)
    resultados = dados.get("results", [])

    if not resultados:
        return f"Nenhuma empresa encontrada para '{q}'."

    linhas = [f"Empresas encontradas para '{q}' (total: {dados.get('total', 0)}):\n"]
    for emp in resultados:
        linhas.append(
            f"  • {emp['nome']} | NIF: {emp['nif']} | "
            f"Estado: {emp.get('estado', '—')} | Distrito: {emp.get('distrito', '—')}"
        )
    return "\n".join(linhas)


def ferramenta_detalhe_empresa(nif: str) -> str:
    """Ferramenta: obtém o perfil completo de uma empresa pelo NIF."""
    client = get_client()
    dados = client.detalhe_empresa(nif)

    if not dados.get("found"):
        return f"Empresa com NIF {nif} não encontrada."

    emp = dados["company"]
    insolvencias = dados.get("insolvencias", [])
    execucoes = dados.get("execucoes", [])

    return (
        f"Nome: {emp.get('nome', '—')}\n"
        f"NIF: {emp.get('nif', '—')}\n"
        f"Estado: {emp.get('estado', '—')}\n"
        f"Forma jurídica: {emp.get('forma_juridica', '—')}\n"
        f"CAE: {emp.get('cae', '—')} — {emp.get('cae_descricao', '')}\n"
        f"Localização: {emp.get('municipio', '—')}, {emp.get('distrito', '—')}\n"
        f"Insolvências: {len(insolvencias)} | Execuções: {len(execucoes)}"
    )


def ferramenta_risco(nif: str) -> str:
    """Ferramenta: obtém a pontuação de risco de uma empresa."""
    client = get_client()
    try:
        dados = client.risco_empresa(nif)
    except Exception:
        dados = client.calcular_risco(nif)

    score = dados.get("risk_score", "—")
    nivel = dados.get("risk_level", "—")
    return f"Risco de {dados.get('company_name', nif)}: {nivel} (score {score}/100)"


def ferramenta_insolvencias(q: str, max_resultados: int = 5) -> str:
    """Ferramenta: pesquisa processos de insolvência."""
    client = get_client()
    dados = client.pesquisar_insolvencias(q=q, per=max_resultados)
    resultados = dados.get("results", [])

    if not resultados:
        return f"Nenhuma insolvência encontrada para '{q}'."

    linhas = [f"Insolvências para '{q}':\n"]
    for i in resultados:
        linhas.append(
            f"  • {i.get('insolvente', '—')} | NIF: {i.get('nif_insolvente', '—')} | "
            f"Tribunal: {i.get('tribunal', '—')} | Ano: {i.get('ano', '—')}"
        )
    return "\n".join(linhas)


# ─── Registo de ferramentas (à mão, sem framework) ────────────────────────

FERRAMENTAS = {
    "pesquisar_empresas": {
        "funcao": ferramenta_pesquisar_empresas,
        "descricao": "Pesquisa empresas pelo nome ou actividade. Argumento: texto de pesquisa.",
    },
    "detalhe_empresa": {
        "funcao": ferramenta_detalhe_empresa,
        "descricao": "Obtém perfil completo de empresa. Argumento: NIF (9 dígitos).",
    },
    "risco_empresa": {
        "funcao": ferramenta_risco,
        "descricao": "Calcula score de risco de empresa. Argumento: NIF (9 dígitos).",
    },
    "insolvencias": {
        "funcao": ferramenta_insolvencias,
        "descricao": "Pesquisa processos de insolvência. Argumento: nome ou NIF.",
    },
}


def listar_ferramentas() -> None:
    """Mostra as ferramentas disponíveis com as suas descrições."""
    print("Ferramentas disponíveis:\n")
    for nome, info in FERRAMENTAS.items():
        print(f"  [{nome}]\n    {info['descricao']}\n")


def invocar_ferramenta(nome: str, argumento: str) -> str:
    """Invoca uma ferramenta pelo nome."""
    if nome not in FERRAMENTAS:
        nomes = ", ".join(FERRAMENTAS.keys())
        return f"Ferramenta '{nome}' não encontrada. Disponíveis: {nomes}"
    return FERRAMENTAS[nome]["funcao"](argumento)


# ─── Demo ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("Capítulo 10 — Criação das Ferramentas")
    print("=" * 60)

    listar_ferramentas()

    print("─" * 60)
    print("Teste: pesquisar_empresas('construção civil')\n")
    print(invocar_ferramenta("pesquisar_empresas", "construção civil"))

    print("\n" + "─" * 60)
    print("Teste: pesquisar_empresas('software, Lisboa')\n")
    print(invocar_ferramenta("pesquisar_empresas", "software"))
