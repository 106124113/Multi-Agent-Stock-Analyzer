"""Decision Making Agent Roles:
1. Bull Researcher
2. Bear Researcher
3. Execution Trader
4. Risk Analyst
5. Portfolio Manager (CIO)
"""

from typing import Any, Dict, List
from agents.base import BaseAgent, AgentOutput

from backend.rag_engine import LocalRAGEngine

# Initialize local ChromaDB RAG engine instance
rag_engine = LocalRAGEngine()


class BullResearcherAgent(BaseAgent):
    """Formulates the thesis-driven bullish upside case, then defends it in rebuttals."""

    def __init__(self):
        super().__init__(name="Bull Researcher", role="Bull Researcher")

    def get_system_prompt(self) -> str:
        return (
            "You are the Bull Researcher at BharatEquity. "
            "Your objective is to identify asymmetric upside potential, competitive advantages (economic moats), "
            "operating leverage, and expansion catalysts based on financial evidence and vector store filings. "
            "Never fabricate numbers. Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        symbol = company_context.get("symbol", "")
        bear_case = evidence.get("bear_thesis")

        # RAG Query for moats, expansion plans, and pricing power
        rag_snippets = rag_engine.query_docs(
            ticker=symbol,
            query_text="competitive advantage economic moat market leadership capacity expansion pricing power revenue growth catalysts",
            n_results=2
        )
        rag_text = "\n---\n".join(rag_snippets) if rag_snippets else "No local annual report or filing snippets retrieved from vector store."

        if bear_case:
            return (
                f"REBUTTAL STAGE: Formulate counter-arguments for {company_context.get('company_name')} "
                f"({symbol}) against this Bear Case:\n{bear_case}\n\n"
                f"[LOCAL VECTOR STORE / BULLISH RAG EVIDENCE]:\n{rag_text}\n\n"
                "Provide evidence-backed rebuttals defending the long-term compounding thesis."
            )
        return (
            f"INITIAL THESIS: Formulate the independent Bull Thesis for {company_context.get('company_name')} "
            f"({symbol}), sector: {company_context.get('sector')}.\n\n"
            f"[LOCAL VECTOR STORE / BULLISH RAG EVIDENCE]:\n{rag_text}\n\n"
            "Detail the moat, revenue catalysts, and margin expansion potential."
        )

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        sym = company_context.get("symbol", "STOCK")
        name = company_context.get("company_name", sym)
        sec = company_context.get("sector") or "its sector"
        is_rebuttal = bool(evidence.get("bear_thesis"))

        findings = [
            f"Competitive Moat: {name} benefits from strong brand recall and entrenched distribution across Indian tier-1/2/3 markets.",
            "Operating Leverage: Fixed asset turnover expansion expected as incremental demand scales without proportional capex.",
            f"Structural Tailwinds: Well positioned to capture domestic demand growth in {sec}."
        ]
        if is_rebuttal:
            findings.append("Rebuttal to Bear: Downside risks from short-term margin compression are counteracted by pricing power.")

        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Bullish investment case synthesized for {name} ({sym}).",
            findings=findings,
            supporting_evidence=[
                f"Listed status on {company_context.get('exchange')}",
                "Historical resilience through Indian economic recovery cycles"
            ],
            assumptions=["Company sustains core market share without catastrophic regulatory shock."],
            missing_information=["Disaggregated export vs domestic margin differentials."],
            confidence_score=0.75,
            confidence_explanation="High conviction in long-term secular growth drivers in Indian economy.",
            questions_for_investigation=[
                "Can operating cash flow sustain projected dividend payouts while funding capacity expansion?",
                "What pricing power does the company maintain against regional unorganized competitors?"
            ],
            role_specific_data={"thesis_type": "Rebuttal" if is_rebuttal else "Initial Thesis", "target_bias": "Bullish"},
            execution_status="dev_stub"
        )


