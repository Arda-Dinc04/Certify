#!/usr/bin/env python3
"""
Generate diff report summarizing adds/removes/changes between certification runs
"""

import json
import pathlib
import datetime
from typing import Dict, List, Any, Set, Tuple

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"

def load_json(path: pathlib.Path) -> Any:
    """Load JSON file"""
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path: pathlib.Path, data: Any) -> None:
    """Save data as JSON with proper formatting"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def normalize_cert(cert: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize certification for comparison (exclude timestamps and sources)"""
    normalized = cert.copy()
    # Remove fields that change frequently and shouldn't trigger diff alerts
    fields_to_exclude = ["last_checked_utc", "sources"]
    for field in fields_to_exclude:
        normalized.pop(field, None)
    return normalized

def calculate_diff(old_certs: List[Dict[str, Any]], new_certs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate differences between old and new certifications"""
    
    # Create lookup dictionaries
    old_by_slug = {cert["slug"]: normalize_cert(cert) for cert in old_certs}
    new_by_slug = {cert["slug"]: normalize_cert(cert) for cert in new_certs}
    
    old_slugs = set(old_by_slug.keys())
    new_slugs = set(new_by_slug.keys())
    
    # Find adds, removes, and potential changes
    added_slugs = new_slugs - old_slugs
    removed_slugs = old_slugs - new_slugs
    common_slugs = old_slugs & new_slugs
    
    # Check for changes in common certifications
    changed_certs = []
    for slug in common_slugs:
        old_cert = old_by_slug[slug]
        new_cert = new_by_slug[slug]
        
        if old_cert != new_cert:
            # Find specific field changes
            field_changes = {}
            for field in set(old_cert.keys()) | set(new_cert.keys()):
                old_val = old_cert.get(field)
                new_val = new_cert.get(field)
                if old_val != new_val:
                    field_changes[field] = {
                        "old": old_val,
                        "new": new_val
                    }
            
            changed_certs.append({
                "slug": slug,
                "name": new_cert.get("name", "Unknown"),
                "domain": new_cert.get("domain", "Unknown"),
                "field_changes": field_changes
            })
    
    # Categorize changes by domain
    added_by_domain = {}
    removed_by_domain = {}
    
    for slug in added_slugs:
        cert = new_by_slug[slug]
        domain = cert.get("domain", "Unknown")
        if domain not in added_by_domain:
            added_by_domain[domain] = []
        added_by_domain[domain].append({
            "slug": slug,
            "name": cert.get("name", "Unknown")
        })
    
    for slug in removed_slugs:
        cert = old_by_slug[slug]
        domain = cert.get("domain", "Unknown")
        if domain not in removed_by_domain:
            removed_by_domain[domain] = []
        removed_by_domain[domain].append({
            "slug": slug,
            "name": cert.get("name", "Unknown")
        })
    
    # Calculate statistics
    total_changes = len(added_slugs) + len(removed_slugs) + len(changed_certs)
    
    return {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "summary": {
            "old_total": len(old_certs),
            "new_total": len(new_certs),
            "net_change": len(new_certs) - len(old_certs),
            "added": len(added_slugs),
            "removed": len(removed_slugs),
            "changed": len(changed_certs),
            "total_changes": total_changes
        },
        "added_by_domain": added_by_domain,
        "removed_by_domain": removed_by_domain,
        "changed_certifications": changed_certs[:20],  # Limit to first 20 changes
        "significant_changes": [
            cert for cert in changed_certs 
            if any(field in cert["field_changes"] for field in ["exam_fee_usd", "level", "domain", "name"])
        ][:10]
    }

def print_diff_report(diff: Dict[str, Any]) -> None:
    """Print diff report to console"""
    
    print("🔄 Certification Diff Report")
    print("=" * 50)
    print(f"Generated: {diff['timestamp']}")
    
    summary = diff["summary"]
    print(f"\n📊 Summary:")
    print(f"  Old total: {summary['old_total']}")
    print(f"  New total: {summary['new_total']}")
    print(f"  Net change: {summary['net_change']:+d}")
    print(f"  Added: {summary['added']}")
    print(f"  Removed: {summary['removed']}")
    print(f"  Changed: {summary['changed']}")
    print(f"  Total changes: {summary['total_changes']}")
    
    if diff["added_by_domain"]:
        print(f"\n➕ Added Certifications by Domain:")
        for domain, certs in diff["added_by_domain"].items():
            print(f"  {domain} ({len(certs)}):")
            for cert in certs[:5]:  # Show first 5
                print(f"    + {cert['name']} ({cert['slug']})")
            if len(certs) > 5:
                print(f"    ... and {len(certs) - 5} more")
    
    if diff["removed_by_domain"]:
        print(f"\n➖ Removed Certifications by Domain:")
        for domain, certs in diff["removed_by_domain"].items():
            print(f"  {domain} ({len(certs)}):")
            for cert in certs[:5]:  # Show first 5
                print(f"    - {cert['name']} ({cert['slug']})")
            if len(certs) > 5:
                print(f"    ... and {len(certs) - 5} more")
    
    if diff["significant_changes"]:
        print(f"\n⚠️  Significant Changes:")
        for cert in diff["significant_changes"]:
            print(f"  {cert['name']} ({cert['domain']}):")
            for field, change in cert["field_changes"].items():
                print(f"    {field}: {change['old']} → {change['new']}")
    
    # Alert on large changes
    if summary["total_changes"] > 50:
        print(f"\n🚨 ALERT: Large number of changes detected ({summary['total_changes']})")
    
    if abs(summary["net_change"]) > 20:
        print(f"\n🚨 ALERT: Large net change in certification count ({summary['net_change']:+d})")

def main():
    """Main function"""
    print("Generating diff report...")
    
    # Load current certifications
    current_path = DATA_DIR / "certifications" / "index.json"
    if not current_path.exists():
        print(f"❌ Current certifications file not found: {current_path}")
        return
    
    current_certs = load_json(current_path)
    
    # Load previous snapshot if exists
    snapshot_path = DATA_DIR / "snapshots" / "previous_certs.json"
    previous_certs = load_json(snapshot_path)  # Returns [] if not exists
    
    if not previous_certs:
        print("ℹ️  No previous snapshot found. Creating baseline...")
        # Create baseline snapshot
        save_json(snapshot_path, current_certs)
        print(f"📁 Baseline saved to: {snapshot_path}")
        print(f"📈 Current certification count: {len(current_certs)}")
        return
    
    # Calculate diff
    diff = calculate_diff(previous_certs, current_certs)
    
    # Print report
    print_diff_report(diff)
    
    # Save diff report
    diff_output_path = DATA_DIR / "diff_report.json"
    save_json(diff_output_path, diff)
    
    # Update snapshot for next run
    save_json(snapshot_path, current_certs)
    
    print(f"\n📁 Diff report saved to: {diff_output_path}")
    print(f"📁 Updated snapshot: {snapshot_path}")

if __name__ == "__main__":
    main()