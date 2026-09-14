path = "frontend/src/i18n/translations.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

en_old = '  relationsTitle: "How Family Relationships Affect Inheritance",'
en_new = en_old + '''
  familySharing: {
    shareBtn: "Share with Family",
    shareDesc: "View-only link — anyone with this link can see the result, without needing an account.",
    copyBtn: "Copy",
    stopSharing: "Stop Sharing",
    openApp: "Open App",
    viewOnlyNotice: "This is a view-only link someone shared with you — it's a family case, not yours.",
    notFound: "This case could not be found — sharing may have been turned off.",
  },'''

ha_old = '  relationsTitle: "Yadda Dangantakar Iyali Take Shafar Gado",'
ha_new = ha_old + '''
  familySharing: {
    shareBtn: "Raba da Iyali",
    shareDesc: "Link na kallo kaɗai — kowa da ke da wannan link zai iya ganin sakamakon, ba tare da shiga account ba.",
    copyBtn: "Kwafa",
    stopSharing: "Dakatar da Raba",
    openApp: "Buɗe App",
    viewOnlyNotice: "Wannan link ne na kallo kaɗai da wani ya raba da kai — case ne cikin iyali, ba naka ba.",
    notFound: "Ba a sami wannan case ba — wataƙila an dakatar da raba shi.",
  },'''

for old in (en_old, ha_old):
    if old not in content:
        raise SystemExit(f"ERROR: anchor not found: {old!r}")
    if content.count(old) != 1:
        raise SystemExit(f"ERROR: anchor found more than once: {old!r}")

content = content.replace(en_old, en_new, 1)
content = content.replace(ha_old, ha_new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
