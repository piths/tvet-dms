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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlusIcon, CheckIcon, XIcon, ClipboardListIcon, StarIcon } from "lucide-react"
import type { UserTier } from "@/lib/types"

interface Applicant {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  id_number: string | null
  tsc_number: string | null
  qualification: string | null
  experience_years: number | null
  cover_letter: string | null
  status: string
  interview_score: number | null
  interview_notes: string | null
  shortlisted_at: string | null
  interviewed_at: string | null
  offered_at: string | null
  created_at: string
}

interface Props {
  vacancy: any
  applicants: Applicant[]
  currentStaffInGroup: number
  userTier: UserTier
  userId: string
  userName: string
}

const APPLICANT_STATUS_COLORS: Record<string, string> = {
  applied: "bg-muted text-muted-foreground",
  shortlisted: "bg-blue-100 text-blue-800",
  interviewed: "bg-purple-100 text-purple-800",
  offered: "bg-cyan-100 text-cyan-800",
  appointed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

export function VacancyDetail({ vacancy, applicants, currentStaffInGroup, userTier, userId, userName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [interviewDialog, setInterviewDialog] = useState<Applicant | null>(null)
  const [interviewScore, setInterviewScore] = useState("")
  const [interviewNotes, setInterviewNotes] = useState("")

  const canManage = userTier === "institution" || userTier === "admin"

  const byStatus = (status: string) => applicants.filter((a) => a.status === status)

  async function updateApplicantStatus(applicantId: string, newStatus: string, extra?: Record<string, any>) {
    setLoading(true)
    const supabase = createClient()
    const update: Record<string, any> = { status: newStatus, ...extra }
    if (newStatus === "shortlisted") update.shortlisted_at = new Date().toISOString()
    if (newStatus === "offered") update.offered_at = new Date().toISOString()

    const { error } = await supabase.from("recruitment_applicant").update(update).eq("id", applicantId)
    if (error) toast.error(error.message)
    else toast.success(`Applicant ${newStatus}`)
    setLoading(false)
    router.refresh()
  }

  async function handleRecordInterview() {
    if (!interviewDialog) return
    await updateApplicantStatus(interviewDialog.id, "interviewed", {
      interview_score: parseFloat(interviewScore) || null,
      interview_notes: interviewNotes || null,
      interviewed_at: new Date().toISOString(),
    })
    setInterviewDialog(null)
    setInterviewScore("")
    setInterviewNotes("")
  }

  return (
    <div className="space-y-6">
      {/* Vacancy Info */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vacancy Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-xs text-muted-foreground">Department</dt><dd className="font-medium">{vacancy.department ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Job Group</dt><dd className="font-medium">{vacancy.job_group ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Positions</dt><dd className="font-medium">{vacancy.positions_available}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Employment Type</dt><dd className="font-medium">{vacancy.employment_type ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Experience Required</dt><dd className="font-medium">{vacancy.experience_years ?? 0} years</dd></div>
              <div><dt className="text-xs text-muted-foreground">Closing Date</dt><dd className="font-medium">{vacancy.closing_date ?? "—"}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-muted-foreground">Qualification</dt><dd className="font-medium">{vacancy.qualification_required ?? "—"}</dd></div>
            </dl>
            {vacancy.description && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm bg-muted p-3 rounded-md">{vacancy.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staffing Gap Context */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Staffing Context</CardTitle>
            <CardDescription>Job Group {vacancy.job_group} at this institution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <p className="text-3xl font-bold tabular-nums">{currentStaffInGroup}</p>
              <p className="text-xs text-muted-foreground">Current trainers in Group {vacancy.job_group}</p>
            </div>
            <div className="text-center border-t pt-3">
              <p className="text-3xl font-bold tabular-nums text-primary">+{vacancy.positions_available}</p>
              <p className="text-xs text-muted-foreground">Positions to fill</p>
            </div>
            <div className="text-center border-t pt-3">
              <p className="text-lg font-bold">{applicants.length}</p>
              <p className="text-xs text-muted-foreground">Total applicants</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applicant Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Pipeline</CardTitle>
          <CardDescription>{applicants.length} applicants total</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({applicants.length})</TabsTrigger>
              <TabsTrigger value="applied">Applied ({byStatus("applied").length})</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted ({byStatus("shortlisted").length})</TabsTrigger>
              <TabsTrigger value="interviewed">Interviewed ({byStatus("interviewed").length})</TabsTrigger>
              <TabsTrigger value="offered">Offered ({byStatus("offered").length})</TabsTrigger>
            </TabsList>

            {["all", "applied", "shortlisted", "interviewed", "offered"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                <div className="overflow-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Qualification</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>TSC No.</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        {canManage && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tab === "all" ? applicants : byStatus(tab)).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                            No applicants in this stage.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (tab === "all" ? applicants : byStatus(tab)).map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.full_name}</TableCell>
                            <TableCell className="text-xs max-w-[200px] truncate">{a.qualification ?? "—"}</TableCell>
                            <TableCell>{a.experience_years ?? "—"} yrs</TableCell>
                            <TableCell className="text-muted-foreground">{a.tsc_number ?? "—"}</TableCell>
                            <TableCell>
                              {a.interview_score != null ? (
                                <div className="flex items-center gap-1">
                                  <StarIcon className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  <span className="tabular-nums">{a.interview_score}</span>
                                </div>
                              ) : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={APPLICANT_STATUS_COLORS[a.status] ?? ""}>
                                {a.status}
                              </Badge>
                            </TableCell>
                            {canManage && (
                              <TableCell>
                                <div className="flex gap-1">
                                  {a.status === "applied" && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => updateApplicantStatus(a.id, "shortlisted")}>Shortlist</Button>
                                      <Button size="sm" variant="ghost" onClick={() => updateApplicantStatus(a.id, "rejected")}>
                                        <XIcon className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  )}
                                  {a.status === "shortlisted" && (
                                    <Button size="sm" variant="outline" onClick={() => { setInterviewDialog(a); setInterviewScore(""); setInterviewNotes("") }}>
                                      Interview
                                    </Button>
                                  )}
                                  {a.status === "interviewed" && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => updateApplicantStatus(a.id, "offered")}>Offer</Button>
                                      <Button size="sm" variant="ghost" onClick={() => updateApplicantStatus(a.id, "rejected")}>
                                        <XIcon className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  )}
                                  {a.status === "offered" && (
                                    <Button size="sm" onClick={() => updateApplicantStatus(a.id, "appointed")}>
                                      <UserPlusIcon className="mr-1 h-3.5 w-3.5" />Appoint
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
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Interview Score Dialog */}
      <Dialog open={!!interviewDialog} onOpenChange={() => setInterviewDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Interview</DialogTitle>
            <DialogDescription>
              Record interview results for {interviewDialog?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Interview Score (0–100)</Label>
              <Input type="number" min="0" max="100" value={interviewScore} onChange={(e) => setInterviewScore(e.target.value)} placeholder="e.g. 78" />
            </div>
            <div className="space-y-2">
              <Label>Interview Notes</Label>
              <Textarea value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} placeholder="Panel observations, strengths, areas of concern..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterviewDialog(null)}>Cancel</Button>
            <Button onClick={handleRecordInterview} disabled={loading}>
              {loading ? "Saving..." : "Record Interview"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
