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
import { CheckIcon, RotateCcwIcon } from "lucide-react"

interface ReturnRow {
  id: string
  status: string
  submitted_at: string | null
  institution: { name: string; code: string } | null
  return_cycle: { name: string; period: string } | null
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  returned: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  locked: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
}

export function CountyReturnsVerify({ returns }: { returns: ReturnRow[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<ReturnRow | null>(null)
  const [action, setAction] = useState<"verify" | "return" | null>(null)

  async function handleAction() {
    if (!selected || !action) return
    setLoading(true)

    const supabase = createClient()
    const newStatus = action === "verify" ? "verified" : "returned"

    await supabase
      .from("institution_return")
      .update({
        status: newStatus,
        ...(action === "verify" ? { verified_at: new Date().toISOString() } : {}),
      })
      .eq("id", selected.id)

    setLoading(false)
    setSelected(null)
    setAction(null)
    router.refresh()
  }

  const submittedReturns = returns.filter((r) => r.status === "submitted")
  const otherReturns = returns.filter((r) => r.status !== "submitted")

  return (
    <>
      {/* Pending Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Verification</CardTitle>
          <CardDescription>
            {submittedReturns.length} return{submittedReturns.length !== 1 ? "s" : ""} awaiting verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submittedReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No returns pending verification
                    </TableCell>
                  </TableRow>
                ) : (
                  submittedReturns.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.institution?.name ?? "—"}
                      </TableCell>
                      <TableCell>{r.return_cycle?.name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.submitted_at
                          ? new Date(r.submitted_at).toLocaleDateString("en-KE")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelected(r)
                              setAction("verify")
                            }}
                          >
                            <CheckIcon className="mr-1 h-3.5 w-3.5" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelected(r)
                              setAction("return")
                            }}
                          >
                            <RotateCcwIcon className="mr-1 h-3.5 w-3.5" />
                            Return
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* All Returns */}
      <Card>
        <CardHeader>
          <CardTitle>All Returns</CardTitle>
          <CardDescription>Complete history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherReturns.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.institution?.name ?? "—"}
                    </TableCell>
                    <TableCell>{r.return_cycle?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[r.status] ?? ""}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.submitted_at
                        ? new Date(r.submitted_at).toLocaleDateString("en-KE")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setAction(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "verify" ? "Verify Return" : "Return for Correction"}
            </DialogTitle>
            <DialogDescription>
              {action === "verify"
                ? `Confirm verification of ${selected?.institution?.name}'s return for ${selected?.return_cycle?.name}?`
                : `Return ${selected?.institution?.name}'s submission for corrections?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelected(null); setAction(null) }}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={loading}
              variant={action === "return" ? "destructive" : "default"}
            >
              {loading ? "Processing..." : action === "verify" ? "Verify" : "Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
