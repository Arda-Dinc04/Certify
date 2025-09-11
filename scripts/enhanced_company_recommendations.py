#!/usr/bin/env python3
"""
Enhanced company recommendations with better fit signals
Implements improved heuristics from instruction.txt
"""

import os
import json
import pathlib
import re
import math
import csv
from collections import Counter, defaultdict
from typing import Dict, List, Any, Set

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"
SCRIPTS_DIR = ROOT / "scripts"

USE_ADZUNA = os.getenv("USE_ADZUNA", "false").lower() == "true"
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")

# Enhanced domain to role mapping with technology stacks
DOMAIN_ROLES = {
    "CS/IT": {
        "Cloud Engineer": {
            "keywords": ["cloud engineer", "aws", "azure", "gcp", "terraform", "kubernetes"],
            "tech_stack": ["docker", "terraform", "ansible", "jenkins", "git"],
            "cert_patterns": ["aws", "azure", "gcp", "kubernetes"]
        },
        "DevOps Engineer": {
            "keywords": ["devops", "sre", "ci/cd", "kubernetes", "docker"],
            "tech_stack": ["jenkins", "gitlab", "circleci", "docker", "kubernetes"],
            "cert_patterns": ["docker", "kubernetes", "jenkins", "aws", "azure"]
        },
        "Security Engineer": {
            "keywords": ["security engineer", "siem", "incident response", "cissp", "soc"],
            "tech_stack": ["splunk", "wireshark", "nmap", "metasploit", "burp"],
            "cert_patterns": ["cissp", "security+", "ceh", "cism"]
        },
        "Data Engineer": {
            "keywords": ["data engineer", "etl", "spark", "snowflake", "bigquery", "redshift"],
            "tech_stack": ["python", "sql", "spark", "kafka", "airflow"],
            "cert_patterns": ["snowflake", "databricks", "aws", "gcp"]
        },
        "Network Engineer": {
            "keywords": ["network engineer", "ccna", "bgp", "cisco"],
            "tech_stack": ["cisco", "juniper", "palo alto", "fortinet"],
            "cert_patterns": ["ccna", "ccnp", "jncia", "fortinet"]
        },
        "Software Engineer": {
            "keywords": ["software engineer", "developer", "programming", "java", "python"],
            "tech_stack": ["git", "docker", "kubernetes", "react", "node"],
            "cert_patterns": ["aws", "azure", "oracle", "microsoft"]
        }
    },
    "Engineering / Business": {
        "Project Manager": {
            "keywords": ["project manager", "pmp", "agile", "scrum master"],
            "tech_stack": ["jira", "confluence", "microsoft project", "slack"],
            "cert_patterns": ["pmp", "capm", "safe", "scrum"]
        },
        "Business Analyst": {
            "keywords": ["business analyst", "requirements", "process improvement"],
            "tech_stack": ["excel", "tableau", "power bi", "visio"],
            "cert_patterns": ["pmp", "six sigma", "lean"]
        },
        "Quality Engineer": {
            "keywords": ["quality engineer", "six sigma", "cqe", "asq"],
            "tech_stack": ["minitab", "r", "spc", "lean tools"],
            "cert_patterns": ["six sigma", "lean", "cqe", "asq"]
        },
        "Civil Engineer": {
            "keywords": ["civil engineer", "pe", "structural"],
            "tech_stack": ["autocad", "revit", "civil 3d", "staad"],
            "cert_patterns": ["pe", "se", "leed"]
        }
    }
}

def load_json(path: pathlib.Path) -> Any:
    """Load JSON file"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path: pathlib.Path, obj: Any) -> None:
    """Save data as JSON"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

