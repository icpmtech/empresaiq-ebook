"""Capítulo 8 — Instalação do llama.cpp.

Demonstra como verificar a instalação do llama-server,
iniciar o servidor e testar a API OpenAI-compatible.

Execute: python chapters/cap08_instalacao_llamacpp.py
"""

import sys
import os
import subprocess
import shutil

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from config import LLM_BASE_URL, LLM_MODEL


# ─── Comandos de instalação por plataforma ────────────────────────────────

INSTALACAO = {
    "win32": [
        "# Windows — via winget (Windows 10/11)",
        "winget install llama.cpp",
        "",
        "# Ou compilar a partir do código fonte:",
        "git clone https://github.com/ggerganov/llama.cpp",
        "cd llama.cpp",
        "cmake -B build -DLLAMA_AVX2=ON",
        "cmake --build build --config Release",
    ],
    "darwin": [
        "# macOS — via Homebrew",
        "brew install llama.cpp",
    ],
    "linux": [
        "# Linux — compilar a partir do código fonte",
        "git clone https://github.com/ggerganov/llama.cpp",
        "cd llama.cpp",
        "cmake -B build -DLLAMA_AVX2=ON",
        "cmake --build build --config Release -j $(nproc)",
        "sudo cp build/bin/llama-server /usr/local/bin/",
    ],
}

COMANDO_SERVIDOR = (
    "llama-server "
    "--model models/Qwen2.5-7B-Instruct-Q4_K_M.gguf "
    "--port 8080 "
    "--ctx-size 8192 "
    "--threads 8 "
    "--n-predict 2048"
)


def verificar_llama_server() -> bool:
    """Verifica se o llama-server está instalado e no PATH."""
    executavel = shutil.which("llama-server") or shutil.which("llama-server.exe")
    if executavel:
        print(f"  ✅ llama-server encontrado: {executavel}")
        # Tentar obter versão
        try:
            result = subprocess.run(
                [executavel, "--version"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            versao = (result.stdout or result.stderr).strip().split("\n")[0]
            print(f"     Versão: {versao}")
        except Exception:
            pass
        return True
    else:
        print("  ❌ llama-server não encontrado no PATH")
        return False


def testar_api_llm() -> None:
    """Testa se o servidor llama.cpp está activo e a responder."""
    try:
        import requests
        resp = requests.get(f"{LLM_BASE_URL.rstrip('/v1')}/health", timeout=3)
        if resp.status_code == 200:
            print(f"  ✅ Servidor LLM activo em {LLM_BASE_URL}")
        else:
            print(f"  ⚠️  Servidor responde com HTTP {resp.status_code}")
    except Exception as exc:
        print(f"  ❌ Servidor LLM inactivo ({exc})")
        print(f"     Inicie com:")
        print(f"     {COMANDO_SERVIDOR}")


def mostrar_instalacao() -> None:
    print("=" * 60)
    print("  Capítulo 8: Instalação do llama.cpp")
    print("=" * 60)
    print()

    print("Verificação do llama-server:")
    instalado = verificar_llama_server()

    if not instalado:
        plataforma = sys.platform
        comandos = INSTALACAO.get(plataforma, INSTALACAO["linux"])
        print()
        print("Comandos de instalação:")
        for linha in comandos:
            print(f"  {linha}")

    print()
    print("Teste de conectividade ao servidor LLM:")
    testar_api_llm()

    print()
    print("Comando para iniciar o servidor llama.cpp:")
    print(f"  {COMANDO_SERVIDOR}")
    print()
    print("Flags úteis:")
    print("  --threads N         → número de núcleos de CPU a usar")
    print("  --ctx-size N        → tamanho do contexto (tokens)")
    print("  --n-gpu-layers N    → camadas na GPU (0 = apenas CPU)")
    print("  --mlock             → bloquear modelo na RAM (evita swap)")


if __name__ == "__main__":
    mostrar_instalacao()
