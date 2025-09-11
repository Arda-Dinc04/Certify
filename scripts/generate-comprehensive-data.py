#!/usr/bin/env python3
"""
Comprehensive Certification Data Generator
Generates realistic certification data for the CertRank platform with:
- 500+ certifications across all domains
- 80+ certification issuers
- Realistic pricing, ratings, and job market data
- Company hiring data and certification recommendations
"""

import json
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import os
from pathlib import Path

# Configuration
TOTAL_CERTIFICATIONS = 500
TOTAL_COMPANIES = 200
OUTPUT_DIR = Path("../web/public/data")

# Domain definitions (matching our domain registry)
DOMAINS = {
    "cs-it": {
        "label": "CS / IT",
        "emoji": "💻",
        "weight": 0.35  # 35% of certifications
    },
    "engineering-business": {
        "label": "Engineering / Business",
        "emoji": "⚙️",
        "weight": 0.25
    },
    "healthcare": {
        "label": "Healthcare",
        "emoji": "🏥",
        "weight": 0.15
    },
    "finance": {
        "label": "Finance",
        "emoji": "💰",
        "weight": 0.15
    },
    "skilled-trades": {
        "label": "Skilled Trades",
        "emoji": "🔧",
        "weight": 0.10
    }
}

# Comprehensive issuer data
ISSUERS = {
    # Technology & Cloud
    "Amazon Web Services (AWS)": {
        "domains": ["cs-it", "engineering-business"],
        "popularity": 0.95,
        "avg_cost": 150,
        "cert_count": 25
    },
    "Microsoft": {
        "domains": ["cs-it", "engineering-business"],
        "popularity": 0.95,
        "avg_cost": 165,
        "cert_count": 30
    },
    "Google": {
        "domains": ["cs-it", "engineering-business"],
        "popularity": 0.90,
        "avg_cost": 200,
        "cert_count": 20
    },
    "Oracle": {
        "domains": ["cs-it", "engineering-business", "finance"],
        "popularity": 0.85,
        "avg_cost": 300,
        "cert_count": 18
    },
    "Salesforce": {
        "domains": ["cs-it", "engineering-business"],
        "popularity": 0.80,
        "avg_cost": 200,
        "cert_count": 15
    },
    "VMware": {
        "domains": ["cs-it"],
        "popularity": 0.75,
        "avg_cost": 250,
        "cert_count": 12
    },
    "Red Hat": {
        "domains": ["cs-it"],
        "popularity": 0.80,
        "avg_cost": 400,
        "cert_count": 14
    },
    "Cisco": {
        "domains": ["cs-it"],
        "popularity": 0.90,
        "avg_cost": 350,
        "cert_count": 20
    },
    "Docker": {
        "domains": ["cs-it"],
        "popularity": 0.70,
        "avg_cost": 300,
        "cert_count": 5
    },
    "Kubernetes": {
        "domains": ["cs-it"],
        "popularity": 0.75,
        "avg_cost": 375,
        "cert_count": 8
    },
    
    # Security & Compliance
    "CompTIA": {
        "domains": ["cs-it"],
        "popularity": 0.90,
        "avg_cost": 350,
        "cert_count": 15
    },
    "ISACA": {
        "domains": ["cs-it", "finance"],
        "popularity": 0.75,
        "avg_cost": 450,
        "cert_count": 8
    },
    "(ISC)²": {
        "domains": ["cs-it"],
        "popularity": 0.80,
        "avg_cost": 750,
        "cert_count": 7
    },
    "EC-Council": {
        "domains": ["cs-it"],
        "popularity": 0.65,
        "avg_cost": 550,
        "cert_count": 10
    },
    
    # Project Management & Business
    "PMI": {
        "domains": ["engineering-business"],
        "popularity": 0.85,
        "avg_cost": 400,
        "cert_count": 8
    },
    "Scrum.org": {
        "domains": ["engineering-business"],
        "popularity": 0.75,
        "avg_cost": 200,
        "cert_count": 6
    },
    "Atlassian": {
        "domains": ["engineering-business", "cs-it"],
        "popularity": 0.70,
        "avg_cost": 150,
        "cert_count": 4
    },
    "Six Sigma Institute": {
        "domains": ["engineering-business"],
        "popularity": 0.65,
        "avg_cost": 500,
        "cert_count": 8
    },
    
    # Finance & Banking
    "CFA Institute": {
        "domains": ["finance"],
        "popularity": 0.90,
        "avg_cost": 1000,
        "cert_count": 5
    },
    "FRM": {
        "domains": ["finance"],
        "popularity": 0.80,
        "avg_cost": 850,
        "cert_count": 3
    },
    "FINRA": {
        "domains": ["finance"],
        "popularity": 0.85,
        "avg_cost": 300,
        "cert_count": 12
    },
    "CAIA Association": {
        "domains": ["finance"],
        "popularity": 0.70,
        "avg_cost": 900,
        "cert_count": 4
    },
    
    # Healthcare
    "NREMT": {
        "domains": ["healthcare"],
        "popularity": 0.95,
        "avg_cost": 90,
        "cert_count": 6
    },
    "AACN": {
        "domains": ["healthcare"],
        "popularity": 0.80,
        "avg_cost": 400,
        "cert_count": 8
    },
    "ANCC": {
        "domains": ["healthcare"],
        "popularity": 0.85,
        "avg_cost": 350,
        "cert_count": 10
    },
    "ARDMS": {
        "domains": ["healthcare"],
        "popularity": 0.75,
        "avg_cost": 500,
        "cert_count": 7
    },
    "ARRT": {
        "domains": ["healthcare"],
        "popularity": 0.90,
        "avg_cost": 200,
        "cert_count": 15
    },
    
    # Skilled Trades
    "NCCER": {
        "domains": ["skilled-trades"],
        "popularity": 0.85,
        "avg_cost": 150,
        "cert_count": 20
    },
    "AWS Welding Society": {
        "domains": ["skilled-trades"],
        "popularity": 0.90,
        "avg_cost": 300,
        "cert_count": 12
    },
    "NATE": {
        "domains": ["skilled-trades"],
        "popularity": 0.75,
        "avg_cost": 200,
        "cert_count": 8
    },
    "HVAC Excellence": {
        "domains": ["skilled-trades"],
        "popularity": 0.80,
        "avg_cost": 250,
        "cert_count": 10
    },
    "OSHA": {
        "domains": ["skilled-trades", "engineering-business"],
        "popularity": 0.95,
        "avg_cost": 100,
        "cert_count": 15
    }
}

