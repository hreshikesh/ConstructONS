"""Financial Ledger & Payments."""
import uuid
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from db import db
from auth import require_admin
from project_schemas import PaymentLogBody
from project_utils import _log_activity, _push_notification

router = APIRouter(prefix="/api", tags=["payments"])

@router.post("/admin/projects/{project_id}/payments", dependencies=[Depends(require_admin)])
async def add_payment_log(project_id: str, body: PaymentLogBody):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    await db.projects.update_one({"id": project_id, "$or": [{"payments_log": {"$exists": False}}, {"payments_log": None}]}, {"$set": {"payments_log": []}})
    now = datetime.now(timezone.utc).isoformat()
    payment_entry = {"id": f"pay_{uuid.uuid4().hex[:10]}", "amount": body.amount, "date": body.date, "method": body.method, "reference": body.reference, "notes": body.notes, "logged_at": now, "logged_by": "Admin"}
    await db.projects.update_one({"id": project_id}, {"$push": {"payments_log": {"$each": [payment_entry], "$sort": {"date": -1}}}, "$inc": {"amount_spent": body.amount}, "$set": {"updated_at": now}})
    formatted_amt = f"₹{body.amount:,.0f}"
    await _log_activity(project_id, "Accounts", f"Payment logged: {formatted_amt} via {body.method}", "Payments")
    asyncio.create_task(_push_notification(project_id, "Payment Received", f"We have successfully received your payment of {formatted_amt}.", "/portal/payments", "payments"))
    return {"success": True, "payment": payment_entry}

@router.delete("/admin/projects/{project_id}/payments/{payment_id}", dependencies=[Depends(require_admin)])
async def delete_payment_log(project_id: str, payment_id: str):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0, "payments_log": 1})
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    payments = p.get("payments_log") or []
    target = next((m for m in payments if m["id"] == payment_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Payment log not found")
    await db.projects.update_one({"id": project_id}, {"$pull": {"payments_log": {"id": payment_id}}, "$inc": {"amount_spent": -target["amount"]}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})
    formatted_amt = f"₹{target['amount']:,.0f}"
    await _log_activity(project_id, "Accounts", f"Payment record reversed: {formatted_amt}", "Payments")
    return {"success": True}