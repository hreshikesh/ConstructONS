"""Financial Ledger, Invoices, Variations & Payment Allocations."""
import uuid
import asyncio
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response as FastAPIResponse
from pydantic import BaseModel, Field
from db import db
from auth import require_admin
from project_utils import _log_activity, _push_notification

router = APIRouter(prefix="/api", tags=["payments"])

# --- SCHEMAS ---
class InvoiceBody(BaseModel):
    number: str
    description: str
    stage: Optional[str] = "General"
    date: str
    due_date: str
    amount: float
    status: str = "upcoming"
    document_url: Optional[str] = None
    milestone_id: Optional[str] = None 

class VariationBody(BaseModel):
    description: str
    amount: float
    status: str = "approved"
    document_url: Optional[str] = None

class PaymentScheduleMilestoneBody(BaseModel):
    name: str
    due_date: Optional[str] = None
    amount: float = 0.0
    stage: Optional[str] = "General"
    status: str = "pending"
    invoice_id: Optional[str] = None

class EnhancedPaymentLogBody(BaseModel):
    amount: float
    date: str
    method: str = "Bank Transfer"
    reference: Optional[str] = ""
    notes: Optional[str] = ""
    invoice_id: Optional[str] = None

# --- INVOICES CRUD ---
@router.post("/admin/projects/{project_id}/invoices", dependencies=[Depends(require_admin)])
async def create_invoice(project_id: str, body: InvoiceBody):
    p = await db.projects.find_one({"id": project_id}, {"id": 1, "payment_schedule": 1})
    if not p: raise HTTPException(404, "Project not found")

    await db.projects.update_one(
        {"id": project_id, "$or": [{"invoices": {"$exists": False}}, {"invoices": None}]},
        {"$set": {"invoices": []}}
    )

    now = datetime.now(timezone.utc).isoformat()
    inv_entry = {
        "id": f"inv_{uuid.uuid4().hex[:10]}",
        "number": body.number.strip(),
        "description": body.description.strip(),
        "stage": body.stage or "General",
        "date": body.date,
        "due_date": body.due_date,
        "amount": body.amount,
        "paid_amount": 0.0,
        "status": body.status,
        "document_url": body.document_url,
        "created_at": now,
        "updated_at": now
    }

    update_ops = {"$push": {"invoices": {"$each": [inv_entry], "$position": 0}}, "$set": {"updated_at": now}}

    # If raised from a milestone, update the milestone status to 'invoiced'
    if body.milestone_id:
        schedule = p.get("payment_schedule") or []
        for ms in schedule:
            if ms["id"] == body.milestone_id:
                ms["status"] = "invoiced"
                ms["invoice_id"] = inv_entry["id"]
                break
        update_ops["$set"]["payment_schedule"] = schedule

    await db.projects.update_one({"id": project_id}, update_ops)
    await _log_activity(project_id, "Accounts", f"Raised Invoice #{body.number} for ₹{body.amount:,.0f}", "Payments")
    asyncio.create_task(_push_notification(project_id, f"New Invoice Raised #{body.number}", f"An invoice for '{body.description}' (₹{body.amount:,.0f}) is ready for review.", "/portal/payments", "payments"))
    return {"success": True, "invoice": inv_entry}

@router.delete("/admin/projects/{project_id}/invoices/{invoice_id}", dependencies=[Depends(require_admin)])
async def delete_invoice(project_id: str, invoice_id: str):
    p = await db.projects.find_one({"id": project_id}, {"id": 1, "invoices": 1})
    if not p: raise HTTPException(404, "Not found")
    await db.projects.update_one({"id": project_id}, {"$pull": {"invoices": {"id": invoice_id}}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"success": True}

# --- VARIATIONS CRUD ---
@router.post("/admin/projects/{project_id}/variations", dependencies=[Depends(require_admin)])
async def create_variation(project_id: str, body: VariationBody):
    p = await db.projects.find_one({"id": project_id}, {"id": 1})
    if not p: raise HTTPException(404, "Project not found")

    await db.projects.update_one(
        {"id": project_id, "$or": [{"variations": {"$exists": False}}, {"variations": None}]},
        {"$set": {"variations": []}}
    )

    now = datetime.now(timezone.utc).isoformat()
    var_entry = {
        "id": f"var_{uuid.uuid4().hex[:10]}",
        "description": body.description.strip(),
        "amount": body.amount,
        "status": body.status,
        "document_url": body.document_url,
        "created_at": now,
        "approved_at": now if body.status == "approved" else None
    }

    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"variations": {"$each": [var_entry], "$position": 0}}, "$set": {"updated_at": now}}
    )
    await _log_activity(project_id, "Accounts", f"Logged Variation: {body.description} (₹{body.amount:,.0f})", "Payments")
    return {"success": True, "variation": var_entry}

