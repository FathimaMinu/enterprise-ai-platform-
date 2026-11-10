"""
Text chunking and OpenAI embedding utilities.
"""
import logging
from typing import List

from config import settings

log = logging.getLogger(__name__)


def chunk_text(text: str,
               chunk_size: int  = None,
               overlap:    int  = None) -> List[str]:
    """
    Split text into overlapping chunks of approximately chunk_size words.

    Args:
        text:       Full document text.
        chunk_size: Target words per chunk  (default: settings.chunk_size).
        overlap:    Words shared between consecutive chunks
                    (default: settings.chunk_overlap).

    Returns:
        List of text chunks.
    """
    chunk_size = chunk_size or settings.chunk_size
    overlap    = overlap    or settings.chunk_overlap

    words  = text.split()
    chunks = []
    start  = 0

    while start < len(words):
        end   = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk.strip())
        start = end - overlap          # slide window with overlap
        if start >= len(words):
            break

    log.debug("Chunked text into %d chunks (size=%d, overlap=%d)",
              len(chunks), chunk_size, overlap)
    return [c for c in chunks if c]


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for a list of texts using OpenAI.

    Returns:
        List of embedding vectors (each is a list of floats).
    """
    if not settings.openai_api_key:
        # Return zero vectors for local dev without an API key
        log.warning("No OPENAI_API_KEY set — returning zero embeddings")
        return [[0.0] * 1536 for _ in texts]

    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=texts,
        )
        vectors = [item.embedding for item in response.data]
        log.debug("Generated %d embeddings", len(vectors))
        return vectors
    except Exception as e:
        log.error("Embedding generation failed: %s", e)
        raise
