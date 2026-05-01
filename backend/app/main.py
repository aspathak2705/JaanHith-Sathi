from fastapi import FastAPI
from app.api.user import router as user_router
from app.api.election import router as election_router
from app.core.database import Base, engine
from app.models import user, state
from app.api.chat import router as chat_router

app = FastAPI(title="CivicGuide AI Backend")

app.include_router(chat_router)

Base.metadata.create_all(bind=engine)

# Routers
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(election_router, prefix="/election", tags=["Election"])

@app.get("/")
def root():
    return {"message": "CivicGuide AI Backend Running"}