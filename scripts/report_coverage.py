#!/usr/bin/env python3
"""
Report coverage statistics per field and domain for certifications
"""

import json
import pathlib
from collections import defaultdict, Counter
from typing import Dict, List, Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"

def load_json(path: pathlib.Path) -> Any:
    """Load JSON file"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def calculate_coverage(certifications: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate coverage statistics per field and domain"""
    
    total_certs = len(certifications)
    domain_counts = Counter(cert["domain"] for cert in certifications)
    
    # Fields to check for coverage
    fields_to_check = [
        "exam_fee_usd",
        "recommended_hours_min", 
        "recommended_hours_max",
        "validity_years",
        "delivery",
        "format",
        "regions",
        "level",
        "license_authority",
        "prerequisites", 
        "ce_credits"
    ]
    
    # Overall coverage
    overall_coverage = {}
    for field in fields_to_check:
        non_null_count = sum(1 for cert in certifications if cert.get(field) is not None)
        overall_coverage[field] = {
            "total": total_certs,
            "non_null": non_null_count,
            "coverage_pct": round((non_null_count / total_certs) * 100, 1) if total_certs > 0 else 0
        }
    
    # Domain-specific coverage
    domain_coverage = {}
    for domain in domain_counts.keys():
        domain_certs = [cert for cert in certifications if cert["domain"] == domain]
        domain_total = len(domain_certs)
        
        domain_coverage[domain] = {
            "total_certs": domain_total,
            "fields": {}
        }
        
        for field in fields_to_check:
            non_null_count = sum(1 for cert in domain_certs if cert.get(field) is not None)
            domain_coverage[domain]["fields"][field] = {
                "non_null": non_null_count,
                "coverage_pct": round((non_null_count / domain_total) * 100, 1) if domain_total > 0 else 0
            }
    
    # Source type distribution
    source_types = Counter()
    for cert in certifications:
        if "sources" in cert and cert["sources"]:
            for source in cert["sources"]:
                source_types[source.get("type", "unknown")] += 1
    
    return {
        "total_certifications": total_certs,
        "domain_distribution": dict(domain_counts),
        "overall_coverage": overall_coverage,
        "domain_coverage": domain_coverage,
        "source_type_distribution": dict(source_types)
    }

def print_coverage_report(coverage: Dict[str, Any]) -> None:
    """Print coverage report to console"""
    
    print("🔍 Certification Coverage Report")
    print("=" * 50)
    
    print(f"\n📊 Total Certifications: {coverage['total_certifications']}")
    
    print(f"\n🏭 Domain Distribution:")
    for domain, count in coverage["domain_distribution"].items():
        pct = round((count / coverage['total_certifications']) * 100, 1)
        print(f"  {domain}: {count} ({pct}%)")
    
    print(f"\n📈 Overall Field Coverage:")
    for field, stats in coverage["overall_coverage"].items():
        print(f"  {field}: {stats['non_null']}/{stats['total']} ({stats['coverage_pct']}%)")
    
    print(f"\n🎯 Domain-Specific Coverage:")
    for domain, domain_stats in coverage["domain_coverage"].items():
        print(f"\n  {domain} ({domain_stats['total_certs']} certs):")
        for field, field_stats in domain_stats["fields"].items():
            if field_stats['coverage_pct'] >= 70:
                status = "✅"
            elif field_stats['coverage_pct'] >= 40:
                status = "⚠️ "
            else:
                status = "❌"
            print(f"    {status} {field}: {field_stats['non_null']}/{domain_stats['total_certs']} ({field_stats['coverage_pct']}%)")
    
    print(f"\n📝 Source Type Distribution:")
    for source_type, count in coverage["source_type_distribution"].items():
        print(f"  {source_type}: {count}")
    
    print(f"\n✨ Quality Summary:")
    high_coverage_fields = sum(1 for field, stats in coverage["overall_coverage"].items() 
                              if stats['coverage_pct'] >= 70)
    total_fields = len(coverage["overall_coverage"])
    print(f"  Fields with ≥70% coverage: {high_coverage_fields}/{total_fields}")
    
    # Domain quality scores
    for domain, domain_stats in coverage["domain_coverage"].items():
        high_coverage = sum(1 for field_stats in domain_stats["fields"].values() 
                           if field_stats['coverage_pct'] >= 70)
        total_domain_fields = len(domain_stats["fields"])
        quality_score = round((high_coverage / total_domain_fields) * 100, 1)
        print(f"  {domain} quality score: {quality_score}%")

def main():
    """Main function"""
    print("Generating coverage report...")
    
    # Load certifications from index.json
    certs_path = DATA_DIR / "certifications" / "index.json"
    if not certs_path.exists():
        print(f"❌ Certifications file not found: {certs_path}")
        return
    
    certifications = load_json(certs_path)
    coverage = calculate_coverage(certifications)
    
    # Print report to console
    print_coverage_report(coverage)
    
    # Save detailed coverage report
    output_path = DATA_DIR / "coverage_report.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(coverage, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 Detailed report saved to: {output_path}")

if __name__ == "__main__":
    main()