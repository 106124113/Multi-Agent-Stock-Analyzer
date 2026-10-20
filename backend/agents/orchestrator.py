"""LangGraph StateGraph Multi-Agent Orchestrator for BharatEquity Platform.

Orchestrates all 13 specialized agents using LangGraph's StateGraph:
- Stage 0: Research Manager & Planning
- Stage 1: Parallel Evidence & Foundational Specialists
- Stage 2: Independent Thesis Generation (Bull & Bear concurrently without cross-contamination)
- Stage 3: Adversarial Rebuttal Debate (Bull responds to Bear, Bear responds to Bull)
- Stage 4: Risk & Execution Evaluation (Concurrent Trader & Risk Analyst)
- Stage 5: Portfolio Manager Conviction Synthesis

Uses Annotated[List[AgentOutput], operator.add] to guarantee safe parallel state updates.
"""

import asyncio
from datetime import datetime, timezone
import operator
from typing import Annotated, Any, Dict, List, Optional, Tuple, TypedDict

from langgraph.graph import END, START, StateGraph

from agents.analysts import (
    EvidenceVerificationAnalyst,
    FundamentalsQualityAnalyst,
    GrowthIndustryAnalyst,
    MarketAnalyst,
    NewsCorporateEventsAnalyst,
    PeerValuationAnalyst,
    ResearchManagerAgent,
    SocialSentimentAnalyst,
)
from agents.base import AgentOutput
from agents.decision_makers import (
    BearResearcherAgent,
    BullResearcherAgent,
    PortfolioManagerAgent,
    RiskAnalystAgent,
    TraderAgent,
)
from agents.metrics import calculate_financial_metrics
from schemas import BullBearDebate, ReportSection, ResearchReport


class AgentGraphState(TypedDict):
    """LangGraph execution state with safe reducer for concurrent node execution."""
    company_context: Dict[str, Any]
    deterministic_metrics: Dict[str, Any]
    manager_output: Optional[AgentOutput]
    evidence_pool: Dict[str, Any]
    bull_initial: Optional[AgentOutput]
    bear_initial: Optional[AgentOutput]
    bull_rebuttal: Optional[AgentOutput]
    bear_rebuttal: Optional[AgentOutput]
    risk_output: Optional[AgentOutput]
    trader_output: Optional[AgentOutput]
    pm_output: Optional[AgentOutput]
    # Reducer ensures parallel agent writes are safely concatenated without overwrites
    agent_runs: Annotated[List[AgentOutput], operator.add]


# Node 0: Research Manager & Planning Node
async def planning_node(state: AgentGraphState) -> Dict[str, Any]:
    company = state["company_context"]

    # Enrich with live free data sources (yfinance, Google News, BSE)
    try:
        from data_providers.aggregator import enrich_company_with_free_sources
        enriched_company = await enrich_company_with_free_sources(company)
    except Exception:
        enriched_company = dict(company)

    # Deterministic metrics calculation from enriched financials
    raw_fin = enriched_company.get("financials") or {}
    metrics = calculate_financial_metrics(raw_fin)
    enriched_company["calculated_metrics"] = metrics

    manager = ResearchManagerAgent()
    manager_output = await manager.run(enriched_company)
    return {
        "company_context": enriched_company,
        "deterministic_metrics": metrics,
        "manager_output": manager_output,
        "agent_runs": [manager_output],
    }


# Node 1: Evidence & Foundational Specialists
async def foundational_analysts_node(state: AgentGraphState) -> Dict[str, Any]:
    company = state["company_context"]
    analysts = [
        EvidenceVerificationAnalyst(),
        FundamentalsQualityAnalyst(),
        GrowthIndustryAnalyst(),
        NewsCorporateEventsAnalyst(),
        SocialSentimentAnalyst(),
        MarketAnalyst(),
        PeerValuationAnalyst(),
    ]
    tasks = [a.run(company) for a in analysts]
    results = await asyncio.gather(*tasks, return_exceptions=False)
    
    evidence_pool = {
        "company": company,
        "calculated_metrics": state.get("deterministic_metrics", {}),
        "analyst_findings": {r.role: r.findings for r in results},
    }
    return {
        "evidence_pool": evidence_pool,
        "agent_runs": list(results),
    }


# Node 2A: Independent Bull Thesis (Reads only evidence pool, zero bear cross-contamination)
async def bull_thesis_node(state: AgentGraphState) -> Dict[str, Any]:
    bull_agent = BullResearcherAgent()
    bull_out = await bull_agent.run(state["company_context"], state["evidence_pool"])
    return {
        "bull_initial": bull_out,
        "agent_runs": [bull_out],
    }


