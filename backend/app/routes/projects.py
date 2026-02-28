from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_projects():
    """Placeholder for future project/workspace grouping."""
    return []
