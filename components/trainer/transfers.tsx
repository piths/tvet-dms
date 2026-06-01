"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckIcon, XIcon, ClockIcon } from "lucide-react"

interface Transfer {
  id: string
  reference_no: string | null
  status: string
  reason: string | null
  created_at: string
  from_institution: { name: string } | null
  to_institution: { name: string } | null
  approvals: Array<{
    approver_role: string
    decision: string
    approver_name: string | null
    comments: string | null
    signed_at: string | null
  }>
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800",
  institution_endorsed: "bg-cyan-100 text-cyan-800",
  county_reviewed: "bg-indigo-100 text-indigo-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
}

export function TrainerTransfers({ transfers }: { transfers: Transfer[] }) {
  if (transfers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          You have no transfer applications.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transfers.map((t) => (
        <Card key={t.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {t.from_institution?.name ?? "—"} → {t.to_institution?.name ?? "—"}
              </CardTitle>
              <Badge variant="secondary" className={statusColors[t.status] ?? ""}>
                {t.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <CardDescription>
              Ref: {t.reference_no ?? "—"} · Applied: {new Date(t.created_at).toLocaleDateString("en-KE")}
              {t.reason && ` · Reason: ${t.reason}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Approval Chain
            </p>
            <div className="flex items-center gap-6">
              {(["institution", "county", "ministry"] as const).map((role) => {
                const approval = t.approvals.find((a) => a.approver_role === role)
                const decided = approval && approval.decision !== "pending"
                return (
                  <div key={role} className="flex items-center gap-1.5">
                    {decided ? (
                      approval.decision === "approved" ? (
                        <CheckIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <XIcon className="h-4 w-4 text-red-600" />
                      )
                    ) : (
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm capitalize">{role}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
