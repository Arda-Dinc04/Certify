import fs from "node:fs";
import path from "node:path";
import { DOMAIN_REGISTRY } from "../web/src/config/domains";

const dataRoot = path.resolve(__dirname, "../web/public/data");
const registry = new Set(Object.keys(DOMAIN_REGISTRY));

function readJson(p: string) { 
  return JSON.parse(fs.readFileSync(p, "utf-8")); 
}

function collectDomains() {
  const found = new Set<string>();
  
  // Check certification shards
  const certsIndex = readJson(path.join(dataRoot, "certifications", "index.map.json"));
  for (const shard of certsIndex.shards) {
    const shardPath = path.join(dataRoot, "certifications", path.basename(shard.file));
    if (fs.existsSync(shardPath)) {
      const certs = readJson(shardPath);
      certs.forEach((c: any) => {
        if (c.domain) {
          found.add(String(c.domain).toLowerCase());
        }
      });
    }
  }
  
  // Check rankings if they exist
  const rankingsPath = path.join(dataRoot, "rankings", "today.json");
  if (fs.existsSync(rankingsPath)) {
    const rankings = readJson(rankingsPath);
    rankings.forEach((r: any) => {
      if (r.domain) {
        found.add(String(r.domain).toLowerCase());
      }
    });
  }
  
  // Check company data
  const companiesByDomainPath = path.join(dataRoot, "companies", "by_domain.json");
  if (fs.existsSync(companiesByDomainPath)) {
    const companiesByDomain = readJson(companiesByDomainPath);
    Object.keys(companiesByDomain).forEach(domain => {
      found.add(String(domain).toLowerCase());
    });
  }
  
  return found;
}

// Map current domain labels to slugs for validation
const DOMAIN_LABEL_TO_SLUG_MAP: Record<string, string> = {
  "cs/it": "cs-it",
  "cs / it": "cs-it",
  "engineering / business": "engineering-business",
  "engineering/business": "engineering-business",
  "healthcare": "healthcare",
  "finance": "finance",
  "skilled trades": "skilled-trades",
  "skilled-trades": "skilled-trades",
};

const found = collectDomains();
const unmappedDomains: string[] = [];
const validDomains: string[] = [];

[...found].forEach(domain => {
  const mappedSlug = DOMAIN_LABEL_TO_SLUG_MAP[domain];
  if (mappedSlug && registry.has(mappedSlug)) {
    validDomains.push(`${domain} → ${mappedSlug}`);
  } else if (registry.has(domain as any)) {
    validDomains.push(domain);
  } else {
    unmappedDomains.push(domain);
  }
});

if (unmappedDomains.length) {
  console.error("❌ Unknown domain(s) in data:", unmappedDomains);
  console.log("\n💡 Add these to DOMAIN_LABEL_TO_SLUG_MAP or DOMAIN_REGISTRY:");
  unmappedDomains.forEach(d => console.log(`  "${d}": "???",`));
  process.exit(1);
}

console.log("✅ Domains OK:", validDomains.join(", "));
console.log(`\n📊 Found ${found.size} unique domains, all mapped to registry`);