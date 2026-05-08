from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.document_service import process_document
from app.models.document import Document

router = APIRouter()

@router.post("/upload")
async def upload_document(
    user_id: int = Form(...),
    document_name: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    content = await file.read()
    try:
        result = await process_document(
            content,
            file.filename,
            file.content_type,
            user_id,
            document_name,
            document_type,
            db,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"status": "success", "data": result}

@router.get("/list/{user_id}")
def list_documents(user_id: int, db: Session = Depends(get_db)):
    docs = (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )
    return {"status": "success", "data": docs}

@router.get("/detail/{document_id}")
def get_document_detail(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return {"status": "success", "data": doc}
