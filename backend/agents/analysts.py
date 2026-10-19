"""Specialized Analyst Agent Roles (1-8):
1. Research Manager
2. Data & Evidence Verification Analyst
3. Fundamentals & Business Quality Analyst
4. Growth & Industry Analyst
5. News, Corporate Events & Earnings-Call Analyst
6. Social Sentiment Analyst
7. Market Analyst
8. Peer Benchmarking & Valuation Analyst
"""

from typing import Any, Dict, List
from agents.base import BaseAgent, AgentOutput


class ResearchManagerAgent(BaseAgent):
    """Coordinates research, manages dependencies, and tracks overall analytical progress."""

    def __init__(self):
        super().__init__(name="Research Manager", role="Research Manager & Orchestrator")

    def get_system_prompt(self) -> str:
        return (
            "You are the Research Manager & Orchestrator for BharatEquity, an institutional Indian equity platform. "
            "Your job is to define the research scope, outline critical investigation hypotheses, "
            "and identify key analytical bottlenecks based on company profile and available exchange data. "
            "Respond strictly in JSON matching the AgentOutput schema."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        return (
            f"Set up the research agenda for {company_context.get('company_name')} "
            f"({company_context.get('symbol')} on {company_context.get('exchange')}). "
            f"Sector: {company_context.get('sector') or company_context.get('industry')}. "
            f"ISIN: {company_context.get('isin')}. "
            "Identify 3 core investment hypotheses and define the data dependencies for specialized analysts."
        )

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        sym = company_context.get("symbol", "EQUITY")
        exch = company_context.get("exchange", "NSE")
        name = company_context.get("company_name", sym)
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Coordinated initial research agenda for {name} ({sym} on {exch}).",
            findings=[
                f"Resolved primary security master listing: {sym} ({exch}) with ISIN {company_context.get('isin') or 'Unspecified'}.",
                "Initiated parallel factual verification, fundamental diagnostics, and growth modeling.",
                "Orchestrated two-stage independent Bull vs Bear thesis generation to prevent analytical cross-contamination."
            ],
            supporting_evidence=[f"Exchange Master Entry: {company_context.get('data_source', 'Database')}"],
            assumptions=["Target company operates as an ongoing entity under SEBI listing regulations."],
            missing_information=["Full live quarterly XBRL balance-sheet disclosures pending real-time data integration."],
            confidence_score=0.9,
            confidence_explanation="High confidence in catalog metadata resolution and research framework assignment.",
            questions_for_investigation=[
                f"What are the highest-priority capital allocation drivers for {sym} over the next 3 financial years?",
                "Are there pending litigation or regulatory filings impacting ongoing operations?"
            ],
            role_specific_data={"stage": "Orchestration & Agenda Formulation", "total_subagents_assigned": 12},
            execution_status="dev_stub"
        )


class EvidenceVerificationAnalyst(BaseAgent):
    """Distinguishes verified factual evidence from unverified claims, rumors, and gaps."""

    def __init__(self):
        super().__init__(name="Evidence Verification Analyst", role="Data & Evidence Verification Analyst")

    def get_system_prompt(self) -> str:
        return (
            "You are the Data & Evidence Verification Analyst at BharatEquity. "
            "You rigorously audit data integrity, distinguish official exchange disclosures from media claims, "
            "and explicitly flag data limitations, unverified assumptions, and missing filings. "
            "Never fabricate financial numbers. Respond strictly in JSON matching the AgentOutput schema."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        return (
            f"Verify evidence for {company_context.get('company_name')} ({company_context.get('symbol')}). "
            f"Available Data: {company_context}. Evaluate whether the company record is verified on {company_context.get('exchange')} "
            "and identify what essential evidence is missing for a full institutional audit."
        )

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        isin = company_context.get("isin")
        source = company_context.get("data_source", "Catalog")
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary="Verified security master provenance and identified information boundaries.",
            findings=[
                f"Verified official exchange listing on {company_context.get('exchange')}.",
                f"ISIN validation: {isin if isin else 'ISIN is missing from source listing file.'}",
                f"Source provenance verified against {source}."
            ],
            supporting_evidence=[f"Catalog Source Record: {source}"],
            assumptions=["Exchange master files reflect the latest SEBI active surveillance classifications."],
            missing_information=[
                "Audited annual report (Form 20-F / MCA filings) not yet ingested into local vector index.",
                "Quarterly concall transcript audio/text not yet connected."
            ],
            confidence_score=0.85,
            confidence_explanation="High confidence regarding exchange listing parameters; financial statements await pipeline connection.",
            questions_for_investigation=[
                "Has SEBI or exchange surveillance placed this scrip under GSM/ASM surveillance stages?",
                "Are auditor qualifications present in the latest FY audit report?"
            ],
            role_specific_data={"isin_verified": bool(isin), "provenance_source": source},
            execution_status="dev_stub"
        )


