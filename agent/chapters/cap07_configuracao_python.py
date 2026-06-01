"""Capítulo 7 — Configuração Python.

Demonstra as boas práticas de configuração com variáveis de ambiente:
leitura de .env, valores de fallback, e validação de configuração.

Execute: python chapters/cap07_configuracao_python.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from config import (
    EMPRESAIQ_BASE_URL,
    EMPRESAIQ_USERNAME,
    EMPRESAIQ_PASSWORD,
    LLM_BASE_URL,
    LLM_API_KEY,
    LLM_MODEL,
    LLM_TEMPERATURE,
    LLM_MAX_TOKENS,
)


def mostrar_configuracao() -> None:
    """Mostra a configuração actual e verifica se .env existe."""

    print("=" * 60)
    print("  Capítulo 7: Configuração Python")
    print("=" * 60)
    print()

    # Verificar .env
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    env_exemplo = os.path.join(os.path.dirname(__file__), "..", ".env.example")

    if os.path.exists(env_path):
        print("  ✅ Ficheiro .env encontrado")
    else:
        print("  ⚠️  Ficheiro .env não encontrado")
        if os.path.exists(env_exemplo):
            print("      → Copie .env.example para .env e preencha os valores:")
            print("        cp .env.example .env  (Linux/macOS)")
            print("        copy .env.example .env  (Windows)")

    print()
    print("Configuração EmpresaIQ API:")
    print(f"  BASE_URL   : {EMPRESAIQ_BASE_URL}")
    print(f"  USERNAME   : {EMPRESAIQ_USERNAME}")
    # Nunca mostrar a palavra-passe em texto claro nos logs
    print(f"  PASSWORD   : {'*' * len(EMPRESAIQ_PASSWORD) if EMPRESAIQ_PASSWORD else '(não definida)'}")

    print()
    print("Configuração LLM:")
    print(f"  BASE_URL   : {LLM_BASE_URL}")
    print(f"  MODEL      : {LLM_MODEL}")
    print(f"  TEMPERATURE: {LLM_TEMPERATURE}")
    print(f"  MAX_TOKENS : {LLM_MAX_TOKENS}")

    # Verificar se a chave de API é um valor real ou placeholder
    if LLM_API_KEY in {"not-needed", ""}:
        print(f"  API_KEY    : (modo local — sem chave necessária)")
    else:
        print(f"  API_KEY    : {'*' * 8}…{LLM_API_KEY[-4:] if len(LLM_API_KEY) > 4 else '****'}")

    print()
    print("Boas práticas de segurança aplicadas:")
    print("  ✅ Credenciais lidas de variáveis de ambiente (nunca hardcoded)")
    print("  ✅ .env listado no .gitignore (nunca versionado)")
    print("  ✅ .env.example como template seguro para partilhar")
    print("  ✅ Palavra-passe mascarada nos logs")


if __name__ == "__main__":
    mostrar_configuracao()
