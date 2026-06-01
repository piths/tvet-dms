"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckIcon, XIcon, ClockIcon } from "lucide-react"
import { staffFullName } from "@/lib/types"
import type { UserTier } from "@/lib/types"

interface Transfer {
  id: string
  reference_no: string | null
  status: string
  reason: string | null
  created_at: string
  staff: { id: string; first_name: string; last_name: string; middle_name: string | null; tsc_number: string | null; employee_number: string | null; job_group: string | null; qualification_level: string | null } | null
  from_institution: { id: string; name: string } | null
  to_institution: { id: string; name: string } | null
  approvals: Array<{
    id: string
    approver_role: string
    approver_name: string | null
    decision: string
    comments: string | null
    signed_at: string | null
  }>
}

interface Props {
  transfers: Transfer[]
  userTier: UserTier
  userId: string
  userName: string
  userInstitutionId: string | null
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

function getPendingStatus(tier: UserTier): string | null {
  switch (tier) {
    case "ministry": return "county_reviewed"
    case "county": return "institution_endorsed"
    case "institution": return "submitted"
    default: return null
  }
}

export function TransfersView({ transfers, userTier, userId, userName, userInstitutionId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Transfer | null>(null)
  const [comments, setComments] = useState("")
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(null)

  const pendingStatus = getPendingStatus(userTier)
  const pending = pendingStatus ? transfers.filter((t) => t.status === pendingStatus) : []
  const all = transfers

  async function handleDecision() {
    if (!selected || !dialogAction) return
    setLoading(true)

    try {
      const res = await fetch("/api/transfers/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferId: selected.id,
          decision: dialogAction === "approve" ? "approved" : "rejected",
          approverRole: userTier,
          userId,
          userName,
          comments: comments || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Action failed")
      } else {
        toast.success(dialogAction === "approve" ? "Transfer approved" : "Transfer rejected")
      }
    } catch {
      toast.error("Network error")
    }

    setLoading(false)
    setSelected(null)
    setComments("")
    setDialogAction(null)
    router.refresh()
  }

  function renderTable(items: Transfer[], showActions: boolean) {
    return (
      <div className="overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref No.</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 7 : 6} className="text-center text-muted-foreground py-8">
                  No transfer applications pending your review.
                </TableCell>
              </TableRow>
            ) : (
              items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.reference_no ?? "—"}</TableCell>
                  <TableCell className="font-medium">
                    {t.staff ? staffFullName(t.staff) : "—"}
                  </TableCell>
                  <TableCell>{t.from_institution?.name ?? "—"}</TableCell>
                  <TableCell>{t.to_institution?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[t.status] ?? ""}>
                      {t.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setSelected(t)}>
                        Review
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending {pendingStatus ? `(${pending.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="all">All Transfers ({all.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          {renderTable(pending, true)}
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          {renderTable(all, false)}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      {selected && !dialogAction && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Transfer Review — {selected.reference_no}</DialogTitle>
              <DialogDescription>
                {selected.staff ? staffFullName(selected.staff) : "Unknown"} ·{" "}
                {selected.from_institution?.name} → {selected.to_institution?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              {/* Trainer info */}
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Employee No:</span> {selected.staff?.employee_number ?? "—"}</div>
                <div><span className="text-muted-foreground">TSC No:</span> {selected.staff?.tsc_number ?? "—"}</div>
                <div><span className="text-muted-foreground">Job Group:</span> {selected.staff?.job_group ?? "—"}</div>
                <div><span className="text-muted-foreground">Qualification:</span> {selected.staff?.qualification_level ?? "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Reason:</span>{" "}
                {selected.reason ?? "Not specified"}
              </div>

              {/* Approval chain */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Approval Chain
                </p>
                {(["institution", "county", "ministry"] as const).map((role) => {
                  const approval = selected.approvals.find((a) => a.approver_role === role)
                  return (
                    <div key={role} className="flex items-center gap-3 rounded-md border p-2">
                      {approval && approval.decision === "approved" ? (
                        <CheckIcon className="h-4 w-4 text-green-600 shrink-0" />
                      ) : approval && approval.decision === "rejected" ? (
                        <XIcon className="h-4 w-4 text-red-600 shrink-0" />
                      ) : (
                        <ClockIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className="capitalize font-medium">{role}</span>
                        {approval && approval.decision !== "pending" && (
                          <span className="text-muted-foreground">
                            {" "}— {approval.decision} by {approval.approver_name ?? "—"}
                            {approval.signed_at && ` on ${new Date(approval.signed_at).toLocaleDateString("en-KE")}`}
                          </span>
                        )}
                        {approval?.comments && (
                          <p className="text-xs text-muted-foreground mt-0.5">{approval.comments}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                onClick={() => setDialogAction("reject")}
              >
                <XIcon className="mr-1.5 h-3.5 w-3.5" /> Reject
              </Button>
              <Button onClick={() => setDialogAction("approve")}>
                <CheckIcon className="mr-1.5 h-3.5 w-3.5" /> Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Decision Dialog */}
      {dialogAction && (
        <Dialog open={!!dialogAction} onOpenChange={() => setDialogAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogAction === "approve" ? "Approve Transfer" : "Reject Transfer"}
              </DialogTitle>
              <DialogDescription>
                {dialogAction === "approve"
                  ? "Confirm approval of this transfer application."
                  : "Provide a reason for rejecting this transfer."}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Comments (required for rejection)..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAction(null)}>Cancel</Button>
              <Button
                onClick={handleDecision}
                disabled={loading || (dialogAction === "reject" && !comments.trim())}
                variant={dialogAction === "reject" ? "destructive" : "default"}
              >
                {loading ? "Processing..." : dialogAction === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
