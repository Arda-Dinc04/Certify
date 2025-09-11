#!/usr/bin/env python3
"""
Comprehensive validation system for all data files
Validates schemas and checks referential integrity
"""

import json
import pathlib
from typing import Dict, List, Any, Set, Tuple
import jsonschema
from jsonschema import validate, ValidationError

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"
SCHEMAS_DIR = ROOT / "schemas"

class ValidationResult:
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.passed_files: List[str] = []
        self.failed_files: List[str] = []

    def add_error(self, message: str):
        self.errors.append(message)
    
    def add_warning(self, message: str):
        self.warnings.append(message)

    def add_passed_file(self, filename: str):
        self.passed_files.append(filename)
    
    def add_failed_file(self, filename: str):
        self.failed_files.append(filename)

    def is_valid(self) -> bool:
        return len(self.errors) == 0

def load_json(path: pathlib.Path) -> Any:
    """Load JSON file safely"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise Exception(f"Failed to load {path}: {e}")

def load_schema(schema_name: str) -> Dict:
    """Load a JSON schema"""
    schema_path = SCHEMAS_DIR / f"{schema_name}.schema.json"
    return load_json(schema_path)

def validate_json_schema(data: Any, schema: Dict, file_path: str, result: ValidationResult) -> bool:
    """Validate data against JSON schema"""
    try:
        validate(instance=data, schema=schema)
        result.add_passed_file(file_path)
        return True
    except ValidationError as e:
        error_path = " → ".join(str(p) for p in e.path) if e.path else "root"
        result.add_error(f"Schema validation failed for {file_path}: {e.message} at {error_path}")
        result.add_failed_file(file_path)
        return False

def validate_certifications(result: ValidationResult) -> Dict[str, Any]:
    """Validate all certification shards and index"""
    print("🔍 Validating certifications...")
    
    cert_schema = load_schema("certification")
    all_certifications = {}
    
    # Validate shard map
    shard_map_path = DATA_DIR / "certifications" / "index.map.json"
    if not shard_map_path.exists():
        result.add_error("Shard map not found: index.map.json")
        return all_certifications
    
    shard_map = load_json(shard_map_path)
    
    # Validate each shard
    for shard_info in shard_map.get("shards", []):
        shard_file = shard_info["file"].replace("/data/", "")
        shard_path = DATA_DIR / shard_file
        
        if not shard_path.exists():
            result.add_error(f"Shard file not found: {shard_file}")
            continue
        
        try:
            shard_data = load_json(shard_path)
            
            # Validate shard is array
            if not isinstance(shard_data, list):
                result.add_error(f"Shard {shard_file} must be an array")
                continue
            
            # Validate count matches
            if len(shard_data) != shard_info["count"]:
                result.add_warning(f"Shard {shard_file} count mismatch: expected {shard_info['count']}, got {len(shard_data)}")
            
            # Validate each certification in shard
            valid_shard = True
            for i, cert in enumerate(shard_data):
                try:
                    validate(instance=cert, schema=cert_schema)
                    
                    # Check for duplicate slugs
                    slug = cert.get("slug")
                    if slug in all_certifications:
                        result.add_error(f"Duplicate slug '{slug}' in {shard_file} and {all_certifications[slug]}")
                        valid_shard = False
                    else:
                        all_certifications[slug] = shard_file
                    
                except ValidationError as e:
                    error_path = " → ".join(str(p) for p in e.path) if e.path else f"item {i}"
                    result.add_error(f"Schema validation failed for {shard_file}[{i}]: {e.message} at {error_path}")
                    valid_shard = False
            
            if valid_shard:
                result.add_passed_file(shard_file)
            else:
                result.add_failed_file(shard_file)
                
        except Exception as e:
            result.add_error(f"Error processing shard {shard_file}: {e}")
            result.add_failed_file(shard_file)
    
    print(f"  📊 Found {len(all_certifications)} unique certifications")
    return all_certifications

def validate_rankings(result: ValidationResult, cert_slugs: Set[str]) -> Dict[str, Any]:
    """Validate rankings and check referential integrity"""
    print("🏆 Validating rankings...")
    
    rankings_schema = load_schema("rankings")
    ranking_data = {}
    
    # Validate today.json
    today_path = DATA_DIR / "rankings" / "today.json"
    if today_path.exists():
        try:
            today_data = load_json(today_path)
            validate_json_schema(today_data, rankings_schema, "rankings/today.json", result)
            
            # Check referential integrity
            for ranking in today_data:
                slug = ranking.get("slug")
                if slug not in cert_slugs:
                    result.add_error(f"Rankings today.json references non-existent certification: {slug}")
                else:
                    ranking_data[slug] = ranking
                    
        except Exception as e:
            result.add_error(f"Error validating rankings/today.json: {e}")
    
    # Validate trends.json
    trends_path = DATA_DIR / "rankings" / "trends.json"
    if trends_path.exists():
        try:
            trends_data = load_json(trends_path)
            validate_json_schema(trends_data, rankings_schema, "rankings/trends.json", result)
            
            # Check referential integrity
            for slug, trend_data in trends_data.items():
                if slug not in cert_slugs:
                    result.add_error(f"Rankings trends.json references non-existent certification: {slug}")
                    
        except Exception as e:
            result.add_error(f"Error validating rankings/trends.json: {e}")
    
    return ranking_data

def validate_companies(result: ValidationResult, cert_slugs: Set[str]):
    """Validate company data"""
    print("🏢 Validating companies...")
    
    companies_schema = load_schema("companies")
    
    # Validate by_domain.json
    by_domain_path = DATA_DIR / "companies" / "by_domain.json"
    if by_domain_path.exists():
        try:
            by_domain_data = load_json(by_domain_path)
            validate_json_schema(by_domain_data, companies_schema, "companies/by_domain.json", result)
        except Exception as e:
            result.add_error(f"Error validating companies/by_domain.json: {e}")
    
    # Validate recommendations.json
    recommendations_path = DATA_DIR / "companies" / "recommendations.json"
    if recommendations_path.exists():
        try:
            recommendations_data = load_json(recommendations_path)
            
            # Check referential integrity
            for domain, companies in recommendations_data.items():
                for company_slug, recommendations in companies.items():
                    for rec in recommendations:
                        slug = rec.get("slug")
                        if slug not in cert_slugs:
                            result.add_error(f"Company recommendations references non-existent certification: {slug}")
            
            result.add_passed_file("companies/recommendations.json")
            
        except Exception as e:
            result.add_error(f"Error validating companies/recommendations.json: {e}")
            result.add_failed_file("companies/recommendations.json")

def validate_data_consistency(result: ValidationResult):
    """Validate cross-file data consistency"""
    print("🔗 Validating data consistency...")
    
    # Check manifest exists and is valid
    manifest_path = DATA_DIR / "manifest.json"
    if manifest_path.exists():
        try:
            manifest_schema = load_schema("manifest")
            manifest_data = load_json(manifest_path)
            validate_json_schema(manifest_data, manifest_schema, "manifest.json", result)
        except Exception as e:
            result.add_error(f"Error validating manifest.json: {e}")
    else:
        result.add_warning("manifest.json not found - consider generating it")

def print_validation_report(result: ValidationResult):
    """Print comprehensive validation report"""
    print("\n" + "="*60)
    print("📋 COMPREHENSIVE VALIDATION REPORT")
    print("="*60)
    
    if result.is_valid():
        print("✅ ALL VALIDATIONS PASSED!")
    else:
        print("❌ VALIDATION FAILURES DETECTED")
    
    print(f"\n📊 Summary:")
    print(f"  ✅ Passed files: {len(result.passed_files)}")
    print(f"  ❌ Failed files: {len(result.failed_files)}")
    print(f"  ⚠️  Warnings: {len(result.warnings)}")
    print(f"  🚨 Errors: {len(result.errors)}")
    
    if result.errors:
        print(f"\n🚨 Errors:")
        for error in result.errors:
            print(f"  • {error}")
    
    if result.warnings:
        print(f"\n⚠️  Warnings:")
        for warning in result.warnings:
            print(f"  • {warning}")
    
    if result.failed_files:
        print(f"\n❌ Failed files:")
        for file in result.failed_files:
            print(f"  • {file}")
    
    print("\n" + "="*60)
    
    return result.is_valid()

def main():
    """Main validation function"""
    print("🔍 Starting comprehensive validation...")
    
    result = ValidationResult()
    
    try:
        # Validate certifications and get all slugs
        cert_data = validate_certifications(result)
        cert_slugs = set(cert_data.keys())
        
        # Validate rankings with referential integrity
        validate_rankings(result, cert_slugs)
        
        # Validate companies with referential integrity
        validate_companies(result, cert_slugs)
        
        # Validate cross-file consistency
        validate_data_consistency(result)
        
        # Print report and exit with appropriate code
        is_valid = print_validation_report(result)
        exit(0 if is_valid else 1)
        
    except Exception as e:
        print(f"💥 Fatal error during validation: {e}")
        exit(1)

if __name__ == "__main__":
    main()