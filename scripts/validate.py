#!/usr/bin/env python3
"""
JSON Schema validation for generated data files
Ensures data integrity before deployment
"""

import json
import pathlib
import jsonschema
from jsonschema import validate, ValidationError, draft7_format_checker
import sys
from typing import Dict, List, Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"
SCHEMAS_DIR = ROOT / "schemas"

def load_json(path: pathlib.Path) -> Any:
    """Load JSON file"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_schema(schema_name: str) -> Dict:
    """Load JSON schema"""
    schema_path = SCHEMAS_DIR / f"{schema_name}.schema.json"
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema not found: {schema_path}")
    return load_json(schema_path)

def validate_file(data_path: pathlib.Path, schema: Dict, description: str) -> bool:
    """Validate a single data file against schema"""
    try:
        if not data_path.exists():
            print(f"⚠️  {description}: File not found - {data_path}")
            return False
        
        data = load_json(data_path)
        validate(instance=data, schema=schema, format_checker=draft7_format_checker)
        print(f"✅ {description}: Valid")
        return True
        
    except ValidationError as e:
        print(f"❌ {description}: Validation failed")
        print(f"   Path: {data_path}")
        print(f"   Error: {e.message}")
        if e.absolute_path:
            print(f"   Location: {' → '.join(str(p) for p in e.absolute_path)}")
        return False
    except Exception as e:
        print(f"💥 {description}: Unexpected error - {e}")
        return False

def validate_certifications() -> bool:
    """Validate certification files (both sharded and legacy)"""
    schema = load_schema("certification")
    
    # Check if sharding is enabled
    map_path = DATA_DIR / "certifications" / "index.map.json"
    
    if map_path.exists():
        print("📊 Validating sharded certifications...")
        
        # Validate shard map first
        try:
            shard_map = load_json(map_path)
            all_valid = True
            
            # Validate each shard
            for shard in shard_map.get("shards", []):
                shard_file = shard["file"].replace("/data/", "")
                shard_path = DATA_DIR / shard_file
                
                if not validate_file(shard_path, {"type": "array", "items": schema}, 
                                   f"Shard {shard['letters']} ({shard['count']} certs)"):
                    all_valid = False
            
            return all_valid
            
        except Exception as e:
            print(f"💥 Shard map error: {e}")
            return False
    else:
        # Validate legacy single file
        print("📄 Validating legacy certification file...")
        index_path = DATA_DIR / "certifications" / "index.json"
        return validate_file(index_path, {"type": "array", "items": schema}, "Certifications index")

def validate_rankings() -> bool:
    """Validate rankings files"""
    schema = load_schema("rankings")
    all_valid = True
    
    # Validate today's rankings
    today_path = DATA_DIR / "rankings" / "today.json"
    if not validate_file(today_path, schema, "Today's rankings"):
        all_valid = False
    
    # Validate trends (different schema - it's an object with arrays)
    trends_path = DATA_DIR / "rankings" / "trends.json"
    trends_schema = {
        "type": "object",
        "patternProperties": {
            "^[a-z0-9-]+$": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["date", "rank"],
                    "properties": {
                        "date": {"type": "string", "format": "date"},
                        "rank": {"type": "integer", "minimum": 1}
                    }
                }
            }
        }
    }
    
    if not validate_file(trends_path, trends_schema, "Ranking trends"):
        all_valid = False
    
    return all_valid

def validate_companies() -> bool:
    """Validate company files"""
    schema = load_schema("companies")
    all_valid = True
    
    # Validate companies by domain
    companies_path = DATA_DIR / "companies" / "by_domain.json"
    if not validate_file(companies_path, schema, "Companies by domain"):
        all_valid = False
    
    # Validate recommendations (complex nested structure)
    recommendations_path = DATA_DIR / "companies" / "recommendations.json"
    recommendations_schema = {
        "type": "object",
        "patternProperties": {
            "^.+$": {  # Domain names
                "type": "object",
                "patternProperties": {
                    "^[a-z0-9-]+$": {  # Company slugs
                        "type": "array",
                        "maxItems": 3,
                        "items": {
                            "type": "object",
                            "required": ["slug", "fit_score", "signals"],
                            "properties": {
                                "slug": {"type": "string", "pattern": "^[a-z0-9-]+$"},
                                "fit_score": {"type": "number", "minimum": 0, "maximum": 1},
                                "signals": {
                                    "type": "object",
                                    "required": ["role_alignment", "global_rank_norm", "cost_penalty"],
                                    "properties": {
                                        "role_alignment": {"type": "number", "minimum": 0, "maximum": 1},
                                        "global_rank_norm": {"type": "number", "minimum": 0, "maximum": 1},
                                        "cost_penalty": {"type": "number", "minimum": 0, "maximum": 1},
                                        "mention_count": {"type": "integer", "minimum": 0},
                                        "mention_z": {"type": "number"}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    if not validate_file(recommendations_path, recommendations_schema, "Company recommendations"):
        all_valid = False
    
    return all_valid

def validate_manifest() -> bool:
    """Validate manifest file"""
    schema = load_schema("manifest")
    manifest_path = DATA_DIR / "manifest.json"
    return validate_file(manifest_path, schema, "Data manifest")

def validate_other_files() -> bool:
    """Validate other data files"""
    all_valid = True
    
    # Validate demand metrics
    demand_path = DATA_DIR / "demand" / "metrics.json"
    demand_schema = {
        "type": "array",
        "items": {
            "type": "object",
            "required": ["slug", "job_postings_7d", "job_postings_30d"],
            "properties": {
                "slug": {"type": "string", "pattern": "^[a-z0-9-]+$"},
                "job_postings_7d": {"type": "integer", "minimum": 0},
                "job_postings_30d": {"type": "integer", "minimum": 0}
            }
        }
    }
    
    if not validate_file(demand_path, demand_schema, "Demand metrics"):
        all_valid = False
    
    # Validate role salaries
    salaries_path = DATA_DIR / "salaries" / "role_salaries.json"
    salaries_schema = {
        "type": "object",
        "patternProperties": {
            "^.+$": {  # Role names
                "type": "object",
                "required": ["median_usd", "p25", "p75", "source"],
                "properties": {
                    "median_usd": {"type": "integer", "minimum": 0},
                    "p25": {"type": "integer", "minimum": 0},
                    "p75": {"type": "integer", "minimum": 0},
                    "source": {"type": "string"}
                }
            }
        }
    }
    
    if not validate_file(salaries_path, salaries_schema, "Role salaries"):
        all_valid = False
    
    return all_valid

def main():
    """Main validation function"""
    print("🔍 Starting JSON Schema validation...\n")
    
    validation_results = []
    
    # Run all validations
    validation_results.append(("Certifications", validate_certifications()))
    validation_results.append(("Rankings", validate_rankings()))
    validation_results.append(("Companies", validate_companies()))
    validation_results.append(("Manifest", validate_manifest()))
    validation_results.append(("Other files", validate_other_files()))
    
    # Summary
    print(f"\n{'='*50}")
    print("📋 VALIDATION SUMMARY")
    print(f"{'='*50}")
    
    all_passed = True
    for category, passed in validation_results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{category:20} {status}")
        if not passed:
            all_passed = False
    
    print(f"{'='*50}")
    
    if all_passed:
        print("🎉 All validations passed! Data is ready for deployment.")
        sys.exit(0)
    else:
        print("💥 Some validations failed! Fix errors before deploying.")
        sys.exit(1)

if __name__ == "__main__":
    main()