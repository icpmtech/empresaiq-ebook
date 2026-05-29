"""Capítulo 15 — Segurança e Privacidade.

Demonstra boas práticas de segurança ao usar a EmpresaIQ API:
- Validação de inputs (NIF, parâmetros de pesquisa)
- Sanitização para evitar injecção nos parâmetros da API
- Gestão segura de credenciais (sem hardcode)
- Logging sem dados sensíveis
- Rate limiting do lado do cliente

Execute: python chapters/cap15_seguranca.py
"""

import sys
import os
import re
import logging
import time
import hashlib
from collections import deque
from datetime import datetime, timedelta
from typing import Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from api_client import get_client

# ─── Logging seguro (sem dados sensíveis) ─────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("cap15_seguranca")


def _anonimizar_nif(nif: str) -> str:
    """Oculta os últimos 5 dígitos do NIF nos logs."""
    if len(nif) >= 9:
        return nif[:4] + "*****"
    return "***"


# ─── Validação de inputs ──────────────────────────────────────────────────

NIF_REGEX = re.compile(r"^\d{9}$")
PESQUISA_MAX_LEN = 200
CARACTERES_PROIBIDOS = re.compile(r"[<>{};\"'\\]")


class InputInvalidoError(ValueError):
    """Erro de validação de input."""


def validar_nif(nif: str) -> str:
    """Valida e normaliza um NIF português (9 dígitos numéricos)."""
    nif = str(nif).strip().replace(" ", "").replace("-", "")
    if not NIF_REGEX.match(nif):
        raise InputInvalidoError(
            f"NIF inválido: deve ter exactamente 9 dígitos numéricos. Recebido: '{nif}'"
        )
    return nif


def validar_texto_pesquisa(texto: str) -> str:
    """Sanitiza um texto de pesquisa livre."""
    texto = str(texto).strip()

    if len(texto) > PESQUISA_MAX_LEN:
        raise InputInvalidoError(
            f"Texto de pesquisa demasiado longo ({len(texto)} > {PESQUISA_MAX_LEN} chars)."
        )

    if CARACTERES_PROIBIDOS.search(texto):
        raise InputInvalidoError(
            "Texto de pesquisa contém caracteres não permitidos."
        )

    return texto


def validar_distrito(distrito: str) -> str:
    """Valida que o distrito é um nome razoável."""
    DISTRITOS_VALIDOS = {
        "aveiro", "beja", "braga", "bragança", "castelo branco", "coimbra",
        "évora", "faro", "guarda", "leiria", "lisboa", "portalegre", "porto",
        "santarém", "setúbal", "viana do castelo", "vila real", "viseu",
        "açores", "madeira",
    }
    d = distrito.strip().lower()
    if d not in DISTRITOS_VALIDOS:
        raise InputInvalidoError(f"Distrito inválido: '{distrito}'.")
    return distrito.strip()


# ─── Rate limiter do lado do cliente ─────────────────────────────────────

class RateLimiter:
    """Limita o número de pedidos por janela de tempo."""

    def __init__(self, max_pedidos: int = 30, janela_segundos: int = 60) -> None:
        self._max = max_pedidos
        self._janela = janela_segundos
        self._timestamps: deque[float] = deque()

    def permitir(self) -> bool:
        """Verifica se um pedido é permitido."""
        agora = time.monotonic()
        limite = agora - self._janela

        # Remove timestamps fora da janela
        while self._timestamps and self._timestamps[0] < limite:
            self._timestamps.popleft()

        if len(self._timestamps) >= self._max:
            return False

        self._timestamps.append(agora)
        return True

    def esperar_se_necessario(self) -> None:
        """Bloqueia até o pedido ser permitido."""
        while not self.permitir():
            time.sleep(0.5)


_rate_limiter = RateLimiter(max_pedidos=30, janela_segundos=60)


# ─── Cliente seguro ───────────────────────────────────────────────────────

def pesquisar_empresa_seguro(q: str, distrito: str | None = None) -> dict:
    """Pesquisa empresa com validação e rate limiting."""
    q = validar_texto_pesquisa(q)
    if distrito:
        distrito = validar_distrito(distrito)

    logger.info("Pesquisa de empresas: q='%s'", q)
    _rate_limiter.esperar_se_necessario()

    return get_client().pesquisar_empresas(q=q, distrito=distrito, per=5)


def detalhe_empresa_seguro(nif: str) -> dict:
    """Obtém detalhe de empresa com validação de NIF."""
    nif = validar_nif(nif)
    logger.info("Detalhe de empresa: NIF=%s", _anonimizar_nif(nif))
    _rate_limiter.esperar_se_necessario()

    return get_client().detalhe_empresa(nif)


def risco_seguro(nif: str) -> dict:
    """Obtém risco com validação de NIF."""
    nif = validar_nif(nif)
    logger.info("Consulta de risco: NIF=%s", _anonimizar_nif(nif))
    _rate_limiter.esperar_se_necessario()

    try:
        return get_client().risco_empresa(nif)
    except Exception:
        return get_client().calcular_risco(nif)


# ─── Demo ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("Capítulo 15 — Segurança e Privacidade")
    print("=" * 60)

    # Teste de validação de NIF
    print("\n1. Validação de NIF:")
    nifs_teste = ["500001234", "123", "abc123456", "500 001 234"]
    for nif in nifs_teste:
        try:
            resultado = validar_nif(nif)
            print(f"   ✅ '{nif}' → válido: {resultado}")
        except InputInvalidoError as e:
            print(f"   ❌ '{nif}' → {e}")

    # Teste de validação de pesquisa
    print("\n2. Sanitização de texto de pesquisa:")
    textos_teste = [
        "construção civil",
        "empresa <script>alert(1)</script>",
        "a" * 250,
        "nome; DROP TABLE empresas;",
    ]
    for texto in textos_teste:
        try:
            resultado = validar_texto_pesquisa(texto)
            print(f"   ✅ '{texto[:40]}' → aceite")
        except InputInvalidoError as e:
            print(f"   ❌ '{texto[:40]}' → {e}")

    # Teste de rate limiting
    print("\n3. Rate limiting (30 pedidos/60s):")
    limiter = RateLimiter(max_pedidos=5, janela_segundos=5)
    for i in range(7):
        permitido = limiter.permitir()
        estado = "✅ permitido" if permitido else "🚫 bloqueado"
        print(f"   Pedido {i+1}: {estado}")

    # Teste com API real
    print("\n4. Pesquisa segura com API:")
    try:
        dados = pesquisar_empresa_seguro("tecnologia")
        total = dados.get("total", 0)
        print(f"   ✅ Pesquisa 'tecnologia': {total} resultados")
    except Exception as exc:
        print(f"   Erro (API pode não estar disponível): {exc}")
