from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/api/zakat", tags=["zakat"])

GRAMS_PER_TROY_OUNCE = 31.1034768


@router.get("/prices")
async def get_metal_prices(currency: str = "NGN"):
    """Live gold & silver price per gram, converted to the requested
    currency. Uses free, no-API-key public sources. Fails gracefully
    (returns null prices + available=False) if a source is down, so the
    frontend can fall back to manual entry instead of breaking."""
    currency = currency.upper()
    gold_usd_oz = None
    silver_usd_oz = None
    fx_rate = 1.0 if currency == "USD" else None

    async with httpx.AsyncClient(timeout=8) as client:
        try:
            r = await client.get("https://data-asg.goldprice.org/dbXRates/USD")
            data = r.json()
            item = data["items"][0]
            gold_usd_oz = item.get("xauPrice")
            silver_usd_oz = item.get("xagPrice")
        except Exception:
            pass

        if currency != "USD":
            try:
                r = await client.get("https://open.er-api.com/v6/latest/USD")
                data = r.json()
                fx_rate = data.get("rates", {}).get(currency)
            except Exception:
                fx_rate = None

    def to_gram_price(usd_per_oz):
        if usd_per_oz is None or fx_rate is None:
            return None
        return round((usd_per_oz / GRAMS_PER_TROY_OUNCE) * fx_rate, 4)

    gold_price_per_gram = to_gram_price(gold_usd_oz)
    silver_price_per_gram = to_gram_price(silver_usd_oz)

    return {
        "currency": currency,
        "gold_price_per_gram": gold_price_per_gram,
        "silver_price_per_gram": silver_price_per_gram,
        "available": gold_price_per_gram is not None and silver_price_per_gram is not None,
    }
