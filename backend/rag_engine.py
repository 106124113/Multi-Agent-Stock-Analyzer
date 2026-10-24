"""Local RAG Engine using ChromaDB and Sentence Transformers."""

import os
import chromadb
from sentence_transformers import SentenceTransformer


class LocalRAGEngine:
    def __init__(self, db_path: str = "./chroma_db"):
        self.db_path = os.path.abspath(db_path)
        os.makedirs(self.db_path, exist_ok=True)
        
        # Initialize persistent ChromaDB client
        self.client = chromadb.PersistentClient(path=self.db_path)
        self.collection = self.client.get_or_create_collection(name="equity_transcripts")
        
        # Load lightweight embedding model
        print("🤖 Loading embedding model (all-MiniLM-L6-v2)...")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def add_document(self, text: str, metadata: dict):
        """Embed and add a document chunk into ChromaDB."""
        embedding = self.model.encode(text).tolist()
        symbol = metadata.get("symbol", "EQUITY")
        chunk_id = metadata.get("chunk_id", 0)
        
        # Unique doc ID for ChromaDB
        doc_id = f"{symbol}_{chunk_id}_{abs(hash(text))}"
        
        self.collection.upsert(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata]
        )

    def query(self, query_text: str, symbol: str = None, ticker: str = None, n_results: int = 3) -> list:
        """Query ChromaDB for relevant text chunks, supporting both symbol and ticker parameters."""
        try:
            # Use ticker if symbol is not provided
            target_symbol = symbol if symbol else ticker
            query_embedding = self.model.encode(query_text).tolist()
            
            where_filter = None
            if target_symbol:
                clean_sym = str(target_symbol).split('-')[0].strip().upper()
                where_filter = {"symbol": clean_sym}
            
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where_filter
            )
            
            documents = results.get("documents", [[]])[0]
            return documents if documents else []
        except Exception as e:
            print(f"⚠️ RAG Query Error: {e}")
            return []

    def query_docs(self, query_text: str, symbol: str = None, ticker: str = None, n_results: int = 3) -> list:
        """Alias method expected by analysts.py, supporting ticker keyword arguments."""
        return self.query(query_text=query_text, symbol=symbol, ticker=ticker, n_results=n_results)