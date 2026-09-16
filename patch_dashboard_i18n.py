path = "frontend/src/i18n/translations.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

en_old = '  welcomeBack: "Welcome back",'
en_new = en_old + '''
  dashboardThisMonth: "Cases this month",
  dashboardTrend: "Last 6 months",
  dashboardRecent: "Recent activity",'''

ha_old = '  welcomeBack: "Barka da dawowa",'
ha_new = ha_old + '''
  dashboardThisMonth: "Cases wannan wata",
  dashboardTrend: "Watanni 6 na baya",
  dashboardRecent: "Ayyukan Kwanan Nan",'''

for old in (en_old, ha_old):
    if content.count(old) != 1:
        raise SystemExit(f"ERROR: found {content.count(old)}: {old!r}")

content = content.replace(en_old, en_new, 1)
content = content.replace(ha_old, ha_new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
