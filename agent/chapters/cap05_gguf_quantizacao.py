"""Capítulo 5 — GGUF e Quantização.

Explica o formato GGUF e os níveis de quantização disponíveis,
mostrando o impacto no tamanho do ficheiro, na qualidade e
no consumo de memória.

Execute: python chapters/cap05_gguf_quantizacao.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ─── Dados dos níveis de quantização ──────────────────────────────────────

QUANTIZACOES = [
    {
        "nome": "F16",
        "bits": 16,
        "descricao": "Precisão total (float16)",
        "factor_tamanho": 2.0,
        "qualidade": "Máxima",
        "uso": "Treino / fine-tuning (raramente inferência)",
    },
    {
        "nome": "Q8_0",
        "bits": 8,
        "descricao": "Quantização inteira de 8 bits",
        "factor_tamanho": 1.0,
        "qualidade": "Muito alta (~F16)",
        "uso": "GPU com VRAM suficiente, avaliação rigorosa",
    },
    {
        "nome": "Q6_K",
        "bits": 6,
        "descricao": "6 bits, blocos K",
        "factor_tamanho": 0.75,
        "qualidade": "Alta",
        "uso": "Boa qualidade com menos memória",
    },
    {
        "nome": "Q5_K_M",
        "bits": 5,
        "descricao": "5 bits, blocos K, mistura média",
        "factor_tamanho": 0.625,
        "qualidade": "Boa",
        "uso": "Equilíbrio qualidade/tamanho acima da média",
    },
    {
        "nome": "Q4_K_M",
        "bits": 4,
        "descricao": "4 bits, blocos K, mistura média",
        "factor_tamanho": 0.50,
        "qualidade": "Boa (recomendada)",
        "uso": "✅ Padrão para produção local — melhor relação qualidade/tamanho",
    },
    {
        "nome": "Q3_K_M",
        "bits": 3,
        "descricao": "3 bits, blocos K, mistura média",
        "factor_tamanho": 0.375,
        "qualidade": "Aceitável",
        "uso": "Hardware muito limitado (<4 GB RAM)",
    },
    {
        "nome": "Q2_K",
        "bits": 2,
        "descricao": "2 bits, blocos K",
        "factor_tamanho": 0.25,
        "qualidade": "Degradada",
        "uso": "Apenas quando não há alternativa",
    },
]

# Tamanho base F16 para Phi-3-mini 3.8B (em GB)
TAMANHO_BASE_GB = 7.6


def calcular_tamanho(factor: float) -> float:
    return round(TAMANHO_BASE_GB * factor, 1)


def mostrar_quantizacoes() -> None:
    print("=" * 60)
    print("  Capítulo 5: GGUF e Quantização")
    print("=" * 60)
    print()
    print("O formato GGUF (GPT-Generated Unified Format) é o padrão")
    print("actual para distribuição de modelos LLM para inferência local.")
    print()
    print("Estrutura de um ficheiro GGUF:")
    print("  ┌─────────────────────────────────────────────────────┐")
    print("  │  Cabeçalho (metadados, tokenizer, hiperparâmetros) │")
    print("  ├─────────────────────────────────────────────────────┤")
    print("  │  Tensores quantizados (pesos do modelo)            │")
    print("  └─────────────────────────────────────────────────────┘")
    print()
    print(f"Comparação de quantizações para Phi-3-mini 3.8B (base F16: {TAMANHO_BASE_GB} GB):")
    print()
    print(f"  {'Nível':<10}  {'Bits':>4}  {'Tamanho':>8}  {'Qualidade':<22}  Uso recomendado")
    print("  " + "─" * 85)
    for q in QUANTIZACOES:
        tamanho = calcular_tamanho(q["factor_tamanho"])
        print(
            f"  {q['nome']:<10}  {q['bits']:>4}  {tamanho:>6.1f}GB  {q['qualidade']:<22}  {q['uso']}"
        )

    print()
    print("Regra prática:")
    print("  • RAM ≥ 8 GB  → Q4_K_M  (recomendado)")
    print("  • RAM ≥ 4 GB  → Q3_K_M  (alternativa)")
    print("  • RAM < 4 GB  → hardware insuficiente para LLMs úteis")
    print()
    print("Nomenclatura dos ficheiros no Hugging Face:")
    print("  Modelo-Q4_K_M.gguf  — 4 bits, blocos K, mistura média")
    print("  Modelo-Q4_K_S.gguf  — 4 bits, blocos K, mistura pequena (mais rápido, menos qualidade)")


if __name__ == "__main__":
    mostrar_quantizacoes()
