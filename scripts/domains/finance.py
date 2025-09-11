# Finance domain certification producer
from datetime import datetime
import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))
from utils.slugify import slugify

def produce() -> list[dict]:
    """Returns list of normalized certifications for Finance domain."""
    now = datetime.utcnow().isoformat() + "Z"
    
    seeds = [
        {
            "name": "CFA Level I",
            "issuer": "CFA Institute",
            "url": "https://www.cfainstitute.org/",
            "level": "Professional",
            "exam_fee_usd": 940,
            "price_source": "estimate",
            "recommended_hours_min": 250,
            "recommended_hours_max": 300,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "MCQ",
            "regions": "Global"
        },
        {
            "name": "CFA Level II",
            "issuer": "CFA Institute", 
            "url": "https://www.cfainstitute.org/",
            "level": "Professional",
            "exam_fee_usd": 940,
            "price_source": "estimate",
            "recommended_hours_min": 300,
            "recommended_hours_max": 350,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "MCQ",
            "regions": "Global"
        },
        {
            "name": "CFA Level III",
            "issuer": "CFA Institute",
            "url": "https://www.cfainstitute.org/",
            "level": "Expert",
            "exam_fee_usd": 940,
            "price_source": "estimate",
            "recommended_hours_min": 350,
            "recommended_hours_max": 400,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center", 
            "format": "MCQ + Essay",
            "regions": "Global"
        },
        {
            "name": "FRM Part I",
            "issuer": "GARP",
            "url": "https://www.garp.org/frm",
            "level": "Professional",
            "exam_fee_usd": 600,
            "price_source": "estimate",
            "recommended_hours_min": 200,
            "recommended_hours_max": 300,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "MCQ",
            "regions": "Global"
        },
        {
            "name": "FRM Part II",
            "issuer": "GARP",
            "url": "https://www.garp.org/frm",
            "level": "Professional", 
            "exam_fee_usd": 600,
            "price_source": "estimate",
            "recommended_hours_min": 250,
            "recommended_hours_max": 350,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "MCQ",
            "regions": "Global"
        },
        {
            "name": "CPA",
            "issuer": "State Boards / NASBA",
            "url": "https://nasba.org/exams/cpaexam/",
            "level": "Professional",
            "exam_fee_usd": 1000,
            "price_source": "heuristic",
            "recommended_hours_min": 300,
            "recommended_hours_max": 450,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "MCQ+Task-based",
            "regions": "US"
        },
        {
            "name": "CMA (Certified Management Accountant)",
            "issuer": "IMA",
            "url": "https://www.imanet.org/cma-certification",
            "level": "Professional",
            "exam_fee_usd": 415,
            "price_source": "heuristic",
            "recommended_hours_min": 150,
            "recommended_hours_max": 250,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "MCQ + Essay",
            "regions": "Global"
        },
        {
            "name": "CIA (Certified Internal Auditor)",
            "issuer": "IIA",
            "url": "https://www.theiia.org/en/certifications/cia/",
            "level": "Professional",
            "exam_fee_usd": 375,
            "price_source": "heuristic",
            "recommended_hours_min": 120,
            "recommended_hours_max": 200,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "MCQ",
            "regions": "Global"
        },
        {
            "name": "CISA (Certified Information Systems Auditor)",
            "issuer": "ISACA",
            "url": "https://www.isaca.org/credentialing/cisa",
            "level": "Professional",
            "exam_fee_usd": 760,
            "price_source": "heuristic",
            "recommended_hours_min": 200,
            "recommended_hours_max": 300,
            "hours_source": "heuristic", 
            "validity_years": 3,
            "delivery": "test center",
            "format": "MCQ",
            "regions": "Global"
        },
        {
            "name": "CFP (Certified Financial Planner)",
            "issuer": "CFP Board",
            "url": "https://www.cfp.net/",
            "level": "Professional",
            "exam_fee_usd": 825,
            "price_source": "heuristic",
            "recommended_hours_min": 250,
            "recommended_hours_max": 350,
            "hours_source": "heuristic",
            "validity_years": 2,
            "delivery": "test center",
            "format": "MCQ",
            "regions": "US"
        },
        {
            "name": "CAMS (Certified Anti-Money Laundering Specialist)",
            "issuer": "ACAMS",
            "url": "https://www.acams.org/en/cams-certification",
            "level": "Professional",
            "exam_fee_usd": 1495,
            "price_source": "heuristic",
            "recommended_hours_min": 40,
            "recommended_hours_max": 80,
            "hours_source": "heuristic",
            "validity_years": 3,
            "delivery": "test center",
            "format": "MCQ",
            "regions": "Global"
        },
        {
            "name": "EA (Enrolled Agent)",
            "issuer": "IRS",
            "url": "https://www.irs.gov/tax-professionals/enrolled-agents",
            "level": "Professional",
            "exam_fee_usd": 181,
            "price_source": "heuristic", 
            "recommended_hours_min": 120,
            "recommended_hours_max": 200,
            "hours_source": "heuristic",
            "validity_years": 3,
            "delivery": "test center",
            "format": "MCQ",
            "regions": "US"
        }
    ]
    
    out = []
    for s in seeds:
        slug = slugify(f"{s['name']}-{s['issuer']}")
        out.append({
            "slug": slug,
            "name": s["name"],
            "domain": "Finance",
            "issuer": s["issuer"],
            "url": s["url"],
            "level": s["level"],
            "exam_fee_usd": s.get("exam_fee_usd"),
            "price_source": s.get("price_source"),
            "recommended_hours_min": s.get("recommended_hours_min"),
            "recommended_hours_max": s.get("recommended_hours_max"),
            "hours_source": s.get("hours_source"),
            "validity_years": s.get("validity_years"),
            "delivery": s.get("delivery"),
            "format": s.get("format"),
            "regions": s.get("regions"),
            "last_checked_utc": now,
            "sources": [{
                "field": "exam_fee_usd",
                "type": s.get("price_source", "heuristic"),
                "url": s.get("url"),
                "checked_at": now
            }]
        })
    
    return out