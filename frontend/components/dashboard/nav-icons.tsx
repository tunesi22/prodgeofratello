import type { ReactElement } from 'react'
import {
  Sidebar,
  SquaresFour,
  ChatCircleText,
  Quotes,
  ChartBar,
  MagnifyingGlass,
  Wrench,
  Sparkle,
  CheckSquare,
  Folder,
  CreditCard,
  Gauge,
  TrendUp,
  GearSix,
  Users,
  SignOut,
  CaretUpDown,
  Plus,
} from '@phosphor-icons/react/dist/ssr'

/**
 * Dashboard nav icons, all from the Phosphor icon library (the Figma design
 * system's icon set; the design files reference Phosphor names directly, e.g.
 * SquaresFour, GearSix). Regular weight, currentColor, sized via className.
 * The /dist/ssr entry avoids the client-only IconContext so these render in
 * both server and client components. See DESIGN_SYSTEM.md "Ikon".
 */

interface IconProps {
  className?: string
}

/** Collapse/expand rail (Phosphor: Sidebar). */
export function PanelLeftIcon({ className }: IconProps): ReactElement {
  return <Sidebar className={className} aria-hidden="true" />
}

/** Overview (Phosphor: SquaresFour, the glyph used in the Figma shell). */
export function SquaresFourIcon({ className }: IconProps): ReactElement {
  return <SquaresFour className={className} aria-hidden="true" />
}

/** Prompts (Phosphor: ChatCircleText). */
export function PromptsIcon({ className }: IconProps): ReactElement {
  return <ChatCircleText className={className} aria-hidden="true" />
}

/** Citations (Phosphor: Quotes). */
export function CitationsIcon({ className }: IconProps): ReactElement {
  return <Quotes className={className} aria-hidden="true" />
}

/** Agents Insights (Phosphor: ChartBar). */
export function ChartBarsIcon({ className }: IconProps): ReactElement {
  return <ChartBar className={className} aria-hidden="true" />
}

/** AI Prompt Research (Phosphor: MagnifyingGlass). */
export function ResearchIcon({ className }: IconProps): ReactElement {
  return <MagnifyingGlass className={className} aria-hidden="true" />
}

/** GEO Audit Tools (Phosphor: Wrench). */
export function ToolsIcon({ className }: IconProps): ReactElement {
  return <Wrench className={className} aria-hidden="true" />
}

/** AI Articles (Phosphor: Sparkle). */
export function SuggestedIcon({ className }: IconProps): ReactElement {
  return <Sparkle className={className} aria-hidden="true" />
}

/** To-Do (Phosphor: CheckSquare). */
export function TodoIcon({ className }: IconProps): ReactElement {
  return <CheckSquare className={className} aria-hidden="true" />
}

/** All Projects (Phosphor: Folder). */
export function ProjectsIcon({ className }: IconProps): ReactElement {
  return <Folder className={className} aria-hidden="true" />
}

/** Billing (Phosphor: CreditCard). */
export function BillingIcon({ className }: IconProps): ReactElement {
  return <CreditCard className={className} aria-hidden="true" />
}

/** Monitor Usage (Phosphor: Gauge). */
export function UsageIcon({ className }: IconProps): ReactElement {
  return <Gauge className={className} aria-hidden="true" />
}

/** Boost your AI Ranking (Phosphor: TrendUp). */
export function BoostIcon({ className }: IconProps): ReactElement {
  return <TrendUp className={className} aria-hidden="true" />
}

/** Account Settings (Phosphor: GearSix, the glyph used in the Figma shell). */
export function GearIcon({ className }: IconProps): ReactElement {
  return <GearSix className={className} aria-hidden="true" />
}

/** Admin users (Phosphor: Users). */
export function UsersIcon({ className }: IconProps): ReactElement {
  return <Users className={className} aria-hidden="true" />
}

/** Log out (Phosphor: SignOut). */
export function LogoutIcon({ className }: IconProps): ReactElement {
  return <SignOut className={className} aria-hidden="true" />
}

/** Project switcher (Phosphor: CaretUpDown). */
export function ChevronUpDownIcon({ className }: IconProps): ReactElement {
  return <CaretUpDown className={className} aria-hidden="true" />
}

/** Add (Phosphor: Plus). */
export function PlusSmallIcon({ className }: IconProps): ReactElement {
  return <Plus className={className} aria-hidden="true" />
}