@router.patch("/admin/projects/{project_id}/variations/{variation_id}/status", dependencies=[Depends(require_admin)])
async def update_variation_status(project_id: str, variation_id: str, status: str):
    p = await db.projects.find_one({"id": project_id}, {"variations": 1})
    variations = p.get("variations") or []
    idx = next((i for i, v in enumerate(variations) if v["id"] == variation_id), -1)
    if idx < 0: raise HTTPException(404, "Variation not found")

    now = datetime.now(timezone.utc).isoformat()
    variations[idx]["status"] = status
    if status == "approved":
        variations[idx]["approved_at"] = now

    await db.projects.update_one({"id": project_id}, {"$set": {"variations": variations, "updated_at": now}})
    return {"success": True, "variation": variations[idx]}

# --- PAYMENT SCHEDULE MILESTONES ---
@router.post("/admin/projects/{project_id}/payment-schedule", dependencies=[Depends(require_admin)])
async def add_schedule_milestone(project_id: str, body: PaymentScheduleMilestoneBody):
    p = await db.projects.find_one({"id": project_id}, {"id": 1})
    if not p: raise HTTPException(404, "Project not found")

    await db.projects.update_one(
        {"id": project_id, "$or": [{"payment_schedule": {"$exists": False}}, {"payment_schedule": None}]},
        {"$set": {"payment_schedule": []}}
    )

    milestone = {
        "id": f"ms_{uuid.uuid4().hex[:10]}",
        "name": body.name.strip(),
        "due_date": body.due_date or "",
        "amount": float(body.amount or 0),
        "stage": body.stage or "General",
        "status": body.status or "pending",
        "invoice_id": body.invoice_id
    }

    await db.projects.update_one({"id": project_id}, {"$push": {"payment_schedule": milestone}})
    return {"success": True, "milestone": milestone}

@router.delete("/admin/projects/{project_id}/payment-schedule/{milestone_id}", dependencies=[Depends(require_admin)])
async def delete_schedule_milestone(project_id: str, milestone_id: str):
    p = await db.projects.find_one({"id": project_id}, {"id": 1})
    if not p: raise HTTPException(404, "Project not found")
    await db.projects.update_one({"id": project_id}, {"$pull": {"payment_schedule": {"id": milestone_id}}})
    return {"success": True}

# --- PAYMENTS & ALLOCATION ---
@router.post("/admin/projects/{project_id}/payments", dependencies=[Depends(require_admin)])
async def add_payment_log(project_id: str, body: EnhancedPaymentLogBody):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not p: raise HTTPException(404, "Project not found")
    
    await db.projects.update_one({"id": project_id, "$or": [{"payments_log": {"$exists": False}}, {"payments_log": None}]}, {"$set": {"payments_log": []}})
    now = datetime.now(timezone.utc).isoformat()
    
    payment_entry = {
        "id": f"pay_{uuid.uuid4().hex[:10]}", 
        "amount": body.amount, 
        "date": body.date, 
        "method": body.method, 
        "reference": body.reference, 
        "notes": body.notes, 
        "invoice_id": body.invoice_id,
        "logged_at": now, 
        "logged_by": "Admin"
    }

    invoices = p.get("invoices") or []
    schedule = p.get("payment_schedule") or []
    
    # If linked to an invoice, auto-update the invoice's paid_amount and status
    if body.invoice_id and invoices:
        inv_idx = next((i for i, inv in enumerate(invoices) if inv["id"] == body.invoice_id), -1)
        if inv_idx >= 0:
            current_paid = float(invoices[inv_idx].get("paid_amount") or 0.0)
            new_paid = current_paid + body.amount
            invoices[inv_idx]["paid_amount"] = new_paid
            
            if new_paid >= float(invoices[inv_idx]["amount"]):
                invoices[inv_idx]["status"] = "paid"
                # Auto-update the linked Milestone to "paid"
                for ms in schedule:
                    if ms.get("invoice_id") == body.invoice_id:
                        ms["status"] = "paid"
                        break
            else:
                invoices[inv_idx]["status"] = "partially_paid"
                
            await db.projects.update_one({"id": project_id}, {"$set": {"invoices": invoices, "payment_schedule": schedule}})

    await db.projects.update_one(
        {"id": project_id}, 
        {"$push": {"payments_log": {"$each": [payment_entry], "$sort": {"date": -1}}}, "$inc": {"amount_spent": body.amount}, "$set": {"updated_at": now}}
    )
    
    formatted_amt = f"₹{body.amount:,.0f}"
    await _log_activity(project_id, "Accounts", f"Payment logged: {formatted_amt} via {body.method}", "Payments")
    asyncio.create_task(_push_notification(project_id, "Payment Received", f"We have successfully received your payment of {formatted_amt}.", "/portal/payments", "payments"))
    return {"success": True, "payment": payment_entry}


