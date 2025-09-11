#!/usr/bin/env python3
"""
Generate search index for client-side Fuse.js
Creates a lightweight JSONL index optimized for fuzzy search
"""

import os
import json
import pathlib
from typing import Dict, List, Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"

def load_json(path: pathlib.Path) -> Any:
    """Load JSON file"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_jsonl(path: pathlib.Path, items: List[Dict]) -> None:
    """Save items as JSONL (one JSON object per line)"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for item in items:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

def create_search_index_item(cert: Dict) -> Dict:
    """Create optimized search index item"""
    return {
        "slug": cert["slug"],
        "name": cert["name"],
        "issuer": cert.get("issuer", ""),
        "domain": cert.get("domain", ""),
        "level": cert.get("level", ""),
        "description": cert.get("description", "")[:200],  # Truncate for performance
        "keywords": cert.get("keywords", [])
    }

def generate_search_index():
    """Generate optimized search index for Fuse.js"""
    print("🔍 Building search index...")
    
    # Load certifications from shards or legacy format
    certs_data = []
    map_path = DATA_DIR / "certifications" / "index.map.json"
    
    if map_path.exists():
        # Load from shards
        shard_map = load_json(map_path)
        for shard in shard_map.get("shards", []):
            shard_file = shard["file"].replace("/data/", "")
            shard_path = DATA_DIR / shard_file
            if shard_path.exists():
                certs_data.extend(load_json(shard_path))
                print(f"   📄 Loaded shard: {shard_file}")
    else:
        # Load from legacy file
        index_path = DATA_DIR / "certifications" / "index.json"
        if index_path.exists():
            certs_data = load_json(index_path)
            print(f"   📄 Loaded legacy format: index.json")
    
    # Create search index items
    search_items = []
    for cert in certs_data:
        search_item = create_search_index_item(cert)
        search_items.append(search_item)
    
    # Save as JSONL for efficient streaming loading
    search_index_path = DATA_DIR / "search" / "index.jsonl"
    save_jsonl(search_index_path, search_items)
    
    # Generate search index metadata
    metadata = {
        "total_items": len(search_items),
        "generated_at": "2024-01-01T00:00:00Z",  # Placeholder
        "format": "jsonl",
        "version": "1.0"
    }
    
    metadata_path = DATA_DIR / "search" / "metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print(f"🎉 Search index complete!")
    print(f"   📊 Indexed {len(search_items)} certifications")
    print(f"   💾 Size: {search_index_path.stat().st_size / 1024:.1f}KB")
    print(f"   📍 Location: {search_index_path.relative_to(ROOT)}")

if __name__ == "__main__":
    generate_search_index()