class FundamentalsQualityAnalyst(BaseAgent):
    """Examines balance-sheet durability, cash conversion, and business quality."""

    def __init__(self):
        super().__init__(name="Fundamentals Analyst", role="Fundamentals & Business Quality Analyst")

    def get_system_prompt(self) -> str:
        return (
            "You are the Fundamentals & Business Quality Analyst at BharatEquity. "
            "Analyze business durability, return on capital employed (ROCE), debt solvency, working capital cycles, "
            "and free cash flow conversion. State clearly when audited numbers are unavailable. "
            "Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        return (
            f"Assess fundamental business quality for {company_context.get('company_name')} ({company_context.get('symbol')}). "
            f"Industry: {company_context.get('industry') or company_context.get('sector')}. "
            "State what fundamental criteria are necessary to assess this firm."
        )

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        sec = company_context.get("sector") or company_context.get("industry") or "Equity"
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Fundamental framework established for {company_context.get('symbol')} in {sec}.",
            findings=[
                f"Business operates in the {sec} sector with standard capital cycle characteristics.",
                "Capital intensity benchmark: sector median ROCE typically guides economic moat sustainability.",
                "Working capital requirement depends on distributor terms and inventory velocity."
            ],
            supporting_evidence=[f"Sector Classification: {sec}"],
            assumptions=["Operating margin resilience is benchmarked against peers in the same industry classification."],
            missing_information=[
                "Latest 5-year audited financial statements (P&L, Balance Sheet, Cash Flows).",
                "Segment-level profitability and working capital days breakdown."
            ],
            confidence_score=0.6,
            confidence_explanation="Moderate confidence; conceptual fundamental framework ready, awaiting live financial feed.",
            questions_for_investigation=[
                "What is the historical 5-year average Return on Capital Employed (ROCE) versus WACC?",
                "Has operating cash flow persistently covered maintenance capital expenditures?"
            ],
            role_specific_data={"sector": sec, "metric_baseline": "Awaiting Audited XBRL Data"},
            execution_status="dev_stub"
        )


