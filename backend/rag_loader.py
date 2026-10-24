"""Automated RAG Ingestion Pipeline with PDF Downloading.
Reads Nifty 100 transcript links CSV, fetches PDFs from BSE/company IR URLs,
extracts text, chunks it, and loads embeddings into ChromaDB.
"""

import os
import sys
import io
import requests
import pandas as pd
from typing import List

# Import pypdf for reading PDF streams
try:
    from pypdf import PdfReader
except ImportError:
    from PyPDF2 import PdfReader

# Ensure backend and project root are in path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    from backend.rag_engine import LocalRAGEngine
except ImportError:
    from rag_engine import LocalRAGEngine


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split large text into overlapping chunks for precise vector search."""
    if not isinstance(text, str) or not text.strip():
        return []
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks


def extract_text_from_pdf_url(url: str) -> str:
    """Download a PDF from a URL in-memory and extract its text content."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        # Read PDF binary directly from memory
        pdf_file = io.BytesIO(response.content)
        reader = PdfReader(pdf_file)
        
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
                
        return "\n".join(extracted_text)
    except Exception as e:
        print(f"  ⚠️ Warning: Could not download/extract PDF from {url}. Error: {e}")
        return ""


def ingest_transcripts_from_links(csv_path: str):
    """Read CSV containing Symbol and Transcript_Link, process PDFs, and save into ChromaDB."""
    print(f"\n📂 Reading transcript links from: {csv_path}")
    
    if not os.path.exists(csv_path):
        print(f"❌ Error: Could not find CSV at {csv_path}. Please place your file there.")
        return

    df = pd.read_csv(csv_path)
    print(f"📊 Found {len(df)} stock links in CSV.")

    # Initialize RAG Engine / ChromaDB
    rag_engine = LocalRAGEngine()
    
    total_chunks_ingested = 0
    headers_symbol_col = "Symbol" if "Symbol" in df.columns else "symbol"
    headers_link_col = "Transcript_Link" if "Transcript_Link" in df.columns else "transcript_link"

    for idx, row in df.iterrows():
        symbol = str(row.get(headers_symbol_col, "UNKNOWN")).upper().strip()
        link = str(row.get(headers_link_col, "")).strip()

        if not link or not link.startswith("http"):
            continue

        print(f"\n[{idx+1}/{len(df)}] Fetching PDF transcript for: {symbol}...")
        transcript_text = extract_text_from_pdf_url(link)

        if not transcript_text or len(transcript_text.strip()) < 100:
            print(f"  ⚠️ Skipping {symbol}: No readable text found in PDF.")
            continue

        # Chunk extracted text
        chunks = chunk_text(transcript_text, chunk_size=400, overlap=50)
        
        for i, chunk in enumerate(chunks):
            metadata = {
                "symbol": symbol,
                "chunk_id": i,
                "source": "official_earnings_transcript_pdf",
                "source_url": link
            }
            rag_engine.add_document(text=chunk, metadata=metadata)
            total_chunks_ingested += 1

        print(f"  ✅ Successfully ingested {len(chunks)} text chunks for {symbol}.")

    print(f"\n🎉 RAG Ingestion Complete! Successfully indexed {total_chunks_ingested} real transcript chunks into ChromaDB.")


if __name__ == "__main__":
    # Point to nifty100_transcripts.csv in project root or data/
    default_csv = os.path.join(PROJECT_ROOT, "nifty100_transcripts.csv")
    if not os.path.exists(default_csv):
        default_csv = os.path.join(PROJECT_ROOT, "data", "nifty100_transcripts.csv")
        
    ingest_transcripts_from_links(default_csv)