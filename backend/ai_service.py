"""AI Copy Assist + Custom Quote Suggestions — Emergent Universal Key + GPT-5."""
import json
import logging
import os
import re
import uuid
from typing import List, Optional

logger = logging.getLogger(__name__)

BRAND_SYSTEM_PROMPT = (
    "You are the senior copy chief for ConstructONS — India's premium AI-powered "
    "home construction brand. Voice: confident, transparent, trustworthy, warm; "
    "never salesy or hype-y. Audience: aspirational Indian homeowners (30-55) "
    "who value quality, on-time delivery and no hidden costs.\n\n"
    "Given a piece of copy and an optional purpose (e.g. 'tagline', 'faq answer', "
    "'description'), return exactly 3 improved rewrites. Rules:\n"
    "1. Keep the same meaning and factual claims — do NOT invent features.\n"
    "2. Vary sentence length; prefer active voice.\n"
    "3. For taglines, cap at 8 words.\n"
    "4. Never mention competitors by name.\n"
    "5. Never use words like 'revolutionary', 'game-changer', 'cutting-edge'.\n\n"
    "Return STRICT JSON only in this shape (no markdown, no prose):\n"
    '{"suggestions": ["rewrite 1", "rewrite 2", "rewrite 3"]}'
)


async def rewrite_copy(text: str, purpose: str = "copy", tone: str = "on-brand") -> List[str]:
    """Return a list of 3 rewrite suggestions. Falls back to [] on any error."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        logger.error("[ai] EMERGENT_LLM_KEY not set")
        return []

    from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore

    prompt = (
        f"Purpose: {purpose}\n"
        f"Tone hint: {tone}\n"
        f"Original copy:\n---\n{text.strip()}\n---\n\n"
        "Return the JSON as instructed."
    )
    chat = LlmChat(
        api_key=api_key,
        session_id=f"ai-rewrite-{uuid.uuid4()}",
        system_message=BRAND_SYSTEM_PROMPT,
    ).with_model("openai", "gpt-5")

    try:
        response = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        logger.error(f"[ai] rewrite call failed: {e}")
        return []

    raw = response if isinstance(response, str) else str(response)
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        logger.warning(f"[ai] no JSON in model response: {raw[:200]}")
        return []
    try:
        parsed = json.loads(match.group(0))
        suggestions = parsed.get("suggestions") or []
        cleaned: List[str] = []
        seen = set()
        for s in suggestions:
            if not isinstance(s, str):
                continue
            s2 = s.strip()
            if s2 and s2 not in seen:
                seen.add(s2)
                cleaned.append(s2)
            if len(cleaned) >= 3:
                break
        return cleaned
    except Exception as e:
        logger.error(f"[ai] JSON parse failed: {e}")
        return []


# ---------------------------------------------------------------------------
# Custom Quote AI Suggestion
# ---------------------------------------------------------------------------
QUOTE_SYSTEM_PROMPT = (
    "You are a senior estimator at ConstructONS — a premium Indian home "
    "construction brand. Given client requirements, produce a realistic, "
    "buildable, budget-aligned custom quotation as STRICT JSON.\n\n"
    "PRICING RULES (critical):\n"
    "• A flat 15% contractor service charge is added on top of ALL items "
    "  (base + addons + interiors + line items). NEVER include GST.\n"
    "• If a budget is given, target: budget = pre_service_total × 1.15. "
    "  So pre_service_total ≈ budget / 1.15. Tune price_per_sqft, addons, "
    "  interiors and line_items to land within ±6%.\n"
    "• Legal rates: price_per_sqft ∈ [1300, 3500]. Total base = built_up × rate.\n"
    "• Use well-known Indian brands (UltraTech, TATA Tiscon, Kamdhenu, JSW, "
    "  Jaquar, Kohler, Asian Paints, Berger, Havells, Kajaria, Somany, "
    "  Godrej Interio, Sleek, Hettich, Blum, Philips, Syska).\n\n"
    "OUTPUT SHAPE (STRICT JSON, no markdown):\n"
    "{\n"
    '  "package_name": string,\n'
    '  "price_per_sqft": number,\n'
    '  "spec_categories": [\n'
    '    {"name": string, "icon": string|null, "items": [\n'
    '      {"spec": string, "value": string, "brand": string|null,\n'
    '       "warranty": string|null, "notes": string|null,\n'
    '       "rate": number, "rate_unit": string|null}\n'
    "    ]}\n"
    "  ],\n"
    '  "interiors": [\n'
    '    {"name": string, "icon": string|null, "items": [\n'
    '      {"spec": string, "value": string, "brand": string|null,\n'
    '       "notes": string|null, "rate": number, "rate_unit": string|null,\n'
    '       "include_in_total": true}\n'
    "    ]}\n"
    "  ],\n"
    '  "addons": [{"name": string, "description": string, "price": number, "unit": string|null}],\n'
    '  "line_items": [{"name": string, "description": string, "amount": number}],\n'
    '  "scope_of_work": [string],\n'
    '  "exclusions": [string],\n'
    '  "payment_schedule": [{"milestone": string, "percentage": number, "description": string}],\n'
    '  "warranty_years": number,\n'
    '  "ai_notes": string\n'
    "}\n\n"
    "CONSTRAINTS to keep responses fast: "
    "6–8 spec_categories, 4–6 items each; 3–5 interior categories with 3–5 items; "
    "3–6 addons; 0–3 line_items; 6–8 milestones. Rates are indicative INR "
    "and should be realistic per unit (e.g. cement ~₹380/bag, tiles ~₹65/sqft, "
    "modular kitchen ~₹1800/sqft). Every item that IS a real cost driver "
    "(especially in interiors) should have include_in_total=true."
)


async def suggest_custom_quote(payload: dict) -> dict:
    """Return a full custom-quote draft based on client requirements + mode.

    Expected payload keys:
      - mode: 'recommend' | 'scratch'
      - built_up_area, plot_area, floors, bhk, budget, style_pref (optional)
      - base_package: optional dict with the selected base package spec_categories

    On any error returns {} — caller should fall back gracefully.
    """
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        logger.error("[ai] EMERGENT_LLM_KEY not set for custom quote")
        return {}

    from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore

    mode = (payload.get("mode") or "recommend").strip().lower()
    if mode not in ("recommend", "scratch"):
        mode = "recommend"

    base_pkg = payload.get("base_package") or {}
    base_summary = ""
    if base_pkg:
        cats = base_pkg.get("spec_categories") or []
        base_summary = (
            f"\nBase package to anchor: '{base_pkg.get('name','?')}' "
            f"({base_pkg.get('price_display','?')}), {len(cats)} spec cats. "
            "In 'ai_notes', explain the upgrades/downgrades vs this baseline."
        )

    budget = payload.get("budget")
    budget_line = ""
    if budget:
        target_pre = float(budget) / 1.15
        budget_line = (
            f"\nBUDGET ANCHOR: client budget = ₹{float(budget):,.0f}. "
            f"Aim pre-service total ≈ ₹{target_pre:,.0f}. Grand = pre × 1.15."
        )

    user_prompt = (
        f"Mode: {mode}\n"
        "Client requirements:\n"
        f"- Built-up area: {payload.get('built_up_area') or 1200} sq.ft\n"
        f"- Plot area: {payload.get('plot_area') or 'not specified'} sq.ft\n"
        f"- Floors: {payload.get('floors') or 'G+1'}\n"
        f"- BHK: {payload.get('bhk') or 'not specified'}\n"
        f"- Style: {payload.get('style_pref') or 'Modern'}"
        f"{budget_line}{base_summary}\n\n"
        "Return the JSON payload exactly as specified — no prose, no markdown."
    )

    chat = LlmChat(
        api_key=api_key,
        session_id=f"cq-{uuid.uuid4()}",
        system_message=QUOTE_SYSTEM_PROMPT,
    ).with_model("openai", "gpt-5")

    try:
        response = await chat.send_message(UserMessage(text=user_prompt))
    except Exception as e:
        logger.error(f"[ai] custom quote call failed: {e}")
        return {}

    raw = response if isinstance(response, str) else str(response)
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        logger.warning(f"[ai] no JSON in custom quote response: {raw[:200]}")
        return {}
    try:
        parsed = json.loads(match.group(0))
    except Exception as e:
        logger.error(f"[ai] custom quote JSON parse failed: {e}")
        return {}

    def _list(x):
        return x if isinstance(x, list) else []

    def _normalise_categories(raw_cats, mark_include=False):
        out = []
        for cat in _list(raw_cats)[:12]:
            if not isinstance(cat, dict):
                continue
            items = []
            for it in _list(cat.get("items"))[:20]:
                if not isinstance(it, dict):
                    continue
                try:
                    rate = float(it.get("rate") or 0)
                except Exception:
                    rate = 0.0
                items.append({
                    "spec": str(it.get("spec") or "")[:120],
                    "value": str(it.get("value") or "")[:400],
                    "brand": (str(it.get("brand"))[:120] if it.get("brand") else None),
                    "warranty": (str(it.get("warranty"))[:80] if it.get("warranty") else None),
                    "notes": (str(it.get("notes"))[:220] if it.get("notes") else None),
                    "rate": max(0.0, rate),
                    "rate_unit": (str(it.get("rate_unit"))[:40] if it.get("rate_unit") else None),
                    "include_in_total": bool(it.get("include_in_total")) or mark_include,
                })
            if items:
                out.append({
                    "name": str(cat.get("name") or "Category")[:80],
                    "icon": (str(cat.get("icon"))[:40] if cat.get("icon") else None),
                    "items": items,
                })
        return out

    out: dict = {}
    out["package_name"] = str(parsed.get("package_name") or "Custom Home")[:120]
    try:
        rate = float(parsed.get("price_per_sqft") or 0)
        out["price_per_sqft"] = max(1000.0, min(4000.0, rate)) if rate else 0.0
    except Exception:
        out["price_per_sqft"] = 0.0

    out["spec_categories"] = _normalise_categories(parsed.get("spec_categories"))
    out["interiors"] = _normalise_categories(parsed.get("interiors"), mark_include=True)

    addons = []
    for a in _list(parsed.get("addons"))[:20]:
        if not isinstance(a, dict):
            continue
        try:
            price = float(a.get("price") or 0)
        except Exception:
            price = 0.0
        addons.append({
            "name": str(a.get("name") or "Add-on")[:120],
            "description": str(a.get("description") or "")[:300],
            "price": max(0.0, price),
            "unit": (str(a.get("unit"))[:40] if a.get("unit") else None),
        })
    out["addons"] = addons

    lines = []
    for l in _list(parsed.get("line_items"))[:20]:
        if not isinstance(l, dict):
            continue
        try:
            amt = float(l.get("amount") or 0)
        except Exception:
            amt = 0.0
        lines.append({
            "name": str(l.get("name") or "Item")[:120],
            "description": str(l.get("description") or "")[:300],
            "amount": max(0.0, amt),
        })
    out["line_items"] = lines

    out["scope_of_work"] = [str(s)[:220] for s in _list(parsed.get("scope_of_work"))[:30] if s]
    out["exclusions"] = [str(s)[:220] for s in _list(parsed.get("exclusions"))[:30] if s]

    sched = []
    for s in _list(parsed.get("payment_schedule"))[:12]:
        if not isinstance(s, dict):
            continue
        try:
            pct = float(s.get("percentage") or 0)
        except Exception:
            pct = 0.0
        sched.append({
            "milestone": str(s.get("milestone") or "Milestone")[:80],
            "percentage": max(0.0, min(100.0, pct)),
            "description": str(s.get("description") or "")[:200],
        })
    out["payment_schedule"] = sched

    try:
        out["warranty_years"] = int(parsed.get("warranty_years") or 10)
    except Exception:
        out["warranty_years"] = 10

    out["ai_notes"] = str(parsed.get("ai_notes") or "")[:2000]
    out["ai_mode"] = mode
    # Force new pricing model
    out["service_charge_percent"] = 15
    out["gst_percent"] = 0
    return out


# ---------------------------------------------------------------------------
# AI Image Generation — Gemini Nano Banana via Emergent LLM key
# ---------------------------------------------------------------------------

async def generate_image_nanobanana(prompt: str) -> Optional[bytes]:
    """Generate a single image from `prompt`. Returns raw PNG bytes or None."""
    if not prompt or not prompt.strip():
        return None
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        logger.error("[ai] EMERGENT_LLM_KEY not set for image gen")
        return None

    from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore
    import base64

    chat = LlmChat(
        api_key=api_key,
        session_id=f"img-{uuid.uuid4()}",
        system_message="You are an interior/architecture visualization assistant. Produce photorealistic images.",
    ).with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])

    try:
        _, images = await chat.send_message_multimodal_response(UserMessage(text=prompt.strip()[:800]))
    except Exception as e:
        logger.error(f"[ai] image gen failed: {e}")
        return None

    if not images:
        logger.warning("[ai] image gen returned no images")
        return None
    try:
        return base64.b64decode(images[0]["data"])
    except Exception as e:
        logger.error(f"[ai] image decode failed: {e}")
        return None
