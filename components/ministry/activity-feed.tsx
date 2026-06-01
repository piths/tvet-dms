"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardCheckIcon,
  ArrowRightLeftIcon,
  UserPlusIcon,
  TrendingUpIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  FileTextIcon,
} from "lucide-react"

interface AuditEvent {
  id: string
  actor_name: string | null
  action: string
  entity_type: string
  created_at: string
}

const ACTION_ICONS: Record<string, any> = {
  "institution_return": ClipboardCheckIcon,
  "transfer_application": ArrowRightLeftIcon,
  "recruitment": UserPlusIcon,
  "promotion": TrendingUpIcon,
  "disciplinary_case": ShieldAlertIcon,
  "qa_assessment": ShieldCheckIcon,
}

const ACTION_LABELS: Record<string, string> = {
  "return.submit": "submitted a return",
  "return.verify": "verified a return",
  "return.return": "returned for correction",
  "transfer.approved": "approved a transfer",
  "transfer.rejected": "rejected a transfer",
  "recruitment.advertise": "advertised a vacancy",
  "recruitment.appoint": "appointed a candidate",
  "promotion.recommend": "recommended a promotion",
  "promotion.approve": "approved a promotion",
  "disciplinary.status_change": "updated a disciplinary case",
  "qa.complete": "completed a QA assessment",
}

export function ActivityFeed({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <CardDescription>System-wide actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity recorded yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        <CardDescription>Latest actions across the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.slice(0, 12).map((event) => {
            const Icon = ACTION_ICONS[event.entity_type] ?? FileTextIcon
            const label = ACTION_LABELS[event.action] ?? event.action.replace(/[._]/g, " ")
            const timeAgo = getTimeAgo(event.created_at)

            return (
              <div key={event.id} className="flex items-start gap-3">
                <div className="rounded-md bg-muted p-1.5 mt-0.5">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className="font-medium">{event.actor_name ?? "System"}</span>{" "}
                    <span className="text-muted-foreground">{label}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short" })
}
