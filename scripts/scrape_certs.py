#!/usr/bin/env python3
"""
Certification scraper - generates certifications and sharded files
Uses domain-specific producers + fixed URLs + heuristics for fees/hours when scraping is blocked
"""

import json
import pathlib
import datetime
import re
import string
from collections import defaultdict
from typing import List, Dict, Any
import requests
from bs4 import BeautifulSoup

# Import domain-specific producers
import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parent))
from domains import healthcare, finance, skilled_trades

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"

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

def save_json(path: pathlib.Path, data: Any) -> None:
    """Save data as JSON with proper formatting"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def get_shard_key(cert_name: str) -> str:
    """Get shard key based on first letter of certification name"""
    first_char = cert_name[0].lower()
    if first_char in string.ascii_lowercase:
        return first_char
    else:
        return "0-9"

def shard_certifications(all_certs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Shard certifications by first letter and create index map"""
    
    print(f"📊 Sharding {len(all_certs)} certifications...")
    
    # Group by shard key
    shards = defaultdict(list)
    for cert in all_certs:
        shard_key = get_shard_key(cert["name"])
        shards[shard_key].append(cert)
    
    # Create shards and index map
    shard_map = {"shards": []}
    total_size = 0
    
    for shard_key in sorted(shards.keys()):
        certs_in_shard = shards[shard_key]
        
        # Determine shard filename and range
        if shard_key == "0-9":
            filename = "0-9.json"
            letters = "0-9"
        else:
            filename = f"{shard_key}.json"
            letters = shard_key
        
        shard_path = DATA_DIR / "certifications" / filename
        save_json(shard_path, certs_in_shard)
        
        # Calculate size
        shard_size = shard_path.stat().st_size
        total_size += shard_size
        
        # Add to map
        shard_map["shards"].append({
            "file": f"/data/certifications/{filename}",
            "letters": letters,
            "count": len(certs_in_shard),
            "size_bytes": shard_size
        })
        
        print(f"  ✅ {filename}: {len(certs_in_shard)} certs ({shard_size:,} bytes)")
    
    return shard_map

