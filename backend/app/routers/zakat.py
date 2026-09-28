from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/api/zakat", tags=["zakat"])

GRAMS_PER_TROY_OUNCE = 31.1034768


async def fetch_metal_prices(currency: str = "NGN"):
    """Fetch live gold/silver prices using the same source as the Zakat UI."""
    currency = currency.upper()
    gold_usd_oz = None
    silver_usd_oz = None
    fx_rate = 1.0 if currency == "USD" else None

    async with httpx.AsyncClient(timeout=8) as client:
        try:
            r = await client.get("https://data-asg.goldprice.org/dbXRates/USD")
            r.raise_for_status()
            data = r.json()
            item = data["items"][0]
            gold_usd_oz = item.get("xauPrice")
            silver_usd_oz = item.get("xagPrice")
        except Exception:
            pass

        if currency != "USD":
            try:
                r = await client.get("https://open.er-api.com/v6/latest/USD")
                r.raise_for_status()
                data = r.json()
                fx_rate = data.get("rates", {}).get(currency)
            except Exception:
                fx_rate = None

    def to_gram_price(usd_per_oz):
        if usd_per_oz is None or fx_rate is None:
            return None
        return round((usd_per_oz / GRAMS_PER_TROY_OUNCE) * fx_rate, 4)

    return {
        "currency": currency,
        "gold_price_per_gram": to_gram_price(gold_usd_oz),
        "silver_price_per_gram": to_gram_price(silver_usd_oz),
    }


@router.get("/prices")
async def get_metal_prices(currency: str = "NGN"):
    prices = await fetch_metal_prices(currency)
    gold_price = prices["gold_price_per_gram"]
    silver_price = prices["silver_price_per_gram"]
    return {
        **prices,
        "available": gold_price is not None and silver_price is not None,
    }
