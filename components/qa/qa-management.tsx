"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, ClipboardCheckIcon, AlertTriangleIcon, CheckCircle2Icon, BarChartIcon } from "lucide-react"
import type { UserTier } from "@/lib/types"

interface Assessment {
  id: string
  category: string
  title: string
  description: string | null
  assessor_name: string | null
  assessor_organization: string | null
  assessment_date: string | null
  status: string
  overall_score: number | null
  compliance_level: string | null
  strengths: string | null
  weaknesses: string | null
  recommendations: string | null
  follow_up_date: string | null
  created_at: string
  institution: { id: string; name: string } | null
}

interface Props {
  assessments: Assessment[]
  institutions: { id: string; name: string }[]
  userTier: UserTier
  userId: string
  userName: string
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  action_required: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

const CATEGORY_COLORS: Record<string, string> = {
  cbet: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  ict: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  iga: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  greening: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  general: "bg-muted text-muted-foreground",
}

const CATEGORIES = [
  { value: "cbet", label: "CBET Implementation" },
  { value: "ict", label: "ICT Integration" },
  { value: "iga", label: "Income Generating Activities" },
  { value: "greening", label: "Greening & Sustainability" },
  { value: "general", label: "General QA" },
]

export function QAManagement({ assessments, institutions, userTier, userId, userName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)

  const [form, setForm] = useState({
    institution_id: "",
    category: "cbet",
    title: "",
    assessor_name: userName,
    assessor_organization: "TVETA",
    assessment_date: "",
    overall_score: "",
    compliance_level: "",
    strengths: "",
    weaknesses: "",
    recommendations: "",
  })

  const canCreate = userTier === "ministry" || userTier === "county" || userTier === "admin"

  const filtered = categoryFilter === "all"
    ? assessments
    : assessments.filter((a) => a.category === categoryFilter)

  // Summary stats
  const completed = assessments.filter((a) => a.status === "completed").length
  const actionRequired = assessments.filter((a) => a.status === "action_required").length
  const avgScore = assessments.filter((a) => a.overall_score != null).length > 0
    ? Math.round(assessments.filter((a) => a.overall_score != null).reduce((s, a) => s + (a.overall_score ?? 0), 0) / assessments.filter((a) => a.overall_score != null).length)
    : 0

  async function handleCreate() {
    if (!form.institution_id || !form.title) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("qa_assessment").insert({
      institution_id: form.institution_id,
      category: form.category,
      title: form.title,
      assessor_name: form.assessor_name || null,
      assessor_organization: form.assessor_organization || null,
      assessment_date: form.assessment_date || null,
      status: form.overall_score ? "completed" : "scheduled",
      overall_score: form.overall_score ? parseFloat(form.overall_score) : null,
      compliance_level: form.compliance_level || null,
      strengths: form.strengths || null,
      weaknesses: form.weaknesses || null,
      recommendations: form.recommendations || null,
      created_by: userId,
    })
    if (error) toast.error(error.message)
    else {
      toast.success("Assessment recorded")
      setNewOpen(false)
      setForm({ institution_id: "", category: "cbet", title: "", assessor_name: userName, assessor_organization: "TVETA", assessment_date: "", overall_score: "", compliance_level: "", strengths: "", weaknesses: "", recommendations: "" })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold tabular-nums">{assessments.length}</p>
            <p className="text-xs text-muted-foreground">Total Assessments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold tabular-nums">{completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold tabular-nums text-red-600">{actionRequired}</p>
            <p className="text-xs text-muted-foreground">Action Required</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold tabular-nums">{avgScore}%</p>
            <p className="text-xs text-muted-foreground">Avg. Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value}>{c.label.split(" ")[0]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {canCreate && (
          <Button onClick={() => setNewOpen(true)}>
            <PlusIcon className="mr-1.5 h-4 w-4" />
            New Assessment
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
                  <TableHead>Institution</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Assessor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No QA assessments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => (
                    <TableRow key={a.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedAssessment(a)}>
                      <TableCell className="font-medium">{a.institution?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={CATEGORY_COLORS[a.category] ?? ""}>
                          {a.category.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{a.title}</TableCell>
                      <TableCell className="text-muted-foreground">{a.assessor_name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.assessment_date ? new Date(a.assessment_date).toLocaleDateString("en-KE") : "—"}
                      </TableCell>
                      <TableCell>
                        {a.overall_score != null ? (
                          <div className="flex items-center gap-2">
                            <Progress value={a.overall_score} className="h-2 w-16" />
                            <span className="text-xs tabular-nums">{a.overall_score}%</span>
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        {a.compliance_level ? (
                          <Badge variant="outline" className={
                            a.compliance_level.includes("Fully") ? "border-green-300 text-green-700" :
                            a.compliance_level.includes("Partial") ? "border-amber-300 text-amber-700" :
                            "border-red-300 text-red-700"
                          }>
                            {a.compliance_level}
                          </Badge>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATUS_COLORS[a.status] ?? ""}>
                          {a.status.replace(/_/g, " ")}
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

      {/* Detail Dialog */}
      {selectedAssessment && (
        <Dialog open={!!selectedAssessment} onOpenChange={() => setSelectedAssessment(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedAssessment.title}</DialogTitle>
              <DialogDescription>
                {selectedAssessment.institution?.name} · {selectedAssessment.category.toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Assessor:</span> {selectedAssessment.assessor_name ?? "—"}</div>
                <div><span className="text-muted-foreground">Organization:</span> {selectedAssessment.assessor_organization ?? "—"}</div>
                <div><span className="text-muted-foreground">Date:</span> {selectedAssessment.assessment_date ?? "—"}</div>
                <div><span className="text-muted-foreground">Score:</span> {selectedAssessment.overall_score ?? "—"}%</div>
              </div>
              {selectedAssessment.strengths && (
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400 mb-1">Strengths</p>
                  <p className="bg-green-50 dark:bg-green-900/10 p-3 rounded-md">{selectedAssessment.strengths}</p>
                </div>
              )}
              {selectedAssessment.weaknesses && (
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400 mb-1">Weaknesses</p>
                  <p className="bg-red-50 dark:bg-red-900/10 p-3 rounded-md">{selectedAssessment.weaknesses}</p>
                </div>
              )}
              {selectedAssessment.recommendations && (
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">Recommendations</p>
                  <p className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md">{selectedAssessment.recommendations}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Assessment Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record QA Assessment</DialogTitle>
            <DialogDescription>Document a quality assurance visit or assessment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution *</Label>
                <Select value={form.institution_id} onValueChange={(v) => setForm({ ...form, institution_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {institutions.map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assessment Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. CBET Implementation Review Q1 2026" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assessor Name</Label>
                <Input value={form.assessor_name} onChange={(e) => setForm({ ...form, assessor_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <Select value={form.assessor_organization} onValueChange={(v) => setForm({ ...form, assessor_organization: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TVETA">TVETA</SelectItem>
                    <SelectItem value="CDACC">CDACC</SelectItem>
                    <SelectItem value="County">County</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assessment Date</Label>
                <Input type="date" value={form.assessment_date} onChange={(e) => setForm({ ...form, assessment_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Overall Score (%)</Label>
                <Input type="number" min="0" max="100" value={form.overall_score} onChange={(e) => setForm({ ...form, overall_score: e.target.value })} placeholder="0-100" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Compliance Level</Label>
              <Select value={form.compliance_level} onValueChange={(v) => setForm({ ...form, compliance_level: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully Compliant">Fully Compliant</SelectItem>
                  <SelectItem value="Partially Compliant">Partially Compliant</SelectItem>
                  <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Strengths</Label>
              <Textarea value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Weaknesses</Label>
              <Textarea value={form.weaknesses} onChange={(e) => setForm({ ...form, weaknesses: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Recommendations</Label>
              <Textarea value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading || !form.institution_id || !form.title}>
              {loading ? "Saving..." : "Record Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
