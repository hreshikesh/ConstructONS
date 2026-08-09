"""Custom Quote PDF — branded to match the ConstructONS brochure style.

Sections:
  1. Cover (navy + orange accent + client card)
  2. Project brief (client + site + requirements)
  3. Pricing breakdown (base + addons + interiors + line items + 15% service charge, NO GST)
  4. Material specifications (with per-item rate + notes)
  5. Interior fit-out sheet (with per-item rate)
  6. Scope of work + Exclusions
  7. Payment schedule
  8. Floor plans (one per page with CAD-style title block)
  9. Elevations (same format)
 10. Visual boards (image galleries)
 11. Terms & signature
"""
from io import BytesIO
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
import logging

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image,
)

logger = logging.getLogger(__name__)

# Match brochure palette
ORANGE = colors.HexColor("#FF5A00")
NAVY = colors.HexColor("#0B1220")
NAVY_SOFT = colors.HexColor("#111A2E")
GREY = colors.HexColor("#64748B")
LIGHT = colors.HexColor("#F1F5F9")
LINE = colors.HexColor("#E2E8F0")
WHITE = colors.white
GREEN = colors.HexColor("#22C55E")
RED = colors.HexColor("#EF4444")


def _styles():
    ss = getSampleStyleSheet()
    return {
        "h1": ParagraphStyle("h1", parent=ss["Heading1"], fontName="Helvetica-Bold",
                             fontSize=24, leading=28, textColor=NAVY, spaceAfter=8),
        "h2": ParagraphStyle("h2", parent=ss["Heading2"], fontName="Helvetica-Bold",
                             fontSize=15, leading=19, textColor=NAVY, spaceBefore=10, spaceAfter=6),
        "h3": ParagraphStyle("h3", parent=ss["Heading3"], fontName="Helvetica-Bold",
                             fontSize=11, leading=15, textColor=ORANGE, spaceBefore=6, spaceAfter=3),
        "body": ParagraphStyle("body", parent=ss["BodyText"], fontName="Helvetica",
                               fontSize=10, leading=14, textColor=NAVY, alignment=TA_JUSTIFY),
        "small": ParagraphStyle("small", parent=ss["BodyText"], fontName="Helvetica",
                                fontSize=8.5, leading=12, textColor=GREY),
        "eyebrow": ParagraphStyle("eyebrow", parent=ss["BodyText"], fontName="Helvetica-Bold",
                                  fontSize=8, textColor=ORANGE, spaceAfter=2),
        "cover_title": ParagraphStyle("cover_title", parent=ss["Heading1"], fontName="Helvetica-Bold",
                                      fontSize=38, leading=42, textColor=WHITE),
        "cover_sub": ParagraphStyle("cover_sub", parent=ss["BodyText"], fontName="Helvetica",
                                    fontSize=12, textColor=colors.HexColor("#C4C9D3"), leading=18),
    }


def _rupees(n) -> str:
    try:
        v = float(n or 0)
        return f"\u20b9{v:,.0f}"
    except Exception:
        return "\u20b90"