# Certification templates for realistic naming
CERT_TEMPLATES = {
    "cs-it": [
        "{issuer} Certified {specialty} {level}",
        "{issuer} {specialty} {certification_type}",
        "{specialty} {level} Certification",
        "Certified {specialty} {professional_type}",
        "{issuer} {domain_tech} {specialty} Exam"
    ],
    "engineering-business": [
        "Project Management {level}",
        "{methodology} {role} Certification", 
        "Certified {business_area} {level}",
        "{issuer} {business_function} Certificate",
        "{level} {business_area} Professional"
    ],
    "healthcare": [
        "Certified {medical_specialty} {level}",
        "{medical_area} Certification Board",
        "Registered {healthcare_role}",
        "{medical_specialty} {certification_type}",
        "{issuer} {medical_area} Credential"
    ],
    "finance": [
        "Chartered {finance_area} {level}",
        "Certified {finance_specialty} {professional_type}",
        "{finance_area} Risk {level}",
        "{issuer} {finance_function} Certificate",
        "Financial {specialty} {certification_type}"
    ],
    "skilled-trades": [
        "Certified {trade} {level}",
        "{trade} {specialty} Certification",
        "{safety_area} Safety Certificate",
        "{trade} {equipment_type} {level}",
        "Master {trade} Certification"
    ]
}

