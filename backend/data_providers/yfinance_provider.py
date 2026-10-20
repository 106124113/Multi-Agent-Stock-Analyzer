"""Free Market and Financial Data Provider via Yahoo Finance (yfinance).

Supports Indian tickers on NSE (.NS) and BSE (.BO).
Fetches:
- Real-time quote and valuation statistics (P/E, P/B, EV/EBITDA, 52W High/Low, Beta)
- 1-Year historical OHLCV candles, 50-DMA, 200-DMA
- Financial statements (Balance Sheet, P&L, Cash Flow)
"""

import asyncio
import logging
from typing import Any, Dict, Optional
import yfinance as yf

logger = logging.getLogger("bharatequity.data.market")


def get_yfinance_symbol(symbol: str, exchange: str = "NSE") -> str:
    """Map Indian exchange ticker to yfinance ticker suffix."""
    clean_sym = symbol.strip().upper()
    exch_clean = exchange.strip().upper() if exchange else "NSE"
    if exch_clean == "BSE":
        return f"{clean_sym}.BO"
    return f"{clean_sym}.NS"


def _fetch_yfinance_data_sync(yf_ticker: str) -> Dict[str, Any]:
    """Synchronous fetcher wrapped in threadpool by caller."""
    try:
        ticker = yf.Ticker(yf_ticker)
        fast_info = getattr(ticker, "fast_info", None)
        info = {}
        try:
            info = ticker.info or {}
        except Exception as e:
            logger.debug(f"Could not load full ticker.info for {yf_ticker}: {e}")

        # Extract current price and basic stats
        cmp_price = None
        if fast_info:
            cmp_price = getattr(fast_info, "last_price", None) or getattr(fast_info, "previous_close", None)
        if not cmp_price and info:
            cmp_price = info.get("currentPrice") or info.get("regularMarketPrice")

        # 1-Year Historical Price OHLCV for Technical/Market Analyst
        hist_1y = ticker.history(period="1y")
        dma_50 = None
        dma_200 = None
        year_high = None
        year_low = None
        vol_avg_30d = None

        if not hist_1y.empty and len(hist_1y) > 0:
            closes = hist_1y["Close"]
            if len(closes) >= 50:
                dma_50 = round(float(closes.tail(50).mean()), 2)
            if len(closes) >= 200:
                dma_200 = round(float(closes.tail(200).mean()), 2)
            year_high = round(float(closes.max()), 2)
            year_low = round(float(closes.min()), 2)
            if "Volume" in hist_1y.columns and len(hist_1y) >= 30:
                vol_avg_30d = int(hist_1y["Volume"].tail(30).mean())

        # Financial Statements Extraction (Most recent fiscal year)
        fin_dict = {}
        try:
            bs = ticker.balance_sheet
            inc = ticker.income_stmt
            cf = ticker.cashflow

            if not inc.empty and len(inc.columns) > 0:
                latest_col = inc.columns[0]
                # Extract key income items
                for k in ["Total Revenue", "Operating Revenue", "Revenue"]:
                    if k in inc.index:
                        fin_dict["revenue"] = float(inc.loc[k, latest_col])
                        break
                for k in ["EBITDA", "Normalized EBITDA"]:
                    if k in inc.index:
                        fin_dict["ebitda"] = float(inc.loc[k, latest_col])
                        break
                for k in ["EBIT", "Operating Income"]:
                    if k in inc.index:
                        fin_dict["ebit"] = float(inc.loc[k, latest_col])
                        break
                for k in ["Net Income", "Net Income Common Stockholders"]:
                    if k in inc.index:
                        fin_dict["pat"] = float(inc.loc[k, latest_col])
                        break
                for k in ["Interest Expense", "Interest Expense Non Operating"]:
                    if k in inc.index:
                        fin_dict["interest_expense"] = float(abs(inc.loc[k, latest_col]))
                        break

            if not bs.empty and len(bs.columns) > 0:
                latest_col = bs.columns[0]
                for k in ["Total Debt", "Long Term Debt And Capital Lease Obligation"]:
                    if k in bs.index:
                        fin_dict["total_debt"] = float(bs.loc[k, latest_col])
                        break
                for k in ["Stockholders Equity", "Total Equity Gross Minority Interest", "Common Stock Equity"]:
                    if k in bs.index:
                        fin_dict["total_equity"] = float(bs.loc[k, latest_col])
                        break

            if not cf.empty and len(cf.columns) > 0:
                latest_col = cf.columns[0]
                for k in ["Operating Cash Flow", "Cash Flowsfromusedin Operating Activities"]:
                    if k in cf.index:
                        fin_dict["cfo"] = float(cf.loc[k, latest_col])
                        break
                for k in ["Capital Expenditure", "Capital Expenditure Reported"]:
                    if k in cf.index:
                        fin_dict["capex"] = float(abs(cf.loc[k, latest_col]))
                        break

            # Calculate free cash flow if available
            if "cfo" in fin_dict and "capex" in fin_dict:
                fin_dict["free_cash_flow"] = round(fin_dict["cfo"] - fin_dict["capex"], 2)

        except Exception as e:
            logger.debug(f"Could not load financial statements for {yf_ticker}: {e}")

        # Valuation Multiples & Ratios from Info
        pe_ratio = info.get("trailingPE") or info.get("forwardPE")
        pb_ratio = info.get("priceToBook")
        ev_ebitda = info.get("enterpriseToEbitda")
        market_cap = info.get("marketCap")
        beta = info.get("beta")
        dividend_yield = info.get("dividendYield")
        sector = info.get("sector")
        industry = info.get("industry")

        return {
            "source": "Yahoo Finance (Free)",
            "yf_ticker": yf_ticker,
            "current_price": round(float(cmp_price), 2) if cmp_price else None,
            "currency": info.get("currency", "INR"),
            "market_cap": market_cap,
            "pe_ratio": round(float(pe_ratio), 2) if pe_ratio else None,
            "pb_ratio": round(float(pb_ratio), 2) if pb_ratio else None,
            "ev_ebitda": round(float(ev_ebitda), 2) if ev_ebitda else None,
            "beta": round(float(beta), 2) if beta else None,
            "dividend_yield_pct": round(float(dividend_yield) * 100, 2) if dividend_yield else None,
            "year_high": year_high,
            "year_low": year_low,
            "dma_50": dma_50,
            "dma_200": dma_200,
            "avg_volume_30d": vol_avg_30d,
            "financials": fin_dict,
            "sector": sector,
            "industry": industry,
            "status": "success",
        }

    except Exception as err:
        logger.warning(f"Failed fetching yfinance data for {yf_ticker}: {err}")
        return {
            "source": "Yahoo Finance (Free)",
            "yf_ticker": yf_ticker,
            "status": "unavailable",
            "error": str(err),
            "financials": {}
        }


async def fetch_stock_market_and_financials(symbol: str, exchange: str = "NSE") -> Dict[str, Any]:
    """Asynchronous wrapper to fetch yfinance data in background thread without blocking event loop."""
    yf_symbol = get_yfinance_symbol(symbol, exchange)
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _fetch_yfinance_data_sync, yf_symbol)
