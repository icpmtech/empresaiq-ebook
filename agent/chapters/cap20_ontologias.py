"""Capítulo 20 — Ontologias: Extracção de Entidades e Grafo de Conhecimento.

Demonstra como construir um grafo de conhecimento sobre empresas
a partir dos dados da EmpresaIQ API:
- Extracção de entidades (empresas, pessoas, tribunais)
- Relações: tem_insolvencia, tem_execucao, pertence_a_distrito
- Análise de vizinhança (empresas relacionadas pelo mesmo tribunal)

Execute: python chapters/cap20_ontologias.py
"""

import sys
import os
import json
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Literal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from api_client import get_client


# ─── Tipos de entidades e relações ────────────────────────────────────────

TipoEntidade = Literal["empresa", "pessoa", "tribunal", "distrito", "cae"]
TipoRelacao = Literal[
    "tem_insolvencia",
    "tem_execucao",
    "pertence_a_distrito",
    "tem_cae",
    "insolvencia_em",
    "execucao_em",
]


@dataclass
class Entidade:
    id: str
    tipo: TipoEntidade
    propriedades: dict = field(default_factory=dict)

    def __hash__(self):
        return hash(self.id)

    def __eq__(self, other):
        return isinstance(other, Entidade) and self.id == other.id


@dataclass
class Relacao:
    origem: str   # ID da entidade origem
    tipo: TipoRelacao
    destino: str  # ID da entidade destino
    propriedades: dict = field(default_factory=dict)


class GrafoConhecimento:
    """Grafo de conhecimento simples sobre empresas portuguesas."""

    def __init__(self) -> None:
        self._entidades: dict[str, Entidade] = {}
        self._relacoes: list[Relacao] = []

    def adicionar_entidade(self, entidade: Entidade) -> None:
        self._entidades[entidade.id] = entidade

    def adicionar_relacao(self, relacao: Relacao) -> None:
        self._relacoes.append(relacao)

    def entidade(self, id_: str) -> Entidade | None:
        return self._entidades.get(id_)

    def vizinhos(self, id_: str, tipo_relacao: TipoRelacao | None = None) -> list[Entidade]:
        """Devolve as entidades vizinhas de uma dada entidade."""
        ids_vizinhos = set()
        for r in self._relacoes:
            if r.origem == id_:
                if tipo_relacao is None or r.tipo == tipo_relacao:
                    ids_vizinhos.add(r.destino)
            elif r.destino == id_:
                if tipo_relacao is None or r.tipo == tipo_relacao:
                    ids_vizinhos.add(r.origem)
        return [self._entidades[i] for i in ids_vizinhos if i in self._entidades]

    def estatisticas(self) -> dict:
        por_tipo: dict[str, int] = defaultdict(int)
        for e in self._entidades.values():
            por_tipo[e.tipo] += 1

        por_relacao: dict[str, int] = defaultdict(int)
        for r in self._relacoes:
            por_relacao[r.tipo] += 1

        return {
            "total_entidades": len(self._entidades),
            "total_relacoes": len(self._relacoes),
            "entidades_por_tipo": dict(por_tipo),
            "relacoes_por_tipo": dict(por_relacao),
        }

    def exportar_json(self) -> str:
        return json.dumps(
            {
                "entidades": [
                    {"id": e.id, "tipo": e.tipo, "props": e.propriedades}
                    for e in self._entidades.values()
                ],
                "relacoes": [
                    {"origem": r.origem, "tipo": r.tipo, "destino": r.destino}
                    for r in self._relacoes
                ],
            },
            ensure_ascii=False,
            indent=2,
        )


# ─── Construtor do grafo a partir da API ─────────────────────────────────