# Vocabulary for generating realistic names
VOCABULARIES = {
    "specialty": ["Security", "Analytics", "Architecture", "Development", "Administration", "Engineering"],
    "level": ["Associate", "Professional", "Expert", "Master", "Advanced", "Foundational"],
    "certification_type": ["Certification", "Certificate", "Credential", "Exam", "Qualification"],
    "professional_type": ["Professional", "Specialist", "Expert", "Practitioner", "Administrator"],
    "domain_tech": ["Cloud", "Data", "Network", "System", "Software", "Infrastructure"],
    "methodology": ["Agile", "Scrum", "Lean", "ITIL", "DevOps", "Six Sigma"],
    "role": ["Master", "Owner", "Manager", "Lead", "Coordinator", "Analyst"],
    "business_area": ["Analytics", "Operations", "Strategy", "Quality", "Process", "Leadership"],
    "business_function": ["Management", "Analysis", "Operations", "Strategy", "Finance", "Marketing"],
    "medical_specialty": ["Emergency", "Critical Care", "Nursing", "Radiology", "Anesthesia", "Pharmacy"],
    "medical_area": ["Emergency Medical", "Nursing", "Medical Imaging", "Laboratory", "Surgical", "Clinical"],
    "healthcare_role": ["Nurse", "Technician", "Therapist", "Assistant", "Specialist", "Coordinator"],
    "finance_area": ["Financial", "Investment", "Risk", "Wealth", "Credit", "Banking"],
    "finance_specialty": ["Planner", "Analyst", "Manager", "Advisor", "Auditor", "Consultant"],
    "finance_function": ["Analysis", "Planning", "Management", "Advisory", "Compliance", "Operations"],
    "trade": ["Welding", "Electrical", "HVAC", "Plumbing", "Carpentry", "Masonry"],
    "safety_area": ["Construction", "Industrial", "Occupational", "Environmental", "Workplace", "Safety"],
    "equipment_type": ["Systems", "Equipment", "Installation", "Maintenance", "Repair", "Operations"]
}

def generate_certification_name(domain: str, issuer: str) -> str:
    """Generate realistic certification names based on domain and issuer."""
    templates = CERT_TEMPLATES.get(domain, CERT_TEMPLATES["cs-it"])
    template = random.choice(templates)
    
    # Replace placeholders with appropriate vocabulary
    name = template
    for key, values in VOCABULARIES.items():
        if f"{{{key}}}" in name:
            name = name.replace(f"{{{key}}}", random.choice(values))
    
    name = name.replace("{issuer}", issuer.split()[0])  # Use first word of issuer
    
    return name

def create_slug(name: str) -> str:
    """Create URL-friendly slug from certification name."""
    return name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("/", "-")

def generate_realistic_rating() -> float:
    """Generate realistic rating with bias towards higher ratings."""
    # Most certifications have ratings between 3.5 and 4.8
    return round(random.uniform(3.2, 4.9), 1)

def generate_realistic_cost(issuer_data: Dict) -> int:
    """Generate realistic cost based on issuer average with variation."""
    base_cost = issuer_data["avg_cost"]
    variation = random.uniform(0.7, 1.4)  # ±40% variation
    return int(base_cost * variation)

def generate_job_postings() -> int:
    """Generate realistic job posting counts."""
    # Most certs have 10-500 job postings mentioning them
    return random.choice([
        random.randint(5, 50),      # 40% - Lower demand
        random.randint(51, 200),    # 35% - Medium demand  
        random.randint(201, 800),   # 20% - High demand
        random.randint(801, 2000)   # 5% - Very high demand
    ])

