path = "frontend/src/i18n/translations.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

en_old = '  familySharing: {'
en_new = '''  pdf: {
    estateSummary: "Estate Summary",
    distributionBreakdown: "Distribution Breakdown",
    heir: "Heir",
    share: "Share",
    amount: "Amount",
    generated: "Generated",
  },
  familySharing: {'''

ha_old = '  familySharing: {'
ha_new = '''  pdf: {
    estateSummary: "Takaitaccen Dukiya",
    distributionBreakdown: "Rabon Dukiya Tsakanin Magada",
    heir: "Magaji",
    share: "Rabo",
    amount: "Adadi",
    generated: "An Tsara Ranar",
  },
  familySharing: {'''

if content.count(en_old) < 2:
    raise SystemExit("ERROR: expected at least 2 occurrences of familySharing anchor.")

first_idx = content.find(en_old)
content = content[:first_idx] + en_new + content[first_idx + len(en_old):]

second_idx = content.find(ha_old, first_idx + len(en_new))
if second_idx == -1:
    raise SystemExit("ERROR: could not find second familySharing anchor for Hausa block.")
content = content[:second_idx] + ha_new + content[second_idx + len(ha_old):]

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
