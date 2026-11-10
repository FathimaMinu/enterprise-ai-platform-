"""
Enterprise AI Platform — Python AI Microservice
FastAPI server exposing RAG query and document indexing endpoints.

Start:  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""
import logging
import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config       import settings
from rag_pipeline import RagPipeline

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
log = logging.getLogger(__name__)

# ── Application lifecycle ─────────────────────────────────────────────────────
pipeline: Optional[RagPipeline] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline
    log.info("Initialising RAG pipeline…")
    pipeline = RagPipeline()
    log.info("RAG pipeline ready. Indexed chunks: %d", pipeline.collection_size())
    yield
    log.info("AI service shutting down.")


# ── FastAPI app ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Enterprise AI Platform — AI Service",
    version="1.0.0",
    description="RAG-based document Q&A microservice",
    lifespan=lifespan,
)

# CORS — allow calls from Spring Boot backend and React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ──────────────────────────────────────────────────
class QueryRequest(BaseModel):
    question:    str = Field(..., min_length=1, max_length=4000,
                            description="User's natural-language question")
    document_id: Optional[str] = Field(None, description="Limit search to one document")
    top_k:       int = Field(5, ge=1, le=20)


class QueryResponse(BaseModel):
    answer:  str
    sources: list


class IndexRequest(BaseModel):
    document_id: str = Field(..., description="UUID of the document")
    file_path:   Optional[str] = Field(None, description="Absolute path on the server")
    text:        Optional[str] = Field(None, description="Pre-extracted text (alternative to file_path)")


class IndexResponse(BaseModel):
    document_id:    str
    chunks_indexed: int
    status:         str


class DeleteRequest(BaseModel):
    document_id: str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health", summary="Health check")
def health():
    return {
        "status":        "healthy",
        "service":       "Enterprise AI Platform — AI Service",
        "indexed_chunks": pipeline.collection_size() if pipeline else 0,
        "openai_key_set": bool(settings.openai_api_key),
    }


@app.get("/", include_in_schema=False)
def root():
    return {"message": "Enterprise AI Platform — AI Service is running. See /docs"}


@app.post("/api/ai/query", response_model=QueryResponse, summary="Answer a question via RAG")
def query_knowledge_base(request: QueryRequest):
    """
    Retrieve relevant document chunks and generate a grounded answer.
    Requires at least one document to be indexed.
    """
    if pipeline is None:
        raise HTTPException(503, "AI pipeline not initialised")
    try:
        result = pipeline.query(
            question=request.question,
            top_k=request.top_k,
            document_id=request.document_id,
        )
        return QueryResponse(answer=result["answer"], sources=result["sources"])
    except Exception as e:
        log.error("Query failed: %s", e, exc_info=True)
        raise HTTPException(500, f"Query failed: {str(e)}")


@app.post("/api/ai/index", response_model=IndexResponse, summary="Index a document")
def index_document(request: IndexRequest, background_tasks: BackgroundTasks):
    """
    Parse and index a document into ChromaDB.
    Provide either `file_path` (server-side path) or `text` (pre-extracted).
    """
    if pipeline is None:
        raise HTTPException(503, "AI pipeline not initialised")
    if not request.file_path and not request.text:
        raise HTTPException(400, "Provide either file_path or text")

    try:
        result = pipeline.index_document(
            document_id=request.document_id,
            file_path=request.file_path or "",
            text=request.text,
        )
        return IndexResponse(
            document_id=result["document_id"],
            chunks_indexed=result["chunks_indexed"],
            status="indexed" if result["chunks_indexed"] > 0 else "empty",
        )
    except Exception as e:
        log.error("Indexing failed for %s: %s", request.document_id, e, exc_info=True)
        raise HTTPException(500, f"Indexing failed: {str(e)}")


@app.delete("/api/ai/document", summary="Remove a document from the index")
def delete_document(request: DeleteRequest):
    """Delete all indexed chunks for a specific document."""
    if pipeline is None:
        raise HTTPException(503, "AI pipeline not initialised")
    try:
        pipeline.delete_document(request.document_id)
        return {"message": f"Document {request.document_id} removed from index"}
    except Exception as e:
        log.error("Delete failed for %s: %s", request.document_id, e)
        raise HTTPException(500, f"Delete failed: {str(e)}")


@app.get("/api/ai/stats", summary="Index statistics")
def stats():
    """Return number of chunks currently indexed."""
    if pipeline is None:
        raise HTTPException(503, "AI pipeline not initialised")
    return {"indexed_chunks": pipeline.collection_size()}
