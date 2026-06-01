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
import { SendIcon } from "lucide-react"

interface ReturnRow {
  id: string
  status: string
  submitted_at: string | null
  verified_at: string | null
  notes: string | null
  return_cycle: {
    name: string
    period: string
    start_date: string
    end_date: string
  } | null
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  returned: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  locked: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
}

export function InstitutionReturns({
  returns,
  institutionId,
}: {
  returns: ReturnRow[]
  institutionId: string
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<ReturnRow | null>(null)

  async function handleSubmit() {
    if (!selectedReturn) return
    setSubmitting(selectedReturn.id)

    const supabase = createClient()
    await supabase
      .from("institution_return")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", selectedReturn.id)

    setSubmitting(null)
    setConfirmOpen(false)
    setSelectedReturn(null)
    router.refresh()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Return Cycles</CardTitle>
          <CardDescription>
            Submit your institutional returns for each cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No return cycles assigned
                    </TableCell>
                  </TableRow>
                ) : (
                  returns.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.return_cycle?.name ?? "—"}
                      </TableCell>
                      <TableCell>{r.return_cycle?.period ?? "—"}</TableCell>
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
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {r.notes ?? "—"}
                      </TableCell>
                      <TableCell>
                        {r.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedReturn(r)
                              setConfirmOpen(true)
                            }}
                          >
                            <SendIcon className="mr-1.5 h-3.5 w-3.5" />
                            Submit
                          </Button>
                        )}
                        {r.status === "returned" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReturn(r)
                              setConfirmOpen(true)
                            }}
                          >
                            <SendIcon className="mr-1.5 h-3.5 w-3.5" />
                            Resubmit
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Return</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit the return for{" "}
              <strong>{selectedReturn?.return_cycle?.name}</strong>? This action
              will send it for county verification.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!!submitting}
            >
              {submitting ? "Submitting..." : "Confirm Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
