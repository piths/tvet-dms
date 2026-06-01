"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PlusIcon, EyeIcon, ShieldAlertIcon, AlertTriangleIcon, CheckCircle2Icon,
} from "lucide-react"
import { staffFullName } from "@/lib/types"
import type { UserTier } from "@/lib/types"

interface CaseRow {
  id: string
  case_type: string | null
  description: string | null
  status: string
  outcome: string | null
  sanction: string | null
  opened_at: string | null
  hearing_date: string | null
  show_cause_date: string | null
  resolved_at: string | null
  visible_to_trainer: boolean
  created_at: string
  staff: { id: string; first_name: string; last_name: string; middle_name: string | null; employee_number: string | null; tsc_number: string | null } | null
  institution: { name: string } | null
}

interface Props {
  cases: CaseRow[]
  staffList: Array<{ id: string; first_name: string; last_name: string; middle_name: string | null; employee_number: string | null }>
  userTier: UserTier
  userId: string
  userName: string
  userInstitutionId: string | null
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  under_investigation: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  active: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  dismissed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  appealed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
}

const CASE_TYPES = [
  "Misconduct",
  "Absenteeism",
  "Insubordination",
  "Negligence of Duty",
  "Substance Abuse",
  "Sexual Misconduct",
  "Fraud/Misappropriation",
  "Incompetence",
  "Other",
]

const SANCTIONS = [
  "Verbal Warning",
  "Written Warning",
  "Suspension",
  "Interdiction",
  "Dismissal Recommendation",
  "Deregistration Recommendation",
]

