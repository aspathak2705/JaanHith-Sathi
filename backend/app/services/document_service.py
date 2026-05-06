import io
from sqlalchemy.orm import Session
from app.models.document import Document

try:
    import easyocr
    reader = easyocr.Reader(['en'])
except ImportError:
    reader = None

async def process_document(file_content: bytes, filename: str, db: Session):
    extracted_text = ""
    if reader:
        # Perform OCR
        # This is a basic implementation. Might need image processing.
        try:
            result = reader.readtext(file_content, detail=0)
            extracted_text = " ".join(result)
        except Exception as e:
            extracted_text = f"Error processing document: {str(e)}"
    else:
        extracted_text = "EasyOCR not installed. Document OCR skipped."

    # Dummy validation logic
    is_valid = "id" in extracted_text.lower() or "name" in extracted_text.lower()

    # Save to db
    doc = Document(
        user_id=1, # Dummy user ID
        document_type="Unknown", # Determine from text or user input
        extracted_text=extracted_text,
        is_valid=is_valid
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    return {"document_id": doc.id, "extracted_text": extracted_text, "is_valid": is_valid}
