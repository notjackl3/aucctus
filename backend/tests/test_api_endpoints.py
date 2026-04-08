"""Tests for Phase 2-6 API endpoints — companies, workspaces, reports, documents."""

import pytest
from httpx import AsyncClient


# ── Company endpoints ──

@pytest.mark.asyncio
async def test_create_company(client: AsyncClient):
    resp = await client.post("/api/companies", json={"name": "Ramp", "context": "Expense management"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Ramp"
    assert data["id"].startswith("cmp_")
    assert data["context"] == "Expense management"


@pytest.mark.asyncio
async def test_list_companies(client: AsyncClient):
    await client.post("/api/companies", json={"name": "Ramp"})
    await client.post("/api/companies", json={"name": "Brex"})
    resp = await client.get("/api/companies")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


@pytest.mark.asyncio
async def test_get_company(client: AsyncClient):
    create = await client.post("/api/companies", json={"name": "Ramp"})
    cid = create.json()["id"]
    resp = await client.get(f"/api/companies/{cid}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Ramp"


@pytest.mark.asyncio
async def test_get_company_not_found(client: AsyncClient):
    resp = await client.get("/api/companies/comp_nope")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_company_context(client: AsyncClient):
    create = await client.post("/api/companies", json={"name": "Ramp"})
    cid = create.json()["id"]
    resp = await client.put(f"/api/companies/{cid}/context", json={"context": "Updated context"})
    assert resp.status_code == 200
    # Verify the update persisted
    get_resp = await client.get(f"/api/companies/{cid}")
    assert get_resp.json()["context"] == "Updated context"


@pytest.mark.asyncio
async def test_update_context_not_found(client: AsyncClient):
    resp = await client.put("/api/companies/comp_nope/context", json={"context": "x"})
    assert resp.status_code == 404


# ── Strategy lens ──

@pytest.mark.asyncio
async def test_strategy_no_context(client: AsyncClient):
    create = await client.post("/api/companies", json={"name": "Ramp"})
    cid = create.json()["id"]
    resp = await client.post(f"/api/companies/{cid}/strategy")
    assert resp.status_code == 400  # no context yet


@pytest.mark.asyncio
async def test_strategy_not_found(client: AsyncClient):
    create = await client.post("/api/companies", json={"name": "Ramp"})
    cid = create.json()["id"]
    resp = await client.get(f"/api/companies/{cid}/strategy")
    assert resp.status_code == 404  # no lens built yet


# ── Document endpoints ──

@pytest.mark.asyncio
async def test_upload_document(client: AsyncClient):
    create = await client.post("/api/companies", json={"name": "Ramp"})
    cid = create.json()["id"]
    resp = await client.post(
        "/api/documents",
        data={"company_id": cid},
        files={"file": ("test.txt", b"Hello world document content", "text/plain")},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "documentId" in data
    assert "operationId" in data


@pytest.mark.asyncio
async def test_upload_document_company_not_found(client: AsyncClient):
    resp = await client.post(
        "/api/documents",
        data={"company_id": "comp_nope"},
        files={"file": ("test.txt", b"content", "text/plain")},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_documents_empty(client: AsyncClient):
    create = await client.post("/api/companies", json={"name": "Ramp"})
    cid = create.json()["id"]
    resp = await client.get(f"/api/documents/by-company/{cid}")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_documents_company_not_found(client: AsyncClient):
    resp = await client.get("/api/documents/by-company/comp_nope")
    assert resp.status_code == 404


# ── Workspace endpoints ──

@pytest.mark.asyncio
async def test_workspace_not_found(client: AsyncClient):
    resp = await client.get("/api/workspaces/ws_nope")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_workspace_by_analysis_not_found(client: AsyncClient):
    resp = await client.get("/api/workspaces/by-analysis/ana_nope")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_workspace_insights_not_found(client: AsyncClient):
    resp = await client.get("/api/workspaces/ws_nope/insights")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_workspace_questions_not_found(client: AsyncClient):
    resp = await client.get("/api/workspaces/ws_nope/questions")
    assert resp.status_code == 404


# ── Report endpoints ──

@pytest.mark.asyncio
async def test_report_not_found(client: AsyncClient):
    resp = await client.get("/api/reports/rpt_nope")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_report_by_workspace_not_found(client: AsyncClient):
    resp = await client.get("/api/reports/by-workspace/ws_nope")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_compile_report_no_workspace(client: AsyncClient):
    resp = await client.post("/api/reports", json={"reportStyle": "executive_brief"})
    assert resp.status_code == 400  # no workspace_id or analysis_id


# ── Integration: mock pipeline creates workspace with insights ──

@pytest.mark.asyncio
async def test_mock_pipeline_creates_workspace(client: AsyncClient):
    """The mock pipeline should create a workspace and seed 16 insights."""
    from app.workflows.orchestrator import run_analysis

    resp = await client.post("/api/analyses", json={
        "companyName": "Ramp", "marketSpace": "Expense Management"
    })
    assert resp.status_code == 201
    analysis_id = resp.json()["id"]
    operation_id = resp.json()["operationId"]

    # Run mock pipeline directly (BackgroundTasks don't complete in test)
    await run_analysis(analysis_id, operation_id, "Ramp", "Expense Management")

    # Workspace should exist
    ws_resp = await client.get(f"/api/workspaces/by-analysis/{analysis_id}")
    assert ws_resp.status_code == 200
    ws = ws_resp.json()
    assert ws["companyName"] == "Ramp"
    assert ws["analysisId"] == analysis_id

    # Should have stats with 16 insights
    assert ws["stats"]["totalInsights"] == 16
    assert ws["stats"]["pinnedInsights"] >= 1

    # Insights endpoint should return them
    insights_resp = await client.get(f"/api/workspaces/{ws['id']}/insights")
    assert insights_resp.status_code == 200
    insights = insights_resp.json()
    assert len(insights) == 16

    # Verify insight structure
    first = insights[0]
    assert "title" in first
    assert "body" in first
    assert "displayStatus" in first
    assert "confidence" in first


@pytest.mark.asyncio
async def test_insight_status_update(client: AsyncClient):
    """Patch an insight's display status."""
    from app.workflows.orchestrator import run_analysis

    resp = await client.post("/api/analyses", json={
        "companyName": "Ramp", "marketSpace": "Expense Management"
    })
    analysis_id = resp.json()["id"]
    operation_id = resp.json()["operationId"]
    await run_analysis(analysis_id, operation_id, "Ramp", "Expense Management")

    ws_resp = await client.get(f"/api/workspaces/by-analysis/{analysis_id}")
    ws_id = ws_resp.json()["id"]

    insights_resp = await client.get(f"/api/workspaces/{ws_id}/insights")
    insight_id = insights_resp.json()[0]["id"]

    # Update to archived
    patch_resp = await client.patch(
        f"/api/workspaces/{ws_id}/insights/{insight_id}",
        json={"displayStatus": "archived"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["displayStatus"] == "archived"


@pytest.mark.asyncio
async def test_operation_completed_after_analysis(client: AsyncClient):
    """After analysis completes, operation should be completed with full progress."""
    resp = await client.post("/api/analyses", json={
        "companyName": "Ramp", "marketSpace": "Expense Management"
    })
    operation_id = resp.json()["operationId"]

    # In test context, BackgroundTasks run inline, so operation is already complete
    op_resp = await client.get(f"/api/operations/{operation_id}")
    assert op_resp.status_code == 200
    op = op_resp.json()
    assert op["status"] == "completed"
    assert op["progress"]["stepsCompleted"] == 4
    assert op["progress"]["stepsTotal"] == 4
    assert op["completedAt"] is not None
    assert op["parentId"] is not None  # linked to analysis


@pytest.mark.asyncio
async def test_operation_fields(client: AsyncClient):
    """Operation response should have correct structure."""
    from app.persistence import repositories as repo
    op = await repo.create_operation("test_op", parent_id="parent_123", steps_total=5)

    op_resp = await client.get(f"/api/operations/{op.id}")
    assert op_resp.status_code == 200
    data = op_resp.json()
    assert data["operationType"] == "test_op"
    assert data["parentId"] == "parent_123"
    assert data["status"] == "pending"
    # progress is None until current_step is set
    assert data["progress"] is None
    assert data["errorMessage"] is None
    assert data["completedAt"] is None