@router.delete("/admin/projects/{project_id}/payments/{payment_id}", dependencies=[Depends(require_admin)])
async def delete_payment_log(project_id: str, payment_id: str):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0, "payments_log": 1, "invoices": 1})
    if not p: raise HTTPException(404, "Project not found")
    
    payments = p.get("payments_log") or []
    target = next((m for m in payments if m["id"] == payment_id), None)
    if not target: raise HTTPException(404, "Payment log not found")

    invoices = p.get("invoices") or []
    if target.get("invoice_id") and invoices:
        inv_idx = next((i for i, inv in enumerate(invoices) if inv["id"] == target["invoice_id"]), -1)
        if inv_idx >= 0:
            current_paid = float(invoices[inv_idx].get("paid_amount") or 0.0)
            new_paid = max(0.0, current_paid - target["amount"])
            invoices[inv_idx]["paid_amount"] = new_paid
            if new_paid <= 0:
                invoices[inv_idx]["status"] = "upcoming"
            else:
                invoices[inv_idx]["status"] = "partially_paid"
            await db.projects.update_one({"id": project_id}, {"$set": {"invoices": invoices}})

    await db.projects.update_one(
        {"id": project_id}, 
        {"$pull": {"payments_log": {"id": payment_id}}, "$inc": {"amount_spent": -target["amount"]}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

# --- PDF GENERATION ENDPOINTS ---
@router.get("/admin/projects/{project_id}/invoices/{invoice_id}/pdf", dependencies=[Depends(require_admin)])
async def download_invoice_pdf(project_id: str, invoice_id: str):
    p = await db.projects.find_one({"id": project_id}, {"id": 1, "customer_name": 1, "address": 1, "project_code": 1, "invoices": 1})
    if not p: raise HTTPException(404, "Project not found")

    invoices = p.get("invoices") or []
    idx = next((i for i, inv in enumerate(invoices) if inv["id"] == invoice_id), -1)
    if idx < 0: raise HTTPException(404, "Invoice not found")

    invoice = invoices[idx]
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    try:
        from invoice_pdf import generate_invoice_pdf
        pdf_bytes = generate_invoice_pdf(invoice, p, settings)
    except Exception as e:
        import logging
        logging.error(f"[Invoice PDF Error] {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {e}")

    filename = f"Invoice_{invoice['number']}_{p.get('project_code', 'Proj')}.pdf"
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"', "Cache-Control": "no-store"}
    )

@router.get("/portal/my-project/{project_id}/invoices/{invoice_id}/pdf")
async def client_download_invoice_pdf(project_id: str, invoice_id: str):
    p = await db.projects.find_one({"id": project_id}, {"id": 1, "customer_name": 1, "address": 1, "project_code": 1, "invoices": 1})
    if not p: raise HTTPException(404, "Project not found")

    invoices = p.get("invoices") or []
    idx = next((i for i, inv in enumerate(invoices) if inv["id"] == invoice_id), -1)
    if idx < 0: raise HTTPException(404, "Invoice not found")

    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    try:
        from invoice_pdf import generate_invoice_pdf
        pdf_bytes = generate_invoice_pdf(invoices[idx], p, settings)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate PDF")

    filename = f"Invoice_{invoices[idx]['number']}.pdf"
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'}
    )