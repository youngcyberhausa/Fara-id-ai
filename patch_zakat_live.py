path = "frontend/src/i18n/translations.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

en_old = '    calculateBtn: "Calculate Zakat",'
en_new = '''    livePrice: "Live market price",
    manualPrice: "Couldn't fetch live price — enter manually",
    refreshPrices: "Refresh prices",
    calculateBtn: "Calculate Zakat",'''

ha_old = '    calculateBtn: "Lissafa Zakat",'
ha_new = '''    livePrice: "Farashin kasuwa na yanzu (live)",
    manualPrice: "Ba a sami farashi kai tsaye ba — saka da hannu",
    refreshPrices: "Sabunta farashi",
    calculateBtn: "Lissafa Zakat",'''

for old in (en_old, ha_old):
    if content.count(old) != 1:
        raise SystemExit(f"ERROR: expected exactly 1 occurrence of {old!r}, found {content.count(old)}")

content = content.replace(en_old, en_new, 1)
content = content.replace(ha_old, ha_new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
