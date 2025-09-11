#!/usr/bin/env python3
"""
Generate build manifest with integrity hashes
Provides deployment integrity and cache invalidation
"""

import os
import json
import hashlib
import pathlib
from typing import Dict, Any
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"

def get_file_hash(file_path: pathlib.Path) -> str:
    """Generate SHA-256 hash of file contents"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()

def get_file_size(file_path: pathlib.Path) -> int:
    """Get file size in bytes"""
    return file_path.stat().st_size

def collect_data_files() -> Dict[str, Any]:
    """Collect all data files with their metadata"""
    files = {}
    
    # Walk through all data files
    for file_path in DATA_DIR.rglob("*.json"):
        if file_path.is_file():
            relative_path = str(file_path.relative_to(DATA_DIR))
            files[relative_path] = {
                "hash": get_file_hash(file_path),
                "size": get_file_size(file_path),
                "modified": datetime.fromtimestamp(file_path.stat().st_mtime, tz=timezone.utc).isoformat()
            }
    
    # Include JSONL search index
    for file_path in DATA_DIR.rglob("*.jsonl"):
        if file_path.is_file():
            relative_path = str(file_path.relative_to(DATA_DIR))
            files[relative_path] = {
                "hash": get_file_hash(file_path),
                "size": get_file_size(file_path),
                "modified": datetime.fromtimestamp(file_path.stat().st_mtime, tz=timezone.utc).isoformat()
            }
    
    return files

def save_json(path: pathlib.Path, obj):
    """Save data as JSON"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

def main():
    """Generate build manifest with integrity information"""
    print("📋 Generating build manifest...")
    
    # Collect all data files
    files = collect_data_files()
    
    # Generate manifest
    now = datetime.now(timezone.utc)
    manifest = {
        "version": "1.0",
        "generated_at": now.isoformat(),
        "build_id": now.strftime("%Y%m%d-%H%M%S"),
        "files": files,
        "stats": {
            "total_files": len(files),
            "total_size": sum(f["size"] for f in files.values()),
            "domains": [],
            "certifications_count": 0
        },
        # Legacy format for backward compatibility
        "versions": {
            "certifications": now.date().isoformat(),
            "rankings": now.date().isoformat(),
            "companies": now.date().isoformat()
        }
    }
    
    # Calculate stats
    try:
        # Count certifications from shards
        shard_map_path = DATA_DIR / "certifications" / "index.map.json"
        if shard_map_path.exists():
            with open(shard_map_path, 'r') as f:
                shard_map = json.load(f)
                manifest["stats"]["certifications_count"] = shard_map.get("total_items", 0)
        
        # Extract domains from companies file
        companies_path = DATA_DIR / "companies" / "by_domain.json"
        if companies_path.exists():
            with open(companies_path, 'r') as f:
                companies = json.load(f)
                manifest["stats"]["domains"] = list(companies.keys())
    
    except Exception as e:
        print(f"   ⚠️  Warning: Could not calculate detailed stats: {e}")
    
    # Save manifest
    save_json(DATA_DIR / "manifest.json", manifest)
    
    print(f"🎉 Build manifest complete!")
    print(f"   📊 Total files: {len(files)}")
    print(f"   💾 Total size: {sum(f['size'] for f in files.values()) / 1024:.1f}KB")
    print(f"   🔒 All files hashed for integrity verification")
    print(f"   🆔 Build ID: {manifest['build_id']}")

if __name__ == "__main__":
    main()