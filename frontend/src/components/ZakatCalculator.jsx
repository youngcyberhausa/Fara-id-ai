import { useState, useEffect, useCallback } from "react";
import { useLang } from "../i18n/LanguageContext";
import { CURRENCIES } from "../i18n/currencies";
import { zakatApi } from "../api";

const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;
const ZAKAT_RATE = 0.025;

function n(v) {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
}

export default function ZakatCalculator({ onBack }) {
  const { t } = useLang();
  const z = t.zakat;

  const [currency, setCurrency] = useState("NGN");
  const [nisabBasis, setNisabBasis] = useState("silver");
  const [cash, setCash] = useState("");
  const [goldGrams, setGoldGrams] = useState("");
  const [goldPrice, setGoldPrice] = useState("");
  const [silverGrams, setSilverGrams] = useState("");
  const [silverPrice, setSilverPrice] = useState("");
  const [tradeGoods, setTradeGoods] = useState("");
  const [receivables, setReceivables] = useState("");
  const [debts, setDebts] = useState("");
  const [result, setResult] = useState(null);

  const [pricesLoading, setPricesLoading] = useState(false);
  const [priceStatus, setPriceStatus] = useState(null);

  const fetchPrices = useCallback(async (curr) => {
    setPricesLoading(true);
    try {
      const res = await zakatApi.getPrices(curr);
      if (res.available) {
        setGoldPrice(String(res.gold_price_per_gram));
        setSilverPrice(String(res.silver_price_per_gram));
        setPriceStatus("live");
      } else {
        setPriceStatus("manual");
      }
    } catch {
      setPriceStatus("manual");
    } finally {
      setPricesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices(currency);
  }, [currency, fetchPrices]);

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
        ← {t.back}
      </button>

      <h2 className="text-lg font-semibold text-gray-900">🕌 {z.title}</h2>
      <p className="text-sm text-gray-500 mt-1">{z.desc}</p>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">{z.currencyLabel}</label>
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

      <Field label={z.cashLabel} value={cash} onChange={setCash} />

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {pricesLoading
            ? "⏳ …"
            : priceStatus === "live"
              ? `🟢 ${z.livePrice}`
              : priceStatus === "manual"
                ? `⚠️ ${z.manualPrice}`
                : ""}
        </span>
        <button
          type="button"
          onClick={() => fetchPrices(currency)}
          disabled={pricesLoading}
          className="text-xs text-brand-600 hover:underline disabled:opacity-50"
        >
          🔄 {z.refreshPrices}
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3">
        <Field label={z.goldGramsLabel} value={goldGrams} onChange={setGoldGrams} />
        <Field label={`${z.goldPriceLabel} (${currency})`} value={goldPrice} onChange={setGoldPrice} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Field label={z.silverGramsLabel} value={silverGrams} onChange={setSilverGrams} />
        <Field label={`${z.silverPriceLabel} (${currency})`} value={silverPrice} onChange={setSilverPrice} />
      </div>

      <Field label={z.tradeGoodsLabel} value={tradeGoods} onChange={setTradeGoods} />
      <Field label={z.receivablesLabel} value={receivables} onChange={setReceivables} />
      <Field label={z.debtsLabel} value={debts} onChange={setDebts} />

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">{z.nisabBasisLabel}</label>
        <div className="mt-1.5 flex gap-2">
          <button
            onClick={() => setNisabBasis("silver")}
            className={`flex-1 text-sm py-2.5 rounded-lg border ${
              nisabBasis === "silver"
                ? "bg-brand-600 text-white border-brand-600"
                : "border-gray-200 text-gray-600"
            }`}
          >
            {z.nisabSilver}
          </button>
          <button
            onClick={() => setNisabBasis("gold")}
            className={`flex-1 text-sm py-2.5 rounded-lg border ${
              nisabBasis === "gold" ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-600"
            }`}
          >
            {z.nisabGold}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">{z.nisabNote}</p>
      </div>

      <button
        onClick={calculate}
        className="mt-6 w-full bg-brand-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-brand-700"
      >
        {z.calculateBtn}
      </button>

      {result && (
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-gray-200 px-3 py-3">
              <div className="text-[11px] text-gray-400">{z.zakatableLabel}</div>
              <div className="text-sm font-semibold mt-0.5 text-gray-800">{fmt(result.zakatable)}</div>
            </div>
            <div className="rounded-lg border border-gray-200 px-3 py-3">
              <div className="text-[11px] text-gray-400">{z.nisabLabel}</div>
              <div className="text-sm font-semibold mt-0.5 text-gray-800">{fmt(result.nisabValue)}</div>
            </div>
          </div>

          {result.meetsNisab ? (
            <div className="rounded-lg border border-brand-300 bg-brand-50 px-4 py-4 text-center">
              <div className="text-xs text-brand-700 mb-1">{z.zakatDueLabel}</div>
              <div className="text-2xl font-bold text-brand-700">{fmt(result.zakatDue)}</div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {z.belowNisabMsg}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">{z.footerNote}</p>
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
