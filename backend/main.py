from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

from pydantic import BaseModel

class EssayPayload(BaseModel):
    essay: str
    prompt: str | None = None

@app.post("/evaluate")
async def evaluate(payload: EssayPayload):
    return {"status": "stub", "scores": {}}
