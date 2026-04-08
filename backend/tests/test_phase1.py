"""Phase 1 tests — API endpoints and basic flows."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_create_analysis(client: AsyncClient):
    resp = await client.post("/api/analyses", json={
        "companyName": "Stripe",
        "marketSpace": "AI-Powered Expense Management",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "id" in data
    assert "operationId" in data
    assert data["id"].startswith("ana_")
    assert data["operationId"].startswith("op_")


@pytest.mark.asyncio
async def test_create_analysis_with_context(client: AsyncClient):
    resp = await client.post("/api/analyses", json={
        "companyName": "Stripe",
        "marketSpace": "AI-Powered Expense Management",
        "companyContext": "Stripe is a global payments company.",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"].startswith("ana_")


@pytest.mark.asyncio
async def test_get_analysis_result(client: AsyncClient):
    # Create
    create_resp = await client.post("/api/analyses", json={
        "companyName": "Acme Corp",
        "marketSpace": "Cloud Security",
    })
    analysis_id = create_resp.json()["id"]

    # Get result
    resp = await client.get(f"/api/analyses/{analysis_id}")
    assert resp.status_code == 200
    data = resp.json()

    # Verify top-level shape
    assert data["id"] == analysis_id
    assert data["status"] == "completed"
    assert data["request"]["companyName"] == "Acme Corp"
    assert data["request"]["marketSpace"] == "Cloud Security"
    assert data["createdAt"] is not None
    assert data["completedAt"] is not None

    # Verify steps
    assert len(data["steps"]) == 4
    step_names = [s["step"] for s in data["steps"]]
    assert step_names == ["incumbents", "emerging_competitors", "market_sizing", "synthesis"]
    for step in data["steps"]:
        assert step["status"] == "completed"

    # Verify research results exist
    assert data["incumbents"] is not None
    assert len(data["incumbents"]["players"]) > 0
    assert data["emergingCompetitors"] is not None
    assert len(data["emergingCompetitors"]["competitors"]) > 0
    assert data["marketSizing"] is not None
    assert data["marketSizing"]["tam"] is not None
    assert data["opportunityAssessment"] is not None
    assert data["opportunityAssessment"]["recommendation"] in ("go", "no-go", "maybe")


@pytest.mark.asyncio
async def test_get_analysis_status(client: AsyncClient):
    create_resp = await client.post("/api/analyses", json={
        "companyName": "TestCo",
        "marketSpace": "DevTools",
    })
    analysis_id = create_resp.json()["id"]

    resp = await client.get(f"/api/analyses/{analysis_id}/status")
    assert resp.status_code == 200
    data = resp.json()

    assert data["id"] == analysis_id
    assert data["status"] == "completed"
    assert len(data["steps"]) == 4
    for step in data["steps"]:
        assert step["status"] == "completed"
        assert step["startedAt"] is not None
        assert step["completedAt"] is not None


@pytest.mark.asyncio
async def test_get_operation(client: AsyncClient):
    create_resp = await client.post("/api/analyses", json={
        "companyName": "TestCo",
        "marketSpace": "DevTools",
    })
    operation_id = create_resp.json()["operationId"]

    resp = await client.get(f"/api/operations/{operation_id}")
    assert resp.status_code == 200
    data = resp.json()

    assert data["id"] == operation_id
    assert data["operationType"] == "analysis"
    assert data["status"] == "completed"
    assert data["completedAt"] is not None

    # Progress should show all steps done
    assert data["progress"]["stepsCompleted"] == 4
    assert data["progress"]["stepsTotal"] == 4


@pytest.mark.asyncio
async def test_analysis_not_found(client: AsyncClient):
    resp = await client.get("/api/analyses/nonexistent")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_analysis_status_not_found(client: AsyncClient):
    resp = await client.get("/api/analyses/nonexistent/status")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_operation_not_found(client: AsyncClient):
    resp = await client.get("/api/operations/nonexistent")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_result_contains_company_name(client: AsyncClient):
    """The mock result should reference the actual company/market from the request."""
    resp = await client.post("/api/analyses", json={
        "companyName": "Notion",
        "marketSpace": "AI Knowledge Management",
    })
    analysis_id = resp.json()["id"]

    result = (await client.get(f"/api/analyses/{analysis_id}")).json()

    # The opportunity assessment should mention the company name
    assert "Notion" in result["opportunityAssessment"]["headline"]
    assert "AI Knowledge Management" in result["opportunityAssessment"]["headline"]


@pytest.mark.asyncio
async def test_camel_case_response_keys(client: AsyncClient):
    """Verify API responses use camelCase keys."""
    resp = await client.post("/api/analyses", json={
        "companyName": "Test",
        "marketSpace": "Test Market",
    })
    data = resp.json()
    assert "operationId" in data  # not operation_id

    analysis_id = data["id"]
    result = (await client.get(f"/api/analyses/{analysis_id}")).json()
    assert "createdAt" in result  # not created_at
    assert "opportunityAssessment" in result  # not opportunity_assessment
    assert "marketSizing" in result  # not market_sizing
    assert "emergingCompetitors" in result  # not emerging_competitors

    # Nested camelCase
    assert "marketConcentration" in result["incumbents"]
    assert "totalFundingInSpace" in result["emergingCompetitors"]
    assert "growthDrivers" in result["marketSizing"]
    assert "reasonsToBelieve" in result["opportunityAssessment"]
