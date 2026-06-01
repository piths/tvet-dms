"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { staffFullName } from "@/lib/types"
import type { UserTier } from "@/lib/types"

interface CaseRow {
  id: string
  case_type: string | null
  status: string
  outcome: string | null
  opened_at: string | null
  visible_to_trainer: boolean
  created_at: string
  staff: { first_name: string; last_name: string; middle_name: string | null } | null
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  under_investigation: "bg-amber-100 text-amber-800",
  active: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-gray-100 text-gray-800",
  appealed: "bg-purple-100 text-purple-800",
}

export function DisciplinaryView({ cases, userTier }: { cases: CaseRow[]; userTier: UserTier }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Case Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Visible to Trainer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No disciplinary cases found.
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.staff ? staffFullName(c.staff) : "—"}
                    </TableCell>
                    <TableCell>{c.case_type ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[c.status] ?? ""}>
                        {c.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.opened_at ? new Date(c.opened_at).toLocaleDateString("en-KE") : "—"}
                    </TableCell>
                    <TableCell>{c.outcome ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.visible_to_trainer ? "default" : "outline"}>
                        {c.visible_to_trainer ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
