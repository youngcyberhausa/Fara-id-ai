#!/bin/bash
set -e
echo "Switching AI Guide to Gemini..."

cat > backend/app/routers/support.py << 'FARAID_EOF'
import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal

from .. import models
from ..deps import get_current_user

router = APIRouter(prefix="/api/support", tags=["support"])

# Google's Gemini has the most generous no-credit-card-required free tier
# (Google AI Studio → aistudio.google.com/apikey), so it's the default
# provider here. Anthropic/Groq remain as optional fallbacks if configured.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite")

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6")

SYSTEM_PROMPT = """You are the "Fara'id AI Guide" — a friendly, concise support \
assistant embedded in the Fara'id AI web app (an Islamic inheritance \
calculator).

You have exactly two jobs:
1. Help users understand how to USE the app (the steps: Estate, \
   Deductions, Wasiyyah, Heirs, Result; saving/viewing cases; changing \
   language; etc).
2. Answer GENERAL educational questions about Islamic inheritance \
   (Fara'id) — heir categories, 'awl, radd, hajb, and so on — at a \
   conceptual level.

Hard limits:
- You have NO access to any user's account, saved cases, or database. \
  You cannot look up, confirm, or discuss anyone's personal case details. \
  If asked about "my case" or specific numbers, explain that you can't \
  see their data and direct them to the app's calculator or their saved \
  case history.
- You do not issue personalized religious rulings (fatwas). For real, \
  specific inheritance situations, always encourage the user to consult \
  a qualified Islamic scholar.
- Keep answers short and conversational (a few sentences), suitable for \
  a mobile chat bubble. Avoid long essays unless the user explicitly \
  asks for more detail.
- If asked to do anything outside these two jobs (e.g. general coding \
  help, unrelated topics), politely redirect to what you can help with.
"""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: List[ChatMessage] = Field(default_factory=list, max_length=20)


class ChatResponse(BaseModel):
    reply: str


async def _call_gemini(messages: list) -> str:
    contents = [
        {
            "role": "model" if m["role"] == "assistant" else "user",
            "parts": [{"text": m["content"]}],
        }
        for m in messages
    ]
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            url,
            headers={"content-type": "application/json"},
            json={
                "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": contents,
                "generationConfig": {"maxOutputTokens": 500},
            },
        )
    resp.raise_for_status()
    data = resp.json()
    candidates = data.get("candidates", [])
    if not candidates:
        return ""
    parts = candidates[0].get("content", {}).get("parts", [])
    return "".join(p.get("text", "") for p in parts).strip()


async def _call_anthropic(messages: list) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": ANTHROPIC_MODEL,
                "max_tokens": 500,
                "system": SYSTEM_PROMPT,
                "messages": messages,
            },
        )
    resp.raise_for_status()
    data = resp.json()
    text_blocks = [b["text"] for b in data.get("content", []) if b.get("type") == "text"]
    return "\n".join(text_blocks).strip()


async def _call_groq(messages: list) -> str:
    groq_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "content-type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "max_tokens": 500,
                "messages": groq_messages,
            },
        )
    resp.raise_for_status()
    data = resp.json()
    choices = data.get("choices", [])
    if not choices:
        return ""
    return (choices[0].get("message", {}).get("content") or "").strip()


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, user: models.User = Depends(get_current_user)):
    """
    Proxies a message to an LLM provider with a scoped system prompt.
    Deliberately does not touch the database — `user` above is only used
    to require that the caller is logged in, its fields are never read.
    Prefers Gemini (free tier), then Anthropic, then Groq — whichever has
    an API key configured.
    """
    if not GEMINI_API_KEY and not ANTHROPIC_API_KEY and not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="The AI guide isn't configured yet (missing GEMINI_API_KEY, GROQ_API_KEY or ANTHROPIC_API_KEY).",
        )

    messages = [{"role": m.role, "content": m.content} for m in req.history]
    messages.append({"role": "user", "content": req.message})

    try:
        if GEMINI_API_KEY:
            reply = await _call_gemini(messages)
        elif ANTHROPIC_API_KEY:
            reply = await _call_anthropic(messages)
        else:
            reply = await _call_groq(messages)
        reply = reply or "Sorry, I couldn't generate a response."
        return ChatResponse(reply=reply)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e.response.status_code}")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach the AI service.")
FARAID_EOF
echo "  updated: backend/app/routers/support.py"
echo "Done. Now run:"
echo "  git add -A && git commit -m 'Switch AI guide to Gemini free tier' && git push"
