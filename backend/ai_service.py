"""AI Copy Assist — Emergent Universal Key + OpenAI GPT-5.

Exposes a single async helper `rewrite_copy` that returns 2–3 rewrite
suggestions for a piece of admin-supplied copy, guided by an on-brand
ConstructONS system prompt.
"""
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

    # Import lazily so the backend still boots if the lib isn't present.
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

    # Extract JSON — model may occasionally wrap in fences even under strict instructions.
    raw = response if isinstance(response, str) else str(response)
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        logger.warning(f"[ai] no JSON in model response: {raw[:200]}")
        return []
    try:
        parsed = json.loads(match.group(0))
        suggestions = parsed.get("suggestions") or []
        # Trim + de-dup + cap to 3
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