class BearResearcherAgent(BaseAgent):
    """Formulates the adversarial thesis-driven downside case, stress-testing vulnerabilities."""

    def __init__(self):
        super().__init__(name="Bear Researcher", role="Bear Researcher")

    def get_system_prompt(self) -> str:
        return (
            "You are the Bear Researcher at BharatEquity. "
            "Your objective is to stress-test vulnerabilities, uncover hidden debt, analyze margin compression risks, "
            "governance concerns, and valuation overextension using risk filings. "
            "Never fabricate numbers. Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        symbol = company_context.get("symbol", "")
        bull_case = evidence.get("bull_thesis")

        # RAG Query for risks, contingent liabilities, margin pressure, and litigation
        rag_snippets = rag_engine.query_docs(
            ticker=symbol,
            query_text="risk factors contingent liabilities margin compression raw material inflation debt covenants litigation competitive threats",
            n_results=2
        )
        rag_text = "\n---\n".join(rag_snippets) if rag_snippets else "No local annual report risk snippets retrieved from vector store."

        if bull_case:
            return (
                f"REBUTTAL STAGE: Formulate counter-arguments for {company_context.get('company_name')} "
                f"({symbol}) against this Bull Case:\n{bull_case}\n\n"
                f"[LOCAL VECTOR STORE / BEARISH RAG EVIDENCE]:\n{rag_text}\n\n"
                "Highlight execution bottlenecks, valuation risks, and competitive threats."
            )
        return (
            f"INITIAL THESIS: Formulate the independent Bear Thesis for {company_context.get('company_name')} "
            f"({symbol}), sector: {company_context.get('sector')}.\n\n"
            f"[LOCAL VECTOR STORE / BEARISH RAG EVIDENCE]:\n{rag_text}\n\n"
            "Detail structural headwinds, competitive threats, and downside scenarios."
        )

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        sym = company_context.get("symbol", "STOCK")
        name = company_context.get("company_name", sym)
        is_rebuttal = bool(evidence.get("bull_thesis"))

        findings = [
            "Valuation Vulnerability: Premium multiples leave zero margin of safety against potential quarterly execution slips.",
            "Input Cost Exposure: Volatility in commodity inputs and wage inflation can compress operating margins unexpectedly.",
            "Disruptive Competition: Aggressive price discounting by new entrants poses market share erosion risks."
        ]
        if is_rebuttal:
            findings.append("Rebuttal to Bull: Moats are not permanent; capex cycles in Indian markets frequently experience execution delays.")

        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Bearish vulnerability audit completed for {name} ({sym}).",
            findings=findings,
            supporting_evidence=[
                "Cyclical nature of industrial margin cycles",
                "Historical sensitivity to global macroeconomic tightening"
            ],
            assumptions=["Operating margin guidance may prove optimistic if raw materials inflate >10%."],
            missing_information=["Granular customer concentration data (top 5 clients revenue share)."],
            confidence_score=0.70,
            confidence_explanation="Strong structural rationale for downside protection and margin scrutiny.",
            questions_for_investigation=[
                "What is the break-even capacity utilization level under adverse demand shocks?",
                "Are there contingent liabilities or tax disputes disclosed in notes to accounts?"
            ],
            role_specific_data={"thesis_type": "Rebuttal" if is_rebuttal else "Initial Thesis", "target_bias": "Bearish"},
            execution_status="dev_stub"
        )


class TraderAgent(BaseAgent):
    """Evaluates practical market execution, entry timing, liquidity buffers, and horizon."""

    def __init__(self):
        super().__init__(name="Execution Trader", role="Trader")

    def get_system_prompt(self) -> str:
        return (
            "You are the Execution Trader at BharatEquity. "
            "Analyze trade timing, liquidity constraints, order execution strategy (TWAP/VWAP), "
            "and portfolio accumulation pacing. Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        return f"Determine optimal execution pacing and accumulation strategy for {company_context.get('symbol')} on {company_context.get('exchange')}."

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        exch = company_context.get("exchange", "NSE")
        sym = company_context.get("symbol")
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Execution plan formulated for {sym} on {exch}.",
            findings=[
                f"Primary trading liquidity venue: {exch}. Order execution recommended via staged limit orders to minimize market impact.",
                "Accumulation strategy: Phased tranche buying across 3 to 6 trading weeks rather than lump-sum execution.",
                "Slippage mitigation: Avoid market orders during market open (9:15-9:45 AM) to guard against opening volatility."
            ],
            supporting_evidence=[f"Exchange series: {company_context.get('series', 'EQ')}"],
            assumptions=["Standard market hours order book depth is sufficient for institutional tranche entry."],
            missing_information=["Live tick-by-tick bid/ask spread and order book depth (Level 2)."],
            confidence_score=0.8,
            confidence_explanation="Execution rules established based on standard Indian equity microstructure.",
            questions_for_investigation=[
                "What is the average impact cost for executing a 0.5% portfolio allocation in this scrip?",
                "Is there substantial arbitrage spread between NSE and BSE order books?"
            ],
            role_specific_data={"execution_strategy": "Phased Tranche Accumulation", "order_type": "Limit / VWAP"},
            execution_status="dev_stub"
        )