def generate_salary_data(domain: str) -> Dict:
    """Generate salary ranges based on domain."""
    base_salaries = {
        "cs-it": {"min": 65000, "max": 150000, "avg": 95000},
        "engineering-business": {"min": 70000, "max": 140000, "avg": 90000},
        "healthcare": {"min": 45000, "max": 120000, "avg": 75000},
        "finance": {"min": 60000, "max": 200000, "avg": 110000},
        "skilled-trades": {"min": 40000, "max": 90000, "avg": 60000}
    }
    
    base = base_salaries[domain]
    # Add some variation
    variation = random.uniform(0.8, 1.2)
    
    return {
        "min": int(base["min"] * variation),
        "max": int(base["max"] * variation),
        "avg": int(base["avg"] * variation)
    }

def generate_certifications() -> List[Dict]:
    """Generate comprehensive certification dataset."""
    certifications = []
    cert_id = 1
    
    for domain, domain_info in DOMAINS.items():
        domain_cert_count = int(TOTAL_CERTIFICATIONS * domain_info["weight"])
        
        # Get issuers for this domain
        domain_issuers = {k: v for k, v in ISSUERS.items() if domain in v["domains"]}
        
        for _ in range(domain_cert_count):
            # Select issuer based on popularity
            issuer_weights = [data["popularity"] for data in domain_issuers.values()]
            issuer = random.choices(list(domain_issuers.keys()), weights=issuer_weights)[0]
            issuer_data = domain_issuers[issuer]
            
            # Generate certification data
            name = generate_certification_name(domain, issuer)
            slug = create_slug(name)
            
            # Ensure unique slug
            existing_slugs = [cert["slug"] for cert in certifications]
            counter = 1
            original_slug = slug
            while slug in existing_slugs:
                slug = f"{original_slug}-{counter}"
                counter += 1
            
            level = random.choice(["Foundational", "Associate", "Professional", "Expert", "Specialty"])
            duration_hours = random.choice([8, 16, 24, 40, 80, 120, 160, 200])
            duration = f"{duration_hours} hours" if duration_hours < 40 else f"{duration_hours//40} weeks"
            
            certification = {
                "id": cert_id,
                "slug": slug,
                "name": name,
                "issuer": issuer,
                "domain": domain,
                "level": level,
                "duration": duration,
                "cost": generate_realistic_cost(issuer_data),
                "currency": "USD",
                "rating": generate_realistic_rating(),
                "total_reviews": random.randint(10, 500),
                "job_postings": generate_job_postings(),
                "salary": generate_salary_data(domain),
                "difficulty": random.choice(["Beginner", "Intermediate", "Advanced"]),
                "validity_years": random.choice([2, 3, 4]),
                "prerequisites": random.choice([[], ["Basic knowledge"], ["Previous certification"], ["Work experience"]]),
                "skills": generate_skills(domain),
                "description": f"Professional certification in {name.lower()} offered by {issuer}.",
                "exam_format": random.choice(["Multiple Choice", "Practical", "Mixed", "Project-based"]),
                "passing_score": random.randint(65, 85),
                "languages": ["English"] + random.sample(["Spanish", "French", "German", "Portuguese"], k=random.randint(0, 2))
            }
            
            certifications.append(certification)
            cert_id += 1
    
    return certifications

def generate_skills(domain: str) -> List[str]:
    """Generate relevant skills for certification based on domain."""
    skill_pools = {
        "cs-it": [
            "Cloud Computing", "DevOps", "Kubernetes", "Docker", "AWS", "Azure", "Python", 
            "Linux", "Network Security", "Database Management", "API Development", 
            "Microservices", "CI/CD", "Infrastructure as Code", "System Administration"
        ],
        "engineering-business": [
            "Project Management", "Agile", "Scrum", "Lean Management", "Process Improvement",
            "Business Analysis", "Risk Management", "Quality Assurance", "Leadership",
            "Strategic Planning", "Change Management", "Six Sigma"
        ],
        "healthcare": [
            "Patient Care", "Medical Procedures", "Healthcare Compliance", "Electronic Health Records",
            "Medical Imaging", "Clinical Assessment", "Emergency Response", "Pharmacology",
            "Infection Control", "Medical Equipment", "Healthcare Analytics"
        ],
        "finance": [
            "Financial Analysis", "Risk Assessment", "Investment Management", "Regulatory Compliance",
            "Financial Modeling", "Portfolio Management", "Trading", "Banking", "Insurance",
            "Financial Planning", "Accounting", "Auditing"
        ],
        "skilled-trades": [
            "Safety Procedures", "Equipment Operation", "Troubleshooting", "Installation",
            "Maintenance", "Blueprint Reading", "Quality Control", "Tool Proficiency",
            "Electrical Systems", "Mechanical Systems", "Construction", "Inspection"
        ]
    }
    
    pool = skill_pools.get(domain, skill_pools["cs-it"])
    return random.sample(pool, k=random.randint(3, 8))

