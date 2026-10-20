"""Free News and Corporate Developments Provider via Google News RSS.

Fetches recent news items and press releases for Indian equities without API keys.
"""

import asyncio
import logging
from typing import Any, Dict, List
import urllib.parse
import feedparser

logger = logging.getLogger("bharatequity.data.news")


def _fetch_google_news_rss_sync(query: str, max_items: int = 10) -> List[Dict[str, Any]]:
    """Parse Google News RSS feed for given search query."""
    try:
        encoded_query = urllib.parse.quote(query)
        feed_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
        feed = feedparser.parse(feed_url)

        articles = []
        for entry in feed.entries[:max_items]:
            articles.append({
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "published": entry.get("published", ""),
                "source": entry.get("source", {}).get("title", "News Source"),
                "summary": entry.get("summary", "")
            })
        return articles
    except Exception as err:
        logger.warning(f"Error fetching Google News RSS for query '{query}': {err}")
        return []


async def fetch_stock_recent_news(company_name: str, symbol: str, max_items: int = 8) -> List[Dict[str, Any]]:
    """Fetch recent news articles for a company using async background thread."""
    # Query prioritizing financial and exchange context in India
    query = f"{company_name} share stock NSE"
    loop = asyncio.get_running_loop()
    articles = await loop.run_in_executor(None, _fetch_google_news_rss_sync, query, max_items)
    
    # If company name query returns 0 items, fallback to symbol query
    if not articles:
        query_sym = f"{symbol} stock price NSE"
        articles = await loop.run_in_executor(None, _fetch_google_news_rss_sync, query_sym, max_items)

    return articles
