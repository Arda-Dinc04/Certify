#!/usr/bin/env python3
"""
Referential integrity checker for certification data
Ensures all cross-file references are valid
"""

import json
import pathlib
import sys
from typing import Set, List, Dict, Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"

def load_json(path: pathlib.Path) -> Any:
    """Load JSON file"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_all_certification_slugs() -> Set[str]:
    """Get all certification slugs from either sharded or legacy files"""
    slugs = set()
    
    # Check if sharding is enabled
    map_path = DATA_DIR / "certifications" / "index.map.json"
    
    if map_path.exists():
        # Load from shards
        shard_map = load_json(map_path)
        for shard in shard_map.get("shards", []):
            shard_file = shard["file"].replace("/data/", "")
            shard_path = DATA_DIR / shard_file
            
            if shard_path.exists():
                certs = load_json(shard_path)
                for cert in certs:
                    slugs.add(cert["slug"])
    else:
        # Load from legacy file
        index_path = DATA_DIR / "certifications" / "index.json"
        if index_path.exists():
            certs = load_json(index_path)
            for cert in certs:
                slugs.add(cert["slug"])
    
    return slugs

def check_rankings_references(cert_slugs: Set[str]) -> List[str]:
    """Check that all ranking references point to valid certifications"""
    errors = []
    
    # Check today's rankings
    today_path = DATA_DIR / "rankings" / "today.json"
    if today_path.exists():
        rankings = load_json(today_path)
        for ranking in rankings:
            slug = ranking.get("slug")
            if slug and slug not in cert_slugs:
                errors.append(f"rankings/today.json: Invalid slug reference '{slug}'")
    
    # Check trends
    trends_path = DATA_DIR / "rankings" / "trends.json"
    if trends_path.exists():
        trends = load_json(trends_path)
        for slug in trends.keys():
            if slug not in cert_slugs:
                errors.append(f"rankings/trends.json: Invalid slug reference '{slug}'")
    
    return errors

def check_company_references(cert_slugs: Set[str]) -> List[str]:
    """Check that all company recommendation references point to valid certifications"""
    errors = []
    
    recommendations_path = DATA_DIR / "companies" / "recommendations.json"
    if recommendations_path.exists():
        recommendations = load_json(recommendations_path)
        
        for domain, companies in recommendations.items():
            for company_slug, recs in companies.items():
                for i, rec in enumerate(recs):
                    slug = rec.get("slug")
                    if slug and slug not in cert_slugs:
                        errors.append(
                            f"companies/recommendations.json: Invalid slug reference '{slug}' "
                            f"in {domain} > {company_slug} > recommendation {i+1}"
                        )
    
    return errors

def check_manifest_references() -> List[str]:
    """Check that all files referenced in manifest actually exist"""
    errors = []
    
    manifest_path = DATA_DIR / "manifest.json"
    if manifest_path.exists():
        manifest = load_json(manifest_path)
        
        for file_key, file_path in manifest.get("files", {}).items():
            # Convert web path to filesystem path
            fs_path = DATA_DIR / file_path.replace("/data/", "")
            
            if not fs_path.exists():
                errors.append(f"manifest.json: Referenced file does not exist: {file_path}")
    
    return errors

def check_shard_integrity() -> List[str]:
    """Check shard map integrity if sharding is enabled"""
    errors = []
    
    map_path = DATA_DIR / "certifications" / "index.map.json"
    if not map_path.exists():
        return errors  # Sharding not enabled
    
    try:
        shard_map = load_json(map_path)
        total_count = 0
        
        for shard in shard_map.get("shards", []):
            shard_file = shard["file"].replace("/data/", "")
            shard_path = DATA_DIR / shard_file
            
            if not shard_path.exists():
                errors.append(f"Shard map references missing file: {shard['file']}")
                continue
            
            # Check actual count matches reported count
            actual_certs = load_json(shard_path)
            actual_count = len(actual_certs)
            reported_count = shard.get("count", 0)
            
            if actual_count != reported_count:
                errors.append(
                    f"Shard {shard['letters']}: Count mismatch - "
                    f"reported {reported_count}, actual {actual_count}"
                )
            
            total_count += actual_count
            
            # Check file size is reasonable
            actual_size = shard_path.stat().st_size
            reported_size = shard.get("size_bytes", 0)
            
            # Allow 10% variance in file size (due to formatting differences)
            if abs(actual_size - reported_size) > reported_size * 0.1:
                errors.append(
                    f"Shard {shard['letters']}: Size mismatch - "
                    f"reported {reported_size} bytes, actual {actual_size} bytes"
                )
        
        print(f"📊 Shard integrity check: {len(shard_map.get('shards', []))} shards, {total_count} total certs")
        
    except Exception as e:
        errors.append(f"Shard map validation error: {e}")
    
    return errors

def check_duplicate_slugs(cert_slugs: Set[str]) -> List[str]:
    """Check for duplicate certification slugs"""
    errors = []
    all_slugs = []
    
    # Collect all slugs with their sources
    map_path = DATA_DIR / "certifications" / "index.map.json"
    
    if map_path.exists():
        # Check shards for duplicates
        shard_map = load_json(map_path)
        for shard in shard_map.get("shards", []):
            shard_file = shard["file"].replace("/data/", "")
            shard_path = DATA_DIR / shard_file
            
            if shard_path.exists():
                certs = load_json(shard_path)
                for cert in certs:
                    all_slugs.append((cert["slug"], shard["file"]))
    else:
        # Check legacy file
        index_path = DATA_DIR / "certifications" / "index.json"
        if index_path.exists():
            certs = load_json(index_path)
            for cert in certs:
                all_slugs.append((cert["slug"], "index.json"))
    
    # Find duplicates
    slug_counts = {}
    for slug, source in all_slugs:
        if slug in slug_counts:
            errors.append(f"Duplicate slug '{slug}' found in {source} and {slug_counts[slug]}")
        else:
            slug_counts[slug] = source
    
    return errors

def main():
    """Main referential integrity check"""
    print("🔗 Starting referential integrity check...\n")
    
    all_errors = []
    
    # Get all certification slugs
    print("📋 Loading certification slugs...")
    cert_slugs = get_all_certification_slugs()
    print(f"   Found {len(cert_slugs)} certification slugs")
    
    # Run all checks
    print("\n🔍 Checking cross-references...")
    
    all_errors.extend(check_rankings_references(cert_slugs))
    all_errors.extend(check_company_references(cert_slugs))
    all_errors.extend(check_manifest_references())
    all_errors.extend(check_shard_integrity())
    all_errors.extend(check_duplicate_slugs(cert_slugs))
    
    # Summary
    print(f"\n{'='*60}")
    print("🔗 REFERENTIAL INTEGRITY SUMMARY")
    print(f"{'='*60}")
    
    if not all_errors:
        print("✅ All referential integrity checks passed!")
        print(f"   📊 {len(cert_slugs)} certifications validated")
        print("   🔗 All cross-references are valid")
        sys.exit(0)
    else:
        print(f"❌ Found {len(all_errors)} referential integrity errors:")
        print()
        for i, error in enumerate(all_errors, 1):
            print(f"  {i:2d}. {error}")
        
        print(f"\n💥 Fix these errors before deploying!")
        sys.exit(1)

if __name__ == "__main__":
    main()