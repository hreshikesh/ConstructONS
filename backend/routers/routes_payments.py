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

# --- SCHEMAS (add to existing) ---
class InvoiceUpdateBody(BaseModel):
    number: Optional[str] = None
    description: Optional[str] = None
    stage: Optional[str] = None
    date: Optional[str] = None
    due_date: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    document_url: Optional[str] = None

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

# --- VARIATIONS CRUD & PORTAL APPROVALS ---

@router.post("/admin/projects/{project_id}/variations", dependencies=[Depends(require_admin)])
async def create_variation(project_id: str, body: VariationBody):
    p = await db.projects.find_one({"id": project_id}, {"id": 1})
    if not p:
        raise HTTPException(404, "Project not found")

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
        "approved_at": now if body.status == "approved" else None,
        "invoice_id": None,        # NEW: track if invoice raised
        "receipt_logged": False     # NEW: track if receipt logged
    }

    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"variations": {"$each": [var_entry], "$position": 0}}, "$set": {"updated_at": now}}
    )

    status_text = "Pre-Approved" if body.status == "approved" else "Awaiting Client Approval"
    await _log_activity(project_id, "Accounts", f"Added Variation: {body.description} (₹{body.amount:,.0f}) [{status_text}]", "Payments")

    if body.status == "pending":
        asyncio.create_task(_push_notification(
            project_id,
            "New Scope Change / Variation Request",
            f"A new variation request of ₹{body.amount:,.0f} requires your review & approval.",
            "/portal/payments",
            "payments"
        ))

    return {"success": True, "variation": var_entry}


# --- Update variation after invoice is raised from it ---
@router.patch("/admin/projects/{project_id}/variations/{variation_id}/link-invoice", dependencies=[Depends(require_admin)])
async def link_variation_to_invoice(project_id: str, variation_id: str, body: Dict[str, str]):
    invoice_id = body.get("invoice_id")
    p = await db.projects.find_one({"id": project_id}, {"variations": 1})
    if not p:
        raise HTTPException(404, "Project not found")

    variations = p.get("variations") or []
    idx = next((i for i, v in enumerate(variations) if v["id"] == variation_id), -1)
    if idx < 0:
        raise HTTPException(404, "Variation not found")

    now = datetime.now(timezone.utc).isoformat()
    variations[idx]["invoice_id"] = invoice_id
    variations[idx]["updated_at"] = now

    await db.projects.update_one({"id": project_id}, {"$set": {"variations": variations, "updated_at": now}})
    return {"success": True}


# --- Mark variation receipt logged ---
@router.patch("/admin/projects/{project_id}/variations/{variation_id}/mark-receipt", dependencies=[Depends(require_admin)])
async def mark_variation_receipt(project_id: str, variation_id: str):
    p = await db.projects.find_one({"id": project_id}, {"variations": 1})
    if not p:
        raise HTTPException(404, "Project not found")

    variations = p.get("variations") or []
    idx = next((i for i, v in enumerate(variations) if v["id"] == variation_id), -1)
    if idx < 0:
        raise HTTPException(404, "Variation not found")

    variations[idx]["receipt_logged"] = True
    await db.projects.update_one({"id": project_id}, {"$set": {"variations": variations}})
    return {"success": True}


