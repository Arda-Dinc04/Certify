#!/usr/bin/env python3
"""
Build demand metrics and company recommendations
Supports both heuristic mode (default) and real API mode
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
DATA = ROOT / "web" / "public" / "data"

USE_ADZUNA = os.getenv("USE_ADZUNA", "false").lower() == "true"
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")

# Domain label to slug mapping for consistency
DOMAIN_MAP = {
    "CS / IT": "cs-it",
    "CS/IT": "cs-it",
    "Engineering / Business": "engineering-business",
    "Engineering/Business": "engineering-business",
    "Healthcare": "healthcare",
    "Finance": "finance", 
    "Skilled Trades": "skilled-trades",
    "Skilled-Trades": "skilled-trades",
}

def normalize_domain_slug(domain_label: str) -> str:
    """Convert domain label to consistent slug format"""
    return DOMAIN_MAP.get(domain_label.strip(), "cs-it")

# Domain to role mapping (using consistent slugs)
DOMAIN_ROLES = {
    "cs-it": {
        "Cloud Engineer": ["cloud engineer", "aws", "azure", "gcp", "terraform", "kubernetes"],
        "DevOps Engineer": ["devops", "sre", "ci/cd", "kubernetes", "docker"],
        "Security Engineer": ["security engineer", "siem", "incident response", "cissp", "soc"],
        "Data Engineer": ["data engineer", "etl", "spark", "snowflake", "bigquery", "redshift"],
        "Network Engineer": ["network engineer", "ccna", "bgp", "cisco"],
        "Software Engineer": ["software engineer", "developer", "programming", "java", "python"]
    },
    "engineering-business": {
        "Project Manager": ["project manager", "pmp", "agile", "scrum master"],
        "Business Analyst": ["business analyst", "requirements", "process improvement"],
        "Quality Engineer": ["quality engineer", "six sigma", "cqe", "asq"],
        "Civil Engineer": ["civil engineer", "pe", "structural"]
    },
    "healthcare": {
        "Registered Nurse (RN)": ["registered nurse", "rn", "nurse"],
        "Nurse Practitioner (NP)": ["nurse practitioner", "np"],
        "Emergency Medical Technician (EMT)": ["emt", "emergency medical technician"],
        "Paramedic": ["paramedic"],
        "Radiologic Technologist": ["radiologic technologist", "rad tech"],
        "Respiratory Therapist": ["respiratory therapist"],
        "Pharmacist": ["pharmacist", "pharmd"],
        "Pharmacy Technician": ["pharmacy technician", "cpht"],
        "Public Health Specialist": ["public health", "epidemiology"],
        "Infection Control Specialist": ["infection control", "cic"],
        "Critical Care Nurse (CCRN)": ["critical care", "ccrn", "icu"]
    },
    "finance": {
        "Financial Analyst": ["financial analyst", "equity research"],
        "Portfolio Manager": ["portfolio manager", "buy-side", "sell-side"],
        "Risk Analyst": ["risk analyst", "market risk", "credit risk", "frm"],
        "Quantitative Analyst": ["quantitative analyst", "quant", "statistics"],
        "Compliance/AML Specialist": ["compliance", "aml", "kyc"],
        "Internal Auditor": ["internal auditor", "cia"],
        "Information Systems Auditor": ["cisa", "it auditor", "systems auditor"],
        "Management Accountant": ["cma", "management accountant"],
        "Tax Accountant": ["tax accountant", "cpa"],
        "Financial Advisor / Planner": ["financial advisor", "planner", "cfp"]
    },
    "skilled-trades": {
        "Electrician": ["electrician", "electrical", "journeyman", "master electrician"],
        "HVAC Technician": ["hvac", "heating", "ventilation", "air conditioning", "refrigeration"],
        "Welder": ["welder", "welding", "fabricator", "structural welding"],
        "Automotive Technician": ["automotive technician", "mechanic", "ase", "auto repair"],
        "Construction Worker": ["construction", "construction worker", "building", "contractor"],
        "Plumber": ["plumber", "plumbing", "pipefitter", "pipe installation"],
        "Carpenter": ["carpenter", "woodworker", "framing", "finish carpentry"],
        "Heavy Equipment Operator": ["heavy equipment", "operator", "excavator", "crane operator"],
        "Safety Inspector": ["safety inspector", "osha", "safety compliance", "construction safety"]
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

def canon_company(name: str) -> str:
    """Canonicalize company name"""
    n = re.sub(r'\b(inc|llc|ltd|corp|co)\b\.?', '', name, flags=re.I)
    n = re.sub(r'[^A-Za-z0-9&/ .-]+', '', n)
    return re.sub(r'\s+', ' ', n).strip()

def load_issuer_affinity() -> Dict[str, Dict[str, float]]:
    """Load issuer-company affinity matrix from CSV"""
    affinity_data = defaultdict(dict)
    affinity_path = ROOT / "scripts" / "data" / "issuer_company_affinity.csv"
    
    if not affinity_path.exists():
        print("⚠️  Issuer affinity CSV not found, using default scoring")
        return affinity_data
    
    try:
        with open(affinity_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                company = row['company']
                issuer = row['issuer']
                score = float(row['affinity_score'])
                affinity_data[company][issuer] = score
        
        print(f"📊 Loaded {len(affinity_data)} company-issuer affinity relationships")
        return affinity_data
        
    except Exception as e:
        print(f"⚠️  Error loading issuer affinity: {e}")
        return affinity_data

# Adzuna API client (optional)
ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs/us/search/1"

def adzuna_search(what: str, max_days_old: int = 30) -> List[Dict]:
    """Search Adzuna API for job postings"""
    if not (USE_ADZUNA and ADZUNA_APP_ID and ADZUNA_APP_KEY):
        return []
    
    try:
        import requests
        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY, 
            "results_per_page": 50,
            "what": what,
            "max_days_old": max_days_old
        }
        r = requests.get(ADZUNA_BASE, params=params, timeout=20)
        r.raise_for_status()
        return r.json().get("results", [])
    except Exception as e:
        print(f"Adzuna API error: {e}")
        return []

def top_companies_for_domain(domain: str, role_kws: Dict[str, List[str]]) -> List[Dict]:
    """Get top companies for a domain"""
    comp_counts = Counter()
    top_roles = defaultdict(lambda: Counter())
    
    if USE_ADZUNA and ADZUNA_APP_ID and ADZUNA_APP_KEY:
        print(f"Fetching real data for {domain} via Adzuna...")
        for role, kws in role_kws.items():
            results = adzuna_search(" OR ".join(kws), max_days_old=30)
            for item in results:
                comp = (item.get("company") or {}).get("display_name")
                if not comp:
                    continue
                cc = canon_company(comp)
                comp_counts[cc] += 1
                top_roles[cc][role] += 1
    else:
        print(f"Using heuristic data for {domain}...")
        # Heuristic fallback based on domain
        if domain == "CS/IT":
            seeds = [
                "Amazon", "Microsoft", "Google", "Cisco", "IBM", 
                "Oracle", "VMware", "Red Hat", "Salesforce", "Adobe"
            ]
        elif domain == "Engineering / Business":
            seeds = [
                "Accenture", "Deloitte", "McKinsey", "BCG", "PwC",
                "EY", "KPMG", "IBM", "Capgemini", "TCS"
            ]
        elif domain == "Healthcare":
            seeds = [
                "HCA Healthcare", "CVS Health", "UnitedHealth Group", 
                "Kaiser Permanente", "Cleveland Clinic", "Mayo Clinic",
                "Anthem", "Humana", "Tenet Healthcare", "CommonSpirit Health"
            ]
        elif domain == "Finance":
            seeds = [
                "JPMorgan Chase", "Goldman Sachs", "Morgan Stanley", 
                "Bank of America", "Citigroup", "Deloitte",
                "PwC", "EY", "KPMG", "Wells Fargo"
            ]
        elif domain == "Skilled Trades":
            seeds = [
                "Johnson Controls", "Carrier", "Lennox International",
                "Home Depot", "Lowe's", "Caterpillar",
                "John Deere", "Fluor Corporation", "Turner Construction", "Bechtel"
            ]
        else:
            seeds = ["Generic Corp", "Tech Solutions", "Professional Services"]
        
        for i, s in enumerate(seeds):
            base_count = 100 - i * 8
            comp_counts[s] = max(base_count, 10)
            
            # Assign roles based on domain
            if domain == "CS/IT":
                top_roles[s]["Cloud Engineer"] = max(40 - i * 3, 5)
                top_roles[s]["DevOps Engineer"] = max(30 - i * 2, 3)
                top_roles[s]["Software Engineer"] = max(35 - i * 3, 5)
            elif domain == "Engineering / Business":
                top_roles[s]["Project Manager"] = max(25 - i * 2, 3)
                top_roles[s]["Business Analyst"] = max(20 - i * 2, 2)
            elif domain == "Healthcare":
                top_roles[s]["Registered Nurse (RN)"] = max(50 - i * 4, 8)
                top_roles[s]["Nurse Practitioner (NP)"] = max(15 - i * 1, 2)
                top_roles[s]["Pharmacist"] = max(12 - i * 1, 2)
                top_roles[s]["Respiratory Therapist"] = max(10 - i * 1, 1)
                top_roles[s]["Radiologic Technologist"] = max(8 - i * 1, 1)
            elif domain == "Finance":
                top_roles[s]["Financial Analyst"] = max(35 - i * 3, 5)
                top_roles[s]["Risk Analyst"] = max(25 - i * 2, 3)
                top_roles[s]["Internal Auditor"] = max(20 - i * 2, 3)
                top_roles[s]["Compliance/AML Specialist"] = max(15 - i * 1, 2)
                top_roles[s]["Portfolio Manager"] = max(10 - i * 1, 1)
            elif domain == "Skilled Trades":
                top_roles[s]["Electrician"] = max(40 - i * 3, 6)
                top_roles[s]["HVAC Technician"] = max(30 - i * 2, 4)
                top_roles[s]["Welder"] = max(25 - i * 2, 3)
                top_roles[s]["Construction Worker"] = max(35 - i * 3, 5)
                top_roles[s]["Safety Inspector"] = max(15 - i * 1, 2)
    
    # Return top 10
    top10 = [name for name, _ in comp_counts.most_common(10)]
    out = []
    
    for i, name in enumerate(top10, start=1):
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        out.append({
            "company_id": i,
            "slug": slug,
            "name": name,
            "postings_30d": comp_counts[name],
            "top_roles": dict(top_roles[name])
        })
    
    return out

def role_alignment(cert_roles: Set[str], comp_roles: Set[str]) -> float:
    """Calculate role alignment score"""
    if not comp_roles or not cert_roles:
        return 0.0
    inter = len(cert_roles & comp_roles)
    union = len(cert_roles | comp_roles)
    return inter / union if union > 0 else 0.0

def infer_cert_roles(cert: Dict) -> Set[str]:
    """Infer relevant roles for a certification"""
    name = (cert["name"] + " " + cert.get("issuer", "")).lower()
    roles = set()
    
    # Check against all domain roles
    for domain_roles in DOMAIN_ROLES.values():
        for role in domain_roles.keys():
            role_token = role.split()[0].lower()  # e.g. "cloud" from "Cloud Engineer"
            if role_token in name:
                roles.add(role)
    
    # Specific mappings
    if any(term in name for term in ["aws", "amazon web services"]):
        roles.update(["Cloud Engineer", "DevOps Engineer"])
    
    if any(term in name for term in ["azure", "microsoft"]):
        roles.update(["Cloud Engineer", "DevOps Engineer"])
    
    if any(term in name for term in ["gcp", "google cloud"]):
        roles.update(["Cloud Engineer", "Data Engineer"])
    
    if any(term in name for term in ["security", "cissp", "security+"]):
        roles.add("Security Engineer")
    
    if any(term in name for term in ["network", "ccna", "cisco"]):
        roles.add("Network Engineer")
    
    if any(term in name for term in ["pmp", "project management"]):
        roles.add("Project Manager")
    
    if any(term in name for term in ["data", "analytics", "bi"]):
        roles.add("Data Engineer")
    
    # Healthcare-specific mappings
    if any(term in name for term in ["nclex", "rn", "registered nurse"]):
        roles.add("Registered Nurse (RN)")
    
    if any(term in name for term in ["np", "nurse practitioner", "fnp"]):
        roles.add("Nurse Practitioner (NP)")
    
    if any(term in name for term in ["ccrn", "critical care"]):
        roles.add("Critical Care Nurse (CCRN)")
    
    if any(term in name for term in ["nremt", "emt", "paramedic"]):
        roles.update(["Emergency Medical Technician (EMT)", "Paramedic"])
    
    if any(term in name for term in ["arrt", "radiologic", "rad tech"]):
        roles.add("Radiologic Technologist")
    
    if any(term in name for term in ["crt", "respiratory"]):
        roles.add("Respiratory Therapist")
    
    if any(term in name for term in ["pharmd", "pharmacist", "nabp"]):
        roles.add("Pharmacist")
    
    if any(term in name for term in ["cpht", "pharmacy technician"]):
        roles.add("Pharmacy Technician")
    
    if any(term in name for term in ["cph", "public health"]):
        roles.add("Public Health Specialist")
    
    if any(term in name for term in ["cic", "infection control"]):
        roles.add("Infection Control Specialist")
    
    # Finance-specific mappings
    if any(term in name for term in ["cfa", "chartered financial"]):
        roles.update(["Financial Analyst", "Portfolio Manager"])
    
    if any(term in name for term in ["frm", "risk management"]):
        roles.add("Risk Analyst")
    
    if any(term in name for term in ["cpa", "certified public accountant"]):
        roles.update(["Tax Accountant", "Management Accountant"])
    
    if any(term in name for term in ["cma", "certified management accountant"]):
        roles.add("Management Accountant")
    
    if any(term in name for term in ["cia", "certified internal auditor"]):
        roles.add("Internal Auditor")
    
    if any(term in name for term in ["cisa", "certified information systems auditor"]):
        roles.add("Information Systems Auditor")
    
    if any(term in name for term in ["cfp", "certified financial planner"]):
        roles.add("Financial Advisor / Planner")
    
    if any(term in name for term in ["cams", "anti-money laundering"]):
        roles.add("Compliance/AML Specialist")
    
    if any(term in name for term in ["ea", "enrolled agent"]):
        roles.add("Tax Accountant")
    
    # Skilled Trades-specific mappings
    if any(term in name for term in ["electrician", "electrical", "journeyman", "master electrician"]):
        roles.add("Electrician")
    
    if any(term in name for term in ["hvac", "nate", "epa 608"]):
        roles.add("HVAC Technician")
    
    if any(term in name for term in ["welding", "welder", "aws d1"]):
        roles.add("Welder")
    
    if any(term in name for term in ["ase", "automotive", "auto repair"]):
        roles.add("Automotive Technician")
    
    if any(term in name for term in ["osha", "construction", "safety"]):
        roles.update(["Construction Worker", "Safety Inspector"])
    
    return roles

def main():
    """Main function"""
    print("Building demand metrics and company recommendations...")
    
    # Load issuer affinity data
    issuer_affinity = load_issuer_affinity()
    
    # Load certifications
    certs = load_json(DATA / "certifications" / "index.json")
    
    # Generate demand metrics (zeros unless using real API)
    demand_metrics = []
    for c in certs:
        # In heuristic mode, use zeros. In API mode, this would be populated
        demand_metrics.append({
            "slug": c["slug"],
            "job_postings_7d": 0,
            "job_postings_30d": 0
        })
    
    save_json(DATA / "demand" / "metrics.json", demand_metrics)
    
    # Load existing role salaries and preserve them (they may have been extended)
    role_salaries_path = DATA / "salaries" / "role_salaries.json"
    if role_salaries_path.exists():
        print("Using existing role salaries data...")
        # Don't overwrite existing salaries - they may have been extended
    else:
        # Only create baseline salaries if file doesn't exist
        role_salaries = {
            "Cloud Engineer": {"median_usd": 135000, "p25": 115000, "p75": 160000, "source": "BLS_2024"},
            "DevOps Engineer": {"median_usd": 140000, "p25": 120000, "p75": 165000, "source": "BLS_2024"},
            "Security Engineer": {"median_usd": 145000, "p25": 125000, "p75": 170000, "source": "BLS_2024"},
            "Data Engineer": {"median_usd": 130000, "p25": 110000, "p75": 155000, "source": "BLS_2024"},
            "Network Engineer": {"median_usd": 105000, "p25": 85000, "p75": 125000, "source": "BLS_2024"},
            "Software Engineer": {"median_usd": 125000, "p25": 105000, "p75": 150000, "source": "BLS_2024"},
            "Project Manager": {"median_usd": 118000, "p25": 95000, "p75": 145000, "source": "BLS_2024"},
            "Business Analyst": {"median_usd": 95000, "p25": 75000, "p75": 115000, "source": "BLS_2024"}
        }
        save_json(role_salaries_path, role_salaries)
    
    # Build companies by domain
    companies = {}
    for domain, role_kws in DOMAIN_ROLES.items():
        companies[domain] = top_companies_for_domain(domain, role_kws)
    
    save_json(DATA / "companies" / "by_domain.json", companies)
    
    # Build company recommendations
    rankings = {}
    if (DATA / "rankings" / "today.json").exists():
        rankings_list = load_json(DATA / "rankings" / "today.json")
        rankings = {r["slug"]: r for r in rankings_list}
    
    # Compute normalization factors
    fees = [float(c["exam_fee_usd"]) for c in certs if c.get("exam_fee_usd")]
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
    
    # Build recommendations
    recommendations = defaultdict(dict)
    cert_by_slug = {c["slug"]: c for c in certs}
    roles_by_cert = {c["slug"]: infer_cert_roles(c) for c in certs}
    
    for domain, comp_list in companies.items():
        domain_certs = [c["slug"] for c in certs if normalize_domain_slug(c["domain"]) == domain]
        
        for comp in comp_list:
            comp_roles = set(comp["top_roles"].keys())
            scored = []
            
            for slug in domain_certs:
                cert = cert_by_slug[slug]
                
                ra = role_alignment(roles_by_cert[slug], comp_roles)
                gn = global_rank_norm(slug)
                fp = fee_penalty(cert)
                
                # Calculate issuer affinity
                issuer = cert.get("issuer", "")
                company_name = comp["name"]
                ia = issuer_affinity.get(company_name, {}).get(issuer, 0.0)
                
                # Enhanced fit score: 50% role alignment + 30% global rank + 20% issuer affinity - 5% cost penalty
                fit_score = 0.5 * ra + 0.3 * gn + 0.2 * ia - 0.05 * fp
                
                signals = {
                    "role_alignment": round(ra, 3),
                    "issuer_affinity": round(ia, 3),
                    "global_rank_norm": round(gn, 3),
                    "cost_penalty": round(fp, 3),
                    "mention_count": 0,  # Would be populated in real mode
                    "mention_z": 0.0
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
    
    save_json(DATA / "companies" / "recommendations.json", recommendations)
    
    # Load role salaries for counting
    role_salaries = load_json(role_salaries_path) if role_salaries_path.exists() else {}
    
    print("Generated:")
    print(f"- Demand metrics: {len(demand_metrics)} certifications")
    print(f"- Role salaries: {len(role_salaries)} roles")
    print(f"- Companies by domain: {sum(len(comps) for comps in companies.values())} companies")
    print(f"- Company recommendations: {sum(len(recs) for domain_recs in recommendations.values() for recs in domain_recs.values())} recommendations")

if __name__ == "__main__":
    main()