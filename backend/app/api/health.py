from fastapi import APIRouter
from app.database import db_manager
from app.models import GraphSummary

router = APIRouter(tags=["Health & Status"])


@router.get("/health")
def get_health():
    """Returns database connectivity and operational status."""
    return db_manager.check_health()


@router.get("/graph/summary", response_model=GraphSummary)
def get_graph_summary():
    """Returns live graph node and relationship counts with measured latency."""
    return db_manager.check_health()


@router.post("/demo/reset")
def reset_demo():
    """Restores the graph and alerts to the pristine initial synthetic baseline."""
    return db_manager.reset_demo()
