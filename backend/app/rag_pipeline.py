"""
RAG (Retrieval-Augmented Generation) pipeline.

index_document  — chunk → embed → store in ChromaDB
query           — embed question → retrieve → generate answer
"""
import logging
from typing import List, Dict, Any, Optional

from config          import settings
from embeddings      import chunk_text, get_embeddings
from vector_store    import add_documents, search, delete_document, collection_count
from llm_client      import generate_answer
from document_parser import parse_file

log = logging.getLogger(__name__)


class RagPipeline:
    """
    Encapsulates the full RAG flow.

    Usage:
        pipeline = RagPipeline()
        pipeline.index_document(document_id, file_path)
        result   = pipeline.query("What is the vacation policy?")
    """

    # ----------------------------------------------------------------
    # Indexing
    # ----------------------------------------------------------------

    def index_document(self,
                       document_id: str,
                       file_path:   str,
                       text:        Optional[str] = None) -> Dict[str, Any]:
        """
        Parse a file (or accept pre-extracted text), chunk it,
        embed each chunk, and store in ChromaDB.

        Returns:
            { "document_id": str, "chunks_indexed": int }
        """
        log.info("Indexing document %s from %s", document_id, file_path or "provided text")

        # 1. Extract text
        if text is None:
            text = parse_file(file_path)

        if not text.strip():
            log.warning("Document %s produced empty text — skipping", document_id)
            return {"document_id": document_id, "chunks_indexed": 0}

        # 2. Chunk
        chunks = chunk_text(text, settings.chunk_size, settings.chunk_overlap)
        log.info("Document %s split into %d chunks", document_id, len(chunks))

        # 3. Embed
        embeddings = get_embeddings(chunks)

        # 4. Store
        stored = add_documents(document_id, chunks, embeddings)

        return {"document_id": document_id, "chunks_indexed": stored}

    # ----------------------------------------------------------------
    # Querying
    # ----------------------------------------------------------------

    def query(self,
              question:    str,
              top_k:       int = None,
              document_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Answer a question by retrieving relevant chunks and generating
        a grounded response.

        Returns:
            {
              "answer":  str,
              "sources": [ { "document_id": str, "chunk_index": int, "preview": str } ]
            }
        """
        top_k = top_k or settings.top_k
        log.info("RAG query: '%s' (top_k=%d)", question[:80], top_k)

        # 1. Embed the question
        question_embedding = get_embeddings([question])[0]

        # 2. Retrieve
        hits = search(question_embedding, top_k=top_k, document_id=document_id)

        context_chunks = [h["text"] for h in hits]
        sources = [
            {
                "document_id":  h["document_id"],
                "chunk_index":  h["chunk_index"],
                "preview":      h["text"][:120] + "…" if len(h["text"]) > 120 else h["text"],
                "distance":     round(h["distance"], 4),
            }
            for h in hits
        ]

        # 3. Generate answer
        answer = generate_answer(question, context_chunks)

        return {"answer": answer, "sources": sources}

    # ----------------------------------------------------------------
    # Management
    # ----------------------------------------------------------------

    def delete_document(self, document_id: str) -> None:
        """Remove all indexed chunks for a document."""
        delete_document(document_id)
        log.info("Removed index for document %s", document_id)

    def collection_size(self) -> int:
        """Return total indexed chunk count."""
        return collection_count()