# Node 2B: Independent Bear Thesis (Reads only evidence pool, zero bull cross-contamination)
async def bear_thesis_node(state: AgentGraphState) -> Dict[str, Any]:
    bear_agent = BearResearcherAgent()
    bear_out = await bear_agent.run(state["company_context"], state["evidence_pool"])
    return {
        "bear_initial": bear_out,
        "agent_runs": [bear_out],
    }


# Node 3: Adversarial Rebuttal Round (Exchanges theses for 1 single bounded debate round)
async def debate_rebuttal_node(state: AgentGraphState) -> Dict[str, Any]:
    bull_initial = state["bull_initial"]
    bear_initial = state["bear_initial"]
    evidence = state["evidence_pool"]

    bull_evidence = dict(evidence, bear_thesis="\n".join(bear_initial.findings if bear_initial else []))
    bear_evidence = dict(evidence, bull_thesis="\n".join(bull_initial.findings if bull_initial else []))

    bull_agent = BullResearcherAgent()
    bear_agent = BearResearcherAgent()

    bull_reb, bear_reb = await asyncio.gather(
        bull_agent.run(state["company_context"], bull_evidence),
        bear_agent.run(state["company_context"], bear_evidence),
        return_exceptions=False
    )
    bull_reb.role = "Bull Researcher (Rebuttal Round)"
    bear_reb.role = "Bear Researcher (Rebuttal Round)"

    return {
        "bull_rebuttal": bull_reb,
        "bear_rebuttal": bear_reb,
        "agent_runs": [bull_reb, bear_reb],
    }


# Node 4: Risk & Execution Evaluation
async def risk_and_execution_node(state: AgentGraphState) -> Dict[str, Any]:
    evidence = state["evidence_pool"]
    trader_agent = TraderAgent()
    risk_agent = RiskAnalystAgent()

    trader_out, risk_out = await asyncio.gather(
        trader_agent.run(state["company_context"], evidence),
        risk_agent.run(state["company_context"], evidence),
        return_exceptions=False
    )
    return {
        "trader_output": trader_out,
        "risk_output": risk_out,
        "agent_runs": [trader_out, risk_out],
    }


# Node 5: Portfolio Manager Conviction Synthesis
async def pm_synthesis_node(state: AgentGraphState) -> Dict[str, Any]:
    pm_agent = PortfolioManagerAgent()
    manager_output = state["manager_output"]
    bull_initial = state.get("bull_initial")
    bear_initial = state.get("bear_initial")
    bull_reb = state.get("bull_rebuttal")
    bear_reb = state.get("bear_rebuttal")
    risk_output = state.get("risk_output")
    trader_output = state.get("trader_output")

    bull_findings = (bull_initial.findings if bull_initial else []) + (bull_reb.findings if bull_reb else [])
    bear_findings = (bear_initial.findings if bear_initial else []) + (bear_reb.findings if bear_reb else [])

    synthesis_inputs = {
        "manager_summary": manager_output.summary if manager_output else "",
        "bull_case": bull_findings,
        "bear_case": bear_findings,
        "risk_assessment": risk_output.findings if risk_output else [],
        "trader_plan": trader_output.findings if trader_output else [],
        "metrics": state.get("deterministic_metrics", {}),
    }
    pm_output = await pm_agent.run(state["company_context"], {"synthesis_inputs": synthesis_inputs})
    return {
        "pm_output": pm_output,
        "agent_runs": [pm_output],
    }


def build_research_graph() -> Any:
    """Build and compile the LangGraph StateGraph workflow for 13 agents."""
    builder = StateGraph(AgentGraphState)

    builder.add_node("planning", planning_node)
    builder.add_node("foundational_analysts", foundational_analysts_node)
    builder.add_node("bull_thesis", bull_thesis_node)
    builder.add_node("bear_thesis", bear_thesis_node)
    builder.add_node("debate_rebuttal", debate_rebuttal_node)
    builder.add_node("risk_and_execution", risk_and_execution_node)
    builder.add_node("pm_synthesis", pm_synthesis_node)

    # Workflow edges:
    # START -> planning -> foundational_analysts
    builder.add_edge(START, "planning")
    builder.add_edge("planning", "foundational_analysts")

    # From foundational_analysts, branch concurrently to bull_thesis and bear_thesis
    builder.add_edge("foundational_analysts", "bull_thesis")
    builder.add_edge("foundational_analysts", "bear_thesis")

    # Both independent theses feed into debate_rebuttal (1 bounded adversarial round)
    builder.add_edge("bull_thesis", "debate_rebuttal")
    builder.add_edge("bear_thesis", "debate_rebuttal")

    # From debate, progress to risk_and_execution, then to final pm_synthesis -> END
    builder.add_edge("debate_rebuttal", "risk_and_execution")
    builder.add_edge("risk_and_execution", "pm_synthesis")
    builder.add_edge("pm_synthesis", END)

    return builder.compile()


