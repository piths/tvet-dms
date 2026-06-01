"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SendIcon,
  CheckIcon,
  RotateCcwIcon,
  CheckCircle2Icon,
  CircleIcon,
  AlertTriangleIcon,
} from "lucide-react"
import type { UserTier } from "@/lib/types"

interface ReturnRow {
  id: string
  status: string
  submitted_at: string | null
  verified_at: string | null
  returned_reason: string | null
  institution_id: string
  institution: { id: string; name: string; type: string; county_id: number | null } | null
  return_cycle: { id: string; name: string; period: string } | null
}

interface Props {
  returns: ReturnRow[]
  counties: { id: number; name: string }[]
  institutions: { id: string; name: string }[]
  openCycle: any
  allCycles: any[]
  userTier: UserTier
  userInstitutionId: string | null
  userId: string
  userName: string
  completeness: { hasEnrolment: boolean; hasStaff: boolean; hasFinance: boolean } | null
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  returned: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  locked: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
}

export function ReturnsView({
  returns,
  counties,
  institutions,
  openCycle,
  allCycles,
  userTier,
  userInstitutionId,
  userId,
  userName,
  completeness,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [cycleFilter, setCycleFilter] = useState<string>(openCycle?.id ?? "all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<"submit" | "verify" | "return" | null>(null)
  const [selectedReturn, setSelectedReturn] = useState<ReturnRow | null>(null)
  const [returnReason, setReturnReason] = useState("")

  // Institution tier: show only their own return
  const isInstitution = userTier === "institution"
  const myReturn = isInstitution
    ? returns.find((r) => r.institution_id === userInstitutionId)
    : null

  // County/Ministry: show all returns with filters
  const filteredReturns = returns.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    if (cycleFilter !== "all" && (r as any).return_cycle?.id !== cycleFilter) return false
    return true
  })

  // Summary counts
  const submitted = returns.filter((r) => r.status === "submitted").length
  const draft = returns.filter((r) => r.status === "draft").length
  const verified = returns.filter((r) => r.status === "verified").length

  async function handleAction() {
    if (!selectedReturn || !dialogAction) return
    setLoading(true)

    try {
      const res = await fetch("/api/returns/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: selectedReturn.id,
          action: dialogAction,
          reason: returnReason || null,
          userId,
          userName,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Action failed")
      } else {
        const labels = { submit: "Return submitted", verify: "Return verified", return: "Return sent back for correction" }
        toast.success(labels[dialogAction])
      }
    } catch {
      toast.error("Network error")
    }

    setLoading(false)
    setDialogOpen(false)
    setSelectedReturn(null)
    setReturnReason("")
    setDialogAction(null)
    router.refresh()
  }

  // ─── Institution View ─────────────────────────────────────────────────────
  if (isInstitution) {
    const canSubmit = completeness?.hasEnrolment && completeness?.hasStaff && completeness?.hasFinance

    return (
      <div className="space-y-4">
        {myReturn?.status === "returned" && myReturn.returned_reason && (
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Returned for correction:</strong> {myReturn.returned_reason}
            </AlertDescription>
          </Alert>
        )}

        {(myReturn?.status === "draft" || myReturn?.status === "returned") && (
          <Card>
            <CardHeader>
              <CardTitle>Data Completeness Checklist</CardTitle>
              <CardDescription>
                All required data must be entered before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {completeness?.hasEnrolment ? (
                  <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                ) : (
                  <CircleIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={completeness?.hasEnrolment ? "" : "text-muted-foreground"}>
                  Enrolment data entered
                </span>
              </div>
              <div className="flex items-center gap-2">
                {completeness?.hasStaff ? (
                  <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                ) : (
                  <CircleIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={completeness?.hasStaff ? "" : "text-muted-foreground"}>
                  Staff records up to date
                </span>
              </div>
              <div className="flex items-center gap-2">
                {completeness?.hasFinance ? (
                  <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                ) : (
                  <CircleIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={completeness?.hasFinance ? "" : "text-muted-foreground"}>
                  Financial record entered
                </span>
              </div>
              <div className="pt-2">
                <Button
                  disabled={!canSubmit || loading}
                  onClick={() => {
                    if (myReturn) {
                      setSelectedReturn(myReturn)
                      setDialogAction("submit")
                      setDialogOpen(true)
                    }
                  }}
                >
                  <SendIcon className="mr-1.5 h-3.5 w-3.5" />
                  {myReturn?.status === "returned" ? "Resubmit Return" : "Submit Return"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {myReturn && (myReturn.status === "submitted" || myReturn.status === "verified" || myReturn.status === "locked") && (
          <Card>
            <CardContent className="py-6 text-center">
              <Badge variant="secondary" className={`${statusColors[myReturn.status]} text-sm px-3 py-1`}>
                {myReturn.status}
              </Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                {myReturn.status === "submitted" && "Your return has been submitted and is awaiting county verification."}
                {myReturn.status === "verified" && "Your return has been verified by the county."}
                {myReturn.status === "locked" && "This return cycle is locked."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // ─── County / Ministry View ───────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span><strong>{submitted}</strong> submitted</span>
        <span><strong>{draft}</strong> draft</span>
        <span><strong>{verified}</strong> verified</span>
        <span className="text-muted-foreground">· {returns.length} total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={cycleFilter} onValueChange={setCycleFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All cycles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cycles</SelectItem>
            {allCycles.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} {c.is_open ? "(active)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
            <SelectItem value="locked">Locked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Verified</TableHead>
                  {userTier === "county" && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No returns match your filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReturns.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.institution?.name ?? "—"}</TableCell>
                      <TableCell>{r.return_cycle?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[r.status] ?? ""}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.verified_at ? new Date(r.verified_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </TableCell>
                      {userTier === "county" && (
                        <TableCell>
                          {r.status === "submitted" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedReturn(r)
                                  setDialogAction("verify")
                                  setDialogOpen(true)
                                }}
                              >
                                <CheckIcon className="mr-1 h-3.5 w-3.5" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedReturn(r)
                                  setDialogAction("return")
                                  setDialogOpen(true)
                                }}
                              >
                                <RotateCcwIcon className="mr-1 h-3.5 w-3.5" />
                                Return
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "submit" && "Submit Return"}
              {dialogAction === "verify" && "Verify Return"}
              {dialogAction === "return" && "Return for Correction"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "submit" && `Submit your institution's return for ${openCycle?.name ?? "the current cycle"}? This will send it for county verification.`}
              {dialogAction === "verify" && `Verify ${selectedReturn?.institution?.name}'s return? This confirms the data is accurate.`}
              {dialogAction === "return" && `Return ${selectedReturn?.institution?.name}'s submission for corrections?`}
            </DialogDescription>
          </DialogHeader>
          {dialogAction === "return" && (
            <Textarea
              placeholder="Reason for returning (required)..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={loading || (dialogAction === "return" && !returnReason.trim())}
              variant={dialogAction === "return" ? "destructive" : "default"}
            >
              {loading ? "Processing..." : dialogAction === "verify" ? "Verify" : dialogAction === "return" ? "Return" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
