#!/usr/bin/env python3
"""
Comprehensive ranking system for certifications based on instruction.txt
Computes rankings using demand, salary, friction, difficulty, and freshness signals
"""

import json
import math
import datetime
import pathlib
import statistics
from typing import Dict, List, Any, Optional

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "web" / "public" / "data"

# Configuration based on instruction.txt
WEIGHTS = {
    'demand': 0.45,
    'salary': 0.25,  
    'fee': 0.15,
    'hours': 0.10,
    'freshness': 0.05
}

DIFFICULTY_WEIGHTS = {
    'foundational': 0.05,
    'associate': 0.10,
    'professional': 0.15,
    'expert': 0.20,
    'specialty': 0.15
}

# EMA smoothing parameter
ALPHA = 0.5  # 14-day feel

def load_json(path: pathlib.Path) -> Any:
    """Load JSON file"""
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path: pathlib.Path, obj: Any) -> None:
    """Save data as JSON"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

def zscore(values: List[float], value: float) -> float:
    """Compute z-score with epsilon protection"""
    if len(values) < 3:
        return 0.0
    
    values = [v for v in values if v is not None and not math.isnan(v)]
    if len(values) < 3:
        return 0.0
        
    mean_val = statistics.mean(values)
    try:
        stdev_val = statistics.stdev(values)
        if stdev_val < 1e-6:
            return 0.0
        return (value - mean_val) / stdev_val
    except:
        return 0.0

def minmax_normalize(values: List[float], value: float) -> float:
    """Min-max normalization with protection"""
    if len(values) < 2:
        return 0.0
        
    values = [v for v in values if v is not None and not math.isnan(v)]
    if len(values) < 2:
        return 0.0
        
    min_val = min(values)
    max_val = max(values)
    
    if max_val - min_val < 1e-6:
        return 0.5
        
    return (value - min_val) / (max_val - min_val)

def get_demand_signal(cert: Dict, demand_data: Dict) -> float:
    """Get job postings demand signal"""
    slug = cert['slug']
    if slug in demand_data:
        return float(demand_data[slug].get('job_postings_30d', 0))
    return float(cert.get('job_postings', 0))

def get_salary_signal(cert: Dict, salary_data: Dict) -> float:
    """Get salary proxy from role salaries"""
    # Use existing salary data from cert if available
    salary_info = cert.get('salary', {})
    if salary_info and 'avg' in salary_info:
        return float(salary_info['avg'])
    
    # Fallback to role-based lookup (simplified)
    domain = cert['domain']
    if domain in salary_data:
        roles = salary_data[domain]
        if roles:
            # Take median of available salaries
            salaries = [role.get('median_usd', 0) for role in roles.values() if role.get('median_usd')]
            if salaries:
                return float(statistics.median(salaries))
    
    return 0.0

def get_friction_signals(cert: Dict) -> tuple:
    """Get fee and hours friction signals"""
    fee = float(cert.get('cost', cert.get('exam_fee_usd', 0)))
    
    # Hours calculation
    hours = 0
    duration_str = cert.get('duration', '0 hours')
    try:
        if 'hour' in duration_str.lower():
            hours = float(duration_str.lower().replace('hours', '').replace('hour', '').strip())
        elif 'week' in duration_str.lower():
            weeks = float(duration_str.lower().replace('weeks', '').replace('week', '').strip())
            hours = weeks * 40  # Assume 40 hours per week
        elif 'day' in duration_str.lower():
            days = float(duration_str.lower().replace('days', '').replace('day', '').strip())  
            hours = days * 8   # Assume 8 hours per day
    except:
        # Fallback to old format
        lo = cert.get("recommended_hours_min", 0) or 0
        hi = cert.get("recommended_hours_max", 0) or lo
        hours = (lo + hi) / 2
        
    return fee, hours

def get_difficulty_weight(cert: Dict) -> float:
    """Get difficulty weight based on level"""
    level = cert.get('level', 'associate').lower()
    return DIFFICULTY_WEIGHTS.get(level, DIFFICULTY_WEIGHTS['associate'])

def main():
    """Main function to compute comprehensive rankings"""
    print("🚀 Computing comprehensive rankings...")
    print("=" * 60)
    
    # Load all certification data from domain files
    certifications = {}
    domains = {}
    
    # Load certifications from all domain files
    cert_files = [f for f in (DATA / "certifications").glob("*.json") 
                  if not f.name.startswith('index')]
    
    for cert_file in cert_files:
        try:
            certs = load_json(cert_file)
            for cert in certs:
                certifications[cert['slug']] = cert
                domain = cert['domain']
                if domain not in domains:
                    domains[domain] = []
                domains[domain].append(cert['slug'])
        except Exception as e:
            print(f"Error loading {cert_file}: {e}")
    
    print(f"Loaded {len(certifications)} certifications across {len(domains)} domains")
    
    # Load demand and salary data
    demand_data = {}
    if (DATA / "demand" / "metrics.json").exists():
        demand_list = load_json(DATA / "demand" / "metrics.json")
        demand_data = {d["slug"]: d for d in demand_list}
    
    salary_data = load_json(DATA / "salaries" / "role_salaries.json")
    
    # Load previous scores for EMA
    trends_path = DATA / "rankings" / "trends.json"
    trends = load_json(trends_path)
    previous_scores = trends.get('scores', {})
    
    today = datetime.date.today().isoformat()
    all_rankings = []
    new_scores = {}
    
    # Process each domain
    for domain, cert_slugs in domains.items():
        print(f"Processing domain: {domain} ({len(cert_slugs)} certs)")
        
        certs = [certifications[slug] for slug in cert_slugs]
        
        # Collect all signals for normalization
        demand_values = []
        salary_values = []
        fee_values = []
        hours_values = []
        
        signals = {}
        
        for cert in certs:
            demand = get_demand_signal(cert, demand_data)
            salary = get_salary_signal(cert, salary_data)
            fee, hours = get_friction_signals(cert)
            
            signals[cert['slug']] = {
                'demand': demand,
                'salary': salary,
                'fee': fee,
                'hours': hours,
                'difficulty': get_difficulty_weight(cert),
                'freshness': 1.0  # Simplified for now
            }
            
            if demand > 0:
                demand_values.append(demand)
            if salary > 0:
                salary_values.append(salary)
            if fee > 0:
                fee_values.append(fee)
            if hours > 0:
                hours_values.append(hours)
        
        # Compute normalized scores
        raw_scores = []
        
        for cert in certs:
            slug = cert['slug']
            s = signals[slug]
            
            # Normalize signals
            demand_z = zscore(demand_values, s['demand'])
            salary_z = zscore(salary_values, s['salary'])
            fee_n = minmax_normalize(fee_values, s['fee'])
            hours_n = minmax_normalize(hours_values, s['hours'])
            
            # Compute raw score
            score_raw = (
                WEIGHTS['demand'] * demand_z +
                WEIGHTS['salary'] * salary_z +
                WEIGHTS['fee'] * (1 - fee_n) +     # Invert: lower fee is better
                WEIGHTS['hours'] * (1 - hours_n) + # Invert: lower hours is better
                WEIGHTS['freshness'] * s['freshness'] +
                s['difficulty']
            )
            
            raw_scores.append(score_raw)
            signals[slug]['score_raw'] = score_raw
            signals[slug]['has_demand'] = s['demand'] > 0
            signals[slug]['has_salary'] = s['salary'] > 0
        
        # Compute mean for shrinkage
        domain_mean = statistics.mean(raw_scores) if raw_scores else 0.0
        
        # Apply shrinkage and EMA, create rankings
        domain_rankings = []
        
        for cert in certs:
            slug = cert['slug']
            s = signals[slug]
            
            # Bayesian shrinkage
            obs = int(s['has_demand']) + int(s['has_salary'])
            lam = max(0.0, min(0.6, 1 - obs/2))
            score_shrunk = lam * domain_mean + (1 - lam) * s['score_raw']
            
            # EMA smoothing
            prev_score = previous_scores.get(slug, score_shrunk)
            score_t = ALPHA * score_shrunk + (1 - ALPHA) * prev_score
            
            # Store new score
            new_scores[slug] = score_t
            
            # Create ranking entry
            confidence = 'high' if obs >= 2 else 'medium' if obs >= 1 else 'low'
            
            domain_rankings.append({
                'slug': slug,
                'name': cert['name'],
                'issuer': cert['issuer'],
                'domain': domain,
                'score': score_t,
                'confidence': confidence,
                'rating': cert.get('rating', 4.0),
                'job_postings': int(s['demand']),
                'signals': {
                    'demand': s['demand'],
                    'salary': s['salary'],
                    'fee': s['fee'], 
                    'hours': s['hours']
                }
            })
        
        # Sort by score descending
        domain_rankings.sort(key=lambda x: (-x['score'], -x['signals']['salary'], x['signals']['fee']))
        
        # Add domain ranks
        for i, ranking in enumerate(domain_rankings, 1):
            ranking['rank'] = i
            all_rankings.append(ranking)
    
    # Compute global rankings
    all_rankings.sort(key=lambda x: (-x['score'], -x['signals']['salary'], x['signals']['fee']))
    
    # Create final output format
    today_rankings = []
    for i, ranking in enumerate(all_rankings, 1):
        today_rankings.append({
            'rank': ranking['rank'],
            'global_rank': i,
            'slug': ranking['slug'],
            'name': ranking['name'],
            'issuer': ranking['issuer'],
            'domain': ranking['domain'],
            'score': round(ranking['score'], 4),
            'confidence': ranking['confidence'],
            'rating': ranking['rating'],
            'job_postings': ranking['job_postings'],
            'trend': 'stable'  # Simplified for now
        })
    
    # Save results
    save_json(DATA / "rankings" / "today.json", today_rankings)
    
    # Update trends with new scores
    trends_data = {
        'last_updated': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'scores': new_scores
    }
    save_json(trends_path, trends_data)
    
    print("=" * 60)
    print(f"✅ Generated rankings for {len(today_rankings)} certifications")
    print(f"📊 Across {len(domains)} domains")
    print("📁 Files updated:")
    print("   - rankings/today.json")  
    print("   - rankings/trends.json")

if __name__ == "__main__":
    main()