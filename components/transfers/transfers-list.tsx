"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckIcon, XIcon } from "lucide-react"

interface Transfer {
  id: string
  status: string
  reason: string | null
  created_at: string
  staff: { full_name: string; tsc_number: string | null } | null
  from_institution: { name: string; code: string } | null
  to_institution: { name: string; code: string } | null
  approvals: Array<{
    id: string
    approver_role: string
    decision: string
    comments: string | null
    decided_at: string
  }>
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  institution_endorsed: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  county_reviewed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
}

export function TransfersList({
  transfers,
  userTier,
}: {
  transfers: Transfer[]
  userTier: string
}) {
  const router = useRouter()
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const canApprove = (transfer: Transfer) => {
    if (userTier === "ministry" && transfer.status === "county_reviewed") return true
    if (userTier === "county" && transfer.status === "institution_endorsed") return true
    if (userTier === "institution" && transfer.status === "submitted") return true
    return false
  }

  async function handleDecision(transferId: string, decision: "approved" | "rejected") {
    setActionLoading(true)
    const supabase = createClient()

    // Create approval record
    const { error } = await supabase.from("transfer_approval").insert({
      transfer_application_id: transferId,
      approver_role: userTier,
      decision,
    })

    if (!error) {
      // Update transfer status
      let newStatus = ""
      if (decision === "rejected") {
        newStatus = "rejected"
      } else {
        switch (userTier) {
          case "institution":
            newStatus = "institution_endorsed"
            break
          case "county":
            newStatus = "county_reviewed"
            break
          case "ministry":
            newStatus = "approved"
            break
        }
      }

      await supabase
        .from("transfer_application")
        .update({ status: newStatus })
        .eq("id", transferId)
    }

    setActionLoading(false)
    setSelectedTransfer(null)
    router.refresh()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transfer Applications</CardTitle>
          <CardDescription>
            {transfers.length} application{transfers.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainer</TableHead>
                  <TableHead>TSC No.</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approvals</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No transfer applications
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        {t.staff?.full_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.staff?.tsc_number ?? "—"}
                      </TableCell>
                      <TableCell>{t.from_institution?.name ?? "—"}</TableCell>
                      <TableCell>{t.to_institution?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[t.status] ?? ""}>
                          {t.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {t.approvals.map((a) => (
                            <Badge
                              key={a.id}
                              variant="outline"
                              className={
                                a.decision === "approved"
                                  ? "border-green-300 text-green-700"
                                  : "border-red-300 text-red-700"
                              }
                            >
                              {a.approver_role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString("en-KE")}
                      </TableCell>
                      <TableCell>
                        {canApprove(t) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTransfer(t)}
                          >
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selectedTransfer && (
        <Dialog open={!!selectedTransfer} onOpenChange={() => setSelectedTransfer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Transfer Application</DialogTitle>
              <DialogDescription>
                {selectedTransfer.staff?.full_name} — from{" "}
                {selectedTransfer.from_institution?.name} to{" "}
                {selectedTransfer.to_institution?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Reason:</span>{" "}
                {selectedTransfer.reason ?? "Not specified"}
              </div>
              <div>
                <span className="font-medium">Current Status:</span>{" "}
                <Badge variant="secondary" className={statusColors[selectedTransfer.status]}>
                  {selectedTransfer.status.replace(/_/g, " ")}
                </Badge>
              </div>
              {selectedTransfer.approvals.length > 0 && (
                <div>
                  <span className="font-medium">Approval Chain:</span>
                  <ul className="mt-1 space-y-1">
                    {selectedTransfer.approvals.map((a) => (
                      <li key={a.id} className="flex items-center gap-2">
                        {a.decision === "approved" ? (
                          <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <XIcon className="h-3.5 w-3.5 text-red-600" />
                        )}
                        <span className="capitalize">{a.approver_role}</span> —{" "}
                        {a.decision}
                        {a.comments && ` (${a.comments})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                disabled={actionLoading}
                onClick={() => handleDecision(selectedTransfer.id, "rejected")}
              >
                <XIcon className="mr-1.5 h-3.5 w-3.5" />
                Reject
              </Button>
              <Button
                disabled={actionLoading}
                onClick={() => handleDecision(selectedTransfer.id, "approved")}
              >
                <CheckIcon className="mr-1.5 h-3.5 w-3.5" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
