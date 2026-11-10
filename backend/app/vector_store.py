"""
ChromaDB vector store wrapper.
Provides add, search, and delete operations against a persistent collection.
"""
import logging
from typing import List, Dict, Any, Optional

from config import settings

log = logging.getLogger(__name__)

# Module-level singleton — initialised on first use
_client     = None
_collection = None


def _get_collection():
    """Lazy-initialise ChromaDB client and collection."""
    global _client, _collection
    if _collection is not None:
        return _collection

    try:
        import chromadb
        from chromadb.config import Settings as ChromaSettings

        _client = chromadb.PersistentClient(
            path=settings.chroma_path,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        _collection = _client.get_or_create_collection(
            name=settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )
        log.info("ChromaDB collection '%s' ready at %s",
                 settings.chroma_collection, settings.chroma_path)
        return _collection

    except ImportError:
        raise RuntimeError("chromadb is not installed. Run: pip install chromadb")
    except Exception as e:
        log.error("ChromaDB initialisation failed: %s", e)
        raise


def add_documents(
        document_id: str,
        chunks:      List[str],
        embeddings:  List[List[float]],
) -> int:
    """
    Store text chunks + embeddings for a document.

    Returns:
        Number of chunks stored.
    """
    col = _get_collection()

    ids       = [f"{document_id}_{i}" for i in range(len(chunks))]
    metadatas = [{"document_id": document_id, "chunk_index": i}
                 for i in range(len(chunks))]

    col.upsert(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    log.info("Stored %d chunks for document %s", len(chunks), document_id)
    return len(chunks)


def search(
        query_embedding: List[float],
        top_k:           int = None,
        document_id:     Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Semantic search over stored chunks.

    Args:
        query_embedding: Vector from get_embeddings([question])[0].
        top_k:           Number of results to return.
        document_id:     Optional filter to search within one document only.

    Returns:
        List of dicts with keys: text, document_id, chunk_index, distance.
    """
    col   = _get_collection()
    top_k = top_k or settings.top_k

    where = {"document_id": document_id} if document_id else None

    results = col.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, max(col.count(), 1)),
        where=where,
        include=["documents", "metadatas", "distances"],
    )

    hits = []
    for i, doc in enumerate(results["documents"][0]):
        hits.append({
            "text":        doc,
            "document_id": results["metadatas"][0][i].get("document_id"),
            "chunk_index": results["metadatas"][0][i].get("chunk_index"),
            "distance":    results["distances"][0][i],
        })

    log.debug("Search returned %d results", len(hits))
    return hits


def delete_document(document_id: str) -> None:
    """Remove all chunks belonging to a document."""
    col = _get_collection()
    col.delete(where={"document_id": document_id})
    log.info("Deleted all chunks for document %s", document_id)


def collection_count() -> int:
    """Return total number of stored chunks."""
    return _get_collection().count()
