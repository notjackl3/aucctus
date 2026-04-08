"""Operation status endpoint — unified polling."""

from fastapi import APIRouter, HTTPException

from app.api.schemas import OperationProgressResponse, OperationResponse
from app.persistence import repositories as repo

router = APIRouter(prefix="/operations", tags=["operations"])


@router.get("/{operation_id}", response_model=OperationResponse)
async def get_operation(operation_id: str):
    """Get operation status for polling."""
    op = await repo.get_operation(operation_id)
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found")

    progress = None
    if op.current_step is not None:
        progress = OperationProgressResponse(
            current_step=op.current_step,
            steps_completed=op.steps_completed,
            steps_total=op.steps_total,
            partial_data=op.partial_data,
        )

    return OperationResponse(
        id=op.id,
        operation_type=op.operation_type,
        parent_id=op.parent_id,
        status=op.status.value,
        progress=progress,
        error_message=op.error_message,
        created_at=op.created_at,
        completed_at=op.completed_at,
    )
