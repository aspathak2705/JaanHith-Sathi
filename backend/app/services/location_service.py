from math import asin, cos, radians, sin, sqrt
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.location_models import Booth


def _clean(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    value = value.strip()
    return value or None


def _booth_to_dict(booth: Booth, distance_km: Optional[float] = None):
    data = {
        "booth_name": booth.booth_name,
        "building": booth.building,
        "area": booth.area,
        "room": booth.room,
        "latitude": booth.latitude,
        "longitude": booth.longitude,
    }
    if distance_km is not None:
        data["distance_km"] = round(distance_km, 2)
    return data


def _distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius_km = 6371.0
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    )
    return 2 * radius_km * asin(sqrt(a))


def get_districts(db: Session):
    rows = (
        db.query(Booth.district)
        .filter(Booth.district.isnot(None), Booth.district != "")
        .distinct()
        .order_by(Booth.district.asc())
        .all()
    )
    return [row[0] for row in rows]


def get_cities(db: Session, district: str):
    rows = (
        db.query(Booth.city)
        .filter(
            Booth.district == _clean(district),
            Booth.city.isnot(None),
            Booth.city != "",
        )
        .distinct()
        .order_by(Booth.city.asc())
        .all()
    )
    return [row[0] for row in rows]


def get_booths(
    db: Session,
    district: str,
    city: str,
    query: Optional[str] = None,
    limit: int = 20,
):
    q = db.query(Booth).filter(
        Booth.district == _clean(district),
        Booth.city == _clean(city),
    )

    query = _clean(query)
    if query:
        pattern = f"%{query}%"
        q = q.filter(
            or_(
                Booth.area.ilike(pattern),
                Booth.booth_name.ilike(pattern),
            )
        )

    booths = q.order_by(Booth.booth_name.asc()).limit(limit).all()
    return [_booth_to_dict(booth) for booth in booths]


def get_nearest_booths(
    db: Session,
    district: str,
    city: str,
    lat: float,
    lng: float,
    limit: int = 10,
):
    booths = (
        db.query(Booth)
        .filter(
            Booth.district == _clean(district),
            Booth.city == _clean(city),
            Booth.latitude.isnot(None),
            Booth.longitude.isnot(None),
        )
        .all()
    )

    ranked = [
        (_distance_km(lat, lng, booth.latitude, booth.longitude), booth)
        for booth in booths
    ]
    ranked.sort(key=lambda item: item[0])

    return [
        _booth_to_dict(booth, distance_km=distance_km)
        for distance_km, booth in ranked[:limit]
    ]
