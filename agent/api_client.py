"""Cliente HTTP para a EmpresaIQ REST API.

Capítulo 9 — Acesso a dados via API REST
- Sessão reutilizada (sem criar ligações novas a cada pedido)
- Re-autenticação automática quando a sessão expira
- Retry automático em erros temporários de servidor
"""

from __future__ import annotations

import logging
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from config import EMPRESAIQ_BASE_URL, EMPRESAIQ_USERNAME, EMPRESAIQ_PASSWORD

logger = logging.getLogger(__name__)


def _make_session() -> requests.Session:
    """Cria uma sessão HTTP com retry automático para erros de servidor."""
    session = requests.Session()
    retry_strategy = Retry(
        total=3,
        backoff_factor=0.5,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["GET", "POST"],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    session.headers.update({"Accept": "application/json"})
    return session


def _clean(params: dict) -> dict:
    """Remove valores None de um dicionário de parâmetros."""
    return {k: v for k, v in params.items() if v is not None}


class EmpresaIQClient:
    """Cliente para a EmpresaIQ REST API.

    Gere autenticação por sessão Flask automaticamente,
    incluindo re-autenticação quando a sessão expira (HTTP 401).
    """

    def __init__(
        self,
        base_url: str = EMPRESAIQ_BASE_URL,
        username: str = EMPRESAIQ_USERNAME,
        password: str = EMPRESAIQ_PASSWORD,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self._username = username
        self._password = password
        self._session = _make_session()
        self._authenticated = False

    # ─── Autenticação ──────────────────────────────────────────────────────

    def login(self) -> None:
        """Autentica na API e guarda os cookies de sessão."""
        resp = self._session.post(
            f"{self.base_url}/auth/login",
            data={"username": self._username, "password": self._password},
            timeout=10,
        )
        resp.raise_for_status()
        self._authenticated = True
        logger.debug("Sessão EmpresaIQ autenticada.")

    # ─── Métodos internos ──────────────────────────────────────────────────

    def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict | None = None,
        json: dict | None = None,
        _retry: bool = True,
    ) -> Any:
        if not self._authenticated:
            self.login()

        url = f"{self.base_url}{path}"
        resp = self._session.request(
            method, url, params=params, json=json, timeout=20
        )

        if resp.status_code == 401 and _retry:
            logger.debug("Sessão expirada — re-autenticando…")
            self._authenticated = False
            return self._request(
                method, path, params=params, json=json, _retry=False
            )

        resp.raise_for_status()
        return resp.json()

    def _get(self, path: str, params: dict | None = None) -> Any:
        return self._request("GET", path, params=_clean(params or {}))

    def _post(self, path: str, json: dict | None = None) -> Any:
        return self._request("POST", path, json=json)

    # ─── Sistema ───────────────────────────────────────────────────────────

    def health(self) -> dict:
        """Verifica o estado do serviço e do Elasticsearch."""
        return self._get("/api/v1/health")

    def stats(self) -> dict:
        """Retorna a contagem de documentos por índice."""
        return self._get("/api/v1/stats")

    # ─── Empresas ──────────────────────────────────────────────────────────

    def pesquisar_empresas(
        self,
        q: str | None = None,
        estado: str | None = None,
        distrito: str | None = None,
        forma_juridica: str | None = None,
        cae: str | None = None,
        n_insolvencias_min: int = 0,
        sort_by: str = "_score",
        sort_order: str = "desc",
        page: int = 1,
        per: int = 20,
    ) -> dict:
        return self._get(
            "/api/v1/companies",
            params={
                "q": q,
                "estado": estado,
                "distrito": distrito,
                "forma_juridica": forma_juridica,
                "cae": cae,
                "n_insolvencias_min": n_insolvencias_min,
                "sort_by": sort_by,
                "sort_order": sort_order,
                "page": page,
                "per": per,
            },
        )

    def detalhe_empresa(self, nif: str) -> dict:
        """Detalhe de empresa com insolvências e execuções associadas."""
        return self._get(f"/api/v1/companies/{nif}")

    # ─── Insolvências ──────────────────────────────────────────────────────

    def pesquisar_insolvencias(
        self,
        q: str | None = None,
        nif: str | None = None,
        tribunal: str | None = None,
        ano: int | None = None,
        tipo_processo: str | None = None,
        page: int = 1,
        per: int = 20,
    ) -> dict:
        return self._get(
            "/api/v1/insolvencias",
            params={
                "q": q,
                "nif": nif,
                "tribunal": tribunal,
                "ano": ano,
                "tipo_processo": tipo_processo,
                "page": page,
                "per": per,
            },
        )

    # ─── Execuções ─────────────────────────────────────────────────────────

    def pesquisar_execucoes(
        self,
        q: str | None = None,
        letra: str | None = None,
        estado: str | None = None,
        entity_type: str | None = None,
        tribunal: str | None = None,
        periodo: str | None = None,
        page: int = 1,
        per: int = 20,
    ) -> dict:
        return self._get(
            "/api/v1/execucoes",
            params={
                "q": q,
                "letra": letra,
                "estado": estado,
                "entity_type": entity_type,
                "tribunal": tribunal,
                "periodo": periodo,
                "page": page,
                "per": per,
            },
        )

    def execucoes_entidade(
        self, entity_id: str, page: int = 1, per: int = 20
    ) -> dict:
        return self._get(
            f"/api/v1/execucoes/entidade/{entity_id}",
            params={"page": page, "per": per},
        )

    # ─── InformaDB ─────────────────────────────────────────────────────────

    def pesquisar_informadb(
        self,
        q: str | None = None,
        distrito: str | None = None,
        concelho: str | None = None,
        cae_codigo: str | None = None,
        page: int = 1,
        per: int = 20,
    ) -> dict:
        return self._get(
            "/api/v1/informadb",
            params={
                "q": q,
                "distrito": distrito,
                "concelho": concelho,
                "cae_codigo": cae_codigo,
                "page": page,
                "per": per,
            },
        )

    # ─── Analytics ─────────────────────────────────────────────────────────

    def analytics(self) -> dict:
        return self._get("/api/v1/analytics")

    def cross_stats(
        self, nif: str | None = None, q: str | None = None
    ) -> dict:
        return self._get("/api/v1/cross-stats", params={"nif": nif, "q": q})

    def cross_stats_overview(self) -> dict:
        return self._get("/api/v1/cross-stats/overview")

    # ─── Risco ─────────────────────────────────────────────────────────────

    def risco_empresa(self, nif: str) -> dict:
        """Obtém a pontuação de risco pre-calculada de uma empresa."""
        return self._get(f"/api/v1/risk/{nif}")

    def calcular_risco(self, nif: str) -> dict:
        """Calcula e persiste o risco de uma empresa pelo NIF."""
        return self._post(f"/api/v1/risk/{nif}/calculate")

    # ─── NIF agregado ──────────────────────────────────────────────────────

    def detalhe_nif(self, nif: str) -> dict:
        """Dados agregados de um NIF: empresa, risco, insolvências, execuções."""
        return self._get(f"/api/v1/nif/{nif}")

    # ─── Pesquisa global ───────────────────────────────────────────────────

    def pesquisa_global(
        self,
        q: str,
        source: str = "",
        distrito: str | None = None,
        page: int = 1,
        per: int = 20,
    ) -> dict:
        """Pesquisa em todos os índices (empresas, insolvências, execuções, InformaDB)."""
        return self._get(
            "/api/v1/search",
            params=_clean(
                {
                    "q": q,
                    "source": source or None,
                    "distrito": distrito,
                    "page": page,
                    "per": per,
                }
            ),
        )


# ─── Singleton ─────────────────────────────────────────────────────────────

_client: EmpresaIQClient | None = None


def get_client() -> EmpresaIQClient:
    """Devolve (ou cria) o cliente singleton EmpresaIQ.

    Reutiliza a mesma sessão HTTP em toda a aplicação para evitar
    overhead de ligação e re-autenticação desnecessária.
    """
    global _client
    if _client is None:
        _client = EmpresaIQClient()
    return _client

    def indices_browser(
        self,
        index: str = "all",
        q: str | None = None,
        page: int = 1,
        per: int = 25,
    ) -> dict:
        return self._get(
            "/api/v1/indices-browser",
            params={"index": index, "q": q, "page": page, "per": per},
        )

    # ─── Pesquisa ──────────────────────────────────────────────────────────

    def pesquisa_global(
        self,
        q: str,
        source: str = "",
        estado: str | None = None,
        distrito: str | None = None,
        page: int = 1,
        per: int = 20,
    ) -> dict:
        return self._get(
            "/api/v1/search",
            params={
                "q": q,
                "source": source,
                "estado": estado,
                "distrito": distrito,
                "page": page,
                "per": per,
            },
        )

    def autocomplete_nif(self, q: str, limit: int = 10) -> dict:
        return self._get(
            "/api/v1/nif/autocomplete", params={"q": q, "limit": limit}
        )

    def detalhe_nif(self, nif: str) -> dict:
        """Detalhe completo por NIF — todos os índices agregados."""
        return self._get(f"/api/v1/nif/{nif}")

    def perfil_nif(self, nif: str) -> dict:
        """Perfil guardado de um NIF (nif_profiles)."""
        return self._get(f"/api/v1/nif/{nif}/profile")

    def perfis_recentes(self, limit: int = 20) -> dict:
        return self._get(
            "/api/v1/nif/profiles/recent", params={"limit": limit}
        )

    # ─── Risco ─────────────────────────────────────────────────────────────

    def risco_empresa(self, nif: str) -> dict:
        """Lê a pontuação de risco já calculada."""
        return self._get(f"/api/v1/risk/{nif}")

    def calcular_risco(self, nif: str) -> dict:
        """Executa o motor de risco completo e guarda no Elasticsearch."""
        return self._post(f"/api/v1/nif/{nif}/risk-run")


# ─── Singleton ────────────────────────────────────────────────────────────
_default_client: EmpresaIQClient | None = None


def get_client() -> EmpresaIQClient:
    """Retorna a instância singleton do cliente EmpresaIQ."""
    global _default_client
    if _default_client is None:
        _default_client = EmpresaIQClient()
    return _default_client
