path = "backend/app/routers/cases.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old1 = '    heir_counts = {h["type"]: h["count"] for h in heirs if h.get("count", 0) > 0}'
new1 = old1 + '\n    heir_names = {h["type"]: [n for n in (h.get("names") or []) if n and n.strip()] for h in heirs}'

old2 = '''        breakdown.append({
            "heir_type": htype,
            "label": HEIR_LABELS.get(htype, htype.replace("_", " ").title()),
            "count": count,
            "share_fraction": str(frac),'''
new2 = '''        breakdown.append({
            "heir_type": htype,
            "label": HEIR_LABELS.get(htype, htype.replace("_", " ").title()),
            "count": count,
            "names": heir_names.get(htype) or None,
            "share_fraction": str(frac),'''

for old in (old1, old2):
    if content.count(old) != 1:
        raise SystemExit(f"ERROR: expected 1 occurrence, found {content.count(old)}: {old[:60]!r}")

content = content.replace(old1, new1, 1)
content = content.replace(old2, new2, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
