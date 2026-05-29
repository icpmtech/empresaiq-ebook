"""Configuração centralizada do EmpresaIQ Agent.

Capítulo 7 — Configuração Python
Todas as variáveis sensíveis são lidas de variáveis de ambiente
ou do ficheiro .env — nunca hardcoded no código.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ─── EmpresaIQ REST API ────────────────────────────────────────────────────
EMPRESAIQ_BASE_URL: str = os.getenv("EMPRESAIQ_BASE_URL", "http://localhost:5000")
EMPRESAIQ_USERNAME: str = os.getenv("EMPRESAIQ_USERNAME", "admin")
EMPRESAIQ_PASSWORD: str = os.getenv("EMPRESAIQ_PASSWORD", "admin")

# ─── LLM (llama.cpp server ou OpenAI) ────────────────────────────────────
LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "http://localhost:8080/v1")
LLM_API_KEY: str = os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", "not-needed"))
LLM_MODEL: str = os.getenv("LLM_MODEL", "local-model")
LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.1"))
LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "2048"))
