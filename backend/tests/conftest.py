"""Shared test fixtures."""

import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

import app.config as config
config._force_mock = True  # Tests always use mock mode

from app.main import app
from app.persistence import database


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Test client with a fresh in-memory database per test."""
    # Override to in-memory DB
    database.DATABASE_PATH = ":memory:"
    database._db = None

    # Re-init
    import aiosqlite
    database._db = await aiosqlite.connect(":memory:")
    database._db.row_factory = aiosqlite.Row
    await database._db.execute("PRAGMA foreign_keys=ON")
    await database._db.executescript(database.SCHEMA_SQL)
    await database._db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    await database.close_db()