class GrowthIndustryAnalyst(BaseAgent):
    """Evaluates macro trends, TAM expansion, and industry competitive positioning."""

    def __init__(self):
        super().__init__(name="Growth & Industry Analyst", role="Growth & Industry Analyst")

    def get_system_prompt(self) -> str:
        return (
            "You are the Growth & Industry Analyst at BharatEquity. "
            "Analyze market tailwinds, total addressable market (TAM), regulatory tailwinds (e.g. PLI schemes, Make in India), "
            "and sectoral growth vectors. Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        return (
            f"Evaluate growth catalysts for {company_context.get('company_name')} in {company_context.get('sector')} "
            f"under Indian macroeconomic expansion backdrop."
        )

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        sec = company_context.get("sector") or "Indian Economy"
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Assessed structural demand drivers and TAM opportunities in {sec}.",
            findings=[
                "Beneficiary of Indian domestic consumption expansion and formalization of supply chains.",
                "Capacity utilization trends in this sector dictate next round of greenfield capital expenditures.",
                "Policy tailwinds supported by domestic manufacturing initiatives and infrastructure capex."
            ],
            supporting_evidence=["Indian macroeconomic GDP growth rate and capex cycle indices."],
            assumptions=["Sector demand grows at least 1.2x to 1.5x real GDP growth."],
            missing_information=["Management forward revenue CAGR guidance and order-book backlog numbers."],
            confidence_score=0.7,
            confidence_explanation="Good visibility into sector-level macro drivers; firm-specific capacity ramp details pending.",
            questions_for_investigation=[
                "What is the company's estimated market share trajectory over the trailing 3 years?",
                "Are capacity bottlenecks emerging in key manufacturing or distribution hubs?"
            ],
            role_specific_data={"growth_drivers": ["Domestic TAM Expansion", "Digital Modernization", "Export Competitiveness"]},
            execution_status="dev_stub"
        )


class NewsCorporateEventsAnalyst(BaseAgent):
    """Scrutinizes exchange disclosures, block deals, and management commentary."""

    def __init__(self):
        super().__init__(name="News & Events Analyst", role="News, Corporate Events & Earnings-Call Analyst")

    def get_system_prompt(self) -> str:
        return (
            "You are the News, Corporate Events & Earnings-Call Analyst at BharatEquity. "
            "Analyze material disclosures, insider transactions (PIT regulations), board changes, and conference calls. "
            "Never fabricate news articles. If live feeds are absent, state the limitation clearly. "
            "Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        return f"Review event risks and regulatory disclosure requirements for {company_context.get('company_name')}."

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        sym = company_context.get("symbol")
        exch = company_context.get("exchange")
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Event monitoring active for {sym} on {exch}.",
            findings=[
                f"Regulatory filings monitored under SEBI (LODR) Regulations on {exch}.",
                "Corporate governance tracking requires audit of promoter pledging and board independence.",
                "Upcoming key event catalyst: Next scheduled quarterly financial results announcement."
            ],
            supporting_evidence=[f"Exchange Listing: {exch}"],
            assumptions=["Company remains compliant with periodic disclosure mandates."],
            missing_information=["Real-time BSE/NSE corporate announcement RSS/API feed not yet connected."],
            confidence_score=0.65,
            confidence_explanation="Event baseline established; real-time feeds await phase 3 API integration.",
            questions_for_investigation=[
                "Have promoters pledged any portion of their shareholding?",
                "Were there significant senior management resignations or CFO changes in the last 12 months?"
            ],
            role_specific_data={"event_category": "Corporate Disclosures & Surveillance"},
            execution_status="dev_stub"
        )


class SocialSentimentAnalyst(BaseAgent):
    """Gauges retail sentiment, community buzz, and extreme sentiment divergence."""

    def __init__(self):
        super().__init__(name="Social Sentiment Analyst", role="Social Sentiment Analyst")

    def get_system_prompt(self) -> str:
        return (
            "You are the Social Sentiment Analyst at BharatEquity. "
            "Analyze retail vs institutional sentiment, retail hype indicators, and contrarian sentiment divergences. "
            "Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        return f"Evaluate retail vs institutional sentiment dynamics for {company_context.get('symbol')}."

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        sym = company_context.get("symbol")
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Sentiment baseline established for {sym}.",
            findings=[
                "Retail interest strongly correlates with quarterly earnings surprises and breakout momentum.",
                "Extreme euphoria often coincides with elevated short-term valuation multiples.",
                "Institutional ownership stability acts as an anchor against retail sentiment volatility."
            ],
            supporting_evidence=["Historical retail volume share trends on Indian cash markets."],
            assumptions=["Current retail positioning is balanced without extreme retail mania."],
            missing_information=["Live social media sentiment feed (Twitter/X, ValuePickr, TradingView) not yet connected."],
            confidence_score=0.55,
            confidence_explanation="Sentiment methodology structured; live conversational feeds remain to be integrated.",
            questions_for_investigation=[
                "Is there high retail shareholder churn in recent quarterly shareholding patterns?",
                "Has Google Trends search volume spiked abnormally for the ticker or product brand?"
            ],
            role_specific_data={"sentiment_regime": "Neutral / Awaiting Live Feed"},
            execution_status="dev_stub"
        )