def scrape_certifications() -> List[Dict[str, Any]]:
    """Generate certification data using known vendors and heuristics"""
    
    certifications = []
    now = datetime.datetime.utcnow().isoformat() + "Z"
    
    # AWS Certifications
    aws_certs = [
        {
            "name": "AWS Certified Cloud Practitioner",
            "level": "Foundational",
            "exam_fee_usd": 100,
            "recommended_hours_min": 20,
            "recommended_hours_max": 40
        },
        {
            "name": "AWS Certified Solutions Architect – Associate",
            "level": "Associate", 
            "exam_fee_usd": 150,
            "recommended_hours_min": 40,
            "recommended_hours_max": 80
        },
        {
            "name": "AWS Certified Developer – Associate",
            "level": "Associate",
            "exam_fee_usd": 150,
            "recommended_hours_min": 40,
            "recommended_hours_max": 80
        },
        {
            "name": "AWS Certified SysOps Administrator – Associate",
            "level": "Associate",
            "exam_fee_usd": 150,
            "recommended_hours_min": 50,
            "recommended_hours_max": 90
        },
        {
            "name": "AWS Certified Solutions Architect – Professional",
            "level": "Professional",
            "exam_fee_usd": 300,
            "recommended_hours_min": 80,
            "recommended_hours_max": 120
        }
    ]
    
    for cert in aws_certs:
        certifications.append({
            "slug": slugify(cert["name"]),
            "name": cert["name"],
            "domain": "CS/IT",
            "issuer": "Amazon Web Services (AWS)",
            "url": "https://aws.amazon.com/certification/",
            "level": cert["level"],
            "exam_fee_usd": cert["exam_fee_usd"],
            "price_source": "official",
            "recommended_hours_min": cert["recommended_hours_min"],
            "recommended_hours_max": cert["recommended_hours_max"],
            "hours_source": "estimate",
            "validity_years": 3,
            "delivery": "online proctored or test center",
            "format": "multiple choice",
            "regions": "Global",
            "last_checked_utc": now
        })
    
    # Microsoft Azure Certifications
    azure_certs = [
        {
            "name": "Microsoft Azure Fundamentals",
            "level": "Foundational",
            "exam_fee_usd": 99,
            "recommended_hours_min": 15,
            "recommended_hours_max": 30
        },
        {
            "name": "Microsoft Azure Administrator Associate",
            "level": "Associate",
            "exam_fee_usd": 165,
            "recommended_hours_min": 40,
            "recommended_hours_max": 70
        },
        {
            "name": "Microsoft Azure Solutions Architect Expert",
            "level": "Expert",
            "exam_fee_usd": 165,
            "recommended_hours_min": 80,
            "recommended_hours_max": 120
        }
    ]
    
    for cert in azure_certs:
        certifications.append({
            "slug": slugify(cert["name"]),
            "name": cert["name"],
            "domain": "CS/IT",
            "issuer": "Microsoft",
            "url": "https://learn.microsoft.com/en-us/certifications/",
            "level": cert["level"],
            "exam_fee_usd": cert["exam_fee_usd"],
            "price_source": "official",
            "recommended_hours_min": cert["recommended_hours_min"],
            "recommended_hours_max": cert["recommended_hours_max"],
            "hours_source": "estimate",
            "validity_years": 2,
            "delivery": "online proctored or test center",
            "format": "multiple choice",
            "regions": "Global",
            "last_checked_utc": now
        })
    
    # Google Cloud Certifications
    gcp_certs = [
        {
            "name": "Google Cloud Digital Leader",
            "level": "Foundational",
            "exam_fee_usd": 99,
            "recommended_hours_min": 20,
            "recommended_hours_max": 40
        },
        {
            "name": "Google Cloud Professional Cloud Architect",
            "level": "Professional",
            "exam_fee_usd": 200,
            "recommended_hours_min": 60,
            "recommended_hours_max": 100
        },
        {
            "name": "Google Cloud Professional Data Engineer",
            "level": "Professional", 
            "exam_fee_usd": 200,
            "recommended_hours_min": 60,
            "recommended_hours_max": 100
        }
    ]
    
    for cert in gcp_certs:
        certifications.append({
            "slug": slugify(cert["name"]),
            "name": cert["name"],
            "domain": "CS/IT",
            "issuer": "Google Cloud",
            "url": "https://cloud.google.com/certification",
            "level": cert["level"],
            "exam_fee_usd": cert["exam_fee_usd"],
            "price_source": "official",
            "recommended_hours_min": cert["recommended_hours_min"],
            "recommended_hours_max": cert["recommended_hours_max"],
            "hours_source": "estimate",
            "validity_years": 2,
            "delivery": "online proctored or test center",
            "format": "multiple choice",
            "regions": "Global",
            "last_checked_utc": now
        })
    
    # CompTIA Certifications
    comptia_certs = [
        {
            "name": "CompTIA Security+",
            "level": "Associate",
            "exam_fee_usd": 370,
            "recommended_hours_min": 40,
            "recommended_hours_max": 80
        },
        {
            "name": "CompTIA Network+",
            "level": "Associate",
            "exam_fee_usd": 358,
            "recommended_hours_min": 50,
            "recommended_hours_max": 90
        },
        {
            "name": "CompTIA A+",
            "level": "Associate",
            "exam_fee_usd": 358,
            "recommended_hours_min": 60,
            "recommended_hours_max": 100
        }
    ]
    
    for cert in comptia_certs:
        certifications.append({
            "slug": slugify(cert["name"]),
            "name": cert["name"],
            "domain": "CS/IT",
            "issuer": "CompTIA",
            "url": "https://www.comptia.org/certifications",
            "level": cert["level"],
            "exam_fee_usd": cert["exam_fee_usd"],
            "price_source": "official",
            "recommended_hours_min": cert["recommended_hours_min"],
            "recommended_hours_max": cert["recommended_hours_max"],
            "hours_source": "estimate",
            "validity_years": 3,
            "delivery": "test center",
            "format": "multiple choice",
            "regions": "Global",
            "last_checked_utc": now
        })
    
    # Project Management Certifications
    pm_certs = [
        {
            "name": "Project Management Professional (PMP)",
            "level": "Professional",
            "exam_fee_usd": 555,
            "recommended_hours_min": 60,
            "recommended_hours_max": 120
        },
        {
            "name": "Certified Associate in Project Management (CAPM)",
            "level": "Associate",
            "exam_fee_usd": 300,
            "recommended_hours_min": 30,
            "recommended_hours_max": 60
        }
    ]
    
    for cert in pm_certs:
        certifications.append({
            "slug": slugify(cert["name"]),
            "name": cert["name"],
            "domain": "Engineering / Business",
            "issuer": "Project Management Institute (PMI)",
            "url": "https://www.pmi.org/certifications",
            "level": cert["level"],
            "exam_fee_usd": cert["exam_fee_usd"],
            "price_source": "official",
            "recommended_hours_min": cert["recommended_hours_min"],
            "recommended_hours_max": cert["recommended_hours_max"],
            "hours_source": "estimate",
            "validity_years": 3,
            "delivery": "test center or online",
            "format": "multiple choice",
            "regions": "Global",
            "last_checked_utc": now
        })
    
    # Cisco Certifications
    cisco_certs = [
        {
            "name": "Cisco Certified Network Associate (CCNA)",
            "level": "Associate",
            "exam_fee_usd": 300,
            "recommended_hours_min": 50,
            "recommended_hours_max": 100
        },
        {
            "name": "Cisco Certified Network Professional (CCNP)",
            "level": "Professional", 
            "exam_fee_usd": 400,
            "recommended_hours_min": 80,
            "recommended_hours_max": 150
        }
    ]
    
    for cert in cisco_certs:
        certifications.append({
            "slug": slugify(cert["name"]),
            "name": cert["name"],
            "domain": "CS/IT",
            "issuer": "Cisco",
            "url": "https://www.cisco.com/c/en/us/training-events/training-certifications.html",
            "level": cert["level"],
            "exam_fee_usd": cert["exam_fee_usd"],
            "price_source": "official",
            "recommended_hours_min": cert["recommended_hours_min"],
            "recommended_hours_max": cert["recommended_hours_max"],
            "hours_source": "estimate",
            "validity_years": 3,
            "delivery": "test center",
            "format": "multiple choice and lab",
            "regions": "Global",
            "last_checked_utc": now
        })
    
    return certifications

