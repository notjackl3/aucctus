"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analyses, companies, documents, internal, operations, reports, workspace
from app.config import API_PREFIX, CORS_ORIGINS
from app.persistence.database import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Aucctus — Competitive Landscape Research",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyses.router, prefix=API_PREFIX)
app.include_router(operations.router, prefix=API_PREFIX)
app.include_router(companies.router, prefix=API_PREFIX)
app.include_router(workspace.router, prefix=API_PREFIX)
app.include_router(reports.router, prefix=API_PREFIX)
app.include_router(documents.router, prefix=API_PREFIX)
app.include_router(internal.router)  # no API_PREFIX — served at /_internal


@app.get("/health")
async def health():
    return {"status": "ok"}
