#!/usr/bin/env python3
"""
Shard certifications into smaller files for better performance
Creates index.map.json and sharded files based on first letter
"""

import json
import pathlib
import string
from collections import defaultdict
from typing import Dict, List, Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"

def save_json(path: pathlib.Path, data: Any) -> None:
    """Save data as JSON with proper formatting"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_shard_key(cert_name: str) -> str:
    """Get shard key based on first letter of certification name"""
    first_char = cert_name[0].lower()
    if first_char in string.ascii_lowercase:
        return first_char
    else:
        return "0-9"

def shard_certifications():
    """Shard certifications by first letter and create index map"""
    
    # Load all certifications
    index_path = DATA_DIR / "certifications" / "index.json"
    if not index_path.exists():
        print("❌ No certifications/index.json found. Run scrape_certs.py first.")
        return
    
    with open(index_path, "r", encoding="utf-8") as f:
        all_certs = json.load(f)
    
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
            "total_size_bytes": total_size,
            "max_shard_size_bytes": max(s["size_bytes"] for s in shard_map["shards"])
        }
        
        save_json(manifest_path, manifest)
    
    print(f"\n🎉 Sharding complete!")
    print(f"  📁 {len(shard_map['shards'])} shards created")
    print(f"  📏 Total size: {total_size:,} bytes")
    print(f"  📋 Index map: {map_path}")
    
    # Optionally keep the original index.json for backward compatibility
    # but mark it as deprecated in the map
    shard_map["deprecated_files"] = ["/data/certifications/index.json"]
    save_json(map_path, shard_map)

if __name__ == "__main__":
    shard_certifications()