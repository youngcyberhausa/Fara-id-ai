path = "frontend/src/reportExport.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old1 = '    const name = `${t.heirs?.[b.heir_type] || b.label}${b.count > 1 ? ` x${b.count}` : ""}`;'
new1 = '''    const namesTxt = b.names?.length ? ` (${b.names.filter(Boolean).join(", ")})` : "";
    const name = `${t.heirs?.[b.heir_type] || b.label}${b.count > 1 ? ` x${b.count}` : ""}${namesTxt}`;'''

old2 = '          new Paragraph(`${t.heirs?.[b.heir_type] || b.label}${b.count > 1 ? ` x${b.count}` : ""}`),'
new2 = '''          new Paragraph(
            `${t.heirs?.[b.heir_type] || b.label}${b.count > 1 ? ` x${b.count}` : ""}${
              b.names?.length ? ` (${b.names.filter(Boolean).join(", ")})` : ""
            }`
          ),'''

for old in (old1, old2):
    if content.count(old) != 1:
        raise SystemExit(f"ERROR: found {content.count(old)} occurrences of: {old[:50]!r}")

content = content.replace(old1, new1, 1)
content = content.replace(old2, new2, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
