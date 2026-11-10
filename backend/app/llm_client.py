"""
OpenAI LLM client for RAG-based answer generation.
Falls back to a template message when no API key is configured.
"""
import logging
from typing import List

from config import settings

log = logging.getLogger(__name__)

# System prompt — instructs the model to stay grounded in the provided context
SYSTEM_PROMPT = """You are an expert Enterprise AI Assistant for a corporate knowledge base.

RULES:
1. Answer ONLY using the context provided below.
2. If the context does not contain enough information, say:
   "I could not find a definitive answer in the company knowledge base.
    Please consult your HR/IT/Finance team directly."
3. Be concise, professional, and factual.
4. Format key information with bullet points where helpful.
5. Never invent policies, numbers, or procedures not in the context.
"""


def generate_answer(question: str, context_chunks: List[str]) -> str:
    """
    Generate a grounded answer from retrieved context chunks.

    Args:
        question:       The user's natural-language question.
        context_chunks: List of relevant text chunks from the vector store.

    Returns:
        The LLM-generated answer string.
    """
    if not settings.openai_api_key:
        log.warning("No OPENAI_API_KEY — returning fallback answer")
        return _fallback_answer(question, context_chunks)

    context_text = "\n\n---\n\n".join(context_chunks) if context_chunks else "No relevant documents found."

    user_message = (
        f"Context from company knowledge base:\n\n{context_text}\n\n"
        f"Question: {question}\n\n"
        f"Answer:"
    )

    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.openai_api_key)

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system",  "content": SYSTEM_PROMPT},
                {"role": "user",    "content": user_message},
            ],
            temperature=0.2,       # low temperature for factual enterprise answers
            max_tokens=800,
        )

        answer = response.choices[0].message.content.strip()
        log.info("LLM answered question (len=%d chars)", len(answer))
        return answer

    except Exception as e:
        log.error("LLM generation failed: %s", e)
        return _fallback_answer(question, context_chunks)


def _fallback_answer(question: str, context_chunks: List[str]) -> str:
    """Return a helpful fallback when the LLM is unavailable."""
    if context_chunks:
        preview = context_chunks[0][:300]
        return (
            f"Based on the company knowledge base, here is the most relevant information:\n\n"
            f"{preview}...\n\n"
            f"(Full AI responses require a configured OPENAI_API_KEY.)"
        )
    return (
        "I could not find relevant information in the knowledge base for your question. "
        "Please check the Knowledge Base section or contact the relevant department."
    )
