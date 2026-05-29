"""Interface de chat Gradio para o agente EmpresaIQ.

Capítulo 13 — Interface de Chat
Inicie com: python app.py
Aceda em:   http://localhost:7860
"""

from __future__ import annotations

import logging
import sys
from typing import Generator

import gradio as gr

from agent import conversar, criar_agente
from api_client import get_client

logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

# ─── Agente global ─────────────────────────────────────────────────────────
_executor = None


def _get_executor():
    global _executor
    if _executor is None:
        _executor = criar_agente(verbose=False)
    return _executor


# ─── Handlers Gradio ───────────────────────────────────────────────────────

def chat(
    mensagem: str,
    historico: list[tuple[str, str]],
) -> tuple[str, list[tuple[str, str]]]:
    """Processa uma mensagem e devolve a resposta do agente."""
    if not mensagem.strip():
        return "", historico

    executor = _get_executor()
    resposta = conversar(executor, mensagem)
    historico.append((mensagem, resposta))
    return "", historico


def lookup_nif(nif: str) -> str:
    """Pesquisa rápida de empresa por NIF (sem usar o agente)."""
    nif = nif.strip()
    if not nif:
        return "Introduza um NIF."

    client = get_client()
    try:
        data = client.detalhe_empresa(nif)
    except Exception as exc:
        return f"Erro: {exc}"

    if not data.get("found"):
        return f"NIF {nif} não encontrado."

    emp = data.get("company", {})
    insolv = data.get("insolvencias", [])
    exec_ = data.get("execucoes", [])

    linhas = [
        f"**{emp.get('nome', '—')}**",
        f"NIF: {emp.get('nif', '—')}",
        f"Estado: {emp.get('estado', '—')}",
        f"Forma jurídica: {emp.get('forma_juridica', '—')}",
        f"CAE: {emp.get('cae', '—')} — {emp.get('cae_descricao', '')}",
        f"Localização: {emp.get('municipio', '—')}, {emp.get('distrito', '—')}",
        f"Capital social: {emp.get('capital_social', '—')}",
        f"Insolvências: {len(insolv)}",
        f"Execuções: {len(exec_)}",
    ]
    return "\n".join(linhas)


def lookup_risco(nif: str) -> str:
    """Consulta rápida de risco por NIF."""
    nif = nif.strip()
    if not nif:
        return "Introduza um NIF."

    client = get_client()
    try:
        data = client.risco_empresa(nif)
    except Exception:
        try:
            data = client.calcular_risco(nif)
        except Exception as exc:
            return f"Erro ao calcular risco: {exc}"

    score = data.get("risk_score", "—")
    nivel = data.get("risk_level", "—")
    nivel_emoji = {"Baixo": "🟢", "Médio": "🟡", "Alto": "🟠", "Crítico": "🔴"}.get(nivel, "⚪")

    return (
        f"{nivel_emoji} **{nivel}** (score: {score}/100)\n"
        f"Insolvências: {data.get('n_insolvencias', 0)} | "
        f"Execuções: {data.get('n_execucoes', 0)}"
    )


def status_api() -> str:
    """Verifica o estado da API EmpresaIQ."""
    client = get_client()
    try:
        h = client.health()
        es = "✅" if h.get("elasticsearch") else "❌"
        return f"API: ✅ | Elasticsearch: {es} | {h.get('timestamp', '')}"
    except Exception as exc:
        return f"API: ❌ — {exc}"


# ─── Interface Gradio ──────────────────────────────────────────────────────

def construir_interface() -> gr.Blocks:
    with gr.Blocks(
        title="EmpresaIQ — Agente Inteligente",
        theme=gr.themes.Soft(primary_hue="blue"),
        css=".gradio-container { max-width: 1200px !important; }",
    ) as demo:

        # ── Cabeçalho ──
        gr.Markdown(
            """
            # 🏢 EmpresaIQ — Agente de IA Local
            **Consulte empresas portuguesas, insolvências, execuções e risco — tudo localmente.**
            """
        )

        with gr.Row():
            # ── Painel lateral ──
            with gr.Column(scale=1, min_width=280):
                gr.Markdown("### 🔍 Consulta Rápida por NIF")

                nif_input = gr.Textbox(
                    label="NIF (9 dígitos)",
                    placeholder="500001234",
                    max_lines=1,
                )

                with gr.Row():
                    btn_empresa = gr.Button("Empresa", variant="secondary", size="sm")
                    btn_risco = gr.Button("Risco", variant="secondary", size="sm")

                resultado_rapido = gr.Markdown(label="Resultado")

                gr.Markdown("---")
                gr.Markdown("### 📊 Estado do Sistema")
                estado_api = gr.Markdown("A verificar…")
                btn_status = gr.Button("Actualizar", size="sm")

                gr.Markdown(
                    """
                    ---
                    **Exemplos de perguntas:**
                    - *Pesquisa empresas de construção em Lisboa*
                    - *Qual o risco da empresa com NIF 500001234?*
                    - *Mostra as insolvências do tribunal do Porto*
                    - *Quantas empresas existem na base de dados?*
                    """
                )

            # ── Chat principal ──
            with gr.Column(scale=3):
                chatbot = gr.Chatbot(
                    label="EmpresaIQ Chat",
                    height=520,
                    bubble_full_width=False,
                    show_copy_button=True,
                )

                with gr.Row():
                    msg_input = gr.Textbox(
                        label="",
                        placeholder="Escreva a sua pergunta aqui…",
                        scale=5,
                        max_lines=3,
                        show_label=False,
                    )
                    btn_enviar = gr.Button("Enviar ➤", variant="primary", scale=1)

                with gr.Row():
                    btn_limpar = gr.Button("Limpar conversa", size="sm")

        # ── Ligações de eventos ──
        btn_empresa.click(lookup_nif, inputs=nif_input, outputs=resultado_rapido)
        btn_risco.click(lookup_risco, inputs=nif_input, outputs=resultado_rapido)
        btn_status.click(status_api, outputs=estado_api)

        btn_enviar.click(
            chat,
            inputs=[msg_input, chatbot],
            outputs=[msg_input, chatbot],
        )
        msg_input.submit(
            chat,
            inputs=[msg_input, chatbot],
            outputs=[msg_input, chatbot],
        )
        btn_limpar.click(lambda: ([], ""), outputs=[chatbot, msg_input])

        # Verificar estado no arranque
        demo.load(status_api, outputs=estado_api)

    return demo


if __name__ == "__main__":
    interface = construir_interface()
    interface.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True,
    )