# --- CLIENT PORTAL ACTION: APPROVE/DECLINE VARIATION ---
@router.patch("/portal/my-project/{project_id}/variations/{variation_id}/status")
async def client_update_variation_status(project_id: str, variation_id: str, body: Dict[str, str]):
    status = body.get("status")
    if status not in ["approved", "rejected"]:
        raise HTTPException(400, "Invalid status. Must be 'approved' or 'rejected'")
    
    p = await db.projects.find_one({"id": project_id}, {"variations": 1, "customer_name": 1, "title": 1, "project_code": 1})
    if not p: raise HTTPException(404, "Project not found")
    
    variations = p.get("variations") or []
    idx = next((i for i, v in enumerate(variations) if v["id"] == variation_id), -1)
    if idx < 0: raise HTTPException(404, "Variation request not found")
    
    now = datetime.now(timezone.utc).isoformat()
    variations[idx]["status"] = status
    variations[idx]["client_action_at"] = now
    if status == "approved":
        variations[idx]["approved_at"] = now
    else:
        variations[idx]["approved_at"] = None
        variations[idx]["rejected_at"] = now
        
    await db.projects.update_one({"id": project_id}, {"$set": {"variations": variations, "updated_at": now}})
    
    action_str = "APPROVED ✅" if status == "approved" else "DECLINED ❌"
    amount_val = variations[idx].get("amount", 0)
    desc = variations[idx].get("description", "")
    client_name = p.get("customer_name", "Client")
    project_title = p.get("title", "Project")
    
    # Log global activity
    await _log_activity(
        project_id, 
        "Client", 
        f"Client {action_str} Variation: {desc} (₹{amount_val:,.0f})", 
        "Payments"
    )
    
    # 🔔 FIX: Push notification to ADMIN system (not client)
    try:
        admin_notification = {
            "id": f"notif_{uuid.uuid4().hex[:12]}",
            "title": f"Variation {action_str} by Client",
            "message": f"{client_name} has {status} the variation '{desc}' worth ₹{amount_val:,.0f} on project '{project_title}'.",
            "type": "variation_response",
            "severity": "success" if status == "approved" else "warning",
            "project_id": project_id,
            "project_code": p.get("project_code"),
            "link": f"/admin/projects/{project_id}?tab=finance",
            "read": False,
            "created_at": now
        }
        
        # Insert into admin notifications collection
        await db.admin_notifications.insert_one(admin_notification)
        
        # Also push to client's log for their record
        asyncio.create_task(_push_notification(
            project_id, 
            f"Variation {action_str}", 
            f"You have {status} the variation request for '{desc}' (₹{amount_val:,.0f}).", 
            "/portal/payments", 
            "payments"
        ))
    except Exception as e:
        import logging
        logging.error(f"[Notification Error] {e}")
    
    return {"success": True, "variation": variations[idx]}

@router.patch("/admin/projects/{project_id}/variations/{variation_id}/status", dependencies=[Depends(require_admin)])
async def update_variation_status(project_id: str, variation_id: str, status: str):
    """Admin overrides variation status"""
    p = await db.projects.find_one({"id": project_id}, {"variations": 1})
    if not p: raise HTTPException(404, "Project not found")
    
    variations = p.get("variations") or []
    idx = next((i for i, v in enumerate(variations) if v["id"] == variation_id), -1)
    if idx < 0: raise HTTPException(404, "Variation not found")

    now = datetime.now(timezone.utc).isoformat()
    old_status = variations[idx]["status"]
    variations[idx]["status"] = status
    if status == "approved":
        variations[idx]["approved_at"] = now
    else:
        variations[idx]["approved_at"] = None

    await db.projects.update_one({"id": project_id}, {"$set": {"variations": variations, "updated_at": now}})
    await _log_activity(project_id, "Accounts", f"Admin changed variation status from '{old_status}' to '{status}': {variations[idx]['description']}", "Payments")
    
    return {"success": True, "variation": variations[idx]}


