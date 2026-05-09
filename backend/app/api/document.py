from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.document_service import process_document
from app.models.document import Document
from app.models.state import UserState
from app.services.notification_service import create_notification_event
from app.services.state_service import update_user_state

router = APIRouter()
REQUIRED_DOCUMENT_TYPES = ["Identity Proof", "Address Proof", "Photograph"]

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

    create_notification_event(
        db,
        user_id=user_id,
        event_key=f"document-upload-{result['document_id']}",
        type="document",
        title="Document Uploaded",
        message=f"{result['document_name']} uploaded for verification.",
        action_text="View Verification",
        target_path="/verification",
        icon="upload_file",
        color="purple",
        is_urgent=False,
    )

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

@router.post("/verify/{user_id}")
def verify_documents(user_id: int, db: Session = Depends(get_db)):
    user_state = db.query(UserState).filter(UserState.user_id == user_id).first()
    current_state = user_state.state if user_state else "NEW_USER"

    if current_state == "VERIFICATION_CHECKED":
        return {
            "status": "success",
            "data": {
                "verified_document_count": 3,
                "state": current_state,
            },
        }

    if current_state != "ELIGIBILITY_CHECKED":
        raise HTTPException(
            status_code=400,
            detail="Eligibility must be checked before document verification.",
        )

    documents = (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )
    if not documents:
        raise HTTPException(status_code=400, detail="No documents uploaded yet.")

    latest_by_type = {}
    for doc in documents:
        if doc.document_type not in latest_by_type:
            latest_by_type[doc.document_type] = doc

    missing_types = [doc_type for doc_type in REQUIRED_DOCUMENT_TYPES if doc_type not in latest_by_type]
    if missing_types:
        raise HTTPException(status_code=400, detail=f"Missing required documents: {', '.join(missing_types)}.")

    documents_to_verify = [latest_by_type[doc_type] for doc_type in REQUIRED_DOCUMENT_TYPES]
    invalid_documents = []
    for doc in documents_to_verify:
        if not doc.file_name or not doc.mime_type or not doc.file_size:
            invalid_documents.append(doc.document_name or doc.document_type)

    if invalid_documents:
        raise HTTPException(
            status_code=400,
            detail=f"These documents are incomplete: {', '.join(invalid_documents)}.",
        )

    for doc in documents_to_verify:
        doc.is_valid = True

    db.commit()

    new_state = update_user_state(db, user_id, "VERIFICATION_CHECKED")
    create_notification_event(
        db,
        user_id=user_id,
        event_key="verification-documents-approved",
        type="document",
        title="All Documents Verified",
        message="All three required documents verified successfully. Civic status moved to verification checked.",
        action_text="View Home",
        target_path="/",
        icon="fact_check",
        color="green",
        is_urgent=False,
        replace_existing=True,
    )

    return {
        "status": "success",
        "data": {
            "verified_document_count": len(documents_to_verify),
            "state": new_state,
        },
    }
