# Skilled Trades domain certification producer
from datetime import datetime
import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))
from utils.slugify import slugify

def produce() -> list[dict]:
    """Returns list of normalized certifications for Skilled Trades domain."""
    now = datetime.utcnow().isoformat() + "Z"
    
    seeds = [
        {
            "name": "AWS D1.1 Structural Welding Code",
            "issuer": "American Welding Society",
            "url": "https://www.aws.org/",
            "level": "Professional",
            "exam_fee_usd": 350,
            "price_source": "estimate",
            "recommended_hours_min": 200,
            "recommended_hours_max": 400,
            "hours_source": "heuristic",
            "validity_years": 3,
            "delivery": "practical test",
            "format": "hands-on welding",
            "regions": "US"
        },
        {
            "name": "NCCER Electrical Level 1",
            "issuer": "NCCER",
            "url": "https://www.nccer.org/",
            "level": "Foundational",
            "exam_fee_usd": 65,
            "price_source": "estimate",
            "recommended_hours_min": 75,
            "recommended_hours_max": 150,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "written and performance",
            "regions": "US"
        },
        {
            "name": "NCCER Electrical Level 2",
            "issuer": "NCCER", 
            "url": "https://www.nccer.org/",
            "level": "Associate",
            "exam_fee_usd": 65,
            "price_source": "estimate",
            "recommended_hours_min": 100,
            "recommended_hours_max": 200,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "written and performance",
            "regions": "US"
        },
        {
            "name": "Journeyman Electrician",
            "issuer": "State Licensing Boards",
            "url": "https://www.neca-neis.org/",
            "level": "Professional",
            "exam_fee_usd": 150,
            "price_source": "heuristic",
            "recommended_hours_min": 8000,
            "recommended_hours_max": 10000,
            "hours_source": "heuristic",
            "validity_years": 3,
            "delivery": "test center",
            "format": "written exam",
            "regions": "US"
        },
        {
            "name": "Master Electrician",
            "issuer": "State Licensing Boards",
            "url": "https://www.neca-neis.org/",
            "level": "Expert",
            "exam_fee_usd": 200,
            "price_source": "heuristic",
            "recommended_hours_min": 12000,
            "recommended_hours_max": 16000,
            "hours_source": "heuristic",
            "validity_years": 3,
            "delivery": "test center",
            "format": "written exam",
            "regions": "US"
        },
        {
            "name": "EPA Section 608 Universal",
            "issuer": "EPA",
            "url": "https://www.epa.gov/",
            "level": "Professional",
            "exam_fee_usd": 35,
            "price_source": "heuristic",
            "recommended_hours_min": 20,
            "recommended_hours_max": 40,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "written exam",
            "regions": "US"
        },
        {
            "name": "NATE ICE Certification",
            "issuer": "NATE",
            "url": "https://www.natex.org/",
            "level": "Professional",
            "exam_fee_usd": 75,
            "price_source": "heuristic",
            "recommended_hours_min": 40,
            "recommended_hours_max": 80,
            "hours_source": "heuristic",
            "validity_years": 2,
            "delivery": "test center",
            "format": "written exam",
            "regions": "US"
        },
        {
            "name": "HVAC Excellence Employment Ready",
            "issuer": "HVAC Excellence",
            "url": "https://www.hvacexcellence.org/",
            "level": "Associate",
            "exam_fee_usd": 45,
            "price_source": "heuristic",
            "recommended_hours_min": 60,
            "recommended_hours_max": 120,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "written exam",
            "regions": "US"
        },
        {
            "name": "ASE A1 Engine Repair",
            "issuer": "ASE",
            "url": "https://www.ase.com/",
            "level": "Professional",
            "exam_fee_usd": 61,
            "price_source": "official",
            "recommended_hours_min": 2,
            "recommended_hours_max": 4,
            "hours_source": "heuristic",
            "validity_years": 5,
            "delivery": "test center",
            "format": "multiple choice",
            "regions": "US"
        },
        {
            "name": "ASE Master Automotive Technician",
            "issuer": "ASE",
            "url": "https://www.ase.com/",
            "level": "Expert",
            "exam_fee_usd": 500,
            "price_source": "estimate",
            "recommended_hours_min": 16,
            "recommended_hours_max": 32,
            "hours_source": "heuristic",
            "validity_years": 5,
            "delivery": "test center",
            "format": "multiple choice",
            "regions": "US"
        },
        {
            "name": "OSHA 10-Hour Construction",
            "issuer": "OSHA",
            "url": "https://www.osha.gov/",
            "level": "Foundational",
            "exam_fee_usd": 25,
            "price_source": "heuristic",
            "recommended_hours_min": 10,
            "recommended_hours_max": 12,
            "hours_source": "official",
            "validity_years": None,
            "delivery": "online or classroom",
            "format": "course completion",
            "regions": "US"
        },
        {
            "name": "OSHA 30-Hour Construction",
            "issuer": "OSHA",
            "url": "https://www.osha.gov/",
            "level": "Professional", 
            "exam_fee_usd": 75,
            "price_source": "heuristic",
            "recommended_hours_min": 30,
            "recommended_hours_max": 35,
            "hours_source": "official",
            "validity_years": None,
            "delivery": "online or classroom",
            "format": "course completion",
            "regions": "US"
        }
    ]
    
    out = []
    for s in seeds:
        slug = slugify(f"{s['name']}-{s['issuer']}")
        out.append({
            "slug": slug,
            "name": s["name"],
            "domain": "Skilled Trades",
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