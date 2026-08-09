from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import orchestrator
from lib.embeddings import get_model
from analyzers.ml_scorer import _load as load_ml


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_model()  # sentence-transformers
    load_ml()      # ML scorer
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
    submissionId: str = ""


@app.post("/evaluate")
async def evaluate(payload: EvaluateRequest):
    result = await orchestrator.evaluate(payload.text, payload.rubric, payload.submissionId)
    return result
