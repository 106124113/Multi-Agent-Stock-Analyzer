import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rag_engine import LocalRAGEngine

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python backend/ingest_cli.py <TICKER> <FILE_PATH> <DOC_TYPE>")
        sys.exit(1)
        
    ticker = sys.argv[1].upper()
    file_path = sys.argv[2]
    doc_type = sys.argv[3] # e.g., 'concall' or 'annual_report'
    
    rag = LocalRAGEngine()
    rag.ingest_file(ticker=ticker, file_path=file_path, doc_type=doc_type)