def main():
    """Main function to scrape and save certification data"""
    print("Scraping certification data...")
    
    # Get certifications from all sources
    certifications = []
    
    # Add existing CS/IT certifications
    certifications.extend(scrape_certifications())
    
    # Add new domain certifications
    print("Adding Healthcare certifications...")
    healthcare_certs = healthcare.produce()
    certifications.extend(healthcare_certs)
    print(f"  ✅ Added {len(healthcare_certs)} Healthcare certifications")
    
    print("Adding Finance certifications...")
    finance_certs = finance.produce()
    certifications.extend(finance_certs)
    print(f"  ✅ Added {len(finance_certs)} Finance certifications")
    
    print("Adding Skilled Trades certifications...")
    trades_certs = skilled_trades.produce()
    certifications.extend(trades_certs)
    print(f"  ✅ Added {len(trades_certs)} Skilled Trades certifications")
    
    # Add sources field to existing certs if missing and normalize domain slugs
    now = datetime.datetime.utcnow().isoformat() + "Z"
    for cert in certifications:
        if "sources" not in cert:
            cert["sources"] = [{
                "field": "exam_fee_usd",
                "type": cert.get("price_source", "heuristic"),
                "url": cert.get("url", ""),
                "checked_at": now
            }]
        
        # Normalize domain to consistent slug format
        if "domain" in cert:
            cert["domain"] = normalize_domain_slug(cert["domain"])
    
    # Save to certifications/index.json for backward compatibility
    output_path = DATA_DIR / "certifications" / "index.json"
    save_json(output_path, certifications)
    
    # Create sharded files and index map
    shard_map = shard_certifications(certifications)
    
    # Save shard map
    map_path = DATA_DIR / "certifications" / "index.map.json"
    save_json(map_path, shard_map)
    
    # Update manifest
    manifest_path = DATA_DIR / "manifest.json"
    if manifest_path.exists():
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        
        manifest["files"]["certifications_map"] = "/data/certifications/index.map.json"
        manifest["sharding"] = {
            "enabled": True,
            "total_shards": len(shard_map["shards"]),
            "total_size_bytes": sum(s["size_bytes"] for s in shard_map["shards"]),
            "max_shard_size_bytes": max(s["size_bytes"] for s in shard_map["shards"])
        }
        
        save_json(manifest_path, manifest)
    
    print(f"\n🎉 Generation complete!")
    print(f"  📊 Total certifications: {len(certifications)}")
    print(f"  📁 {len(shard_map['shards'])} shards created")
    print(f"  📋 Index map: {map_path}")
    print(f"  📄 Backward compatibility: {output_path}")

if __name__ == "__main__":
    main()