"""
Application configuration loaded from environment variables.
Uses pydantic-settings so values can come from .env or the shell.
"""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str = ""
    openai_model:   str = "gpt-4o-mini"       # cheap + fast for enterprise Q&A

    # ChromaDB
    chroma_path:    str = "./chroma_db"        # persisted on disk
    chroma_collection: str = "enterprise_docs"

    # Chunking
    chunk_size:     int = 500
    chunk_overlap:  int = 50

    # RAG retrieval
    top_k:          int = 5

    # Service
    host:           str = "0.0.0.0"
    port:           int = 8000
    log_level:      str = "info"

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:5174"

    class Config:
        env_file = ".env"
        extra    = "ignore"


settings = Settings()
