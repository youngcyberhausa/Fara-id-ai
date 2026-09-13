import re

path = "frontend/src/i18n/translations.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

en_old = '  tileRelationsDesc: "Explore who inherits and why, in 3D",'
en_new = '''  tileRelationsDesc: "Explore who inherits and why, in 3D",
  tileZakat: "Zakat Calculator",
  tileZakatDesc: "Calculate Zakat on cash, gold and business assets",
  zakat: {
    title: "Zakat Calculator",
    desc: "Calculate Zakat on cash, gold, silver, trade goods, and receivables — based on Nisab.",
    currencyLabel: "Currency",
    cashLabel: "Cash & Bank Savings",
    goldGramsLabel: "Gold (grams)",
    goldPriceLabel: "Gold price per gram",
    silverGramsLabel: "Silver (grams)",
    silverPriceLabel: "Silver price per gram",
    tradeGoodsLabel: "Trade Goods / Stock Value",
    receivablesLabel: "Money Owed to You (collectible)",
    debtsLabel: "Debts You Owe (short-term)",
    nisabBasisLabel: "Nisab Basis",
    nisabSilver: "Silver (595g)",
    nisabGold: "Gold (85g)",
    nisabNote: "Most scholars recommend the silver Nisab since it is lower, meaning more Zakat is given to the poor.",
    calculateBtn: "Calculate Zakat",
    zakatableLabel: "Total Zakatable Wealth",
    nisabLabel: "Nisab (Threshold)",
    zakatDueLabel: "Zakat Due (2.5%)",
    belowNisabMsg: "Your wealth is below the Nisab, so no Zakat is due at this time.",
    footerNote: "This calculator is a general guide only. For complex situations (e.g. Zakat on farmland, livestock, or specialized investments), please consult a scholar for full guidance.",
  },'''

ha_old = '  tileRelationsDesc: "Bincika wanene ke gaji da dalili, cikin 3D",'
ha_new = '''  tileRelationsDesc: "Bincika wanene ke gaji da dalili, cikin 3D",
  tileZakat: "Zakat Calculator",
  tileZakatDesc: "Lissafa Zakat akan kuɗi, zinariya da hannun jari",
  zakat: {
    title: "Zakat Calculator",
    desc: "Lissafta Zakat akan kuɗi, zinariya, azurfa, kayan kasuwanci, da bashin da za a karɓa — bisa Nisab.",
    currencyLabel: "Kuɗin da za a yi amfani da su (Currency)",
    cashLabel: "Kuɗi da Ajiya a Banki (Cash & Bank)",
    goldGramsLabel: "Zinariya (grams)",
    goldPriceLabel: "Farashin gram 1 na Zinariya",
    silverGramsLabel: "Azurfa (grams)",
    silverPriceLabel: "Farashin gram 1 na Azurfa",
    tradeGoodsLabel: "Darajar Kayan Kasuwanci/Stock",
    receivablesLabel: "Bashin da Wasu ke Bin ka (za a iya karɓa)",
    debtsLabel: "Bashin da Kake Bin Wasu (za a cire)",
    nisabBasisLabel: "Tushen Nisab",
    nisabSilver: "Azurfa (595g)",
    nisabGold: "Zinariya (85g)",
    nisabNote: "Yawancin malamai suna ba da shawarar amfani da Nisab na azurfa domin ya fi ƙasƙanci, wanda ke nufin an fi bayar da Zakat ga talakawa.",
    calculateBtn: "Lissafa Zakat",
    zakatableLabel: "Jimlar Dukiyar da za a Yi wa Zakat",
    nisabLabel: "Nisab (Iyaka)",
    zakatDueLabel: "Zakat da za a Bayar (2.5%)",
    belowNisabMsg: "Dukiyarka bata kai Nisab ba, don haka babu Zakat da wajaba akanka a wannan lokacin.",
    footerNote: "Wannan calculator jagora ne na gaba ɗaya kawai. Don yanayi mai rikitarwa (misali Zakat na gonaki, dabbobi, ko hannun jari na musamman), da fatan za a tuntuɓi malami don cikakken shawara.",
  },'''

if en_old not in content:
    raise SystemExit("ERROR: English anchor line not found — aborting.")
if content.count(en_old) != 1:
    raise SystemExit("ERROR: English anchor line found more than once — aborting.")
if ha_old not in content:
    raise SystemExit("ERROR: Hausa anchor line not found — aborting.")
if content.count(ha_old) != 1:
    raise SystemExit("ERROR: Hausa anchor line found more than once — aborting.")

content = content.replace(en_old, en_new, 1)
content = content.replace(ha_old, ha_new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK: translations.js patched successfully.")
