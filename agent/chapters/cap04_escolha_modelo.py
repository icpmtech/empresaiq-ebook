"""Capítulo 4 — Escolha do Modelo.

Demonstra critérios de selecção de modelos GGUF para uso empresarial:
licença, tamanho de contexto, desempenho em português e raciocínio.

Execute: python chapters/cap04_escolha_modelo.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ─── Catálogo de modelos testados para o EmpresaIQ ────────────────────────

CATALOGO = [
    {
        "nome": "Phi-3-mini-4k-instruct",
        "familia": "Microsoft Phi-3",
        "parametros": "3.8B",
        "contexto_tokens": 4096,
        "licenca": "MIT (uso comercial ✅)",
        "huggingface": "bartowski/Phi-3-mini-4k-instruct-GGUF",
        "quantizacao_recomendada": "Q4_K_M",
        "uso_recomendado": "Hardware modesto (4-8 GB RAM), bom em inglês",
        "pontuacao_pt": "★★★☆☆",
        "raciocinio": "★★★★☆",
    },
    {
        "nome": "Qwen2.5-7B-Instruct",
        "familia": "Alibaba Qwen 2.5",
        "parametros": "7B",
        "contexto_tokens": 32768,
        "licenca": "Apache 2.0 (uso comercial ✅)",
        "huggingface": "Qwen/Qwen2.5-7B-Instruct-GGUF",
        "quantizacao_recomendada": "Q4_K_M",
        "uso_recomendado": "Equilíbrio óptimo, excelente em português",
        "pontuacao_pt": "★★★★★",
        "raciocinio": "★★★★☆",
    },
    {
        "nome": "Llama-3.1-8B-Instruct",
        "familia": "Meta Llama 3.1",
        "parametros": "8B",
        "contexto_tokens": 128000,
        "licenca": "Llama 3 Community (uso comercial condicionado)",
        "huggingface": "bartowski/Meta-Llama-3.1-8B-Instruct-GGUF",
        "quantizacao_recomendada": "Q4_K_M",
        "uso_recomendado": "Melhor modelo 8B, contexto muito longo",
        "pontuacao_pt": "★★★★☆",
        "raciocinio": "★★★★★",
    },
    {
        "nome": "Mistral-7B-Instruct-v0.3",
        "familia": "Mistral AI",
        "parametros": "7B",
        "contexto_tokens": 32768,
        "licenca": "Apache 2.0 (uso comercial ✅)",
        "huggingface": "bartowski/Mistral-7B-Instruct-v0.3-GGUF",
        "quantizacao_recomendada": "Q4_K_M",
        "uso_recomendado": "Clássico fiável, bom para RAG e tools",
        "pontuacao_pt": "★★★☆☆",
        "raciocinio": "★★★★☆",
    },
]


def mostrar_catalogo() -> None:
    print("=" * 60)
    print("  Capítulo 4: Escolha do Modelo")
    print("=" * 60)
    print()

    print("Critérios de selecção para uso empresarial:")
    print("  1. Licença: deve permitir uso comercial sem restrições")
    print("  2. Desempenho em português: modelos multilíngues são preferíveis")
    print("  3. Contexto: quanto maior, mais documentos o agente processa")
    print("  4. Raciocínio: importante para o ciclo ReAct (Thought/Action)")
    print("  5. Tamanho: deve caber na RAM disponível com quantização Q4_K_M")
    print()

    for m in CATALOGO:
        print(f"  {'─' * 56}")
        print(f"  {m['nome']} ({m['parametros']})")
        print(f"    Família     : {m['familia']}")
        print(f"    Contexto    : {m['contexto_tokens']:,} tokens")
        print(f"    Licença     : {m['licenca']}")
        print(f"    Português   : {m['pontuacao_pt']}")
        print(f"    Raciocínio  : {m['raciocinio']}")
        print(f"    Quantização : {m['quantizacao_recomendada']}")
        print(f"    Uso         : {m['uso_recomendado']}")
        print(f"    HuggingFace : https://huggingface.co/{m['huggingface']}")

    print()
    print("Modelo recomendado para este livro:")
    print("  Qwen2.5-7B-Instruct (Q4_K_M) — melhor equilíbrio para português")
    print("  Alternativa com menos RAM: Phi-3-mini-4k (Q4_K_M)")


if __name__ == "__main__":
    mostrar_catalogo()
