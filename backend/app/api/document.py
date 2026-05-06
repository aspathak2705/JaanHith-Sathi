from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.document_service import process_document

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Read file content
    content = await file.read()
    # Process document
    result = await process_document(content, file.filename, db)
    return {"status": "success", "data": result}

@router.get("/list/{user_id}")
def list_documents(user_id: int, db: Session = Depends(get_db)):
    from app.models.document import Document
    docs = db.query(Document).filter(Document.user_id == user_id).all()
    return {"status": "success", "data": docs}
