import { useState } from "react";
import { CURRENCIES } from "../i18n/currencies";

const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;
const ZAKAT_RATE = 0.025;

function n(v) {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
}

export default function ZakatCalculator({ onBack }) {
  const [currency, setCurrency] = useState("NGN");
  const [nisabBasis, setNisabBasis] = useState("silver"); // "gold" | "silver"
  const [cash, setCash] = useState("");
  const [goldGrams, setGoldGrams] = useState("");
  const [goldPrice, setGoldPrice] = useState("");
  const [silverGrams, setSilverGrams] = useState("");
  const [silverPrice, setSilverPrice] = useState("");
  const [tradeGoods, setTradeGoods] = useState("");
  const [receivables, setReceivables] = useState("");
  const [debts, setDebts] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    const goldValue = n(goldGrams) * n(goldPrice);
    const silverValue = n(silverGrams) * n(silverPrice);
    const zakatable =
      n(cash) + goldValue + silverValue + n(tradeGoods) + n(receivables) - n(debts);

    const nisabValue =
      nisabBasis === "gold" ? GOLD_NISAB_GRAMS * n(goldPrice) : SILVER_NISAB_GRAMS * n(silverPrice);

    const meetsNisab = nisabValue > 0 && zakatable >= nisabValue;
    const zakatDue = meetsNisab ? zakatable * ZAKAT_RATE : 0;

    setResult({ zakatable, nisabValue, meetsNisab, zakatDue });
  }

  function fmt(v) {
    return `${Math.max(0, v).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-brand-600 hover:underline mb-3">
        ← Koma
      </button>

      <h2 className="text-lg font-semibold text-gray-900">🕌 Zakat Calculator</h2>
      <p className="text-sm text-gray-500 mt-1">
        Lissafta Zakat akan kuɗi, zinariya, azurfa, kayan kasuwanci, da bashin da za a karɓa — bisa Nisab.
      </p>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">Kuɗin da za a yi amfani da su (Currency)</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      <Field label="Kuɗi da Ajiya a Banki (Cash & Bank)" value={cash} onChange={setCash} />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Field label="Zinariya (grams)" value={goldGrams} onChange={setGoldGrams} />
        <Field label={`Farashin gram 1 na Zinariya (${currency})`} value={goldPrice} onChange={setGoldPrice} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Field label="Azurfa (grams)" value={silverGrams} onChange={setSilverGrams} />
        <Field label={`Farashin gram 1 na Azurfa (${currency})`} value={silverPrice} onChange={setSilverPrice} />
      </div>

      <Field label="Darajar Kayan Kasuwanci/Stock" value={tradeGoods} onChange={setTradeGoods} />
      <Field label="Bashin da Wasu ke Bin ka (za a iya karɓa)" value={receivables} onChange={setReceivables} />
      <Field label="Bashin da Kake Bin Wasu (za a cire)" value={debts} onChange={setDebts} />

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">Tushen Nisab</label>
        <div className="mt-1.5 flex gap-2">
          <button
            onClick={() => setNisabBasis("silver")}
            className={`flex-1 text-sm py-2.5 rounded-lg border ${
              nisabBasis === "silver"
                ? "bg-brand-600 text-white border-brand-600"
                : "border-gray-200 text-gray-600"
            }`}
          >
            Azurfa (595g)
          </button>
          <button
            onClick={() => setNisabBasis("gold")}
            className={`flex-1 text-sm py-2.5 rounded-lg border ${
              nisabBasis === "gold" ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-600"
            }`}
          >
            Zinariya (85g)
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          Yawancin malamai suna ba da shawarar amfani da Nisab na azurfa domin ya fi ƙasƙanci, wanda ke nufin an fi
          bayar da Zakat ga talakawa.
        </p>
      </div>

      <button
        onClick={calculate}
        className="mt-6 w-full bg-brand-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-brand-700"
      >
        Lissafa Zakat
      </button>

      {result && (
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-gray-200 px-3 py-3">
              <div className="text-[11px] text-gray-400">Jimlar Dukiyar da za a Yi wa Zakat</div>
              <div className="text-sm font-semibold mt-0.5 text-gray-800">{fmt(result.zakatable)}</div>
            </div>
            <div className="rounded-lg border border-gray-200 px-3 py-3">
              <div className="text-[11px] text-gray-400">Nisab (Iyaka)</div>
              <div className="text-sm font-semibold mt-0.5 text-gray-800">{fmt(result.nisabValue)}</div>
            </div>
          </div>

          {result.meetsNisab ? (
            <div className="rounded-lg border border-brand-300 bg-brand-50 px-4 py-4 text-center">
              <div className="text-xs text-brand-700 mb-1">Zakat da za a Bayar (2.5%)</div>
              <div className="text-2xl font-bold text-brand-700">{fmt(result.zakatDue)}</div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Dukiyarka bata kai Nisab ba, don haka babu Zakat da wajaba akanka a wannan lokacin.
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">
        Wannan calculator jagora ne na gaba ɗaya kawai. Don yanayi mai rikitarwa (misali Zakat na gonaki, dabbobi, ko
        hannun jari na musamman), da fatan za a tuntuɓi malami don cikakken shawara.
      </p>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div className="mt-5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  );
}
