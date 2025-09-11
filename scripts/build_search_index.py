#!/usr/bin/env python3
"""
Build lightweight search index for client-side fuzzy search
Creates index.jsonl with searchable text for each certification
"""

import json
import pathlib
from typing import List, Dict, Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"

def load_json(path: pathlib.Path) -> Any:
    """Load JSON file"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def normalize_text(text: str) -> str:
    """Normalize text for search indexing"""
    if not text:
        return ""
    
    # Convert to lowercase and remove extra spaces
    normalized = " ".join(text.lower().split())
    
    # Remove common punctuation that might interfere with search
    normalized = normalized.replace("(", " ").replace(")", " ")
    normalized = normalized.replace("-", " ").replace("_", " ")
    normalized = normalized.replace("/", " ").replace("\\", " ")
    
    # Remove extra spaces again
    normalized = " ".join(normalized.split())
    
    return normalized

def build_search_text(cert: Dict[str, Any]) -> str:
    """Build comprehensive search text for a certification"""
    search_parts = []
    
    # Primary fields (weighted higher in search)
    search_parts.append(cert.get("name", ""))
    search_parts.append(cert.get("issuer", ""))
    
    # Secondary fields
    search_parts.append(cert.get("domain", ""))
    search_parts.append(cert.get("level", ""))
    
    # Additional searchable content
    if cert.get("format"):
        search_parts.append(cert["format"])
    
    if cert.get("delivery"):
        search_parts.append(cert["delivery"])
    
    # Create common variations and acronyms
    name = cert.get("name", "")
    issuer = cert.get("issuer", "")
    
    # Add acronyms for common certifications
    if "aws" in name.lower():
        search_parts.append("amazon web services aws")
    if "azure" in name.lower():
        search_parts.append("microsoft azure")
    if "google cloud" in name.lower() or "gcp" in name.lower():
        search_parts.append("google cloud platform gcp")
    if "comptia" in issuer.lower():
        search_parts.append("comptia computing technology industry association")
    if "cisco" in issuer.lower():
        search_parts.append("cisco networking ccna ccnp")
    if "pmp" in name.lower():
        search_parts.append("project management professional pmp")
    
    # Join all parts and normalize
    search_text = " ".join(search_parts)
    return normalize_text(search_text)

def get_all_certifications() -> List[Dict[str, Any]]:
    """Get all certifications from either sharded or legacy files"""
    all_certs = []
    
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
                all_certs.extend(certs)
    else:
        # Load from legacy file
        index_path = DATA_DIR / "certifications" / "index.json"
        if index_path.exists():
            all_certs = load_json(index_path)
    
    return all_certs

def build_search_index():
    """Build the search index"""
    print("🔍 Building search index...")
    
    # Get all certifications
    all_certs = get_all_certifications()
    print(f"   📋 Processing {len(all_certs)} certifications")
    
    # Build search index entries
    search_entries = []
    for cert in all_certs:
        slug = cert.get("slug")
        if not slug:
            continue
        
        search_text = build_search_text(cert)
        
        # Create search index entry
        entry = {
            "slug": slug,
            "t": search_text,  # 't' for 'text' - keep it short
            "name": cert.get("name", ""),
            "issuer": cert.get("issuer", ""),
            "domain": cert.get("domain", ""),
            "level": cert.get("level", "")
        }
        
        search_entries.append(entry)
    
    # Save as JSONL (one JSON object per line)
    search_dir = DATA_DIR / "search"
    search_dir.mkdir(exist_ok=True)
    
    index_path = search_dir / "index.jsonl"
    with open(index_path, "w", encoding="utf-8") as f:
        for entry in search_entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    # Also save as regular JSON for easier debugging
    json_path = search_dir / "index.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(search_entries, f, ensure_ascii=False, indent=2)
    
    # Update manifest
    manifest_path = DATA_DIR / "manifest.json"
    if manifest_path.exists():
        manifest = load_json(manifest_path)
        manifest["files"]["search_index"] = "/data/search/index.jsonl"
        manifest["files"]["search_index_json"] = "/data/search/index.json"
        
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
    
    # Calculate stats
    index_size = index_path.stat().st_size
    avg_text_length = sum(len(entry["t"]) for entry in search_entries) / len(search_entries)
    
    print(f"   ✅ Search index created: {len(search_entries)} entries")
    print(f"   📏 Index size: {index_size:,} bytes")
    print(f"   📝 Average text length: {avg_text_length:.1f} characters")
    print(f"   💾 Files: {index_path} (JSONL), {json_path} (JSON)")

if __name__ == "__main__":
    build_search_index()