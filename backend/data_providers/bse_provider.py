"""Free BSE Corporate Disclosures and Announcements Provider.

Fetches regulatory announcements and corporate filings from the official BSE public JSON endpoints.
Uses the 6-digit BSE Scrip Code stored in the SQLite catalog.
"""

import logging
from typing import Any, Dict, List, Optional
import httpx

logger = logging.getLogger("bharatequity.data.bse")


async def fetch_bse_corporate_announcements(scrip_code: Optional[str], max_items: int = 6) -> List[Dict[str, Any]]:
    """Fetch recent corporate filings, board meeting outcomes, and announcements for a BSE scrip code."""
    if not scrip_code or not scrip_code.isdigit():
        return []

    url = "https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w"
    params = {
        "pageno": "1",
        "strCat": "-1",
        "strPrevDate": "",
        "strScrip": scrip_code.strip(),
        "strSearch": "P",
        "strToDate": "",
        "strType": "C",
        "subcategory": ""
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.bseindia.com/"
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                table = data.get("Table", [])
                announcements = []
                for item in table[:max_items]:
                    announcements.append({
                        "category": item.get("CATEGORYNAME", "Corporate Action"),
                        "headline": item.get("HEADLINE", ""),
                        "details": item.get("MORE", "") or item.get("NEWS_SUB", ""),
                        "time": item.get("NEWS_DT", "")
                    })
                return announcements
    except Exception as e:
        logger.debug(f"BSE announcements fetch skipped/failed for {scrip_code}: {e}")
    return []
