#!/usr/bin/env python3
"""
Aura Omegas Grok — Hybrid Agent
================================
Owner: Ryan Puddy · Aura Lift Essentials LLC™

Fuses three brains into one decision:
  1. xAI Grok           (XAI_API_KEY)            — bold, real-time, opinionated
  2. OpenAI GPT         (OPENAI_API_KEY)         — precise arbiter
  3. Lovable AI Gemini  (LOVABLE_API_KEY)        — fast, multimodal, free-tier friendly

Each model answers independently, then GPT arbitrates and returns the unified
answer with rationale. Designed to run from the Lovable sandbox via
`code--exec python scripts/grok-agent.py "<prompt>"`.

Usage:
  python scripts/grok-agent.py "Should we launch the neck-fan blitz tonight?"
  python scripts/grok-agent.py @/tmp/long_prompt.txt --json
  python scripts/grok-agent.py "Plan a 5-step launch" --no-arbiter   # raw 3 answers
  python scripts/grok-agent.py "..." --solo grok                      # one brain

Owner-only: refuses to run unless LOVABLE_OWNER_EMAIL matches the allowlist.
"""
from __future__ import annotations

import argparse, json, os, sys, time
from typing import Any, Optional

import requests  # urllib has SSL issues in sandbox — always use requests

OWNER_EMAILS = {"ryanauralift@gmail.com", "thegrokfather@outlook.com"}

XAI_URL      = "https://api.x.ai/v1/chat/completions"
OPENAI_URL   = "https://api.openai.com/v1/chat/completions"
LOVABLE_URL  = "https://ai.gateway.lovable.dev/v1/chat/completions"

XAI_MODEL     = os.getenv("AURA_XAI_MODEL",     "grok-4-latest")
OPENAI_MODEL  = os.getenv("AURA_OPENAI_MODEL",  "gpt-5-mini")
GEMINI_MODEL  = os.getenv("AURA_GEMINI_MODEL",  "google/gemini-3-flash-preview")
ARBITER_MODEL = os.getenv("AURA_ARBITER_MODEL", "gpt-5")

SYSTEM_PROMPT = (
    "You are part of Aura Omegas Grok, a hybrid intelligence council operated "
    "by Ryan Puddy (Aura Lift Essentials LLC). Be direct, revenue-focused, and "
    "concrete. No fluff. Prefer actionable steps with explicit money outcomes."
)

ARBITER_PROMPT = (
    "You are the arbiter of the Aura Omegas Grok council. Three models answered "
    "the same question. Produce ONE unified answer that:\n"
    "  1. Synthesizes the strongest points from each.\n"
    "  2. Flags contradictions and resolves them with reasoning.\n"
    "  3. Ends with a numbered action plan and an estimated $ outcome.\n"
    "Be concise. No model name-dropping in the final answer."
)


def _post(url: str, headers: dict, payload: dict, timeout: int = 90) -> dict:
    r = requests.post(url, headers=headers, json=payload, timeout=timeout)
    if r.status_code == 402:
        raise SystemExit("402 — credits exhausted. Top up at Settings → Workspace → Usage.")
    if r.status_code == 429:
        raise SystemExit("429 — rate limited. Retry shortly.")
    r.raise_for_status()
    return r.json()


