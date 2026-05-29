"""Capítulo 12 — Optimizações: Cache, Conexões e Performance.

Demonstra como optimizar o cliente da EmpresaIQ API:
- Reutilização de sessão HTTP (connection pooling)
- Cache em memória com TTL para evitar chamadas repetidas
- Medição de tempo de resposta
- Pré-carregamento de dados frequentes

Execute: python chapters/cap12_optimizacoes.py
"""

import sys
import os
import time
import functools
from datetime import datetime, timedelta
from typing import Any, Callable

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from api_client import get_client


# ─── Cache simples com TTL ─────────────────────────────────────────────────

class CacheTTL:
    """Cache em memória com tempo de expiração (Time-To-Live)."""

    def __init__(self, ttl_segundos: int = 300) -> None:
        self._ttl = timedelta(seconds=ttl_segundos)
        self._dados: dict[str, tuple[Any, datetime]] = {}

    def get(self, chave: str) -> Any | None:
        entrada = self._dados.get(chave)
        if entrada is None:
            return None
        valor, expira_em = entrada
        if datetime.now() > expira_em:
            del self._dados[chave]
            return None
        return valor

    def set(self, chave: str, valor: Any) -> None:
        self._dados[chave] = (valor, datetime.now() + self._ttl)

    def invalidar(self, chave: str) -> None:
        self._dados.pop(chave, None)

    def limpar(self) -> None:
        self._dados.clear()

    def __len__(self) -> int:
        # Remove entradas expiradas antes de contar
        agora = datetime.now()
        expiradas = [k for k, (_, exp) in self._dados.items() if agora > exp]
        for k in expiradas:
            del self._dados[k]
        return len(self._dados)


# ─── Decorator de cache ────────────────────────────────────────────────────

_cache_global = CacheTTL(ttl_segundos=300)  # 5 minutos


def com_cache(chave_fn: Callable) -> Callable:
    """Decorator que guarda o resultado em cache usando a chave devolvida por chave_fn."""
    def decorador(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            chave = chave_fn(*args, **kwargs)
            cached = _cache_global.get(chave)
            if cached is not None:
                print(f"  [CACHE HIT] {chave}")
                return cached
            print(f"  [CACHE MISS] {chave} — a chamar API…")
            resultado = func(*args, **kwargs)
            _cache_global.set(chave, resultado)
            return resultado
        return wrapper
    return decorador


# ─── Cliente optimizado com cache ─────────────────────────────────────────

@com_cache(lambda nif: f"empresa:{nif}")
def obter_empresa_cached(nif: str) -> dict:
    return get_client().detalhe_empresa(nif)


@com_cache(lambda q, per: f"pesquisa:{q}:{per}")
def pesquisar_empresas_cached(q: str, per: int = 5) -> dict:
    return get_client().pesquisar_empresas(q=q, per=per)


@com_cache(lambda: "analytics")
def analytics_cached() -> dict:
    return get_client().analytics()


# ─── Medição de performance ───────────────────────────────────────────────

class Cronometro:
    """Cronómetro de contexto para medir tempos de execução."""

    def __init__(self, nome: str) -> None:
        self.nome = nome
        self._inicio: float = 0.0

    def __enter__(self) -> "Cronometro":
        self._inicio = time.perf_counter()
        return self

    def __exit__(self, *_) -> None:
        duracao = (time.perf_counter() - self._inicio) * 1000
        print(f"  ⏱  {self.nome}: {duracao:.1f} ms")


# ─── Pré-carregamento (warm-up) ───────────────────────────────────────────

def precarregar_dados_frequentes(nifs: list[str]) -> None:
    """Pré-carrega dados de um conjunto de NIFs no cache."""
    print(f"A pré-carregar {len(nifs)} empresas no cache…")
    for nif in nifs:
        try:
            obter_empresa_cached(nif)
        except Exception as exc:
            print(f"  [AVISO] NIF {nif}: {exc}")
    print(f"Cache aquecido: {len(_cache_global)} entradas.")


# ─── Demo ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("Capítulo 12 — Optimizações de Performance")
    print("=" * 60)

    print("\n1. Teste de cache (primeira chamada = API, segunda = cache):\n")
    with Cronometro("Primeira chamada (sem cache)"):
        r1 = pesquisar_empresas_cached("tecnologia", 3)

    with Cronometro("Segunda chamada (com cache)"):
        r2 = pesquisar_empresas_cached("tecnologia", 3)

    print(f"\n   Resultados iguais: {r1 == r2}")

    print("\n2. Analytics com cache:\n")
    with Cronometro("Analytics (primeira vez)"):
        analytics_cached()
    with Cronometro("Analytics (cache)"):
        analytics_cached()

    print(f"\n3. Entradas no cache: {len(_cache_global)}")

    print("\n4. Invalidar cache e chamar de novo:\n")
    _cache_global.invalidar("analytics")
    with Cronometro("Analytics após invalidação"):
        analytics_cached()
