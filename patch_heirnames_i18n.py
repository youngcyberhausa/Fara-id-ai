path = "frontend/src/i18n/translations.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

en_old = '  heirsDesc: "Select every heir who survived the deceased and enter how many of each.",'
en_new = en_old + '\n  addNamesOptional: "Add names (optional)",'

ha_old = '  heirsDesc: "Zaba kowane magaji da ya rage bayan mamaci sannan ka shigar da yawansu.",'
ha_new = ha_old + '\n  addNamesOptional: "Kara sunaye (zabi)",'

for old in (en_old, ha_old):
    if content.count(old) != 1:
        raise SystemExit(f"ERROR: found {content.count(old)}: {old[:40]!r}")

content = content.replace(en_old, en_new, 1)
content = content.replace(ha_old, ha_new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
