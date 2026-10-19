"""Deterministic Financial Calculations Module for BharatEquity.

Ensures LLMs (e.g. Qwen3 4B) receive verified ratios and metrics rather
than computing multi-step arithmetic prone to hallucination.
"""

from typing import Any, Dict, Optional


def safe_div(numerator: Optional[float], denominator: Optional[float], default: Optional[float] = None) -> Optional[float]:
    """Safe division avoiding ZeroDivisionError or None inputs."""
    if numerator is None or denominator is None:
        return default
    if abs(denominator) < 1e-9:
        return default
    return numerator / denominator


def calculate_financial_metrics(financials: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes key financial ratios deterministically:
    - Debt-to-Equity
    - Interest Coverage Ratio (EBIT / Interest Expense)
    - ROCE vs Estimated WACC spread
    - PEG Ratio (P/E / EPS Growth Rate)
    - Valuation metrics & margins
    """
    total_debt = financials.get("total_debt")
    equity = financials.get("total_equity") or financials.get("shareholders_equity")
    ebit = financials.get("ebit") or financials.get("operating_profit")
    interest_expense = financials.get("interest_expense") or financials.get("finance_costs")
    roce = financials.get("roce_pct")  # as percentage, e.g. 18.5
    estimated_wacc = financials.get("estimated_wacc_pct", 10.5)  # default Indian equity cost of capital ~10.5%
    pe_ratio = financials.get("pe_ratio")
    eps_growth_3yr = financials.get("eps_cagr_3yr_pct")
    revenue = financials.get("revenue")
    pat = financials.get("pat") or financials.get("net_profit")
    ebitda = financials.get("ebitda")

    debt_to_equity = safe_div(total_debt, equity)
    interest_coverage = safe_div(ebit, interest_expense)
    
    roce_wacc_spread = None
    if roce is not None and estimated_wacc is not None:
        roce_wacc_spread = round(roce - estimated_wacc, 2)

    peg_ratio = safe_div(pe_ratio, eps_growth_3yr)

    net_margin_pct = None
    if pat is not None and revenue:
        net_margin_pct = round((pat / revenue) * 100.0, 2)

    ebitda_margin_pct = None
    if ebitda is not None and revenue:
        ebitda_margin_pct = round((ebitda / revenue) * 100.0, 2)

    return {
        "debt_to_equity": round(debt_to_equity, 2) if debt_to_equity is not None else None,
        "interest_coverage": round(interest_coverage, 2) if interest_coverage is not None else None,
        "roce_pct": roce,
        "estimated_wacc_pct": estimated_wacc,
        "roce_wacc_spread": roce_wacc_spread,
        "peg_ratio": round(peg_ratio, 2) if peg_ratio is not None else None,
        "net_margin_pct": net_margin_pct,
        "ebitda_margin_pct": ebitda_margin_pct,
        "is_solvent": interest_coverage > 2.5 if interest_coverage is not None else None,
        "is_value_creating": roce_wacc_spread > 0 if roce_wacc_spread is not None else None,
    }
