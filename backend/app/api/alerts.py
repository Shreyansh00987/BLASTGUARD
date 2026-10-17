from fastapi import APIRouter, HTTPException
from typing import List
from app.seed_data import SYNTHETIC_ALERTS
from app.models import SecurityAlert

router = APIRouter(prefix="/alerts", tags=["Security Alerts"])


@router.get("", response_model=List[SecurityAlert])
def list_alerts():
    """Lists all synthetic security alerts in queue."""
    return [SecurityAlert(**a) for a in SYNTHETIC_ALERTS]


@router.get("/{alert_id}", response_model=SecurityAlert)
def get_alert(alert_id: str):
    """Retrieves a single alert by ID."""
    alert = next((a for a in SYNTHETIC_ALERTS if a["id"].lower() == alert_id.lower()), None)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    return SecurityAlert(**alert)
