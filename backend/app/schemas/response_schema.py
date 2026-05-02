from pydantic import BaseModel
from typing import List, Dict, Any

class MetaData(BaseModel):
    current_stage: str
    next_step: str
    recommendations: List[str] = []


class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any] = {}
    meta: MetaData | None = None