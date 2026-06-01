"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, TrendingUpIcon, CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react"
import { staffFullName } from "@/lib/types"
import type { UserTier } from "@/lib/types"

interface Promotion {
  id: string
  from_job_group: string
  to_job_group: string
  from_designation: string | null
  to_designation: string | null
  basis: string | null
  years_in_grade: number | null
  status: string
  effective_date: string | null
  remarks: string | null
  created_at: string
  staff: { id: string; first_name: string; last_name: string; middle_name: string | null; employee_number: string | null; job_group: string | null } | null
  institution: { name: string } | null
}

interface Props {
  promotions: Promotion[]
  staffList: Array<{ id: string; first_name: string; last_name: string; middle_name: string | null; employee_number: string | null; job_group: string | null; designation: string | null }>
  userTier: UserTier
  userId: string
  userInstitutionId: string | null
}

const STATUS_COLORS: Record<string, string> = {
  recommended: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  submitted: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  effected: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
}

const JOB_GROUPS = ["G", "H", "J", "K", "L", "M", "N", "P", "Q"]

export function PromotionsManagement({ promotions, staffList, userTier, userId, userInstitutionId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [formStaffId, setFormStaffId] = useState("")
  const [formToGroup, setFormToGroup] = useState("")
  const [formBasis, setFormBasis] = useState("merit")
  const [formYears, setFormYears] = useState("")
  const [formRemarks, setFormRemarks] = useState("")

  const canRecommend = userTier === "institution" || userTier === "admin"

  const selectedStaff = staffList.find((s) => s.id === formStaffId)

  async function handleCreate() {
    if (!formStaffId || !formToGroup) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("promotion").insert({
      staff_id: formStaffId,
      institution_id: userInstitutionId,
      from_job_group: selectedStaff?.job_group ?? "—",
      to_job_group: formToGroup,
      from_designation: selectedStaff?.designation ?? null,
      basis: formBasis,
      years_in_grade: parseInt(formYears) || null,
      remarks: formRemarks || null,
      status: "recommended",
      recommended_by: userId,
    })
    if (error) toast.error(error.message)
    else {
      toast.success("Promotion recommended")
      setNewOpen(false)
      setFormStaffId("")
      setFormToGroup("")
      setFormRemarks("")
      router.refresh()
    }
    setLoading(false)
  }

  async function handleStatusChange(id: string, status: string) {
    const supabase = createClient()
    const update: Record<string, any> = { status }
    if (status === "approved") update.approved_at = new Date().toISOString()
    if (status === "effected") update.effective_date = new Date().toISOString().split("T")[0]
    const { error } = await supabase.from("promotion").update(update).eq("id", id)
    if (error) toast.error(error.message)
    else toast.success(`Promotion ${status}`)
    router.refresh()
  }

  return (
    <>
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniCard icon={ClockIcon} label="Pending" value={promotions.filter((p) => p.status === "recommended" || p.status === "submitted").length} color="amber" />
        <MiniCard icon={CheckCircle2Icon} label="Approved" value={promotions.filter((p) => p.status === "approved").length} color="green" />
        <MiniCard icon={TrendingUpIcon} label="Effected" value={promotions.filter((p) => p.status === "effected").length} color="purple" />
        <MiniCard icon={XCircleIcon} label="Rejected" value={promotions.filter((p) => p.status === "rejected").length} color="red" />
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        {canRecommend && (
          <Button onClick={() => setNewOpen(true)}>
            <PlusIcon className="mr-1.5 h-4 w-4" />
            Recommend Promotion
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Basis</TableHead>
                  <TableHead>Years in Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Effective</TableHead>
                  {(userTier === "ministry" || userTier === "admin") && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No promotion records yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  promotions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.staff ? staffFullName(p.staff) : "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{p.institution?.name ?? "—"}</TableCell>
                      <TableCell>Group {p.from_job_group}</TableCell>
                      <TableCell className="font-medium">Group {p.to_job_group}</TableCell>
                      <TableCell className="capitalize">{p.basis ?? "—"}</TableCell>
                      <TableCell className="tabular-nums">{p.years_in_grade ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATUS_COLORS[p.status] ?? ""}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.effective_date ?? "—"}</TableCell>
                      {(userTier === "ministry" || userTier === "admin") && (
                        <TableCell>
                          {p.status === "recommended" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(p.id, "approved")}>Approve</Button>
                              <Button size="sm" variant="ghost" onClick={() => handleStatusChange(p.id, "rejected")}>Reject</Button>
                            </div>
                          )}
                          {p.status === "approved" && (
                            <Button size="sm" onClick={() => handleStatusChange(p.id, "effected")}>Effect</Button>
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

      {/* New Promotion Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recommend Promotion</DialogTitle>
            <DialogDescription>Recommend a staff member for promotion to the next job group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select value={formStaffId} onValueChange={setFormStaffId}>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {staffFullName(s)} — Group {s.job_group ?? "?"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedStaff && (
              <p className="text-xs text-muted-foreground">
                Current: Job Group {selectedStaff.job_group ?? "—"} · {selectedStaff.designation ?? "No designation"}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Promote To Job Group</Label>
                <Select value={formToGroup} onValueChange={setFormToGroup}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {JOB_GROUPS.map((g) => (
                      <SelectItem key={g} value={g}>Group {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Basis</Label>
                <Select value={formBasis} onValueChange={setFormBasis}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merit">Merit</SelectItem>
                    <SelectItem value="competitive">Competitive</SelectItem>
                    <SelectItem value="automatic">Automatic (years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Years in Current Grade</Label>
              <Input type="number" min="0" value={formYears} onChange={(e) => setFormYears(e.target.value)} placeholder="e.g. 5" />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)} placeholder="Justification for promotion..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading || !formStaffId || !formToGroup}>
              {loading ? "Submitting..." : "Recommend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MiniCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-md p-2 bg-${color}-500/10`}>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div>
        <div>
          <p className="text-xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
