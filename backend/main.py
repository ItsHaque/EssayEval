from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import orchestrator
from lib.embeddings import get_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_model()  # pre-warm on startup
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)


class EvaluateRequest(BaseModel):
    text: str
    rubric: dict


@app.post("/evaluate")
async def evaluate(payload: EvaluateRequest):
    result = await orchestrator.evaluate(payload.text, payload.rubric)
    return result