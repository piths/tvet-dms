"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DisciplinaryCase {
  id: string
  case_type: string | null
  description: string | null
  status: string
  outcome: string | null
  opened_at: string | null
  resolved_at: string | null
  created_at: string
}

export function TrainerDisciplinary({ cases }: { cases: DisciplinaryCase[] }) {
  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No disciplinary cases on your record.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {cases.map((c) => (
        <Card key={c.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{c.case_type ?? "Case"}</CardTitle>
              <Badge variant="outline">{c.status}</Badge>
            </div>
            <CardDescription>
              Opened: {c.opened_at ? new Date(c.opened_at).toLocaleDateString("en-KE") : new Date(c.created_at).toLocaleDateString("en-KE")}
              {c.resolved_at && ` · Resolved: ${new Date(c.resolved_at).toLocaleDateString("en-KE")}`}
            </CardDescription>
          </CardHeader>
          {(c.description || c.outcome) && (
            <CardContent className="space-y-2">
              {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
              {c.outcome && (
                <p className="text-sm"><strong>Outcome:</strong> {c.outcome}</p>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