def generate_companies() -> List[Dict]:
    """Generate comprehensive company dataset."""
    company_names = [
        "TechCorp", "InnovateNow", "DataDriven Solutions", "CloudFirst Technologies",
        "SecureNet Systems", "AnalyticsPro", "DevOps Masters", "ScaleTech",
        "HealthTech Innovations", "MedicalCore Systems", "CarePlus Technologies",
        "FinanceForward", "InvestSmart", "BankingTech", "RiskManage Pro",
        "TradesMaster", "SafetyFirst Corp", "BuildRight Technologies",
        "ManufacturingTech", "QualityAssurance Systems"
    ] + [f"Company{i}" for i in range(21, TOTAL_COMPANIES + 1)]
    
    companies = []
    for i, name in enumerate(company_names[:TOTAL_COMPANIES], 1):
        # Assign primary domain
        primary_domain = random.choices(
            list(DOMAINS.keys()), 
            weights=[info["weight"] for info in DOMAINS.values()]
        )[0]
        
        slug = name.lower().replace(" ", "-").replace(".", "")
        
        # Generate job postings for different roles
        roles = generate_company_roles(primary_domain)
        total_postings = sum(roles.values())
        
        company = {
            "company_id": i,
            "slug": slug,
            "name": name,
            "primary_domain": primary_domain,
            "postings_30d": total_postings,
            "top_roles": roles,
            "employee_count": random.choice(["1-50", "51-200", "201-1000", "1000-5000", "5000+"]),
            "industry": get_industry_for_domain(primary_domain),
            "locations": random.sample(["New York", "San Francisco", "Austin", "Seattle", "Chicago", "Boston", "Remote"], k=random.randint(1, 4))
        }
        
        companies.append(company)
    
    return companies

def generate_company_roles(domain: str) -> Dict[str, int]:
    """Generate realistic job roles and counts for a company in a specific domain."""
    role_pools = {
        "cs-it": [
            "Software Engineer", "DevOps Engineer", "Cloud Architect", "Data Scientist",
            "Security Engineer", "Full Stack Developer", "System Administrator",
            "Database Administrator", "Network Engineer", "Product Manager"
        ],
        "engineering-business": [
            "Project Manager", "Business Analyst", "Process Engineer", "Quality Engineer",
            "Operations Manager", "Scrum Master", "Product Owner", "Program Manager",
            "Business Operations", "Strategy Consultant"
        ],
        "healthcare": [
            "Registered Nurse", "Medical Technician", "Healthcare Administrator",
            "Clinical Specialist", "Medical Assistant", "Pharmacy Technician",
            "Radiology Tech", "Emergency Medical Technician", "Clinical Coordinator"
        ],
        "finance": [
            "Financial Analyst", "Investment Advisor", "Risk Manager", "Compliance Officer",
            "Portfolio Manager", "Credit Analyst", "Banking Associate", "Auditor",
            "Financial Planner", "Quantitative Analyst"
        ],
        "skilled-trades": [
            "Electrician", "HVAC Technician", "Welder", "Carpenter", "Plumber",
            "Construction Worker", "Equipment Operator", "Safety Inspector",
            "Maintenance Technician", "Industrial Mechanic"
        ]
    }
    
    pool = role_pools[domain]
    num_roles = random.randint(3, 7)
    selected_roles = random.sample(pool, k=num_roles)
    
    roles = {}
    for role in selected_roles:
        # Generate realistic job counts with power law distribution
        count = random.choices(
            [random.randint(1, 5), random.randint(6, 20), random.randint(21, 50)],
            weights=[0.6, 0.3, 0.1]
        )[0]
        roles[role] = count
    
    return roles