class MarketAnalyst(BaseAgent):
    """Monitors market microstructure, liquidity, delivery percentage, and technical structure."""

    def __init__(self):
        super().__init__(name="Market Analyst", role="Market Analyst")

    def get_system_prompt(self) -> str:
        return (
            "You are the Market Analyst at BharatEquity. "
            "Analyze trading liquidity, delivery volume percentage, beta, institutional absorption, and market microstructure. "
            "Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        return f"Evaluate liquidity profile and market microstructure for {company_context.get('symbol')} on {company_context.get('exchange')}."

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        exch = company_context.get("exchange", "NSE")
        series = company_context.get("series", "EQ")
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Market liquidity profile verified on {exch} (Series: {series}).",
            findings=[
                f"Listed under trading series '{series}' with continuous standard settlement.",
                f"Exchange trading venue: {exch} provides primary order book liquidity.",
                "Delivery volume percentage is the critical metric separating speculative turnover from institutional accumulation."
            ],
            supporting_evidence=[f"Exchange Series: {series}", f"Venue: {exch}"],
            assumptions=["Order book spread remains within standard institutional tolerance during market hours."],
            missing_information=["Daily Bhavcopy historical OHLCV and delivery volume time-series."],
            confidence_score=0.75,
            confidence_explanation="Listing settlement parameters verified from exchange master.",
            questions_for_investigation=[
                "What is the 30-day average daily delivery volume percentage?",
                "Does the stock trade at a premium/discount between NSE and BSE order books?"
            ],
            role_specific_data={"series": series, "settlement_cycle": "T+1"},
            execution_status="dev_stub"
        )


class PeerValuationAnalyst(BaseAgent):
    """Evaluates peer multiples, DCF baselines, and historical valuation percentiles."""

    def __init__(self):
        super().__init__(name="Valuation Analyst", role="Peer Benchmarking & Valuation Analyst")

    def get_system_prompt(self) -> str:
        return (
            "You are the Peer Benchmarking & Valuation Analyst at BharatEquity. "
            "Perform comparative multiples analysis (P/E, P/B, EV/EBITDA), cost of capital (WACC) baseline, "
            "and historical valuation percentile evaluation. Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        return f"Formulate valuation framework for {company_context.get('symbol')} in {company_context.get('sector')}."

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        sec = company_context.get("sector") or "Peer Group"
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Comparative valuation framework formulated for {company_context.get('symbol')} vs {sec} peers.",
            findings=[
                f"Valuation methodology balances relative peer multiples with discounted cash flow (DCF) assumptions.",
                "Indian 10-year sovereign bond yield serves as risk-free benchmark for equity risk premium (ERP).",
                "Sectoral premium/discount must be justified by return on invested capital (ROIC) spreads over WACC."
            ],
            supporting_evidence=[f"Peer Sector Baseline: {sec}"],
            assumptions=["Cost of Equity modeled with 10Y G-Sec yield baseline plus standard Indian ERP."],
            missing_information=["Audited consensus EPS estimates and live peer market capitalizations."],
            confidence_score=0.65,
            confidence_explanation="Valuation logic established; live consensus estimates awaiting market feed.",
            questions_for_investigation=[
                "Is the stock currently trading in the top or bottom decile of its 5-year historical P/E band?",
                "How does the forward PEG ratio compare against direct industry peers?"
            ],
            role_specific_data={"valuation_models": ["Relative P/E & EV/EBITDA", "Reverse DCF Implied Growth"]},
            execution_status="dev_stub"
        )
