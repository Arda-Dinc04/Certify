// Single source of truth for domains across the app.
// Only edit here if adding/removing a domain.

import React from 'react';
import { 
  Monitor, 
  Shield, 
  Cloud, 
  BarChart3, 
  Bot, 
  Code, 
  Network, 
  Database, 
  ClipboardList, 
  TrendingUp, 
  Smartphone, 
  Truck, 
  Users, 
  DollarSign, 
  Calculator, 
  AlertTriangle, 
  ShieldCheck, 
  Heart, 
  Stethoscope, 
  Pill, 
  Microscope, 
  Factory, 
  CheckCircle, 
  Cog, 
  Zap, 
  Wrench, 
  Hammer, 
  Building, 
  Car, 
  GraduationCap, 
  Briefcase, 
  Scale, 
  Leaf
} from 'lucide-react';

// Domain to Lucide React icon mapping
export const DOMAIN_ICONS: Record<DomainSlug, React.ComponentType<any>> = {
  // Technology & Computing
  "cs-it": Monitor,
  "cybersecurity": Shield,
  "cloud-computing": Cloud,
  "data-science": BarChart3,
  "artificial-intelligence": Bot,
  "software-development": Code,
  "networking": Network,
  "database-management": Database,
  // Business & Management
  "project-management": ClipboardList,
  "business-analysis": TrendingUp,
  "digital-marketing": Smartphone,
  "supply-chain": Truck,
  "human-resources": Users,
  // Finance & Accounting
  "finance": DollarSign,
  "accounting": Calculator,
  "risk-management": AlertTriangle,
  "insurance": ShieldCheck,
  // Healthcare & Life Sciences
  "healthcare": Heart,
  "nursing": Stethoscope,
  "pharmacy": Pill,
  "medical-technology": Microscope,
  // Manufacturing & Engineering
  "manufacturing": Factory,
  "quality-assurance": CheckCircle,
  "mechanical-engineering": Cog,
  "electrical-engineering": Zap,
  "engineering-business": Wrench,
  // Skilled Trades & Construction
  "skilled-trades": Wrench,
  "construction": Hammer,
  "automotive": Car,
  // Education & Training
  "education": GraduationCap,
  // Sales & Customer Service
  "sales": Briefcase,
  // Legal & Compliance
  "legal": Scale,
  // Environmental & Sustainability
  "environmental": Leaf
};

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
  | "engineering-business"
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
  "cs-it": { slug: "cs-it", label: "Computer Science / IT", emoji: "💻", color: "#2563EB", bgColor: "bg-blue-50" },
  "cybersecurity": { slug: "cybersecurity", label: "Cybersecurity", emoji: "🔐", color: "#DC2626", bgColor: "bg-red-50" },
  "cloud-computing": { slug: "cloud-computing", label: "Cloud Computing", emoji: "☁️", color: "#0891B2", bgColor: "bg-sky-50" },
  "data-science": { slug: "data-science", label: "Data Science / Analytics", emoji: "📊", color: "#7C3AED", bgColor: "bg-purple-50" },
  "artificial-intelligence": { slug: "artificial-intelligence", label: "AI / Machine Learning", emoji: "🤖", color: "#9333EA", bgColor: "bg-violet-50" },
  "software-development": { slug: "software-development", label: "Software Development", emoji: "👨‍💻", color: "#4F46E5", bgColor: "bg-indigo-50" },
  "networking": { slug: "networking", label: "Networking", emoji: "🌐", color: "#0D9488", bgColor: "bg-cyan-50" },
  "database-management": { slug: "database-management", label: "Database Management", emoji: "🗄️", color: "#475569", bgColor: "bg-slate-50" },
  
  // Business & Management
  "project-management": { slug: "project-management", label: "Project Management", emoji: "📋", color: "#16A34A", bgColor: "bg-green-50" },
  "business-analysis": { slug: "business-analysis", label: "Business Analysis", emoji: "📈", color: "#059669", bgColor: "bg-emerald-50" },
  "digital-marketing": { slug: "digital-marketing", label: "Digital Marketing", emoji: "📱", color: "#DB2777", bgColor: "bg-pink-50" },
  "supply-chain": { slug: "supply-chain", label: "Supply Chain Management", emoji: "🚚", color: "#D97706", bgColor: "bg-amber-50" },
  "human-resources": { slug: "human-resources", label: "Human Resources", emoji: "👥", color: "#E11D48", bgColor: "bg-rose-50" },
  
  // Finance & Accounting
  "finance": { slug: "finance", label: "Finance", emoji: "💰", color: "#CA8A04", bgColor: "bg-yellow-50" },
  "accounting": { slug: "accounting", label: "Accounting", emoji: "🧮", color: "#65A30D", bgColor: "bg-lime-50" },
  "risk-management": { slug: "risk-management", label: "Risk Management", emoji: "⚠️", color: "#EA580C", bgColor: "bg-orange-50" },
  "insurance": { slug: "insurance", label: "Insurance", emoji: "🛡️", color: "#0F766E", bgColor: "bg-teal-50" },
  
  // Healthcare & Life Sciences
  "healthcare": { slug: "healthcare", label: "Healthcare", emoji: "🏥", color: "#B91C1C", bgColor: "bg-red-50" },
  "nursing": { slug: "nursing", label: "Nursing", emoji: "👩‍⚕️", color: "#BE185D", bgColor: "bg-pink-50" },
  "pharmacy": { slug: "pharmacy", label: "Pharmacy", emoji: "💊", color: "#15803D", bgColor: "bg-green-50" },
  "medical-technology": { slug: "medical-technology", label: "Medical Technology", emoji: "🔬", color: "#1D4ED8", bgColor: "bg-blue-50" },
  
  // Manufacturing & Engineering
  "manufacturing": { slug: "manufacturing", label: "Manufacturing", emoji: "🏭", color: "#4B5563", bgColor: "bg-gray-50" },
  "quality-assurance": { slug: "quality-assurance", label: "Quality Assurance", emoji: "✅", color: "#059669", bgColor: "bg-green-50" },
  "mechanical-engineering": { slug: "mechanical-engineering", label: "Mechanical Engineering", emoji: "⚙️", color: "#374151", bgColor: "bg-slate-50" },
  "electrical-engineering": { slug: "electrical-engineering", label: "Electrical Engineering", emoji: "⚡", color: "#A16207", bgColor: "bg-yellow-50" },
  "engineering-business": { slug: "engineering-business", label: "Engineering / Business", emoji: "🔧", color: "#92400E", bgColor: "bg-amber-50" },
  
  // Skilled Trades & Construction
  "skilled-trades": { slug: "skilled-trades", label: "Skilled Trades", emoji: "🔧", color: "#C2410C", bgColor: "bg-orange-50" },
  "construction": { slug: "construction", label: "Construction", emoji: "🏗️", color: "#B45309", bgColor: "bg-amber-50" },
  "automotive": { slug: "automotive", label: "Automotive", emoji: "🚗", color: "#1E40AF", bgColor: "bg-blue-50" },
  
  // Education & Training
  "education": { slug: "education", label: "Education & Training", emoji: "🎓", color: "#3730A3", bgColor: "bg-indigo-50" },
  
  // Sales & Customer Service
  "sales": { slug: "sales", label: "Sales", emoji: "💼", color: "#7C2D12", bgColor: "bg-purple-50" },
  
  // Legal & Compliance
  "legal": { slug: "legal", label: "Legal & Compliance", emoji: "⚖️", color: "#1F2937", bgColor: "bg-gray-50" },
  
  // Environmental & Sustainability
  "environmental": { slug: "environmental", label: "Environmental & Sustainability", emoji: "🌱", color: "#166534", bgColor: "bg-green-50" }
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

export function getDomainIcon(slug: string) {
  return DOMAIN_ICONS[slug as DomainSlug] || Monitor;
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