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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PlusIcon, BriefcaseIcon, UsersIcon, CheckCircle2Icon, ClockIcon,
} from "lucide-react"
import type { UserTier } from "@/lib/types"
import Link from "next/link"

interface Recruitment {
  id: string
  title: string
  department: string | null
  job_group: string | null
  qualification_required: string | null
  experience_years: number
  employment_type: string
  positions_available: number
  description: string | null
  status: string
  advertised_at: string | null
  closing_date: string | null
  created_at: string
  institution: { name: string } | null
  applicants: Array<{ id: string; status: string }>
}

interface Props {
  recruitments: Recruitment[]
  userTier: UserTier
  userId: string
  userName: string
  userInstitutionId: string | null
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  advertised: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  shortlisting: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  interviewing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  offered: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  appointed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

const JOB_GROUPS = ["G", "H", "J", "K", "L", "M", "N", "P", "Q"]

export function RecruitmentManagement({ recruitments, userTier, userId, userName, userInstitutionId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  // Form state
  const [form, setForm] = useState({
    title: "",
    department: "",
    job_group: "",
    qualification_required: "",
    experience_years: "0",
    employment_type: "Permanent",
    positions_available: "1",
    description: "",
    closing_date: "",
  })

  const canCreate = userTier === "institution" || userTier === "admin"

  const filtered = statusFilter === "all"
    ? recruitments
    : recruitments.filter((r) => r.status === statusFilter)

  const activeCount = recruitments.filter((r) => r.status === "advertised" || r.status === "shortlisting" || r.status === "interviewing").length
  const totalPositions = recruitments.filter((r) => r.status !== "cancelled").reduce((s, r) => s + r.positions_available, 0)
  const totalApplicants = recruitments.reduce((s, r) => s + r.applicants.length, 0)
  const appointed = recruitments.filter((r) => r.status === "appointed").length

  async function handleCreate() {
    if (!form.title) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("recruitment").insert({
      institution_id: userInstitutionId,
      title: form.title,
      department: form.department || null,
      job_group: form.job_group || null,
      qualification_required: form.qualification_required || null,
      experience_years: parseInt(form.experience_years) || 0,
      employment_type: form.employment_type,
      positions_available: parseInt(form.positions_available) || 1,
      description: form.description || null,
      closing_date: form.closing_date || null,
      status: "draft",
      created_by: userId,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Vacancy created")
      setNewOpen(false)
      setForm({ title: "", department: "", job_group: "", qualification_required: "", experience_years: "0", employment_type: "Permanent", positions_available: "1", description: "", closing_date: "" })
      router.refresh()
    }
    setLoading(false)
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const supabase = createClient()
    const update: Record<string, any> = { status: newStatus }
    if (newStatus === "advertised") update.advertised_at = new Date().toISOString()

    const { error } = await supabase.from("recruitment").update(update).eq("id", id)
    if (error) toast.error(error.message)
    else toast.success(`Status updated to ${newStatus}`)
    router.refresh()
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-blue-500/10 p-2">
                <BriefcaseIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active Vacancies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-amber-500/10 p-2">
                <ClockIcon className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{totalPositions}</p>
                <p className="text-xs text-muted-foreground">Total Positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-purple-500/10 p-2">
                <UsersIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{totalApplicants}</p>
                <p className="text-xs text-muted-foreground">Applicants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-green-500/10 p-2">
                <CheckCircle2Icon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{appointed}</p>
                <p className="text-xs text-muted-foreground">Appointed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="advertised">Advertised</SelectItem>
            <SelectItem value="shortlisting">Shortlisting</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="offered">Offered</SelectItem>
            <SelectItem value="appointed">Appointed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {canCreate && (
          <Button onClick={() => setNewOpen(true)}>
            <PlusIcon className="mr-1.5 h-4 w-4" />
            New Vacancy
          </Button>
        )}
      </div>

      {/* Vacancies Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Job Group</TableHead>
                  <TableHead>Positions</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Closing</TableHead>
                  {canCreate && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No vacancies found. {canCreate ? "Create one to get started." : ""}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <Link href={`/recruitment/${r.id}`} className="font-medium text-primary hover:underline">
                            {r.title}
                          </Link>
                          {r.department && <p className="text-xs text-muted-foreground">{r.department}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.institution?.name ?? "—"}</TableCell>
                      <TableCell>{r.job_group ?? "—"}</TableCell>
                      <TableCell className="tabular-nums">{r.positions_available}</TableCell>
                      <TableCell className="tabular-nums">{r.applicants.length}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATUS_COLORS[r.status] ?? ""}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.closing_date ? new Date(r.closing_date).toLocaleDateString("en-KE") : "—"}
                      </TableCell>
                      {canCreate && (
                        <TableCell>
                          <div className="flex gap-1">
                            {r.status === "draft" && (
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(r.id, "advertised")}>
                                Advertise
                              </Button>
                            )}
                            {r.status === "advertised" && (
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(r.id, "shortlisting")}>
                                Shortlist
                              </Button>
                            )}
                            {r.status === "shortlisting" && (
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(r.id, "interviewing")}>
                                Interview
                              </Button>
                            )}
                            {r.status === "interviewing" && (
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(r.id, "offered")}>
                                Offer
                              </Button>
                            )}
                            {r.status === "offered" && (
                              <Button size="sm" onClick={() => handleStatusChange(r.id, "appointed")}>
                                Appoint
                              </Button>
                            )}
                          </div>
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

      {/* New Vacancy Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Vacancy</DialogTitle>
            <DialogDescription>
              Define a new trainer position. It will start as a draft until you advertise it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Position Title *</Label>
              <Input
                placeholder="e.g. Trainer - Electrical Engineering"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  placeholder="e.g. Electrical & Electronics"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Group</Label>
                <Select value={form.job_group} onValueChange={(v) => setForm({ ...form, job_group: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_GROUPS.map((g) => (
                      <SelectItem key={g} value={g}>Job Group {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Qualification Required</Label>
                <Input
                  placeholder="e.g. Bachelors in Engineering"
                  value={form.qualification_required}
                  onChange={(e) => setForm({ ...form, qualification_required: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select value={form.employment_type} onValueChange={(v) => setForm({ ...form, employment_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Positions Available</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.positions_available}
                  onChange={(e) => setForm({ ...form, positions_available: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Closing Date</Label>
              <Input
                type="date"
                value={form.closing_date}
                onChange={(e) => setForm({ ...form, closing_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea
                placeholder="Full job description and requirements..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading || !form.title}>
              {loading ? "Creating..." : "Create Vacancy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
