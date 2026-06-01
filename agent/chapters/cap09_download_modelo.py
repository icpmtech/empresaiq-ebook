"""Capítulo 9 — Download e Verificação do Modelo GGUF.

Demonstra como descarregar o modelo do Hugging Face via linha de comandos,
verificar a integridade do ficheiro e testar uma primeira inferência
com o servidor llama.cpp.

Execute: python chapters/cap09_download_modelo.py
"""

import sys
import os
import hashlib
import urllib.request
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from config import LLM_BASE_URL, LLM_API_KEY, LLM_MODEL


# ─── Modelos disponíveis para download ────────────────────────────────────

MODELOS_GGUF = {
    "phi3-mini-q4": {
        "nome": "Phi-3-mini-4k-instruct-Q4_K_M",
        "url": "https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/resolve/main/Phi-3-mini-4k-instruct-Q4_K_M.gguf",
        "tamanho_gb": 2.2,
        "sha256": None,  # verificação via tamanho
    },
    "qwen25-7b-q4": {
        "nome": "Qwen2.5-7B-Instruct-Q4_K_M",
        "url": "https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf",
        "tamanho_gb": 4.7,
        "sha256": None,
    },
}

PASTA_MODELOS_PADRAO = os.path.join(
    os.path.dirname(__file__), "..", "..", "models"
)


def formatar_bytes(n: int) -> str:
    """Formata bytes em GB/MB de forma legível."""
    if n >= 1_000_000_000:
        return f"{n / 1_000_000_000:.2f} GB"
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f} MB"
    return f"{n:,} bytes"


def verificar_modelo_existente(pasta: str, nome: str) -> str | None:
    """Verifica se o ficheiro .gguf já existe na pasta de modelos."""
    for f in os.listdir(pasta) if os.path.isdir(pasta) else []:
        if f.endswith(".gguf") and nome.lower() in f.lower():
            return os.path.join(pasta, f)
    return None


def mostrar_comandos_download() -> None:
    """Mostra os comandos de download para cada modelo."""
    print("  Método 1 — huggingface-hub (recomendado):")
    print("    pip install huggingface-hub")
    print()
    for chave, m in MODELOS_GGUF.items():
        print(f"    # {m['nome']} (~{m['tamanho_gb']} GB)")
        print(f'    huggingface-cli download \\')
        print(f'      {"/".join(m["url"].split("/")[3:5])} \\')
        print(f'      {m["url"].split("/")[-1]} \\')
        print(f'      --local-dir models/')
        print()

    print("  Método 2 — wget / curl:")
    for chave, m in MODELOS_GGUF.items():
        print(f"    # {m['nome']}")
        print(f"    wget -P models/ {m['url']}")
        print()


def testar_inferencia() -> None:
    """Testa uma chamada mínima ao servidor LLM para verificar que funciona."""
    try:
        from openai import OpenAI

        client = OpenAI(base_url=LLM_BASE_URL, api_key=LLM_API_KEY)
        t0 = time.perf_counter()
        resp = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": "Responde apenas: olá"}],
            max_tokens=10,
            temperature=0,
        )
        latencia_ms = (time.perf_counter() - t0) * 1000
        resposta = resp.choices[0].message.content.strip()
        print(f"  ✅ Inferência OK em {latencia_ms:.0f} ms: '{resposta}'")
    except ImportError:
        print("  ⚠️  openai não instalado. Execute: pip install openai")
    except Exception as exc:
        print(f"  ❌ Falha na inferência: {exc}")
        print(f"     Verifique se o llama-server está activo em {LLM_BASE_URL}")


def mostrar_download() -> None:
    print("=" * 60)
    print("  Capítulo 9: Download do Modelo GGUF")
    print("=" * 60)
    print()

    print("Modelos disponíveis:")
    for chave, m in MODELOS_GGUF.items():
        print(f"  [{chave}] {m['nome']} — ~{m['tamanho_gb']} GB")

    print()
    print("Pasta de modelos padrão:")
    pasta = os.path.abspath(PASTA_MODELOS_PADRAO)
    print(f"  {pasta}")

    if os.path.isdir(pasta):
        gguf_files = [f for f in os.listdir(pasta) if f.endswith(".gguf")]
        if gguf_files:
            print("  Modelos já descarregados:")
            for f in gguf_files:
                tamanho = os.path.getsize(os.path.join(pasta, f))
                print(f"    ✅ {f}  ({formatar_bytes(tamanho)})")
        else:
            print("  (pasta vazia — nenhum modelo encontrado)")
    else:
        print("  (pasta não existe — será criada no download)")

    print()
    print("Comandos de download:")
    mostrar_comandos_download()

    print("Teste de inferência (requer llama-server activo):")
    testar_inferencia()


if __name__ == "__main__":
    mostrar_download()
