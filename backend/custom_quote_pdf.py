"""Custom Quote PDF generator.

Produces a branded multi-page PDF for a ConstructONS custom quotation.
Shares brochure/proposal styling for visual consistency. Unlike the
standard proposal, a custom quote fully snapshots its own spec_categories,
addons, pricing and terms so it's not tied to any base package after saving.

Signature:
    generate_custom_quote_pdf(quote_dict, site_settings_dict) -> bytes
"""
from io import BytesIO
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
)
from reportlab.lib.enums import TA_LEFT

BRAND_NAVY = colors.HexColor("#0B1B32")
BRAND_ORANGE = colors.HexColor("#FF5A00")
BRAND_BG = colors.HexColor("#F5F5F0")
GREY = colors.HexColor("#666666")


def _styles():
    ss = getSampleStyleSheet()
    ss.add(ParagraphStyle(name="CQCover", parent=ss["Title"], fontSize=32, leading=38,
                          textColor=BRAND_NAVY, alignment=TA_LEFT, spaceBefore=24))
    ss.add(ParagraphStyle(name="CQCoverSub", parent=ss["Normal"], fontSize=14,
                          textColor=BRAND_ORANGE, alignment=TA_LEFT, spaceBefore=8))
    ss.add(ParagraphStyle(name="CQH1", parent=ss["Heading1"], fontSize=22, leading=28,
                          textColor=BRAND_NAVY, spaceAfter=8))
    ss.add(ParagraphStyle(name="CQH2", parent=ss["Heading2"], fontSize=15, leading=21,
                          textColor=BRAND_NAVY, spaceBefore=10, spaceAfter=6))
    ss.add(ParagraphStyle(name="CQBody", parent=ss["Normal"], fontSize=10.5, leading=15,
                          textColor=BRAND_NAVY, spaceAfter=4))
    ss.add(ParagraphStyle(name="CQSmall", parent=ss["Normal"], fontSize=9, leading=12,
                          textColor=GREY))
    ss.add(ParagraphStyle(name="CQEyebrow", parent=ss["Normal"], fontSize=9, leading=12,
                          textColor=BRAND_ORANGE, spaceAfter=2))
    return ss


def _rupees(n) -> str:
    try:
        v = float(n)
        return f"\u20b9{v:,.0f}"
    except Exception:
        return "\u20b90"


def _header_footer(company_name: str):
    def draw(canvas_obj, doc):
        canvas_obj.saveState()
        canvas_obj.setFillColor(BRAND_NAVY)
        canvas_obj.rect(0, A4[1] - 15 * mm, A4[0], 15 * mm, fill=1, stroke=0)
        canvas_obj.setFillColor(colors.white)
        canvas_obj.setFont("Helvetica-Bold", 10)
        canvas_obj.drawString(20 * mm, A4[1] - 10 * mm, company_name)
        canvas_obj.setFont("Helvetica", 8)
        canvas_obj.drawRightString(A4[0] - 20 * mm, A4[1] - 10 * mm,
                                   "CUSTOM QUOTATION \u2014 CONFIDENTIAL")
        canvas_obj.setFillColor(BRAND_NAVY)
        canvas_obj.setFont("Helvetica", 8)
        canvas_obj.drawString(20 * mm, 12 * mm,
                              f"Page {doc.page} \u00b7 Generated {datetime.now(timezone.utc).strftime('%d %b %Y')}")
        canvas_obj.drawRightString(A4[0] - 20 * mm, 12 * mm, "constructons.com")
        canvas_obj.restoreState()
    return draw


def _kv_table(rows: List[List[str]]) -> Table:
    tbl = Table(rows, colWidths=[55 * mm, 110 * mm])
    tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONT", (0, 0), (0, -1), "Helvetica-Bold", 10),
        ("FONT", (1, 0), (1, -1), "Helvetica", 10),
        ("TEXTCOLOR", (0, 0), (0, -1), GREY),
        ("TEXTCOLOR", (1, 0), (1, -1), BRAND_NAVY),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#E5E7EB")),
    ]))
    return tbl


def _bullet_list(items: List[str], styles, check=True):
    out = []
    marker = "\u2713" if check else "\u2717"
    color_hex = "#22C55E" if check else "#EF4444"
    for it in items:
        if not it:
            continue
        out.append(Paragraph(
            f'<font color="{color_hex}">{marker}</font>  {it}', styles["CQBody"]
        ))
    return out


