// Single source of truth for domains across the app.
// Only edit here if adding/removing a domain.

export type DomainSlug =
  // Technology & Computing
  | "cs-it"
  | "cybersecurity"
  | "cloud-computing"
  | "data-science"
  | "artificial-intelligence"
  | "software-development"
  | "networking"
  | "database-management"
  // Business & Management
  | "project-management"
  | "business-analysis"
  | "digital-marketing"
  | "supply-chain"
  | "human-resources"
  // Finance & Accounting
  | "finance"
  | "accounting"
  | "risk-management"
  | "insurance"
  // Healthcare & Life Sciences
  | "healthcare"
  | "nursing"
  | "pharmacy"
  | "medical-technology"
  // Manufacturing & Engineering
  | "manufacturing"
  | "quality-assurance"
  | "mechanical-engineering"
  | "electrical-engineering"
  // Skilled Trades & Construction
  | "skilled-trades"
  | "construction"
  | "automotive"
  // Education & Training
  | "education"
  // Sales & Customer Service
  | "sales"
  // Legal & Compliance
  | "legal"
  // Environmental & Sustainability
  | "environmental";

// Registry drives UI (tabs, chips, headings) and filters.
// Emoji choice: one emoji per domain to keep a clean, consistent look.
export const DOMAIN_REGISTRY: Record<DomainSlug, {
  slug: DomainSlug;
  label: string;
  emoji: string;
  color?: string; // hex color for banners
  bgColor?: string; // Tailwind background class
}> = {
  // Technology & Computing
  "cs-it": { slug: "cs-it", label: "Computer Science / IT", emoji: "💻", color: "#3B82F6", bgColor: "bg-blue-50" },
  "cybersecurity": { slug: "cybersecurity", label: "Cybersecurity", emoji: "🔐", color: "#EF4444", bgColor: "bg-red-50" },
  "cloud-computing": { slug: "cloud-computing", label: "Cloud Computing", emoji: "☁️", color: "#0EA5E9", bgColor: "bg-sky-50" },
  "data-science": { slug: "data-science", label: "Data Science / Analytics", emoji: "📊", color: "#8B5CF6", bgColor: "bg-purple-50" },
  "artificial-intelligence": { slug: "artificial-intelligence", label: "AI / Machine Learning", emoji: "🤖", color: "#7C3AED", bgColor: "bg-violet-50" },
  "software-development": { slug: "software-development", label: "Software Development", emoji: "👨‍💻", color: "#6366F1", bgColor: "bg-indigo-50" },
  "networking": { slug: "networking", label: "Networking", emoji: "🌐", color: "#06B6D4", bgColor: "bg-cyan-50" },
  "database-management": { slug: "database-management", label: "Database Management", emoji: "🗄️", color: "#64748B", bgColor: "bg-slate-50" },
  
  // Business & Management
  "project-management": { slug: "project-management", label: "Project Management", emoji: "📋", color: "#10B981", bgColor: "bg-green-50" },
  "business-analysis": { slug: "business-analysis", label: "Business Analysis", emoji: "📈", color: "#059669", bgColor: "bg-emerald-50" },
  "digital-marketing": { slug: "digital-marketing", label: "Digital Marketing", emoji: "📱", color: "#EC4899", bgColor: "bg-pink-50" },
  "supply-chain": { slug: "supply-chain", label: "Supply Chain Management", emoji: "🚚", color: "#F59E0B", bgColor: "bg-amber-50" },
  "human-resources": { slug: "human-resources", label: "Human Resources", emoji: "👥", color: "#F43F5E", bgColor: "bg-rose-50" },
  
  // Finance & Accounting
  "finance": { slug: "finance", label: "Finance", emoji: "💰", color: "#EAB308", bgColor: "bg-yellow-50" },
  "accounting": { slug: "accounting", label: "Accounting", emoji: "🧮", color: "#84CC16", bgColor: "bg-lime-50" },
  "risk-management": { slug: "risk-management", label: "Risk Management", emoji: "⚠️", color: "#F97316", bgColor: "bg-orange-50" },
  "insurance": { slug: "insurance", label: "Insurance", emoji: "🛡️", color: "#14B8A6", bgColor: "bg-teal-50" },
  
  // Healthcare & Life Sciences
  "healthcare": { slug: "healthcare", label: "Healthcare", emoji: "🏥", color: "#DC2626", bgColor: "bg-red-50" },
  "nursing": { slug: "nursing", label: "Nursing", emoji: "👩‍⚕️", color: "#E11D48", bgColor: "bg-pink-50" },
  "pharmacy": { slug: "pharmacy", label: "Pharmacy", emoji: "💊", color: "#16A34A", bgColor: "bg-green-50" },
  "medical-technology": { slug: "medical-technology", label: "Medical Technology", emoji: "🔬", color: "#2563EB", bgColor: "bg-blue-50" },
  
  // Manufacturing & Engineering
  "manufacturing": { slug: "manufacturing", label: "Manufacturing", emoji: "🏭", color: "#6B7280", bgColor: "bg-gray-50" },
  "quality-assurance": { slug: "quality-assurance", label: "Quality Assurance", emoji: "✅", color: "#22C55E", bgColor: "bg-green-50" },
  "mechanical-engineering": { slug: "mechanical-engineering", label: "Mechanical Engineering", emoji: "⚙️", color: "#475569", bgColor: "bg-slate-50" },
  "electrical-engineering": { slug: "electrical-engineering", label: "Electrical Engineering", emoji: "⚡", color: "#CA8A04", bgColor: "bg-yellow-50" },
  
  // Skilled Trades & Construction
  "skilled-trades": { slug: "skilled-trades", label: "Skilled Trades", emoji: "🔧", color: "#EA580C", bgColor: "bg-orange-50" },
  "construction": { slug: "construction", label: "Construction", emoji: "🏗️", color: "#D97706", bgColor: "bg-amber-50" },
  "automotive": { slug: "automotive", label: "Automotive", emoji: "🚗", color: "#1D4ED8", bgColor: "bg-blue-50" },
  
  // Education & Training
  "education": { slug: "education", label: "Education & Training", emoji: "🎓", color: "#4338CA", bgColor: "bg-indigo-50" },
  
  // Sales & Customer Service
  "sales": { slug: "sales", label: "Sales", emoji: "💼", color: "#9333EA", bgColor: "bg-purple-50" },
  
  // Legal & Compliance
  "legal": { slug: "legal", label: "Legal & Compliance", emoji: "⚖️", color: "#374151", bgColor: "bg-gray-50" },
  
  // Environmental & Sustainability
  "environmental": { slug: "environmental", label: "Environmental & Sustainability", emoji: "🌱", color: "#15803D", bgColor: "bg-green-50" }
};

// Utility getters
export const ALL_DOMAIN_SLUGS: DomainSlug[] = Object.keys(DOMAIN_REGISTRY) as DomainSlug[];

export function getDomainMeta(slug: string) {
  return DOMAIN_REGISTRY[slug as DomainSlug];
}

export function getDomainLabel(slug: string) {
  return getDomainMeta(slug)?.label ?? slug;
}

export function getDomainEmoji(slug: string) {
  return getDomainMeta(slug)?.emoji ?? "🏷️";
}

// Coerce incoming domain values to valid DomainSlugs
export function coerceDomainSlug(value: string): DomainSlug {
  const normalized = value.trim().toLowerCase();
  
  // Map common variations to domain slugs
  const domainMap: Record<string, DomainSlug> = {
    "cs / it": "cs-it",
    "cs/it": "cs-it",
    "engineering / business": "engineering-business",
    "engineering/business": "engineering-business",
    "healthcare": "healthcare",
    "finance": "finance",
    "skilled trades": "skilled-trades",
    "skilled-trades": "skilled-trades",
  };
  
  const slug = domainMap[normalized];
  return slug && slug in DOMAIN_REGISTRY ? slug : "cs-it";
}