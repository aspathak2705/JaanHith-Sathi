from pathlib import Path

from sqlalchemy.orm import Session
from app.models.document import Document

try:
    import easyocr
    reader = easyocr.Reader(['en'])
except ImportError:
    reader = None

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}


async def process_document(
    file_content: bytes,
    filename: str,
    content_type: str,
    user_id: int,
    document_name: str,
    document_type: str,
    db: Session,
):
    extension = Path(filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported document format. Please upload PDF, PNG, JPG, JPEG, or WEBP files.")

    extracted_text = ""
    if reader:
        try:
            result = reader.readtext(file_content, detail=0)
            extracted_text = " ".join(result)
        except Exception as exc:
            extracted_text = f"Document stored successfully. OCR unavailable for this file: {str(exc)}"
    else:
        extracted_text = "Document stored successfully. OCR is not enabled in this environment."

    lowered_text = extracted_text.lower()
    is_valid = bool(lowered_text and ("id" in lowered_text or "name" in lowered_text or "address" in lowered_text))

    doc = Document(
        user_id=user_id,
        document_name=document_name,
        document_type=document_type or document_name,
        file_name=filename,
        mime_type=content_type,
        file_size=len(file_content),
        extracted_text=extracted_text,
        is_valid=is_valid,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    return {
        "document_id": doc.id,
        "document_name": doc.document_name,
        "document_type": doc.document_type,
        "file_name": doc.file_name,
        "mime_type": doc.mime_type,
        "file_size": doc.file_size,
        "uploaded_at": doc.uploaded_at,
        "extracted_text": extracted_text,
        "is_valid": is_valid,
    }