def _draw_logo(c, x, y, size=20):
    r = size / 2
    c.setFillColor(ORANGE)
    c.circle(x + r, y + r, r, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", size * 0.75)
    tw = c.stringWidth("C", "Helvetica-Bold", size * 0.75)
    c.drawString(x + (size - tw) / 2, y + size * 0.22, "C")


def _header_footer(ref: str, doc_kind: str = "CUSTOM QUOTATION"):
    def draw(canvas_obj, doc):
        canvas_obj.saveState()
        W, H = A4
        # Header line + logo
        canvas_obj.setStrokeColor(LINE)
        canvas_obj.setLineWidth(0.5)
        canvas_obj.line(15 * mm, H - 15 * mm, W - 15 * mm, H - 15 * mm)
        _draw_logo(canvas_obj, 15 * mm, H - 12 * mm, size=10)
        canvas_obj.setFillColor(NAVY)
        canvas_obj.setFont("Helvetica-Bold", 9)
        canvas_obj.drawString(28 * mm, H - 9 * mm, "ConstructONS")
        canvas_obj.setFillColor(GREY)
        canvas_obj.setFont("Helvetica", 7)
        canvas_obj.drawString(28 * mm, H - 12.5 * mm, "EVERYTHING CONSTRUCTION. ALWAYS ON.")
        canvas_obj.setFont("Helvetica", 8)
        canvas_obj.setFillColor(GREY)
        canvas_obj.drawRightString(W - 15 * mm, H - 10 * mm, f"{doc_kind} · {ref}")

        # Footer
        canvas_obj.setStrokeColor(LINE)
        canvas_obj.line(15 * mm, 15 * mm, W - 15 * mm, 15 * mm)
        canvas_obj.setFont("Helvetica", 7.5)
        canvas_obj.setFillColor(GREY)
        canvas_obj.drawString(15 * mm, 10 * mm,
                              "\u00a9 ConstructONS Pvt. Ltd. \u2014 Confidential quotation. Not a legal contract.")
        canvas_obj.drawRightString(W - 15 * mm, 10 * mm, f"Page {canvas_obj.getPageNumber()}")
        canvas_obj.restoreState()
    return draw


def _cover_page(client_name: str, doc_ref: str):
    def draw(canvas_obj, doc):
        W, H = A4
        canvas_obj.setFillColor(NAVY)
        canvas_obj.rect(0, 0, W, H, fill=1, stroke=0)
        # Top orange accent
        canvas_obj.setFillColor(ORANGE)
        canvas_obj.rect(0, H - 8, W, 8, fill=1, stroke=0)
        # Logo
        _draw_logo(canvas_obj, 20 * mm, H - 40 * mm, size=18)
        canvas_obj.setFillColor(WHITE)
        canvas_obj.setFont("Helvetica-Bold", 14)
        canvas_obj.drawString(43 * mm, H - 32 * mm, "ConstructONS")
        canvas_obj.setFillColor(colors.HexColor("#98A2B3"))
        canvas_obj.setFont("Helvetica", 8)
        canvas_obj.drawString(43 * mm, H - 37 * mm, "EVERYTHING CONSTRUCTION. ALWAYS ON.")
        canvas_obj.setFillColor(colors.HexColor("#98A2B3"))
        canvas_obj.setFont("Helvetica-Bold", 9)
        canvas_obj.drawRightString(W - 20 * mm, H - 32 * mm, "CUSTOM QUOTATION")
    return draw


def _kv_table(rows: List[List[str]], col1=55, col2=110):
    tbl = Table(rows, colWidths=[col1 * mm, col2 * mm])
    tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONT", (0, 0), (0, -1), "Helvetica-Bold", 9),
        ("FONT", (1, 0), (1, -1), "Helvetica", 10),
        ("TEXTCOLOR", (0, 0), (0, -1), GREY),
        ("TEXTCOLOR", (1, 0), (1, -1), NAVY),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
    ]))
    return tbl


def _compute_pricing(quote: dict) -> dict:
    area = float(quote.get("built_up_area") or 0)
    rate = float(quote.get("price_per_sqft") or 0)
    base = area * rate

    addons = quote.get("addons") or []
    addon_total = sum(float(a.get("price") or 0) for a in addons)

    line_items = quote.get("line_items") or []
    line_total = sum(float(l.get("amount") or 0) for l in line_items)

    interiors_total = 0.0
    for cat in (quote.get("interiors") or []):
        for it in (cat.get("items") or []):
            if it.get("include_in_total"):
                try:
                    qty = float(it.get("quantity") or 1)
                except Exception:
                    qty = 1.0
                interiors_total += float(it.get("rate") or 0) * qty

    subtotal = base + addon_total + line_total + interiors_total
    discount = float(quote.get("discount_amount") or 0)
    net = max(0.0, subtotal - discount)
    svc_pct = float(quote.get("service_charge_percent") if quote.get("service_charge_percent") is not None else 15)
    svc_amt = net * svc_pct / 100
    grand = net + svc_amt
    return {
        "base": base, "addon_total": addon_total, "line_total": line_total,
        "interiors_total": interiors_total, "subtotal": subtotal, "discount": discount,
        "net": net, "svc_pct": svc_pct, "svc_amt": svc_amt, "grand": grand,
    }


