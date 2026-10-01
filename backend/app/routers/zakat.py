from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/api/zakat", tags=["zakat"])

GRAMS_PER_TROY_OUNCE = 31.1034768


async def fetch_metal_prices(currency: str = "NGN"):
    """Fetch live gold/silver prices with provider fallbacks.

    Gold price is fetched in USD per troy ounce, then converted to the
    requested currency and per-gram value.
    """
    currency = (currency or "NGN").strip().upper()

    if len(currency) != 3 or not currency.isalpha():
        return {
            "currency": currency,
            "gold_price_per_gram": None,
            "silver_price_per_gram": None,
        }

    gold_usd_oz = None
    silver_usd_oz = None

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(10.0, connect=5.0),
        follow_redirects=True,
        headers={"User-Agent": "Faraid-AI/1.0"},
    ) as client:

        # Provider 1: goldprice.org
        try:
            r = await client.get(
                "https://data-asg.goldprice.org/dbXRates/USD"
            )
            r.raise_for_status()
            data = r.json()
            item = (data.get("items") or [{}])[0]

            gold_usd_oz = item.get("xauPrice")
            silver_usd_oz = item.get("xagPrice")
        except Exception:
            pass

        # Provider 2: GoldAPI-compatible public endpoint fallback.
        # This is only used when provider 1 did not return a gold price.
        if gold_usd_oz is None:
            try:
                r = await client.get(
                    "https://api.gold-api.com/price/XAU"
                )
                r.raise_for_status()
                data = r.json()

                gold_usd_oz = (
                    data.get("price")
                    or data.get("value")
                )
            except Exception:
                pass

        # Provider 3: another public gold quote fallback.
        if gold_usd_oz is None:
            try:
                r = await client.get(
                    "https://api.metals.live/v1/spot"
                )
                r.raise_for_status()
                data = r.json()

                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            if "gold" in item:
                                gold_usd_oz = item["gold"]
                            if "silver" in item:
                                silver_usd_oz = item["silver"]
            except Exception:
                pass

        # USD -> requested currency.
        if currency == "USD":
            fx_rate = 1.0
        else:
            fx_rate = None

            # Primary FX provider.
            try:
                r = await client.get(
                    f"https://open.er-api.com/v6/latest/USD"
                )
                r.raise_for_status()
                data = r.json()
                fx_rate = data.get("rates", {}).get(currency)
            except Exception:
                pass

            # FX fallback.
            if fx_rate is None:
                try:
                    r = await client.get(
                        f"https://api.frankfurter.app/latest?from=USD&to={currency}"
                    )
                    r.raise_for_status()
                    data = r.json()
                    fx_rate = data.get("rates", {}).get(currency)
                except Exception:
                    pass

    def to_gram_price(usd_per_oz):
        if usd_per_oz is None or fx_rate is None:
            return None

        try:
            return round(
                (float(usd_per_oz) / GRAMS_PER_TROY_OUNCE)
                * float(fx_rate),
                4,
            )
        except (TypeError, ValueError):
            return None

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