# Global compiled graph instance
research_graph = build_research_graph()


async def orchestrate_stock_research(company_context: Dict[str, Any]) -> Tuple[ResearchReport, List[AgentOutput]]:
    """Execute complete LangGraph research workflow across all 13 roles."""
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    symbol = company_context.get("symbol", "EQUITY")
    exchange = company_context.get("exchange", "NSE")
    company_name = company_context.get("company_name", symbol)

    initial_state: AgentGraphState = {
        "company_context": company_context,
        "deterministic_metrics": {},
        "manager_output": None,
        "evidence_pool": {},
        "bull_initial": None,
        "bear_initial": None,
        "bull_rebuttal": None,
        "bear_rebuttal": None,
        "risk_output": None,
        "trader_output": None,
        "pm_output": None,
        "agent_runs": [],
    }

    final_state = await research_graph.ainvoke(initial_state)

    all_agent_runs: List[AgentOutput] = final_state["agent_runs"]
    manager_output = final_state.get("manager_output")
    bull_initial = final_state.get("bull_initial")
    bear_initial = final_state.get("bear_initial")
    bull_reb = final_state.get("bull_rebuttal")
    bear_reb = final_state.get("bear_rebuttal")
    risk_out = final_state.get("risk_output")
    pm_output = final_state.get("pm_output")

    # Find specific analyst outputs by name
    find_agent = lambda name: next((r for r in all_agent_runs if r.agent_name == name), None)
    fundamentals_out = find_agent("Fundamentals Analyst")
    growth_out = find_agent("Growth & Industry Analyst")
    valuation_out = find_agent("Valuation Analyst")

    bull_case = (bull_initial.findings if bull_initial else []) + (bull_reb.findings if bull_reb else [])
    bear_case = (bear_initial.findings if bear_initial else []) + (bear_reb.findings if bear_reb else [])

    debate = BullBearDebate(
        bull_case=bull_case,
        bear_case=bear_case,
        critical_swing_factors=risk_out.findings if risk_out else []
    )

    is_dev_mode = any(r.execution_status == "dev_stub" for r in all_agent_runs)

    report = ResearchReport(
        report_id=f"AGY-{symbol.upper()}-{int(datetime.now().timestamp())}",
        symbol=symbol.upper(),
        company_name=company_name,
        exchange=exchange,
        generated_at=now_iso,
        status="generated" if not is_dev_mode else "dev_stub",
        is_prototype_demo=is_dev_mode,
        disclaimer=(
            "MULTI-AGENT RESEARCH SYNTHESIS: Generated through a LangGraph 13-agent deliberation loop "
            "powered by Qwen 2.5 Coder 7B reasoning engine (Orchestration, Evidence Verification, Fundamentals, Growth, "
            "Valuation, Independent Bull vs Bear Debate, Risk Audit, Execution Trader, and Portfolio Manager). "
            "Does not constitute personal investment advice."
            if not is_dev_mode else
            "DEVELOPMENT STUB REPORT: Generated with explicitly labeled agent analytical stubs because live LLM_API_KEY "
            "is not configured in backend/.env. Connect Ollama or an API key to activate live reasoning."
        ),
        business_overview=ReportSection(
            title="Business Overview & Evidence Audit",
            status="generated",
            summary=manager_output.summary if manager_output else "",
            key_points=manager_output.findings if manager_output else []
        ),
        financial_analysis=ReportSection(
            title="Fundamentals & Balance Sheet Quality",
            status="generated",
            summary=fundamentals_out.summary if fundamentals_out else "Fundamentals analysis",
            key_points=fundamentals_out.findings if fundamentals_out else []
        ),
        growth_prospects=ReportSection(
            title="Growth Catalysts & Industry Position",
            status="generated",
            summary=growth_out.summary if growth_out else "Growth analysis",
            key_points=growth_out.findings if growth_out else []
        ),
        valuation=ReportSection(
            title="Peer Benchmarking & Valuation",
            status="generated",
            summary=valuation_out.summary if valuation_out else "Valuation analysis",
            key_points=valuation_out.findings if valuation_out else []
        ),
        risks=ReportSection(
            title="Systemic & Regulatory Risks",
            status="generated",
            summary=risk_out.summary if risk_out else "Risk analysis",
            key_points=risk_out.findings if risk_out else []
        ),
        bull_vs_bear=debate,
        final_assessment=ReportSection(
            title="Portfolio Manager Conviction Synthesis",
            status="generated",
            summary=pm_output.summary if pm_output else "",
            key_points=pm_output.findings if pm_output else []
        )
    )

    return report, all_agent_runs