def _fetch_image_flowable(url_or_path: str, max_w_mm: float, max_h_mm: float) -> Optional[Image]:
    """Turn a stored image path or /api/media/... URL into a ReportLab Image."""
    if not url_or_path:
        return None
    path = url_or_path
    if path.startswith("/api/media/"):
        path = path[len("/api/media/"):]
    elif path.startswith("http"):
        # External URLs we skip — we only trust our object store
        return None
    try:
        from media_service import get_object
        data, _ct = get_object(path)
        buf = BytesIO(data)
        img = Image(buf)
        # Scale down maintaining aspect
        iw, ih = img.imageWidth, img.imageHeight
        max_w = max_w_mm * mm
        max_h = max_h_mm * mm
        if iw <= 0 or ih <= 0:
            return None
        scale = min(max_w / iw, max_h / ih, 1.0)
        img.drawWidth = iw * scale
        img.drawHeight = ih * scale
        return img
    except Exception as e:
        logger.warning(f"[pdf] failed to fetch image {path}: {e}")
        return None


def generate_custom_quote_pdf(quote: Dict[str, Any], settings: Dict[str, Any]) -> bytes:
    buf = BytesIO()
    styles = _styles()
    ref = quote.get("ref_number") or "CUSTOM"
    client = quote.get("client_name") or "Valued Customer"
    company = settings.get("company_name") or "ConstructONS"
    today = datetime.now(timezone.utc)
    valid_until = today + timedelta(days=int(quote.get("valid_days") or 30))

    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=22 * mm, bottomMargin=20 * mm,
        title=f"{ref} \u2014 {client}",
    )
    story: List[Any] = []

    # ---------- 1. Cover ----------
    story.append(Spacer(1, 42 * mm))
    story.append(Paragraph("PREPARED FOR", styles["eyebrow"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(client.upper(), styles["cover_title"]))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        quote.get("package_name") or "Your bespoke home, engineered and priced honestly.",
        styles["cover_sub"],
    ))
    story.append(Spacer(1, 20 * mm))

    # Preparation card
    prep_rows = [
        ["QUOTE REFERENCE", ref],
        ["DATE", today.strftime("%d %b %Y").upper()],
        ["VALID UNTIL", valid_until.strftime("%d %b %Y").upper()],
        ["PREPARED BY", (quote.get("prepared_by") or company).upper()],
    ]
    prep_table = Table(prep_rows, colWidths=[45 * mm, 95 * mm], hAlign="LEFT")
    prep_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (0, -1), 7.5),
        ("TEXTCOLOR", (0, 0), (0, -1), ORANGE),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (1, 0), (1, -1), 10),
        ("TEXTCOLOR", (1, 0), (1, -1), WHITE),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("BACKGROUND", (0, 0), (-1, -1), NAVY_SOFT),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, colors.HexColor("#2A3441")),
        ("BOX", (0, 0), (-1, -1), 1.4, ORANGE),
    ]))
    story.append(prep_table)
    story.append(PageBreak())

    # ---------- 2. Project Brief ----------
    story.append(Paragraph("Project Brief", styles["h1"]))
    if quote.get("intro_note"):
        # intro_note may be rich HTML — feed as-is to Paragraph (limited HTML support)
        story.append(Paragraph(quote["intro_note"], styles["body"]))
        story.append(Spacer(1, 8))

    story.append(Paragraph("Client Details", styles["h2"]))
    story.append(_kv_table([
        ["Name", client],
        ["Phone", quote.get("client_phone") or "\u2014"],
        ["Email", quote.get("client_email") or "\u2014"],
        ["Client Address", quote.get("client_address") or "\u2014"],
    ]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Site & Requirements", styles["h2"]))
    plot = quote.get("plot_area")
    built = quote.get("built_up_area") or 0
    story.append(_kv_table([
        ["Site Address", quote.get("site_address") or "\u2014"],
        ["Plot Area", f"{float(plot):,.0f} sq.ft" if plot else "\u2014"],
        ["Built-up Area", f"{float(built):,.0f} sq.ft"],
        ["Floors", quote.get("floors") or "\u2014"],
        ["Configuration", quote.get("bhk") or "\u2014"],
        ["Style Preference", quote.get("style_pref") or "\u2014"],
        ["Client Budget", _rupees(quote.get("budget")) if quote.get("budget") else "\u2014"],
        ["Expected Start", quote.get("expected_start") or "\u2014"],
        ["Expected Completion", quote.get("expected_completion") or "\u2014"],
    ]))
    story.append(PageBreak())

    # ---------- 3. Pricing ----------
    p = _compute_pricing(quote)
    story.append(Paragraph("Pricing Breakdown", styles["h1"]))
    story.append(Paragraph(
        "Transparent line-item pricing. A flat 15% contractor service charge is applied "
        "on the net total. No GST is levied by ConstructONS on this quotation.",
        styles["small"],
    ))
    story.append(Spacer(1, 8))

    rows = [["Item", "Detail", "Amount"]]
    pkg_label = quote.get("package_name") or "Custom Base Build"
    area = float(built or 0)
    rate = float(quote.get("price_per_sqft") or 0)
    if p["base"] > 0:
        rows.append([pkg_label, f"{area:,.0f} sq.ft x {_rupees(rate)}", _rupees(p["base"])])
    if p["addon_total"] > 0:
        rows.append(["Add-ons (Total)", f"{len(quote.get('addons') or [])} items", _rupees(p["addon_total"])])
    if p["interiors_total"] > 0:
        rows.append(["Interior Fit-out", "See interiors sheet", _rupees(p["interiors_total"])])
    if p["line_total"] > 0:
        rows.append(["Custom Line Items", f"{len(quote.get('line_items') or [])} items", _rupees(p["line_total"])])
    rows.append(["Subtotal", "", _rupees(p["subtotal"])])
    if p["discount"] > 0:
        rows.append([quote.get("discount_label") or "Discount", "", f"\u2212 {_rupees(p['discount'])}"])
        rows.append(["Net", "", _rupees(p["net"])])
    rows.append([f"Contractor Service Charge @ {p['svc_pct']:g}%", "", _rupees(p["svc_amt"])])
    rows.append(["Grand Total", "", _rupees(p["grand"])])

    tbl = Table(rows, colWidths=[70 * mm, 60 * mm, 40 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 10),
        ("FONT", (0, 1), (-1, -1), "Helvetica", 10),
        ("BACKGROUND", (0, -1), (-1, -1), ORANGE),
        ("TEXTCOLOR", (0, -1), (-1, -1), WHITE),
        ("FONT", (0, -1), (-1, -1), "Helvetica-Bold", 11),
        ("ALIGN", (2, 0), (2, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.3, LINE),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 8))
    if quote.get("budget"):
        try:
            b = float(quote.get("budget"))
            delta = p["grand"] - b
            if abs(delta) < 1:
                story.append(Paragraph(f"Client budget {_rupees(b)} \u2014 matches this quote.", styles["small"]))
            else:
                sign = "over" if delta > 0 else "under"
                story.append(Paragraph(
                    f"Client budget {_rupees(b)} \u2014 quote is {_rupees(abs(delta))} {sign} budget.",
                    styles["small"],
                ))
        except Exception:
            pass
    story.append(PageBreak())

    # ---------- 4. Material Specifications ----------
    story.append(Paragraph("Material Specifications", styles["h1"]))
    story.append(Paragraph(
        "Every material, brand and grade proposed for your home \u2014 with indicative rates for full transparency.",
        styles["small"],
    ))
    story.append(Spacer(1, 6))
    for cat in (quote.get("spec_categories") or [])[:16]:
        story.append(Paragraph(cat.get("name", ""), styles["h2"]))
        cat_rows = [["Spec", "Value", "Brand", "Rate", "Warranty"]]
        for it in (cat.get("items") or []):
            rate_txt = ""
            if it.get("rate"):
                try:
                    rate_txt = f"{_rupees(it.get('rate'))} {it.get('rate_unit') or ''}".strip()
                except Exception:
                    rate_txt = ""
            cat_rows.append([
                it.get("spec", ""), it.get("value", ""),
                it.get("brand") or "\u2014",
                rate_txt or "\u2014",
                it.get("warranty") or "\u2014",
            ])
        if len(cat_rows) > 1:
            t = Table(cat_rows, colWidths=[32 * mm, 55 * mm, 32 * mm, 27 * mm, 25 * mm])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 8.5),
                ("FONT", (0, 1), (-1, -1), "Helvetica", 8.5),
                ("TEXTCOLOR", (0, 0), (-1, 0), NAVY),
                ("GRID", (0, 0), (-1, -1), 0.25, LINE),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]))
            story.append(t)
            # Notes row(s)
            for it in (cat.get("items") or []):
                if it.get("notes"):
                    story.append(Paragraph(
                        f"<font color='#64748B'><b>{it.get('spec','')}</b> \u2014 {it.get('notes')}</font>",
                        styles["small"],
                    ))
            story.append(Spacer(1, 6))
    story.append(PageBreak())

    # ---------- 5. Interior Fit-Out ----------
    if quote.get("interiors"):
        story.append(Paragraph("Interior Fit-Out", styles["h1"]))
        story.append(Paragraph(
            "Interior scope with brands, quantities and indicative unit rates.",
            styles["small"],
        ))
        story.append(Spacer(1, 6))
        for cat in (quote.get("interiors") or [])[:16]:
            story.append(Paragraph(cat.get("name", ""), styles["h2"]))
            cat_rows = [["Item", "Description", "Brand", "Rate", "Qty"]]
            for it in (cat.get("items") or []):
                rate_txt = _rupees(it.get("rate") or 0)
                if it.get("rate_unit"):
                    rate_txt += f" {it.get('rate_unit')}"
                cat_rows.append([
                    it.get("spec", ""), it.get("value", ""),
                    it.get("brand") or "\u2014", rate_txt,
                    str(it.get("quantity") or "\u2014"),
                ])
            if len(cat_rows) > 1:
                t = Table(cat_rows, colWidths=[34 * mm, 60 * mm, 32 * mm, 32 * mm, 15 * mm])
                t.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
                    ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 8.5),
                    ("FONT", (0, 1), (-1, -1), "Helvetica", 8.5),
                    ("GRID", (0, 0), (-1, -1), 0.25, LINE),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]))
                story.append(t)
                for it in (cat.get("items") or []):
                    if it.get("notes"):
                        story.append(Paragraph(
                            f"<font color='#64748B'><b>{it.get('spec','')}</b> \u2014 {it.get('notes')}</font>",
                            styles["small"],
                        ))
                story.append(Spacer(1, 6))
        story.append(PageBreak())

    # ---------- 6. Scope + Exclusions ----------
    story.append(Paragraph("What's Included", styles["h1"]))
    for s in (quote.get("scope_of_work") or []):
        story.append(Paragraph(f"<font color='#22C55E'>\u2713</font>  {s}", styles["body"]))
    if not (quote.get("scope_of_work") or []):
        story.append(Paragraph("Scope will be finalised at booking.", styles["small"]))
    story.append(Spacer(1, 14))
    story.append(Paragraph("Exclusions", styles["h1"]))
    for s in (quote.get("exclusions") or []):
        story.append(Paragraph(f"<font color='#EF4444'>\u2717</font>  {s}", styles["body"]))
    if not (quote.get("exclusions") or []):
        story.append(Paragraph("None.", styles["small"]))
    story.append(PageBreak())

    # ---------- 7. Payment Schedule ----------
    schedule = quote.get("payment_schedule") or []
    if schedule:
        story.append(Paragraph("Payment Schedule", styles["h1"]))
        story.append(Paragraph(
            "Milestone-based payments. Each stage requires signed customer approval before the next stage begins.",
            styles["small"],
        ))
        story.append(Spacer(1, 6))
        s_rows = [["Milestone", "%", "Description", "Est. Amount"]]
        for s in schedule:
            pct = float(s.get("percentage") or 0)
            s_rows.append([
                s.get("milestone", ""),
                f"{pct:g}%",
                s.get("description", ""),
                _rupees(p["grand"] * pct / 100),
            ])
        t = Table(s_rows, colWidths=[50 * mm, 15 * mm, 65 * mm, 35 * mm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
            ("FONT", (0, 1), (-1, -1), "Helvetica", 9),
            ("GRID", (0, 0), (-1, -1), 0.25, LINE),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("ALIGN", (3, 0), (3, -1), "RIGHT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(t)
        story.append(PageBreak())

    # ---------- 8/9. Floor Plans + Elevations (one page each with CAD title block) ----------
    def _drawing_pages(drawings: List[Dict[str, Any]], kind: str):
        for i, dr in enumerate(drawings or []):
            story.append(Paragraph(f"{kind} \u2014 Sheet {dr.get('sheet_number') or (i + 1)}", styles["h1"]))
            title = dr.get("title") or f"{kind} {i + 1}"
            story.append(Paragraph(title, styles["h3"]))
            img = _fetch_image_flowable(dr.get("image_url") or "", max_w_mm=170, max_h_mm=160)
            if img:
                story.append(img)
            else:
                story.append(Paragraph(
                    f"<i>Drawing preview unavailable. Sheet: {title}</i>", styles["small"],
                ))
            story.append(Spacer(1, 6))
            if dr.get("notes"):
                story.append(Paragraph(f"<b>Notes:</b> {dr['notes']}", styles["small"]))
                story.append(Spacer(1, 4))

            # Revisions history block (if any)
            revs = dr.get("revisions") or []
            current_rev = dr.get("current_revision") or (revs[-1].get("letter") if revs else "-")
            if revs:
                rev_rows = [["REV", "DATE", "DESCRIPTION"]]
                for r in revs[-6:]:  # last 6
                    rev_rows.append([
                        str(r.get("letter") or "")[:4],
                        str(r.get("date") or "")[:20],
                        str(r.get("note") or "")[:120],
                    ])
                rt = Table(rev_rows, colWidths=[18 * mm, 30 * mm, 122 * mm])
                rt.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
                    ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 7),
                    ("FONT", (0, 1), (-1, -1), "Helvetica", 7.5),
                    ("GRID", (0, 0), (-1, -1), 0.25, LINE),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]))
                story.append(rt)
                story.append(Spacer(1, 4))

            # CAD-style title block at bottom with current revision
            tb_rows = [[
                "PROJECT", "SHEET TITLE", "SHEET NO.", "SCALE",
            ], [
                (quote.get("package_name") or "Custom Home")[:30],
                title[:30], str(dr.get("sheet_number") or (i + 1)),
                dr.get("scale") or "1:100",
            ], [
                "CLIENT", "UNITS", "DRAWN BY", "REV / NORTH",
            ], [
                client[:30],
                dr.get("units") or "mm",
                dr.get("drawn_by") or company,
                f"{current_rev}  \u00b7  {dr.get('north_direction') or 'N'}",
            ]]
            tb = Table(tb_rows, colWidths=[45 * mm, 55 * mm, 30 * mm, 40 * mm])
            tb.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("BACKGROUND", (0, 2), (-1, 2), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("TEXTCOLOR", (0, 2), (-1, 2), WHITE),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 7),
                ("FONT", (0, 2), (-1, 2), "Helvetica-Bold", 7),
                ("FONT", (0, 1), (-1, 1), "Helvetica-Bold", 9),
                ("FONT", (0, 3), (-1, 3), "Helvetica", 9),
                ("TEXTCOLOR", (0, 1), (-1, 1), NAVY),
                ("TEXTCOLOR", (0, 3), (-1, 3), NAVY),
                ("GRID", (0, 0), (-1, -1), 0.4, NAVY),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(tb)
            story.append(PageBreak())

    _drawing_pages(quote.get("floor_plans") or [], "FLOOR PLAN")
    _drawing_pages(quote.get("elevations") or [], "ELEVATION")

    # ---------- 10. Visual Boards ----------
    for board in (quote.get("visual_boards") or []):
        story.append(Paragraph(board.get("title") or "Visual Reference", styles["h1"]))
        if board.get("description"):
            story.append(Paragraph(board["description"], styles["body"]))
            story.append(Spacer(1, 8))
        images = board.get("images") or []
        # Try to render up to 4 images in a 2-column grid
        row_pairs = []
        i = 0
        while i < len(images):
            left = _fetch_image_flowable(images[i].get("url") or "", max_w_mm=80, max_h_mm=60)
            right_flow = None
            if i + 1 < len(images):
                right_flow = _fetch_image_flowable(images[i + 1].get("url") or "", max_w_mm=80, max_h_mm=60)
            left_cell = [left, Paragraph(images[i].get("caption") or "", styles["small"])] if left else [Paragraph(images[i].get("caption") or "Image unavailable", styles["small"])]
            if right_flow:
                right_cell = [right_flow, Paragraph(images[i + 1].get("caption") or "", styles["small"])]
            elif i + 1 < len(images):
                right_cell = [Paragraph(images[i + 1].get("caption") or "Image unavailable", styles["small"])]
            else:
                right_cell = [Paragraph("", styles["small"])]
            row_pairs.append([left_cell, right_cell])
            i += 2
        if row_pairs:
            for pair in row_pairs:
                t = Table([pair], colWidths=[85 * mm, 85 * mm])
                t.setStyle(TableStyle([
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]))
                story.append(t)
        else:
            story.append(Paragraph("No images added.", styles["small"]))
        story.append(PageBreak())

    # ---------- 11. Terms & signature ----------
    story.append(Paragraph("Terms & Conditions", styles["h1"]))
    default_terms = (
        f"1. This quotation is valid for {quote.get('valid_days', 30)} days from the date of issue.<br/>"
        "2. A flat 15% contractor service charge is included in the grand total.<br/>"
        "3. Payments are milestone-based; each milestone requires signed customer approval.<br/>"
        f"4. Warranty of {quote.get('warranty_years') or 10} years on structure, waterproofing and workmanship.<br/>"
        "5. Any change in scope after booking is quoted separately as a variation order.<br/>"
        "6. Municipal approvals, land-related legal fees and utility deposits are excluded unless explicitly included.<br/>"
        "7. Rates and specifications shown are indicative and confirmed at booking. This quotation does not constitute a binding contract until a formal work order is signed."
    )
    story.append(Paragraph(quote.get("terms") or default_terms, styles["body"]))
    story.append(Spacer(1, 30))
    sign_tbl = Table([
        ["For ConstructONS", "For Client"],
        ["\n\n_________________________", "\n\n_________________________"],
        [company, client],
    ], colWidths=[80 * mm, 80 * mm])
    sign_tbl.setStyle(TableStyle([
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 10),
        ("FONT", (0, 2), (-1, 2), "Helvetica", 10),
        ("TEXTCOLOR", (0, 0), (-1, -1), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(sign_tbl)

    # Build with cover on first page, header/footer on the rest
    doc.build(
        story,
        onFirstPage=_cover_page(client, ref),
        onLaterPages=_header_footer(ref),
    )
    buf.seek(0)
    return buf.getvalue()
