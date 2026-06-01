"""Capítulo 3 — Limitações de Hardware.

Mostra como avaliar se o seu hardware é suficiente para correr
o modelo local, e como estimar o consumo de RAM/VRAM com base
no tamanho do modelo e na quantização.

Execute: python chapters/cap03_limitacoes_hardware.py
"""

import sys
import os
import platform

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ─── Tabela de requisitos por quantização ─────────────────────────────────

MODELOS = {
    "Phi-3-mini-4k (Q4_K_M)": {
        "parametros_B": 3.8,
        "quantizacao": "Q4_K_M",
        "ficheiro_gb": 2.2,
        "ram_minima_gb": 4,
        "ram_recomendada_gb": 8,
        "tokens_por_segundo_cpu": "8–15",
    },
    "Mistral-7B (Q4_K_M)": {
        "parametros_B": 7,
        "quantizacao": "Q4_K_M",
        "ficheiro_gb": 4.1,
        "ram_minima_gb": 8,
        "ram_recomendada_gb": 16,
        "tokens_por_segundo_cpu": "4–8",
    },
    "Llama-3-8B (Q4_K_M)": {
        "parametros_B": 8,
        "quantizacao": "Q4_K_M",
        "ficheiro_gb": 4.7,
        "ram_minima_gb": 8,
        "ram_recomendada_gb": 16,
        "tokens_por_segundo_cpu": "3–7",
    },
    "Qwen2.5-14B (Q4_K_M)": {
        "parametros_B": 14,
        "quantizacao": "Q4_K_M",
        "ficheiro_gb": 8.2,
        "ram_minima_gb": 16,
        "ram_recomendada_gb": 24,
        "tokens_por_segundo_cpu": "1–4",
    },
}


def detectar_hardware() -> dict:
    """Detecção básica do hardware disponível."""
    info = {
        "os": platform.system(),
        "arquitectura": platform.machine(),
        "processador": platform.processor() or "desconhecido",
    }

    # Tentar obter RAM total via psutil (opcional)
    try:
        import psutil  # type: ignore
        ram_total = psutil.virtual_memory().total / (1024 ** 3)
        ram_disp = psutil.virtual_memory().available / (1024 ** 3)
        info["ram_total_gb"] = round(ram_total, 1)
        info["ram_disponivel_gb"] = round(ram_disp, 1)
    except ImportError:
        info["ram_total_gb"] = None
        info["ram_disponivel_gb"] = None

    return info


def recomendar_modelo(ram_gb: float) -> str:
    """Recomenda o modelo mais adequado para a RAM disponível."""
    if ram_gb >= 16:
        return "Qwen2.5-14B (Q4_K_M) — qualidade máxima"
    if ram_gb >= 8:
        return "Llama-3-8B (Q4_K_M) — excelente equilíbrio"
    if ram_gb >= 4:
        return "Phi-3-mini-4k (Q4_K_M) — ideal para hardware modesto"
    return "Hardware insuficiente para correr modelos localmente."


def mostrar_tabela() -> None:
    print("=" * 60)
    print("  Capítulo 3: Limitações de Hardware")
    print("=" * 60)
    print()

    hw = detectar_hardware()
    print("Hardware detectado:")
    print(f"  SO: {hw['os']} ({hw['arquitectura']})")
    print(f"  CPU: {hw['processador']}")
    if hw["ram_total_gb"]:
        print(f"  RAM total: {hw['ram_total_gb']} GB")
        print(f"  RAM disponível: {hw['ram_disponivel_gb']} GB")
    else:
        print("  RAM: instale 'psutil' para detecção automática (pip install psutil)")

    print()
    print("Requisitos por modelo:")
    print(f"  {'Modelo':<35} {'Ficheiro':>8}  {'RAM mín.':>8}  {'RAM rec.':>8}  {'tok/s CPU':>10}")
    print("  " + "-" * 75)
    for nome, cfg in MODELOS.items():
        print(
            f"  {nome:<35} {cfg['ficheiro_gb']:>6.1f}GB"
            f"  {cfg['ram_minima_gb']:>6}GB"
            f"  {cfg['ram_recomendada_gb']:>6}GB"
            f"  {cfg['tokens_por_segundo_cpu']:>10}"
        )

    print()
    if hw["ram_total_gb"]:
        recomendacao = recomendar_modelo(hw["ram_total_gb"])
        print(f"Recomendação para o seu hardware: {recomendacao}")
    else:
        print("Recomendação padrão (8 GB RAM): Phi-3-mini-4k (Q4_K_M)")


if __name__ == "__main__":
    mostrar_tabela()
