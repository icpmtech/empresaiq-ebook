---
sidebar_position: 16
title: "16. Melhorias Futuras"
description: "Próximos passos para evoluir o agente EmpresaIQ"
---

# Melhorias Futuras

O agente base está funcional. Aqui estão os próximos passos para o tornar ainda mais poderoso.

```mermaid
graph LR
    A[EmpresaIQ v1] --> B[v2: Multi-agente]
    B --> C[v3: GPU acceleration]
    C --> D[v4: Fine-tuning local]
    D --> E[v5: RAG avancado]
    E --> F[v6: Interface mobile]
    style A fill:#1D2951,color:#fff
    style F fill:#E8720C,color:#fff
```
## 1. Memória Vetorial com ChromaDB

Permita que o agente "lembre" de documentos e pesquise por similaridade semântica:

```bash
pip install chromadb sentence-transformers
```

```python title="memoria_vetorial.py"
import chromadb
from chromadb.utils import embedding_functions

# Criar base de dados vectorial local
cliente = chromadb.PersistentClient(path="./db_vetorial")

# Usar modelo de embeddings local (sem internet)
embeddings = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"  # ~80 MB, corre em CPU
)

colecao = cliente.get_or_create_collection(
    name="documentos_empresaiq",
    embedding_function=embeddings
)

# Adicionar documento
colecao.add(
    documents=["Contrato de prestação de serviços EmpresaIQ..."],
    ids=["contrato_001"],
    metadatas=[{"tipo": "contrato", "data": "2026-05-29"}]
)

# Pesquisar por similaridade
resultados = colecao.query(
    query_texts=["qual é o prazo do contrato?"],
    n_results=3
)
```

**Capacidades desbloqueadas:**
- Responder perguntas sobre documentos internos
- Pesquisa semântica em bases de conhecimento
- "Memória" persistente entre sessões

---

## 2. Interface Web Completa com FastAPI + React

```bash
pip install fastapi uvicorn
```

```python title="api.py"
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="EmpresaIQ Agent API")

class Pergunta(BaseModel):
    texto: str

@app.post("/chat")
async def chat(pergunta: Pergunta):
    resposta = agent_executor.invoke({"input": pergunta.texto})
    return {"resposta": resposta["output"]}

# Iniciar: uvicorn api:app --host 127.0.0.1 --port 8000
```

---

## 3. OCR para Analisar Documentos PDF

```bash
pip install pytesseract pillow pdf2image
# Instalar Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
```

```python
@tool
def analisar_pdf(caminho_pdf: str) -> str:
    """Extrai e analisa o texto de um ficheiro PDF."""
    import pytesseract
    from pdf2image import convert_from_path
    
    imagens = convert_from_path(caminho_pdf)
    texto_completo = ""
    
    for imagem in imagens:
        texto_completo += pytesseract.image_to_string(imagem, lang='por')
    
    return texto_completo[:3000]  # Limita ao contexto disponível
```

---

## 4. Reconhecimento de Voz com Whisper

```bash
pip install openai-whisper
```

```python
import whisper

modelo_whisper = whisper.load_model("small")  # ~244 MB

def transcrever_audio(caminho_audio: str) -> str:
    resultado = modelo_whisper.transcribe(caminho_audio, language="pt")
    return resultado["text"]

# Integrar no loop de chat
import sounddevice as sd
import numpy as np
import scipy.io.wavfile as wav

def gravar_voz(segundos=5):
    """Grava áudio do microfone."""
    audio = sd.rec(int(segundos * 16000), samplerate=16000, channels=1)
    sd.wait()
    wav.write("temp_audio.wav", 16000, audio)
    return transcrever_audio("temp_audio.wav")
```

---

## 5. Síntese de Voz com Piper TTS

[Piper](https://github.com/rhasspy/piper) é um sistema TTS local extremamente leve e com suporte a português:

```bash
pip install piper-tts
```

```python
import subprocess

def falar(texto: str):
    """Converte texto em fala usando Piper TTS."""
    subprocess.run([
        "piper",
        "--model", "pt_PT-tugao-medium.onnx",
        "--output_file", "resposta.wav"
    ], input=texto.encode(), check=True)
    
    # Reproduzir o áudio
    subprocess.run(["aplay", "resposta.wav"])  # Linux
    # subprocess.run(["start", "resposta.wav"], shell=True)  # Windows
```

---

## 6. Dashboard de Monitorização

Visualize métricas do agente com Streamlit:

```bash
pip install streamlit pandas
```

```python title="dashboard.py"
import streamlit as st
import pandas as pd
import json

st.title("EmpresaIQ — Dashboard do Agente IA")

# Carregar logs
logs = []
try:
    with open("log_agente.jsonl") as f:
        for linha in f:
            logs.append(json.loads(linha))
except FileNotFoundError:
    st.warning("Sem logs registados ainda.")

if logs:
    df = pd.DataFrame(logs)
    st.metric("Total de perguntas", len(df))
    st.dataframe(df[["timestamp", "pergunta", "resposta"]])

# Iniciar: streamlit run dashboard.py
```

---

## Roadmap Sugerido

```
Fase 1 (Semana 1-2): ✅ Agente base funcional
Fase 2 (Semana 3-4):    Memória vetorial com ChromaDB
Fase 3 (Mês 2):         Interface web FastAPI
Fase 4 (Mês 3):         OCR e análise de PDFs
Fase 5 (Mês 4):         Voz (Whisper + Piper)
Fase 6 (Mês 5-6):       Dashboard e monitorização
```