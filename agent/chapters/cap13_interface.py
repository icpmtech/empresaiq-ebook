"""Capítulo 13 — Interface de Chat (versão standalone simples).

Versão mínima do chat Gradio para demonstrar o conceito do capítulo.
Para a interface completa, use app.py na raiz do projeto.

Execute: python chapters/cap13_interface.py
Aceda em: http://localhost:7861
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import gradio as gr
from agent import conversar, criar_agente

# Agente com verbose=True para mostrar o raciocínio no terminal
executor = criar_agente(verbose=True)


def responder(mensagem: str, historico: list) -> tuple[str, list]:
    """Callback do chatbot: recebe mensagem, devolve resposta."""
    if not mensagem.strip():
        return "", historico

    resposta = conversar(executor, mensagem)
    historico.append((mensagem, resposta))
    return "", historico


# ─── Interface mínima ─────────────────────────────────────────────────────

with gr.Blocks(title="EmpresaIQ Chat") as demo:
    gr.Markdown("## 🏢 EmpresaIQ — Chat com Agente Local")

    chatbot = gr.Chatbot(height=400)
    msg = gr.Textbox(placeholder="Escreva a sua pergunta…", label="")

    with gr.Row():
        btn_enviar = gr.Button("Enviar", variant="primary")
        btn_limpar = gr.Button("Limpar")

    gr.Examples(
        examples=[
            "Pesquisa empresas de construção em Lisboa",
            "Quantas empresas têm insolvências?",
            "Qual o risco da empresa com NIF 500001234?",
            "Mostra estatísticas gerais da base de dados",
        ],
        inputs=msg,
    )

    btn_enviar.click(responder, inputs=[msg, chatbot], outputs=[msg, chatbot])
    msg.submit(responder, inputs=[msg, chatbot], outputs=[msg, chatbot])
    btn_limpar.click(lambda: ([], ""), outputs=[chatbot, msg])

if __name__ == "__main__":
    demo.launch(server_port=7861, show_error=True)
