import {
  Building2,
  BarChart3,
  Wallet,
  Megaphone,
  Users,
  Settings,
  TrendingUp,
  Search,
  Crown, // Using Crown for "chess"
  Scale,
  HelpCircle, // Fallback icon
} from "lucide-react"

// The Dictionary: Maps JSON strings to React Components
const iconMap: Record<string, React.ElementType> = {
  "building-2": Building2,
  "bar-chart-3": BarChart3,
  wallet: Wallet,
  megaphone: Megaphone,
  users: Users,
  settings: Settings,
  "trending-up": TrendingUp,
  search: Search,
  chess: Crown,
  scale: Scale,
}

export default function DynamicIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  // If your friend makes a typo in the JSON, it safely falls back to a question mark instead of crashing
  const Icon = iconMap[name] || HelpCircle

  return <Icon className={className} />
}