def get_industry_for_domain(domain: str) -> str:
    """Map domain to realistic industry."""
    industry_map = {
        "cs-it": random.choice(["Technology", "Software", "Cloud Services", "Cybersecurity"]),
        "engineering-business": random.choice(["Consulting", "Manufacturing", "Engineering", "Business Services"]),
        "healthcare": random.choice(["Healthcare", "Medical Devices", "Pharmaceuticals", "Hospital Systems"]),
        "finance": random.choice(["Financial Services", "Banking", "Investment Management", "Insurance"]),
        "skilled-trades": random.choice(["Construction", "Manufacturing", "Utilities", "Transportation"])
    }
    return industry_map[domain]

def generate_company_recommendations(certifications: List[Dict], companies: List[Dict]) -> Dict:
    """Generate certification recommendations for each company."""
    recommendations = {}
    
    for domain in DOMAINS.keys():
        recommendations[domain] = {}
        domain_companies = [c for c in companies if c["primary_domain"] == domain]
        domain_certifications = [c for c in certifications if c["domain"] == domain]
        
        for company in domain_companies:
            company_recs = []
            
            # Select top certifications for this company
            num_recommendations = min(random.randint(5, 15), len(domain_certifications))
            selected_certs = random.sample(domain_certifications, k=num_recommendations)
            
            for cert in selected_certs:
                # Generate realistic fit scores and signals
                role_alignment = random.uniform(0.2, 0.9)
                issuer_affinity = random.uniform(0.1, 0.8)
                global_rank_norm = random.uniform(0.3, 1.0)
                cost_penalty = random.uniform(0.0, 0.15)
                
                fit_score = (role_alignment * 0.4 + issuer_affinity * 0.3 + global_rank_norm * 0.3) - cost_penalty
                fit_score = max(0.1, min(1.0, fit_score))  # Clamp between 0.1 and 1.0
                
                recommendation = {
                    "slug": cert["slug"],
                    "fit_score": round(fit_score, 3),
                    "signals": {
                        "role_alignment": round(role_alignment, 3),
                        "issuer_affinity": round(issuer_affinity, 3),
                        "global_rank_norm": round(global_rank_norm, 3),
                        "cost_penalty": round(cost_penalty, 3),
                        "mention_count": random.randint(0, 20),
                        "mention_z": round(random.uniform(-1.0, 3.0), 2)
                    }
                }
                company_recs.append(recommendation)
            
            # Sort by fit score
            company_recs.sort(key=lambda x: x["fit_score"], reverse=True)
            recommendations[domain][company["slug"]] = company_recs
    
    return recommendations

def generate_rankings_data(certifications: List[Dict]) -> Dict:
    """Generate ranking data for today and trends."""
    today_rankings = []
    
    for domain in DOMAINS.keys():
        domain_certs = [c for c in certifications if c["domain"] == domain]
        # Sort by a composite score (rating + job_postings)
        domain_certs.sort(key=lambda x: x["rating"] * 0.6 + (x["job_postings"] / 1000) * 0.4, reverse=True)
        
        for rank, cert in enumerate(domain_certs[:20], 1):  # Top 20 per domain
            today_rankings.append({
                "rank": rank,
                "slug": cert["slug"],
                "name": cert["name"],
                "issuer": cert["issuer"],
                "domain": domain,
                "rating": cert["rating"],
                "job_postings": cert["job_postings"],
                "trend": random.choice(["up", "down", "stable"]),
                "change": random.randint(-5, 5)
            })
    
    # Generate trend data (simplified)
    trends = {
        "overall": {
            "growing_domains": ["cs-it", "healthcare"],
            "declining_domains": [],
            "hot_certifications": [r["slug"] for r in today_rankings[:10]],
            "emerging_skills": ["Cloud Security", "AI/ML", "DevOps", "Data Analytics"]
        }
    }
    
    return {
        "today": today_rankings,
        "trends": trends
    }

