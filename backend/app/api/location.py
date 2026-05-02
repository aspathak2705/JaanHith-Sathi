from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.location_service import (
    get_districts,
    get_cities,
    get_booths,
    get_nearest_booths,
)

router = APIRouter(prefix="/location", tags=["Location"])


@router.get("/districts")
def districts(db: Session = Depends(get_db)):
    return {"data": get_districts(db)}


@router.get("/cities")
def cities(district: str, db: Session = Depends(get_db)):
    return {"data": get_cities(db, district)}


@router.get("/booths")
def booths(district: str, city: str, query: str = None, db: Session = Depends(get_db)):
    return {"data": get_booths(db, district, city, query)}


@router.get("/nearest")
def nearest_booths(
    district: str,
    city: str,
    lat: float,
    lng: float,
    db: Session = Depends(get_db),
):
    return {"data": get_nearest_booths(db, district, city, lat, lng)}