export function DisciplinaryManagement({ cases, staffList, userTier, userId, userName, userInstitutionId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newCaseOpen, setNewCaseOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseRow | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  // New case form
  const [formStaffId, setFormStaffId] = useState("")
  const [formType, setFormType] = useState("")
  const [formDescription, setFormDescription] = useState("")

  const canCreate = userTier === "institution" || userTier === "admin"
  const canManage = userTier === "institution" || userTier === "admin"

  const filtered = cases.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (search) {
      const name = c.staff ? staffFullName(c.staff).toLowerCase() : ""
      if (!name.includes(search.toLowerCase()) && !(c.case_type ?? "").toLowerCase().includes(search.toLowerCase())) return false
    }
    return true
  })

  async function handleCreateCase() {
    if (!formStaffId || !formType) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("disciplinary_case").insert({
      staff_id: formStaffId,
      institution_id: userInstitutionId,
      case_type: formType,
      description: formDescription || null,
      status: "draft",
      opened_at: new Date().toISOString().split("T")[0],
      created_by: userId,
      visible_to_trainer: false,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Disciplinary case opened")
      setNewCaseOpen(false)
      setFormStaffId("")
      setFormType("")
      setFormDescription("")
      router.refresh()
    }
    setLoading(false)
  }

  async function handleStatusChange(caseId: string, newStatus: string) {
    setLoading(true)
    const supabase = createClient()
    const update: Record<string, any> = { status: newStatus }
    if (newStatus === "resolved") update.resolved_at = new Date().toISOString().split("T")[0]

    const { error } = await supabase.from("disciplinary_case").update(update).eq("id", caseId)
    if (error) toast.error(error.message)
    else toast.success(`Case status updated to ${newStatus.replace(/_/g, " ")}`)
    setLoading(false)
    setSelectedCase(null)
    router.refresh()
  }

  async function handleToggleVisibility(caseId: string, visible: boolean) {
    const supabase = createClient()
    const { error } = await supabase.from("disciplinary_case").update({ visible_to_trainer: visible }).eq("id", caseId)
    if (error) toast.error(error.message)
    else toast.success(visible ? "Case released to trainer" : "Case hidden from trainer")
    router.refresh()
  }

  async function handleSetSanction(caseId: string, sanction: string) {
    const supabase = createClient()
    const { error } = await supabase.from("disciplinary_case").update({ sanction }).eq("id", caseId)
    if (error) toast.error(error.message)
    else toast.success("Sanction recorded")
    router.refresh()
  }

  return (
    <>
      {/* Filters + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Input
            placeholder="Search by name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px]"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="under_investigation">Under Investigation</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
              <SelectItem value="appealed">Appealed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canCreate && (
          <Button onClick={() => setNewCaseOpen(true)}>
            <PlusIcon className="mr-1.5 h-4 w-4" />
            New Case
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniCard label="Total Cases" value={cases.length} />
        <MiniCard label="Active" value={cases.filter((c) => c.status === "active" || c.status === "under_investigation").length} />
        <MiniCard label="Resolved" value={cases.filter((c) => c.status === "resolved" || c.status === "dismissed").length} />
        <MiniCard label="Released to Trainer" value={cases.filter((c) => c.visible_to_trainer).length} />
      </div>

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Emp. No.</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sanction</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Visible</TableHead>
                  {canManage && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No disciplinary cases match your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.staff ? staffFullName(c.staff) : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.staff?.employee_number ?? "—"}
                      </TableCell>
                      <TableCell>{c.case_type ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATUS_COLORS[c.status] ?? ""}>
                          {c.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{c.sanction ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.opened_at ? new Date(c.opened_at).toLocaleDateString("en-KE") : "—"}
                      </TableCell>
                      <TableCell>
                        {c.visible_to_trainer ? (
                          <Badge variant="default" className="bg-green-600 text-xs">Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">No</Badge>
                        )}
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedCase(c)}>
                            <EyeIcon className="h-3.5 w-3.5" />
                          </Button>
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

      {/* New Case Dialog */}
      <Dialog open={newCaseOpen} onOpenChange={setNewCaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open Disciplinary Case</DialogTitle>
            <DialogDescription>
              Issue a show-cause notice to a staff member. The case will start in draft status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select value={formStaffId} onValueChange={setFormStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {staffFullName(s)} {s.employee_number ? `(${s.employee_number})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Case Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CASE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description / Allegations</Label>
              <Textarea
                placeholder="Describe the allegations or incident..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCaseOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCase} disabled={loading || !formStaffId || !formType}>
              {loading ? "Creating..." : "Open Case"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Case Detail Sheet */}
      {selectedCase && (
        <Sheet open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Case: {selectedCase.case_type}</SheetTitle>
              <SheetDescription>
                {selectedCase.staff ? staffFullName(selectedCase.staff) : "—"} · {selectedCase.institution?.name ?? ""}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Case Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="secondary" className={STATUS_COLORS[selectedCase.status] ?? ""}>
                    {selectedCase.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Opened</p>
                  <p className="font-medium">{selectedCase.opened_at ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TSC No.</p>
                  <p className="font-medium">{selectedCase.staff?.tsc_number ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sanction</p>
                  <p className="font-medium">{selectedCase.sanction ?? "Not determined"}</p>
                </div>
              </div>

              {/* Description */}
              {selectedCase.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Allegations</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedCase.description}</p>
                </div>
              )}

              {/* Outcome */}
              {selectedCase.outcome && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Outcome</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedCase.outcome}</p>
                </div>
              )}

              {/* Actions */}
              {canManage && (
                <div className="space-y-3 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</p>

                  {/* Status transitions */}
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.status === "draft" && (
                      <Button size="sm" onClick={() => handleStatusChange(selectedCase.id, "under_investigation")}>
                        Begin Investigation
                      </Button>
                    )}
                    {selectedCase.status === "under_investigation" && (
                      <Button size="sm" onClick={() => handleStatusChange(selectedCase.id, "active")}>
                        Activate Case
                      </Button>
                    )}
                    {selectedCase.status === "active" && (
                      <>
                        <Button size="sm" onClick={() => handleStatusChange(selectedCase.id, "resolved")}>
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedCase.id, "dismissed")}>
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Sanction */}
                  {(selectedCase.status === "active" || selectedCase.status === "resolved") && (
                    <div className="space-y-2">
                      <Label className="text-xs">Set Sanction</Label>
                      <Select onValueChange={(v) => handleSetSanction(selectedCase.id, v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={selectedCase.sanction ?? "Select sanction"} />
                        </SelectTrigger>
                        <SelectContent>
                          {SANCTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Visibility toggle */}
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">Release to Trainer</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCase.visible_to_trainer
                          ? "Trainer can see this case in their portal"
                          : "Hidden from trainer's view"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedCase.visible_to_trainer ? "destructive" : "default"}
                      onClick={() => handleToggleVisibility(selectedCase.id, !selectedCase.visible_to_trainer)}
                    >
                      {selectedCase.visible_to_trainer ? "Hide" : "Release"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}

function MiniCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