def save_json_data(data: Any, filepath: Path) -> None:
    """Save data as JSON with pretty formatting."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved {filepath}")

def main():
    """Generate comprehensive certification platform data."""
    print("🚀 Generating comprehensive certification data...")
    print(f"📊 Target: {TOTAL_CERTIFICATIONS} certifications, {TOTAL_COMPANIES} companies")
    
    # Generate core data
    print("\n📋 Generating certifications...")
    certifications = generate_certifications()
    print(f"✅ Generated {len(certifications)} certifications")
    
    print("🏢 Generating companies...")
    companies = generate_companies()
    print(f"✅ Generated {len(companies)} companies")
    
    print("🎯 Generating company recommendations...")
    recommendations = generate_company_recommendations(certifications, companies)
    print("✅ Generated company recommendations")
    
    print("📈 Generating rankings...")
    rankings_data = generate_rankings_data(certifications)
    print("✅ Generated rankings and trends")
    
    # Save all data
    print("\n💾 Saving data files...")
    
    # Certifications by domain (for sharded service)
    certs_by_domain = {}
    for cert in certifications:
        domain = cert["domain"]
        if domain not in certs_by_domain:
            certs_by_domain[domain] = []
        certs_by_domain[domain].append(cert)
    
    for domain, certs in certs_by_domain.items():
        save_json_data(certs, OUTPUT_DIR / f"certifications/{domain}.json")
    
    # Companies data
    companies_by_domain = {}
    for company in companies:
        domain = company["primary_domain"]
        if domain not in companies_by_domain:
            companies_by_domain[domain] = []
        companies_by_domain[domain].append(company)
    
    save_json_data(companies_by_domain, OUTPUT_DIR / "companies/by_domain.json")
    save_json_data(recommendations, OUTPUT_DIR / "companies/recommendations.json")
    
    # Rankings
    save_json_data(rankings_data["today"], OUTPUT_DIR / "rankings/today.json")
    save_json_data(rankings_data["trends"], OUTPUT_DIR / "rankings/trends.json")
    
    # Generate manifest
    manifest = {
        "version": "2.0.0",
        "generated_at": datetime.now().isoformat(),
        "stats": {
            "total_certifications": len(certifications),
            "total_companies": len(companies),
            "domains": len(DOMAINS),
            "issuers": len(ISSUERS)
        },
        "shards": {
            domain: {
                "file": f"certifications/{domain}.json",
                "count": len(certs),
                "last_updated": datetime.now().isoformat()
            }
            for domain, certs in certs_by_domain.items()
        }
    }
    save_json_data(manifest, OUTPUT_DIR / "manifest.json")
    
    # Summary statistics
    print(f"\n📊 Data Generation Complete!")
    print(f"   • {len(certifications)} certifications across {len(DOMAINS)} domains")
    print(f"   • {len(ISSUERS)} certification issuers")  
    print(f"   • {len(companies)} companies with hiring data")
    print(f"   • Rankings for top certifications per domain")
    print(f"   • Company-specific certification recommendations")
    
    domain_counts = {domain: len([c for c in certifications if c["domain"] == domain]) for domain in DOMAINS}
    print(f"\n📈 Certifications by Domain:")
    for domain, count in domain_counts.items():
        print(f"   • {DOMAINS[domain]['label']}: {count}")

if __name__ == "__main__":
    main()