def construir_grafo_empresas(q: str = "tecnologia", max_empresas: int = 10) -> GrafoConhecimento:
    """Constrói um grafo de conhecimento a partir de dados da API EmpresaIQ.

    Args:
        q: Termo de pesquisa de empresas.
        max_empresas: Número máximo de empresas a indexar.
    """
    client = get_client()
    grafo = GrafoConhecimento()

    # 1. Obter empresas
    dados_empresas = client.pesquisar_empresas(q=q, per=max_empresas)
    empresas = dados_empresas.get("results", [])

    print(f"A construir grafo com {len(empresas)} empresas…")

    for emp in empresas:
        nif = emp.get("nif", "")
        if not nif:
            continue

        # Entidade: empresa
        grafo.adicionar_entidade(Entidade(
            id=f"empresa:{nif}",
            tipo="empresa",
            propriedades={
                "nome": emp.get("nome", "—"),
                "nif": nif,
                "estado": emp.get("estado", "—"),
                "forma_juridica": emp.get("forma_juridica", "—"),
            },
        ))

        # Entidade + relação: distrito
        distrito = emp.get("distrito")
        if distrito:
            d_id = f"distrito:{distrito.lower()}"
            grafo.adicionar_entidade(Entidade(
                id=d_id, tipo="distrito", propriedades={"nome": distrito}
            ))
            grafo.adicionar_relacao(Relacao(
                origem=f"empresa:{nif}",
                tipo="pertence_a_distrito",
                destino=d_id,
            ))

        # Entidade + relação: CAE
        cae = emp.get("cae")
        if cae:
            cae_id = f"cae:{cae}"
            grafo.adicionar_entidade(Entidade(
                id=cae_id, tipo="cae",
                propriedades={"codigo": cae, "descricao": emp.get("cae_descricao", "")}
            ))
            grafo.adicionar_relacao(Relacao(
                origem=f"empresa:{nif}", tipo="tem_cae", destino=cae_id
            ))

        # Insolvências da empresa
        if emp.get("n_insolvencias", 0) > 0:
            try:
                det = client.detalhe_empresa(nif)
                for insolv in det.get("insolvencias", []):
                    tribunal = insolv.get("tribunal")
                    if tribunal:
                        t_id = f"tribunal:{tribunal.lower()}"
                        grafo.adicionar_entidade(Entidade(
                            id=t_id, tipo="tribunal", propriedades={"nome": tribunal}
                        ))
                        grafo.adicionar_relacao(Relacao(
                            origem=f"empresa:{nif}",
                            tipo="insolvencia_em",
                            destino=t_id,
                            propriedades={"ano": insolv.get("ano")},
                        ))
            except Exception:
                pass

    return grafo


# ─── Análise do grafo ─────────────────────────────────────────────────────

def empresas_no_mesmo_tribunal(grafo: GrafoConhecimento, tribunal: str) -> list[Entidade]:
    """Encontra empresas com insolvência no mesmo tribunal."""
    t_id = f"tribunal:{tribunal.lower()}"
    return grafo.vizinhos(t_id, tipo_relacao="insolvencia_em")


def empresas_no_mesmo_distrito(grafo: GrafoConhecimento, distrito: str) -> list[Entidade]:
    """Encontra empresas do mesmo distrito."""
    d_id = f"distrito:{distrito.lower()}"
    return grafo.vizinhos(d_id, tipo_relacao="pertence_a_distrito")


# ─── Demo ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("Capítulo 20 — Ontologias e Grafo de Conhecimento")
    print("=" * 60)

    # Construir grafo
    grafo = construir_grafo_empresas(q="construção", max_empresas=8)

    # Estatísticas
    print("\nEstatísticas do grafo:")
    stats = grafo.estatisticas()
    for chave, valor in stats.items():
        print(f"  {chave}: {valor}")

    # Empresas em Lisboa
    print("\nEmpresas no distrito de Lisboa:")
    empresas_lisboa = empresas_no_mesmo_distrito(grafo, "Lisboa")
    for emp in empresas_lisboa[:5]:
        print(f"  • {emp.propriedades.get('nome', emp.id)}")

    # Exportar para JSON
    saida = "grafo_conhecimento.json"
    with open(saida, "w", encoding="utf-8") as f:
        f.write(grafo.exportar_json())
    print(f"\nGrafo exportado para: {saida}")
