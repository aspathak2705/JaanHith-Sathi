from fastapi import FastAPI
from app.api import user, election
from app.core.database import Base, engine
from app.models import user, state


app = FastAPI(title="CivicGuide AI Backend")

Base.metadata.create_all(bind=engine)

# Routers
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(election.router, prefix="/election", tags=["Election"])

@app.get("/")
def root():
    return {"message": "CivicGuide AI Backend Running"}