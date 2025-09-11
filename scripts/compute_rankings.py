#!/usr/bin/env python3
"""
Compute rankings and trends from certifications data
"""

import json
import math
import datetime
import pathlib
from typing import Dict, List, Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "web" / "public" / "data"

def load_json(path: pathlib.Path) -> Any:
    """Load JSON file"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path: pathlib.Path, obj: Any) -> None:
    """Save data as JSON"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

def minmax(vals: List[float], v: float) -> float:
    """Min-max normalization"""
    if not vals:
        return 0.0
    mn, mx = min(vals), max(vals)
    return 0.0 if mx == mn else (v - mn) / (mx - mn)

def main():
    """Main function to compute rankings"""
    print("Computing rankings...")
    
    # Load certifications
    certs = load_json(DATA / "certifications" / "index.json")
    
    # Load optional inputs
    demand = {}
    if (DATA / "demand" / "metrics.json").exists():
        demand_list = load_json(DATA / "demand" / "metrics.json")
        demand = {d["slug"]: d for d in demand_list}
    
    salaries = {}
    if (DATA / "salaries" / "role_salaries.json").exists():
        salaries = load_json(DATA / "salaries" / "role_salaries.json")
    
    # Group by domain
    by_domain = {}
    fees, hours, demand30 = [], [], []
    
    for c in certs:
        by_domain.setdefault(c["domain"], []).append(c)
        
        # Collect global stats for normalization
        if c.get("exam_fee_usd"):
            fees.append(float(c["exam_fee_usd"]))
            
        if c.get("recommended_hours_min") or c.get("recommended_hours_max"):
            lo = c.get("recommended_hours_min") or 0
            hi = c.get("recommended_hours_max") or lo
            midh = (lo + hi) / 2
            hours.append(midh)
            
        dm = demand.get(c["slug"], {}).get("job_postings_30d")
        if dm is not None:
            demand30.append(dm)
    
    today = datetime.date.today().isoformat()
    rankings_out = []
    
    # Load existing trends
    trends_path = DATA / "rankings" / "trends.json"
    trends = load_json(trends_path) if trends_path.exists() else {}
    
    # Ranking weights
    w1, w2, w3, w4, w5 = 0.5, 0.2, 0.1, 0.15, 0.05  # demand, salary, cost, difficulty, freshness
    
    # Process each domain
    for domain, cert_list in by_domain.items():
        print(f"Processing domain: {domain} ({len(cert_list)} certs)")
        
        # Collect domain-specific vectors
        fees_d = [float(x["exam_fee_usd"]) for x in cert_list if x.get("exam_fee_usd")]
        hours_d = []
        
        for x in cert_list:
            lo, hi = x.get("recommended_hours_min"), x.get("recommended_hours_max")
            if lo or hi:
                lo = lo or 0
                hi = hi or lo
                hours_d.append((lo + hi) / 2)
        
        demand_d = []
        for x in cert_list:
            dm = demand.get(x["slug"], {}).get("job_postings_30d")
            if dm is not None:
                demand_d.append(dm)
        
        # Compute scores for this domain
        scored = []
        for c in cert_list:
            # Fee term (lower is better)
            fee = float(c["exam_fee_usd"]) if c.get("exam_fee_usd") else (min(fees_d) if fees_d else 0.0)
            fee_term = 1.0 - minmax(fees_d, fee) if fees_d else 0.0
            
            # Hours term (fewer is better)  
            lo, hi = c.get("recommended_hours_min"), c.get("recommended_hours_max")
            midh = (lo + hi) / 2 if (lo or hi) else (min(hours_d) if hours_d else 0.0)
            hour_term = 1.0 - minmax(hours_d, midh) if hours_d else 0.0
            
            # Demand Z-score
            dm = demand.get(c["slug"], {}).get("job_postings_30d", 0)
            demand_z = 0.0
            if demand_d and len(demand_d) > 1:
                mu = sum(demand_d) / len(demand_d)
                var = sum((x - mu) ** 2 for x in demand_d) / max(1, len(demand_d) - 1)
                sd = math.sqrt(var) or 1.0
                demand_z = (dm - mu) / sd
            
            # Difficulty bonus
            difficulty_map = {
                "Foundational": 0.05,
                "Associate": 0.1, 
                "Professional": 0.15,
                "Expert": 0.2,
                "Specialty": 0.15
            }
            difficulty = difficulty_map.get(c.get("level", ""), 0.0)
            
            # Freshness bonus
            freshness = 0.05 if c.get("last_checked_utc", "")[:10] == today else 0.0
            
            # Final score
            score = (w1 * demand_z + w2 * 0 + w3 * fee_term + 
                    w4 * difficulty + w5 * freshness)
            
            scored.append((c["slug"], score, c["domain"]))
        
        # Sort by score and assign ranks
        scored.sort(key=lambda x: x[1], reverse=True)
        
        for i, (slug, score, dom) in enumerate(scored, start=1):
            rankings_out.append({
                "slug": slug,
                "rank": i, 
                "score": round(score, 4),
                "domain": dom
            })
            
            # Update trends
            arr = trends.get(slug, [])
            # Remove today's entry if exists, then add new one
            arr = [x for x in arr if x["date"] != today]
            arr.append({"date": today, "rank": i})
            # Keep last 14 days
            trends[slug] = arr[-14:]
    
    # Save results
    save_json(DATA / "rankings" / "today.json", rankings_out)
    save_json(trends_path, trends)
    
    print(f"Generated rankings for {len(rankings_out)} certifications")
    print(f"Updated trends for {len(trends)} certifications")

if __name__ == "__main__":
    main()