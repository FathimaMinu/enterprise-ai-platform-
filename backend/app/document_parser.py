"""
Document text extraction.
Supports PDF, DOCX, and plain-text files.
Returns the full extracted text as a string.
"""
import logging
from pathlib import Path

log = logging.getLogger(__name__)


def parse_pdf(file_path: str) -> str:
    """Extract text from a PDF file using pypdf."""
    try:
        from pypdf import PdfReader  # pypdf >= 3.x
        reader = PdfReader(file_path)
        pages  = [page.extract_text() or "" for page in reader.pages]
        text   = "\n".join(pages)
        log.info("Parsed PDF %s — %d pages, %d chars", file_path, len(pages), len(text))
        return text
    except ImportError:
        raise RuntimeError(
            "pypdf is not installed. Run: pip install pypdf"
        )
    except Exception as e:
        log.error("PDF parse error for %s: %s", file_path, e)
        raise


def parse_docx(file_path: str) -> str:
    """Extract text from a DOCX file using python-docx."""
    try:
        from docx import Document  # python-docx
        doc  = Document(file_path)
        text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        log.info("Parsed DOCX %s — %d chars", file_path, len(text))
        return text
    except ImportError:
        raise RuntimeError(
            "python-docx is not installed. Run: pip install python-docx"
        )
    except Exception as e:
        log.error("DOCX parse error for %s: %s", file_path, e)
        raise


def parse_txt(file_path: str) -> str:
    """Read a plain-text file."""
    text = Path(file_path).read_text(encoding="utf-8", errors="replace")
    log.info("Parsed TXT %s — %d chars", file_path, len(text))
    return text


def parse_file(file_path: str) -> str:
    """
    Auto-detect file type from extension and extract text.
    Raises ValueError for unsupported types.
    """
    suffix = Path(file_path).suffix.lower()
    if suffix == ".pdf":
        return parse_pdf(file_path)
    elif suffix in (".docx", ".doc"):
        return parse_docx(file_path)
    elif suffix in (".txt", ".md", ".csv"):
        return parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")
