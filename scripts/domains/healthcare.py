# Healthcare domain certification producer
from datetime import datetime
import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))
from utils.slugify import slugify

def produce() -> list[dict]:
    """Returns list of normalized certifications for Healthcare domain."""
    now = datetime.utcnow().isoformat() + "Z"
    out = []

    # Seed healthcare certifications (expand with more real entries as needed)
    seeds = [
        {
            "name": "NCLEX-RN",
            "issuer": "NCSBN",
            "url": "https://www.ncsbn.org/exams/nclex",
            "level": "Foundational",
            "exam_fee_usd": 200,
            "price_source": "heuristic",
            "recommended_hours_min": 120,
            "recommended_hours_max": 200,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "adaptive MCQ",
            "regions": "US",
            "license_authority": "State Boards of Nursing",
            "prerequisites": "State eligibility; nursing education",
            "ce_credits": None
        },
        {
            "name": "CIC (Certification in Infection Control)",
            "issuer": "CBIC",
            "url": "https://www.cbic.org/",
            "level": "Professional",
            "exam_fee_usd": 410,
            "price_source": "heuristic",
            "recommended_hours_min": 60,
            "recommended_hours_max": 120,
            "hours_source": "heuristic",
            "validity_years": 5,
            "delivery": "online or test center",
            "format": "multiple choice",
            "regions": "Global",
            "license_authority": None,
            "prerequisites": "Experience in infection prevention/control",
            "ce_credits": 80
        },
        {
            "name": "CCRN (Critical Care Registered Nurse)",
            "issuer": "AACN",
            "url": "https://www.aacn.org/certification",
            "level": "Professional",
            "exam_fee_usd": 285,
            "price_source": "heuristic",
            "recommended_hours_min": 80,
            "recommended_hours_max": 150,
            "hours_source": "heuristic",
            "validity_years": 3,
            "delivery": "test center",
            "format": "multiple choice",
            "regions": "US",
            "license_authority": None,
            "prerequisites": "RN license; minimum 1 yr ICU experience",
            "ce_credits": 100
        },
        {
            "name": "FNP-C (Family Nurse Practitioner)",
            "issuer": "ANCC",
            "url": "https://www.nursingworld.org/our-certifications/family-nurse-practitioner/",
            "level": "Expert",
            "exam_fee_usd": 395,
            "price_source": "heuristic",
            "recommended_hours_min": 200,
            "recommended_hours_max": 300,
            "hours_source": "heuristic",
            "validity_years": 5,
            "delivery": "test center",
            "format": "multiple choice",
            "regions": "US",
            "license_authority": "State Boards of Nursing",
            "prerequisites": "MSN in Family Practice; clinical hours",
            "ce_credits": 75
        },
        {
            "name": "NREMT-P (National Registry Paramedic)",
            "issuer": "NREMT",
            "url": "https://www.nremt.org/",
            "level": "Professional",
            "exam_fee_usd": 110,
            "price_source": "heuristic",
            "recommended_hours_min": 1000,
            "recommended_hours_max": 1500,
            "hours_source": "heuristic",
            "validity_years": 2,
            "delivery": "test center",
            "format": "adaptive MCQ + practical",
            "regions": "US",
            "license_authority": "State EMS authorities",
            "prerequisites": "Paramedic training program completion",
            "ce_credits": 40
        },
        {
            "name": "ARRT (American Registry of Radiologic Technologists)",
            "issuer": "ARRT",
            "url": "https://www.arrt.org/",
            "level": "Foundational",
            "exam_fee_usd": 200,
            "price_source": "heuristic",
            "recommended_hours_min": 1800,
            "recommended_hours_max": 2400,
            "hours_source": "heuristic",
            "validity_years": 2,
            "delivery": "test center",
            "format": "multiple choice",
            "regions": "US",
            "license_authority": "State licensing boards",
            "prerequisites": "ARRT-approved education program",
            "ce_credits": 24
        },
        {
            "name": "CRT (Certified Respiratory Therapist)",
            "issuer": "NBRC",
            "url": "https://www.nbrc.org/",
            "level": "Foundational",
            "exam_fee_usd": 200,
            "price_source": "heuristic",
            "recommended_hours_min": 120,
            "recommended_hours_max": 180,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "multiple choice",
            "regions": "US",
            "license_authority": "State licensing boards",
            "prerequisites": "RT education program completion",
            "ce_credits": None
        },
        {
            "name": "PharmD (Doctor of Pharmacy)",
            "issuer": "NABP",
            "url": "https://nabp.pharmacy/",
            "level": "Expert",
            "exam_fee_usd": 700,
            "price_source": "heuristic",
            "recommended_hours_min": 4000,
            "recommended_hours_max": 6000,
            "hours_source": "heuristic",
            "validity_years": None,
            "delivery": "test center",
            "format": "multiple choice",
            "regions": "US",
            "license_authority": "State Boards of Pharmacy",
            "prerequisites": "PharmD degree; internship hours",
            "ce_credits": 30
        },
        {
            "name": "CPhT (Certified Pharmacy Technician)",
            "issuer": "PTCB",
            "url": "https://www.ptcb.org/",
            "level": "Associate",
            "exam_fee_usd": 129,
            "price_source": "heuristic",
            "recommended_hours_min": 40,
            "recommended_hours_max": 80,
            "hours_source": "heuristic",
            "validity_years": 2,
            "delivery": "test center",
            "format": "multiple choice",
            "regions": "US",
            "license_authority": "State Boards of Pharmacy",
            "prerequisites": "High school diploma or equivalent",
            "ce_credits": 20
        },
        {
            "name": "CPH (Certified in Public Health)",
            "issuer": "NBPHE",
            "url": "https://www.ceph.org/",
            "level": "Professional",
            "exam_fee_usd": 375,
            "price_source": "heuristic",
            "recommended_hours_min": 100,
            "recommended_hours_max": 200,
            "hours_source": "heuristic",
            "validity_years": 2,
            "delivery": "test center",
            "format": "multiple choice",
            "regions": "US",
            "license_authority": None,
            "prerequisites": "MPH or equivalent; public health experience",
            "ce_credits": 42
        }
    ]

    for s in seeds:
        slug = slugify(f"{s['name']}-{s['issuer']}")
        out.append({
            "slug": slug,
            "name": s["name"],
            "domain": "Healthcare",
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
            }],
            "license_authority": s.get("license_authority"),
            "prerequisites": s.get("prerequisites"),
            "ce_credits": s.get("ce_credits")
        })
    
    return out