def load_issuer_company_affinity() -> Dict[str, Dict[str, float]]:
    """Load issuer-company affinity table"""
    affinity_path = SCRIPTS_DIR / "data" / "issuer_company_affinity.csv"
    affinity = defaultdict(dict)
    
    if affinity_path.exists():
        with open(affinity_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                company = row["company"].strip()
                issuer = row["issuer"].strip()
                score = float(row["affinity_score"])
                affinity[company][issuer] = score
    
    return affinity

def canon_company(name: str) -> str:
    """Canonicalize company name"""
    n = re.sub(r'\b(inc|llc|ltd|corp|co)\b\.?', '', name, flags=re.I)
    n = re.sub(r'[^A-Za-z0-9&/ .-]+', '', n)
    return re.sub(r'\s+', ' ', n).strip()

def get_technology_stack_alignment(cert: Dict, role_info: Dict) -> float:
    """Calculate alignment between certification and role technology stack"""
    cert_text = f"{cert.get('name', '')} {cert.get('issuer', '')}".lower()
    tech_stack = role_info.get("tech_stack", [])
    cert_patterns = role_info.get("cert_patterns", [])
    
    # Check for direct technology mentions
    tech_matches = sum(1 for tech in tech_stack if tech.lower() in cert_text)
    pattern_matches = sum(1 for pattern in cert_patterns if pattern.lower() in cert_text)
    
    # Weight pattern matches higher than general tech stack
    total_score = (pattern_matches * 2 + tech_matches) / max(len(cert_patterns) * 2 + len(tech_stack), 1)
    return min(total_score, 1.0)

def get_issuer_affinity(company_name: str, cert_issuer: str, affinity_table: Dict) -> float:
    """Get issuer affinity score for company"""
    return affinity_table.get(company_name, {}).get(cert_issuer, 0.0)

def calculate_market_demand_signal(cert_slug: str, demand_data: Dict) -> float:
    """Calculate market demand signal (normalized)"""
    demand_info = demand_data.get(cert_slug, {})
    postings_30d = demand_info.get("job_postings_30d", 0)
    
    # Simple normalization - in production, this would use more sophisticated metrics
    if postings_30d > 500:
        return 1.0
    elif postings_30d > 100:
        return 0.8
    elif postings_30d > 50:
        return 0.6
    elif postings_30d > 10:
        return 0.4
    elif postings_30d > 0:
        return 0.2
    else:
        return 0.0

def calculate_certification_difficulty_bonus(cert: Dict) -> float:
    """Calculate difficulty bonus based on certification level"""
    level = cert.get("level", "").lower()
    level_scores = {
        "foundational": 0.2,
        "associate": 0.4,
        "professional": 0.8,
        "expert": 1.0,
        "specialty": 0.6
    }
    return level_scores.get(level, 0.4)

def enhanced_role_alignment(cert: Dict, comp_roles: Set[str], domain_roles: Dict) -> Dict[str, float]:
    """Enhanced role alignment with detailed signals"""
    cert_name = cert.get("name", "").lower()
    cert_issuer = cert.get("issuer", "").lower()
    
    alignment_scores = {}
    tech_stack_scores = {}
    
    for role in comp_roles:
        if role in domain_roles:
            role_info = domain_roles[role]
            
            # Basic keyword matching
            keywords = role_info.get("keywords", [])
            keyword_matches = sum(1 for kw in keywords if kw in cert_name or kw in cert_issuer)
            keyword_score = min(keyword_matches / max(len(keywords), 1), 1.0)
            
            # Technology stack alignment
            tech_score = get_technology_stack_alignment(cert, role_info)
            
            # Combined alignment score
            combined_score = (keyword_score * 0.6 + tech_score * 0.4)
            
            alignment_scores[role] = combined_score
            tech_stack_scores[role] = tech_score
    
    # Return the best role alignment
    if alignment_scores:
        best_role = max(alignment_scores, key=alignment_scores.get)
        return {
            "score": alignment_scores[best_role],
            "best_role": best_role,
            "tech_alignment": tech_stack_scores.get(best_role, 0.0),
            "all_scores": alignment_scores
        }
    
    return {"score": 0.0, "best_role": None, "tech_alignment": 0.0, "all_scores": {}}

def generate_enhanced_recommendations():
    """Generate enhanced company recommendations with better signals"""
    print("🔧 Building enhanced company recommendations...")
    
    # Load existing data
    certs_data = []
    map_path = DATA_DIR / "certifications" / "index.map.json"
    
    if map_path.exists():
        # Load from shards
        shard_map = load_json(map_path)
        for shard in shard_map.get("shards", []):
            shard_file = shard["file"].replace("/data/", "")
            shard_path = DATA_DIR / shard_file
            if shard_path.exists():
                certs_data.extend(load_json(shard_path))
    else:
        # Load from legacy file
        index_path = DATA_DIR / "certifications" / "index.json"
        if index_path.exists():
            certs_data = load_json(index_path)
    
    # Load supporting data
    rankings = {}
    if (DATA_DIR / "rankings" / "today.json").exists():
        rankings_list = load_json(DATA_DIR / "rankings" / "today.json")
        rankings = {r["slug"]: r for r in rankings_list}
    
    demand_data = {}
    if (DATA_DIR / "demand" / "metrics.json").exists():
        demand_list = load_json(DATA_DIR / "demand" / "metrics.json")
        demand_data = {d["slug"]: d for d in demand_list}
    
    companies_data = {}
    if (DATA_DIR / "companies" / "by_domain.json").exists():
        companies_data = load_json(DATA_DIR / "companies" / "by_domain.json")
    
    # Load issuer-company affinity table
    affinity_table = load_issuer_company_affinity()
    
    # Calculate global normalization factors
    fees = [float(c["exam_fee_usd"]) for c in certs_data if c.get("exam_fee_usd")]
    fmin, fmax = (min(fees), max(fees)) if fees else (0, 1)
    
    rank_scores = list({v["score"] for v in rankings.values()}) if rankings else []
    rmin, rmax = (min(rank_scores), max(rank_scores)) if rank_scores else (0, 1)
    
    def fee_penalty(cert):
        if not fees or not cert.get("exam_fee_usd"):
            return 0.0
        return (float(cert["exam_fee_usd"]) - fmin) / (fmax - fmin + 1e-9)
    
    def global_rank_norm(slug):
        if not rankings or slug not in rankings:
            return 0.0
        s = rankings[slug]["score"]
        return (s - rmin) / (rmax - rmin + 1e-9)
    
    # Build enhanced recommendations
    recommendations = defaultdict(dict)
    cert_by_slug = {c["slug"]: c for c in certs_data}
    
    print(f"   📊 Processing {len(certs_data)} certifications")
    print(f"   🏢 Processing {sum(len(comps) for comps in companies_data.values())} companies")
    print(f"   🤝 Loaded {sum(len(issuers) for issuers in affinity_table.values())} affinity relationships")
    
    for domain, comp_list in companies_data.items():
        domain_certs = [c["slug"] for c in certs_data if c["domain"] == domain]
        domain_role_info = DOMAIN_ROLES.get(domain, {})
        
        print(f"   🎯 Processing {domain}: {len(domain_certs)} certs, {len(comp_list)} companies")
        
        for comp in comp_list:
            comp_name = comp["name"]
            comp_roles = set(comp["top_roles"].keys())
            scored = []
            
            for slug in domain_certs:
                cert = cert_by_slug[slug]
                
                # Enhanced role alignment with detailed signals
                role_alignment_result = enhanced_role_alignment(cert, comp_roles, domain_role_info)
                role_alignment = role_alignment_result["score"]
                
                # Issuer affinity score
                issuer_affinity = get_issuer_affinity(comp_name, cert.get("issuer", ""), affinity_table)
                
                # Global ranking normalization
                global_rank = global_rank_norm(slug)
                
                # Market demand signal
                market_demand = calculate_market_demand_signal(slug, demand_data)
                
                # Difficulty bonus
                difficulty_bonus = calculate_certification_difficulty_bonus(cert)
                
                # Cost penalty
                cost_penalty = fee_penalty(cert)
                
                # Enhanced fit score calculation
                # Weights: role_alignment (40%), issuer_affinity (25%), global_rank (20%), 
                #          market_demand (10%), difficulty (5%) - cost_penalty (small negative)
                fit_score = (
                    0.40 * role_alignment +
                    0.25 * issuer_affinity +
                    0.20 * global_rank +
                    0.10 * market_demand +
                    0.05 * difficulty_bonus -
                    0.05 * cost_penalty
                )
                
                # Detailed signals for UI
                signals = {
                    "role_alignment": round(role_alignment, 3),
                    "issuer_affinity": round(issuer_affinity, 3),
                    "global_rank_norm": round(global_rank, 3),
                    "market_demand": round(market_demand, 3),
                    "difficulty_bonus": round(difficulty_bonus, 3),
                    "cost_penalty": round(cost_penalty, 3),
                    "tech_alignment": round(role_alignment_result.get("tech_alignment", 0.0), 3),
                    "best_role_match": role_alignment_result.get("best_role"),
                    "mention_count": 0,  # Placeholder for future API integration
                    "mention_z": 0.0     # Placeholder for future API integration
                }
                
                scored.append((slug, fit_score, signals))
            
            # Sort by fit score and take top 3
            scored.sort(key=lambda x: x[1], reverse=True)
            recommendations[domain][comp["slug"]] = [
                {
                    "slug": s[0],
                    "fit_score": round(s[1], 4),
                    "signals": s[2]
                }
                for s in scored[:3]
            ]
    
    # Save enhanced recommendations
    save_json(DATA_DIR / "companies" / "recommendations.json", recommendations)
    
    # Generate summary statistics
    total_recommendations = sum(len(recs) for domain_recs in recommendations.values() 
                              for recs in domain_recs.values())
    
    avg_fit_score = 0
    high_fit_count = 0
    if total_recommendations > 0:
        all_scores = [rec["fit_score"] for domain_recs in recommendations.values() 
                     for comp_recs in domain_recs.values() for rec in comp_recs]
        avg_fit_score = sum(all_scores) / len(all_scores)
        high_fit_count = sum(1 for score in all_scores if score > 0.6)
    
    print(f"\n🎉 Enhanced recommendations complete!")
    print(f"   📈 Total recommendations: {total_recommendations}")
    print(f"   🎯 Average fit score: {avg_fit_score:.3f}")
    print(f"   ⭐ High-fit recommendations (>60%): {high_fit_count}")
    print(f"   🤝 Affinity relationships used: {sum(len(issuers) for issuers in affinity_table.values())}")

if __name__ == "__main__":
    generate_enhanced_recommendations()