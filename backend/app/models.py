from pydantic import BaseModel
from typing import Optional

class AnalysisRequest(BaseModel):
    text: str
    question: Optional[str] = None

class ChatRequest(BaseModel):
    prompt: str
    
class TimelineRequest(BaseModel):
    text: str