class RiskAnalystAgent(BaseAgent):
    """Independent auditor of tail risks, regulatory exposure, and portfolio drawdown probability."""

    def __init__(self):
        super().__init__(name="Risk Analyst", role="Risk Analyst")

    def get_system_prompt(self) -> str:
        return (
            "You are the independent Risk Analyst at BharatEquity. "
            "You operate with strict independence from the Bull and Bear debaters. "
            "Evaluate catastrophic tail risks, regulatory and legal exposure, leverage/covenant breaches, "
            "and liquidity drawdown risk using local vector store disclosures. Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        symbol = company_context.get("symbol", "")

        # RAG Query for regulatory and covenant litigation
        rag_snippets = rag_engine.query_docs(
            ticker=symbol,
            query_text="regulatory compliance SEBI investigation tax litigation legal dispute covenant breach debt default statutory liability",
            n_results=2
        )
        rag_text = "\n---\n".join(rag_snippets) if rag_snippets else "No local legal/regulatory filings retrieved from vector store."

        return (
            f"Perform independent risk and stress-test assessment for {company_context.get('company_name')} ({symbol}).\n\n"
            f"[LOCAL VECTOR STORE / RISK & REGULATORY RAG SNIPPETS]:\n{rag_text}\n\n"
            "Assess tail risks, debt covenants, and regulatory compliance status."
        )

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        sym = company_context.get("symbol")
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Independent risk matrix evaluated for {sym}.",
            findings=[
                "Regulatory Risk: Scrutiny under SEBI disclosure norms and sectoral regulatory frameworks.",
                "Macro Sensitivities: Sensitivity to Indian interest rate trajectory and currency (USD/INR) fluctuations.",
                "Tail Risk: Extreme downside bounded by asset backing, balance-sheet leverage, and statutory debt covenants."
            ],
            supporting_evidence=["Capital market risk taxonomy for Indian listed corporate entities."],
            assumptions=["Standard statutory compliances are actively maintained."],
            missing_information=["Contingent liabilities schedule from recent notes to financial statements."],
            confidence_score=0.82,
            confidence_explanation="High confidence in systemic and regulatory risk classification.",
            questions_for_investigation=[
                "Are debt covenants tied to minimum EBITDA thresholds that could be breached in a downturn?",
                "What is the total value of ongoing tax or legal litigation under appeal?"
            ],
            role_specific_data={"risk_level": "Moderate", "surveillance_status": "Clean"},
            execution_status="dev_stub"
        )


class PortfolioManagerAgent(BaseAgent):
    """Synthesizes all findings, preserves unresolvable debate divergences, and determines asset conviction."""

    def __init__(self):
        super().__init__(name="Portfolio Manager", role="Portfolio Manager")

    def get_system_prompt(self) -> str:
        return (
            "You are the Portfolio Manager at BharatEquity. "
            "Synthesize all agent inputs, balance the Bull vs Bear adversarial debate, preserve unresolvable "
            "conflicts when evidence is insufficient, and assign capital allocation conviction without resorting "
            "to a naive majority vote. Respond strictly in JSON matching AgentOutput."
        )

    def get_user_prompt(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        symbol = company_context.get("symbol", "")

        # RAG Query for overall management guidance, governance, and capital allocation
        rag_snippets = rag_engine.query_docs(
            ticker=symbol,
            query_text="management outlook strategic direction capital allocation dividend policy corporate governance long term vision",
            n_results=2
        )
        rag_text = "\n---\n".join(rag_snippets) if rag_snippets else "No local annual report executive summaries retrieved from vector store."

        return (
            f"Synthesize comprehensive investment decision for {company_context.get('company_name')} "
            f"({symbol} on {company_context.get('exchange')}).\n\n"
            f"[LOCAL VECTOR STORE / EXECUTIVE SUMMARY RAG SNIPPETS]:\n{rag_text}\n\n"
            f"Sub-agent findings summary:\n{evidence.get('synthesis_inputs', {})}"
        )

    def get_development_stub(self, company_context: Dict[str, Any], evidence: Dict[str, Any]) -> AgentOutput:
        sym = company_context.get("symbol")
        name = company_context.get("company_name", sym)
        return AgentOutput(
            agent_name=self.name,
            role=self.role,
            summary=f"Final portfolio synthesis formulated for {name} ({sym}).",
            findings=[
                "Strategic Franchise Evaluation: Durable fundamental positioning balanced against realistic cyclical downside risks.",
                "Divergence Preservation: Bull thesis highlights long-term compounding moat; Bear thesis underscores premium valuation vulnerability.",
                "Capital Allocation Recommendation: Accumulate cautiously in phased tranches on valuation pullbacks."
            ],
            supporting_evidence=[
                "Synthesis of 12 preceding multi-agent analytical evaluations",
                f"Official security master confirmation on {company_context.get('exchange')}"
            ],
            assumptions=["Investment horizon is oriented for long-term compounders (3-5+ years)."],
            missing_information=["Granular quarterly filings and live transcript audio ingest."],
            confidence_score=0.80,
            confidence_explanation="Balanced multi-agent synthesis incorporating both upside moats and downside margin stress tests.",
            questions_for_investigation=[
                "Will management guidance in the upcoming financial quarter validate the margin expansion thesis?",
                "Are institutional mutual funds increasing or decreasing weight in this scrip?"
            ],
            role_specific_data={
                "recommendation": "Constructive on Pullbacks",
                "conviction_tier": "Tier-2 Watchlist / Phased Accumulation",
                "debate_status": "Disagreements preserved regarding valuation margin of safety"
            },
            execution_status="dev_stub"
        )