@router.delete("/admin/projects/{project_id}/variations/{variation_id}", dependencies=[Depends(require_admin)])
async def delete_variation(project_id: str, variation_id: str):
    """Admin deletes variation entry"""
    p = await db.projects.find_one({"id": project_id}, {"id": 1})
    if not p: raise HTTPException(404, "Project not found")
    
    await db.projects.update_one(
        {"id": project_id}, 
        {"$pull": {"variations": {"id": variation_id}}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    await _log_activity(project_id, "Accounts", "Deleted variation item entry", "Payments")
    return {"success": True}
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
@router.put("/admin/projects/{project_id}/invoices/{invoice_id}", dependencies=[Depends(require_admin)])
async def update_invoice(project_id: str, invoice_id: str, body: InvoiceUpdateBody):
    p = await db.projects.find_one(
        {"id": project_id}, 
        {"id": 1, "invoices": 1, "customer_name": 1, "customer_email": 1, "title": 1, "project_code": 1}
    )
    if not p:
        raise HTTPException(404, "Project not found")
    
    invoices = p.get("invoices") or []
    idx = next((i for i, inv in enumerate(invoices) if inv["id"] == invoice_id), -1)
    if idx < 0:
        raise HTTPException(404, "Invoice not found")
    
    now = datetime.now(timezone.utc).isoformat()
    old_invoice = invoices[idx].copy()
    
    # Build change log for notification
    changes = []
    update_data = body.dict(exclude_unset=True)
    
    for field, new_val in update_data.items():
        if new_val is not None:
            old_val = old_invoice.get(field)
            if str(old_val) != str(new_val):
                if field == "amount":
                    changes.append(f"Amount: ₹{float(old_val or 0):,.0f} → ₹{float(new_val):,.0f}")
                elif field == "due_date":
                    changes.append(f"Due Date: {old_val or '—'} → {new_val}")
                elif field == "description":
                    changes.append(f"Description updated")
                elif field == "status":
                    changes.append(f"Status: {old_val} → {new_val}")
                else:
                    changes.append(f"{field} updated")
            invoices[idx][field] = new_val
    
    invoices[idx]["updated_at"] = now
    
    # Track edit history
    if "edit_history" not in invoices[idx]:
        invoices[idx]["edit_history"] = []
    invoices[idx]["edit_history"].append({
        "edited_at": now,
        "edited_by": "Admin",
        "changes": changes
    })
    
    await db.projects.update_one(
        {"id": project_id}, 
        {"$set": {"invoices": invoices, "updated_at": now}}
    )
    
    # Log activity
    change_summary = ", ".join(changes) if changes else "Minor edits"
    await _log_activity(
        project_id, "Accounts", 
        f"Edited Invoice #{invoices[idx]['number']}: {change_summary}", 
        "Payments"
    )
    
    # Push notification to client
    if changes:
        asyncio.create_task(_push_notification(
            project_id,
            f"Invoice Updated: #{invoices[idx]['number']}",
            f"Your invoice #{invoices[idx]['number']} has been updated. Changes: {change_summary}",
            "/portal/payments",
            "payments"
        ))
        
        # Send email notification to client
        asyncio.create_task(_send_invoice_edit_email(
            project=p,
            invoice=invoices[idx],
            changes=changes
        ))
    
    return {"success": True, "invoice": invoices[idx], "changes": changes}


async def _send_invoice_edit_email(project: dict, invoice: dict, changes: list):
    """Send email to client when an invoice is edited."""
    try:
        from email_utils import send_email  # Your existing email utility
        
        customer_email = project.get("customer_email")
        if not customer_email:
            return
        
        customer_name = project.get("customer_name", "Client")
        project_title = project.get("title", "Your Project")
        inv_number = invoice.get("number", "N/A")
        inv_amount = float(invoice.get("amount", 0))
        inv_due = invoice.get("due_date", "—")
        change_list = "\n".join([f"  • {c}" for c in changes])
        
        subject = f"Invoice #{inv_number} Updated — {project_title}"
        
        html_body = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #000F1B; padding: 24px; border-radius: 12px 12px 0 0;">
                <h2 style="color: #FF5A00; margin: 0; font-size: 20px;">Invoice Updated</h2>
                <p style="color: #ccc; margin: 8px 0 0; font-size: 13px;">{project_title}</p>
            </div>
            <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #333; font-size: 14px;">Dear {customer_name},</p>
                <p style="color: #555; font-size: 13px;">
                    Invoice <strong>#{inv_number}</strong> has been updated by the project team. 
                    Please review the changes below:
                </p>
                
                <div style="background: #FFF7ED; border: 1px solid #FDBA74; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="font-size: 12px; font-weight: bold; color: #9A3412; margin: 0 0 8px; text-transform: uppercase;">Changes Made:</p>
                    <ul style="margin: 0; padding: 0 0 0 16px; color: #333; font-size: 13px;">
                        {''.join([f'<li style="margin: 4px 0;">{c}</li>' for c in changes])}
                    </ul>
                </div>
                
                <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <table style="width: 100%; font-size: 13px; color: #333;">
                        <tr>
                            <td style="padding: 4px 0; color: #888;">Invoice Number</td>
                            <td style="padding: 4px 0; font-weight: bold; text-align: right;">{inv_number}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #888;">Current Amount</td>
                            <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #FF5A00;">₹{inv_amount:,.0f}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #888;">Due Date</td>
                            <td style="padding: 4px 0; font-weight: bold; text-align: right;">{inv_due}</td>
                        </tr>
                    </table>
                </div>
                
                <p style="color: #555; font-size: 12px; margin-top: 16px;">
                    You can view the updated invoice and download the PDF from your client portal.
                </p>
                
                <a href="#" style="display: inline-block; background: #FF5A00; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold; margin-top: 12px;">
                    View in Portal →
                </a>
            </div>
            <div style="background: #F9FAFB; padding: 16px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #999; font-size: 11px; margin: 0; text-align: center;">
                    This is an automated notification from your project management portal.
                </p>
            </div>
        </div>
        """
        
        await send_email(
            to_email=customer_email,
            subject=subject,
            html_content=html_body
        )
    except Exception as e:
        import logging
        logging.error(f"[Invoice Edit Email Error] {e}", exc_info=True)