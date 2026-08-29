from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import cases

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fara'id AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
