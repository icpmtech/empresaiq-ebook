"""Capítulo 6 — Instalação do Ambiente.

Guia de instalação e verificação do ambiente Python necessário
para o EmpresaIQ Agent: Python 3.11+, venv, dependências.

Execute: python chapters/cap06_instalacao_ambiente.py
"""

import sys
import os
import subprocess
import importlib.util

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ─── Dependências necessárias ─────────────────────────────────────────────

DEPENDENCIAS = [
    ("langchain", "0.3.0", "Orquestração de agentes ReAct"),
    ("langchain_openai", "0.2.0", "Conector LLM OpenAI-compatible"),
    ("openai", "1.40.0", "SDK OpenAI (usada pelo langchain_openai)"),
    ("requests", "2.31.0", "Cliente HTTP para a EmpresaIQ API"),
    ("gradio", "4.44.0", "Interface de chat web"),
    ("dotenv", None, "Carregamento de variáveis de ambiente (.env)"),
]


def verificar_python() -> bool:
    """Verifica a versão mínima de Python."""
    versao = sys.version_info
    ok = versao >= (3, 11)
    estado = "✅" if ok else "❌"
    print(f"  {estado} Python {versao.major}.{versao.minor}.{versao.micro}", end="")
    if not ok:
        print("  ← Python 3.11+ obrigatório", end="")
    print()
    return ok


def verificar_venv() -> None:
    """Detecta se o código corre dentro de um virtual environment."""
    em_venv = (
        hasattr(sys, "real_prefix")
        or (hasattr(sys, "base_prefix") and sys.base_prefix != sys.prefix)
    )
    estado = "✅" if em_venv else "⚠️ "
    print(f"  {estado} Virtual environment: {'activo' if em_venv else 'NÃO activo — recomendado usar venv'}")


def verificar_pacote(nome_import: str, versao_min: str | None, descricao: str) -> bool:
    """Verifica se um pacote Python está instalado."""
    spec = importlib.util.find_spec(nome_import)
    if spec is None:
        print(f"  ❌ {nome_import:<25}  não instalado  — {descricao}")
        return False

    # Tentar obter versão instalada
    try:
        import importlib.metadata
        versao = importlib.metadata.version(nome_import.replace("_", "-"))
        print(f"  ✅ {nome_import:<25}  v{versao:<12}  {descricao}")
    except Exception:
        print(f"  ✅ {nome_import:<25}  (versão desconhecida)  {descricao}")
    return True


def mostrar_comandos_instalacao() -> None:
    """Mostra os comandos de instalação necessários."""
    print()
    print("Comandos de instalação:")
    print()
    print("  # 1. Criar e activar virtual environment")
    if sys.platform == "win32":
        print("  python -m venv .venv")
        print("  .venv\\Scripts\\activate")
    else:
        print("  python3 -m venv .venv")
        print("  source .venv/bin/activate")
    print()
    print("  # 2. Instalar todas as dependências")
    print("  pip install -r requirements.txt")


def verificar_ambiente() -> None:
    print("=" * 60)
    print("  Capítulo 6: Instalação do Ambiente")
    print("=" * 60)
    print()

    print("Verificação do ambiente Python:")
    python_ok = verificar_python()
    verificar_venv()

    print()
    print("Dependências instaladas:")
    todas_ok = True
    for nome, versao_min, descricao in DEPENDENCIAS:
        ok = verificar_pacote(nome, versao_min, descricao)
        todas_ok = todas_ok and ok

    if not todas_ok or not python_ok:
        mostrar_comandos_instalacao()
    else:
        print()
        print("✅ Ambiente pronto. Avance para o capítulo 7.")


if __name__ == "__main__":
    verificar_ambiente()