def generate_custom_quote_pdf(quote: Dict[str, Any], settings: Dict[str, Any]) -> bytes:
    buf = BytesIO()
    styles = _styles()
    company = (settings.get("company_name") or "ConstructONS")
    ref = quote.get("ref_number") or "CUSTOM"
    client = quote.get("client_name") or "Valued Customer"
    today = datetime.now(timezone.utc)
    valid_until = today + timedelta(days=int(quote.get("valid_days") or 30))

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=25 * mm, bottomMargin=20 * mm,
        title=f"{ref} \u2014 {client}",
    )
    story: List[Any] = []

    # ---------- Page 1: Cover ----------
    story.append(Spacer(1, 30 * mm))
    story.append(Paragraph("CUSTOMISED HOME QUOTATION", styles["CQEyebrow"]))
    story.append(Paragraph(f"Prepared for<br/><b>{client}</b>", styles["CQCover"]))
    tagline = quote.get("package_name") or "Bespoke Home Build"
    story.append(Paragraph(tagline, styles["CQCoverSub"]))
    story.append(Spacer(1, 40 * mm))
    story.append(_kv_table([
        ["Reference", ref],
        ["Date of Issue", today.strftime("%d %B %Y")],
        ["Valid Until", valid_until.strftime("%d %B %Y")],
        ["Prepared By", quote.get("prepared_by") or company],
    ]))
    story.append(PageBreak())

    # ---------- Page 2: Client & Site ----------
    story.append(Paragraph("Project Brief", styles["CQH1"]))
    if quote.get("intro_note"):
        story.append(Paragraph(quote["intro_note"], styles["CQBody"]))
        story.append(Spacer(1, 8))
    story.append(Paragraph("Client Details", styles["CQH2"]))
    story.append(_kv_table([
        ["Name", client],
        ["Phone", quote.get("client_phone") or "\u2014"],
        ["Email", quote.get("client_email") or "\u2014"],
        ["Address", quote.get("client_address") or "\u2014"],
    ]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Site & Requirements", styles["CQH2"]))
    plot_area = quote.get("plot_area")
    built_up = quote.get("built_up_area") or 0
    story.append(_kv_table([
        ["Site Address", quote.get("site_address") or "\u2014"],
        ["Plot Size", f"{plot_area:,.0f} sq.ft" if plot_area else "\u2014"],
        ["Floors", quote.get("floors") or "\u2014"],
        ["Built-up Area", f"{float(built_up):,.0f} sq.ft"],
        ["BHK", str(quote.get("bhk") or "\u2014")],
        ["Style Preference", quote.get("style_pref") or "\u2014"],
        ["Client Budget", _rupees(quote.get("budget")) if quote.get("budget") else "\u2014"],
        ["Expected Start", quote.get("expected_start") or "\u2014"],
        ["Expected Completion", quote.get("expected_completion") or "\u2014"],
    ]))
    story.append(PageBreak())

    # ---------- Page 3: Pricing ----------
    story.append(Paragraph("Pricing Breakdown", styles["CQH1"]))
    story.append(Paragraph(
        "Complete cost breakdown for your customised home. All items below are transparent, itemised and free of hidden fees.",
        styles["CQSmall"],
    ))
    story.append(Spacer(1, 8))

    area = float(quote.get("built_up_area") or 0)
    rate = float(quote.get("price_per_sqft") or 0)
    base = area * rate
    addons = quote.get("addons") or []
    line_items = quote.get("line_items") or []
    addon_total = sum(float(a.get("price") or 0) for a in addons)
    line_total = sum(float(l.get("amount") or 0) for l in line_items)
    subtotal = base + addon_total + line_total
    discount = float(quote.get("discount_amount") or 0)
    net = max(0.0, subtotal - discount)
    gst_pct = float(quote.get("gst_percent") or 18)
    gst_amt = net * gst_pct / 100
    grand = net + gst_amt

    rows = [["Line Item", "Detail", "Amount"]]
    pkg_label = quote.get("package_name") or "Custom Base Build"
    if base > 0:
        rows.append([pkg_label, f"{area:,.0f} sq.ft \u00d7 {_rupees(rate)}", _rupees(base)])
    for a in addons:
        rows.append([
            a.get("name", "Add-on"),
            (a.get("description") or a.get("unit") or ""),
            _rupees(a.get("price") or 0),
        ])
    for l in line_items:
        rows.append([
            l.get("name", "Line Item"),
            l.get("description") or "",
            _rupees(l.get("amount") or 0),
        ])
    rows.append(["Subtotal", "", _rupees(subtotal)])
    if discount > 0:
        rows.append([quote.get("discount_label") or "Discount", "", f"\u2212 {_rupees(discount)}"])
        rows.append(["Net", "", _rupees(net)])
    rows.append([f"GST @ {gst_pct:g}%", "", _rupees(gst_amt)])
    rows.append(["Grand Total", "", _rupees(grand)])

    pricing_tbl = Table(rows, colWidths=[65 * mm, 65 * mm, 40 * mm])
    pricing_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 10),
        ("FONT", (0, 1), (-1, -1), "Helvetica", 10),
        ("BACKGROUND", (0, -1), (-1, -1), BRAND_ORANGE),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.white),
        ("FONT", (0, -1), (-1, -1), "Helvetica-Bold", 11),
        ("ALIGN", (2, 0), (2, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(pricing_tbl)
    story.append(Spacer(1, 6))
    if quote.get("budget"):
        try:
            b = float(quote.get("budget"))
            delta = grand - b
            if abs(delta) > 0.5:
                sign = "over" if delta > 0 else "under"
                story.append(Paragraph(
                    f"Client budget: {_rupees(b)} \u2014 this quote is {_rupees(abs(delta))} {sign} budget.",
                    styles["CQSmall"],
                ))
            else:
                story.append(Paragraph(
                    f"Client budget: {_rupees(b)} \u2014 quote matches the target budget.",
                    styles["CQSmall"],
                ))
        except Exception:
            pass
    story.append(PageBreak())

    # ---------- Page 4: Scope + Exclusions ----------
    story.append(Paragraph("What's Included", styles["CQH1"]))
    scope = quote.get("scope_of_work") or []
    if scope:
        story.extend(_bullet_list(scope, styles, check=True))
    else:
        story.append(Paragraph("Scope will be finalised on booking.", styles["CQSmall"]))
    story.append(Spacer(1, 14))
    story.append(Paragraph("Exclusions", styles["CQH1"]))
    excl = quote.get("exclusions") or []
    if excl:
        story.extend(_bullet_list(excl, styles, check=False))
    else:
        story.append(Paragraph("None.", styles["CQSmall"]))
    story.append(PageBreak())

    # ---------- Page 5+: Deep Specifications ----------
    story.append(Paragraph("Material Specifications", styles["CQH1"]))
    story.append(Paragraph(
        "Every material, brand and grade proposed for your home. Fully transparent \u2014 nothing is hidden.",
        styles["CQSmall"],
    ))
    story.append(Spacer(1, 8))
    for cat in (quote.get("spec_categories") or [])[:16]:
        story.append(Paragraph(cat.get("name", ""), styles["CQH2"]))
        cat_rows = [["Spec", "Value", "Brand", "Warranty"]]
        for it in (cat.get("items") or []):
            cat_rows.append([
                it.get("spec", ""), it.get("value", ""),
                it.get("brand") or "\u2014", it.get("warranty") or "\u2014",
            ])
        if len(cat_rows) > 1:
            t = Table(cat_rows, colWidths=[38 * mm, 55 * mm, 42 * mm, 35 * mm])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_BG),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
                ("FONT", (0, 1), (-1, -1), "Helvetica", 9),
                ("TEXTCOLOR", (0, 0), (-1, 0), BRAND_NAVY),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#E5E7EB")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]))
            story.append(t)
            story.append(Spacer(1, 6))
    story.append(PageBreak())

    # ---------- Payment Schedule ----------
    story.append(Paragraph("Payment Schedule", styles["CQH1"]))
    story.append(Paragraph(
        "Payments are strictly milestone-based. You only pay once a stage is verified and signed off.",
        styles["CQSmall"],
    ))
    story.append(Spacer(1, 6))
    schedule = quote.get("payment_schedule") or []
    if schedule:
        s_rows = [["Milestone", "%", "Description", "Est. Amount"]]
        for s in schedule:
            pct = float(s.get("percentage") or 0)
            s_rows.append([
                s.get("milestone", ""),
                f"{pct:g}%",
                s.get("description", ""),
                _rupees(grand * pct / 100),
            ])
        t = Table(s_rows, colWidths=[55 * mm, 15 * mm, 65 * mm, 35 * mm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9.5),
            ("FONT", (0, 1), (-1, -1), "Helvetica", 9.5),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#E5E7EB")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("ALIGN", (3, 0), (3, -1), "RIGHT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(t)
    else:
        story.append(Paragraph("Payment schedule will be finalised at booking.", styles["CQSmall"]))
    story.append(PageBreak())

    # ---------- Terms & Signature ----------
    story.append(Paragraph("Terms & Conditions", styles["CQH1"]))
    default_terms = (
        f"1. This quotation is valid for {quote.get('valid_days', 30)} days from the date of issue.<br/>"
        "2. Prices are indicative and confirmed at time of booking.<br/>"
        "3. Payments are milestone-based; each milestone requires signed customer approval before the next stage begins.<br/>"
        f"4. Warranty of {quote.get('warranty_years') or 10} years on structure, waterproofing and workmanship.<br/>"
        "5. Any change in scope after booking is quoted separately as a variation order.<br/>"
        "6. Municipal approvals, land-related legal fees and utility deposits are excluded unless explicitly included above.<br/>"
        "7. This quotation does not constitute a binding contract until a formal work order is signed by both parties."
    )
    story.append(Paragraph(quote.get("terms") or default_terms, styles["CQBody"]))
    story.append(Spacer(1, 30))
    sign_tbl = Table([
        ["For ConstructONS", "For Client"],
        ["\n\n_________________________", "\n\n_________________________"],
        [company, client],
    ], colWidths=[80 * mm, 80 * mm])
    sign_tbl.setStyle(TableStyle([
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 10),
        ("FONT", (0, 2), (-1, 2), "Helvetica", 10),
        ("TEXTCOLOR", (0, 0), (-1, -1), BRAND_NAVY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(sign_tbl)

    doc.build(story, onFirstPage=_header_footer(company), onLaterPages=_header_footer(company))
    buf.seek(0)
    return buf.getvalue()