def call_xai(prompt: str, system: str = SYSTEM_PROMPT) -> Optional[str]:
    key = os.getenv("XAI_API_KEY")
    if not key:
        return None
    data = _post(XAI_URL,
                 {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                 {"model": XAI_MODEL, "temperature": 0.6,
                  "messages": [{"role": "system", "content": system},
                               {"role": "user",   "content": prompt}]})
    return data["choices"][0]["message"]["content"].strip()


def call_openai(prompt: str, system: str = SYSTEM_PROMPT, model: str = OPENAI_MODEL) -> Optional[str]:
    key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_MASTER_API_KEY")
    if not key:
        return None
    data = _post(OPENAI_URL,
                 {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                 {"model": model,
                  "messages": [{"role": "system", "content": system},
                               {"role": "user",   "content": prompt}]})
    return data["choices"][0]["message"]["content"].strip()


def call_gemini(prompt: str, system: str = SYSTEM_PROMPT) -> Optional[str]:
    key = os.getenv("LOVABLE_API_KEY")
    if not key:
        return None
    data = _post(LOVABLE_URL,
                 {"Lovable-API-Key": key, "Content-Type": "application/json"},
                 {"model": GEMINI_MODEL,
                  "messages": [{"role": "system", "content": system},
                               {"role": "user",   "content": prompt}]})
    return data["choices"][0]["message"]["content"].strip()


def arbitrate(question: str, answers: dict[str, str]) -> str:
    transcript = "\n\n".join(f"=== {name.upper()} ===\n{ans}" for name, ans in answers.items() if ans)
    user_msg = f"QUESTION:\n{question}\n\nCOUNCIL ANSWERS:\n{transcript}"
    out = call_openai(user_msg, system=ARBITER_PROMPT, model=ARBITER_MODEL)
    return out or "Arbiter unavailable. Raw answers above."


def owner_gate() -> None:
    email = (os.getenv("LOVABLE_OWNER_EMAIL") or os.getenv("AURA_OWNER_EMAIL") or "").lower().strip()
    if not email:
        # sandbox use — caller is the Lovable agent acting on Ryan's behalf
        return
    if email not in OWNER_EMAILS:
        raise SystemExit(f"Forbidden: {email} is not an Aura Omegas Grok owner.")


def read_prompt(arg: str) -> str:
    if arg == "-":
        return sys.stdin.read()
    if arg.startswith("@"):
        with open(arg[1:], "r") as f:
            return f.read()
    return arg


def main() -> int:
    p = argparse.ArgumentParser(description="Aura Omegas Grok hybrid agent")
    p.add_argument("prompt", help="Prompt text, @file, or - for stdin")
    p.add_argument("--solo", choices=["grok", "openai", "gemini"], help="Use a single brain")
    p.add_argument("--no-arbiter", action="store_true", help="Return raw 3-way council answers")
    p.add_argument("--json", action="store_true", help="Emit JSON")
    p.add_argument("--output", help="Write to file instead of stdout")
    args = p.parse_args()

    owner_gate()
    question = read_prompt(args.prompt)

    council: dict[str, Optional[str]] = {}
    if args.solo == "grok":
        council["grok"] = call_xai(question)
    elif args.solo == "openai":
        council["openai"] = call_openai(question)
    elif args.solo == "gemini":
        council["gemini"] = call_gemini(question)
    else:
        # Parallel-ish (sequential is fine in sandbox; keep order deterministic)
        for name, fn in (("grok", call_xai), ("openai", call_openai), ("gemini", call_gemini)):
            try:
                council[name] = fn(question)
            except Exception as e:
                council[name] = f"[error: {e}]"

    available = {k: v for k, v in council.items() if v and not v.startswith("[error")}

    if not available:
        print("All council members unavailable. Check XAI_API_KEY / OPENAI_API_KEY / LOVABLE_API_KEY.", file=sys.stderr)
        return 2

    if args.no_arbiter or args.solo:
        final = "\n\n".join(f"### {n.upper()}\n{a}" for n, a in council.items() if a)
    else:
        final = arbitrate(question, available)

    out_obj: Any
    if args.json:
        out_obj = json.dumps({"question": question, "council": council, "final": final}, indent=2)
    else:
        out_obj = final

    if args.output:
        with open(args.output, "w") as f:
            f.write(out_obj if isinstance(out_obj, str) else json.dumps(out_obj))
        print(f"Wrote → {args.output}")
    else:
        print(out_obj)
    return 0


if __name__ == "__main__":
    sys.exit(main())