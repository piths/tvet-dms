"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ClipboardListIcon, CalendarIcon, ScaleIcon, CheckCircle2Icon, RotateCcwIcon, FileTextIcon,
  AlertTriangleIcon, PlusIcon,
} from "lucide-react"
import { staffFullName } from "@/lib/types"
import type { UserTier } from "@/lib/types"

interface CaseEvent {
  id: string
  event_type: string
  title: string
  description: string | null
  event_date: string | null
  actor_name: string | null
  created_at: string
}

interface Props {
  caseData: any
  events: CaseEvent[]
  userTier: UserTier
  userId: string
  userName: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  under_investigation: "bg-amber-100 text-amber-800",
  active: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-gray-100 text-gray-800",
  appealed: "bg-purple-100 text-purple-800",
}

const EVENT_ICONS: Record<string, any> = {
  complaint_filed: ClipboardListIcon,
  hearing_scheduled: CalendarIcon,
  hearing_held: ScaleIcon,
  decision_made: CheckCircle2Icon,
  appeal_filed: RotateCcwIcon,
  note_added: FileTextIcon,
}

const EVENT_TYPES = [
  { value: "complaint_filed", label: "Complaint Filed" },
  { value: "hearing_scheduled", label: "Hearing Scheduled" },
  { value: "hearing_held", label: "Hearing Held" },
  { value: "decision_made", label: "Decision Made" },
  { value: "appeal_filed", label: "Appeal Filed" },
  { value: "note_added", label: "Note Added" },
]

export function CaseDetail({ caseData, events, userTier, userId, userName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [eventType, setEventType] = useState("note_added")
  const [eventTitle, setEventTitle] = useState("")
  const [eventDesc, setEventDesc] = useState("")
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0])

  const canManage = userTier === "institution" || userTier === "admin"

  async function handleAddEvent() {
    if (!eventTitle) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("disciplinary_event").insert({
      case_id: caseData.id,
      event_type: eventType,
      title: eventTitle,
      description: eventDesc || null,
      event_date: eventDate || null,
      actor_user_id: userId,
      actor_name: userName,
    })
    if (error) toast.error(error.message)
    else {
      toast.success("Event added to timeline")
      setAddEventOpen(false)
      setEventTitle("")
      setEventDesc("")
      router.refresh()
    }
    setLoading(false)
  }

  async function handleStatusChange(newStatus: string) {
    setLoading(true)
    const supabase = createClient()
    const update: Record<string, any> = { status: newStatus }
    if (newStatus === "resolved") update.resolved_at = new Date().toISOString().split("T")[0]

    const { error } = await supabase.from("disciplinary_case").update(update).eq("id", caseData.id)
    if (error) toast.error(error.message)
    else toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`)
    setLoading(false)
    router.refresh()
  }

  async function handleToggleVisibility() {
    const supabase = createClient()
    const newVal = !caseData.visible_to_trainer
    const { error } = await supabase.from("disciplinary_case").update({ visible_to_trainer: newVal }).eq("id", caseData.id)
    if (error) toast.error(error.message)
    else toast.success(newVal ? "Case released to trainer" : "Case hidden from trainer")
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main Content — Timeline */}
      <div className="lg:col-span-2 space-y-4">
        {/* Staff Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{caseData.staff ? staffFullName(caseData.staff) : "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {caseData.staff?.employee_number ?? "—"} · TSC: {caseData.staff?.tsc_number ?? "—"} · Group {caseData.staff?.job_group ?? "—"}
                </p>
              </div>
              <Badge variant="secondary" className={STATUS_COLORS[caseData.status] ?? ""}>
                {caseData.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Case Description */}
        {caseData.description && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Allegations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{caseData.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Case Timeline</CardTitle>
              {canManage && (
                <Button size="sm" variant="outline" onClick={() => setAddEventOpen(true)}>
                  <PlusIcon className="mr-1 h-3.5 w-3.5" />
                  Add Event
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No timeline events recorded yet.
              </p>
            ) : (
              <div className="relative pl-6 space-y-6">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

                {events.map((event, i) => {
                  const Icon = EVENT_ICONS[event.event_type] ?? FileTextIcon
                  return (
                    <div key={event.id} className="relative">
                      {/* Dot */}
                      <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border-2 border-primary">
                        <Icon className="h-2.5 w-2.5 text-primary" />
                      </div>
                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{event.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {event.event_date ? new Date(event.event_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : ""}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                        )}
                        {event.actor_name && (
                          <p className="text-xs text-muted-foreground mt-0.5">— {event.actor_name}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar — Status & Actions */}
      <div className="space-y-4">
        {/* Status Management */}
        {canManage && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Case Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {caseData.status === "draft" && (
                  <Button size="sm" className="w-full" onClick={() => handleStatusChange("under_investigation")}>
                    Begin Investigation
                  </Button>
                )}
                {caseData.status === "under_investigation" && (
                  <Button size="sm" className="w-full" onClick={() => handleStatusChange("active")}>
                    Activate Case
                  </Button>
                )}
                {caseData.status === "active" && (
                  <>
                    <Button size="sm" className="flex-1" onClick={() => handleStatusChange("resolved")}>
                      Resolve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleStatusChange("dismissed")}>
                      Dismiss
                    </Button>
                  </>
                )}
                {(caseData.status === "resolved" || caseData.status === "dismissed") && (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleStatusChange("appealed")}>
                    Record Appeal
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Case Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Case Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Case Type</span>
              <span className="font-medium">{caseData.case_type ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opened</span>
              <span className="font-medium">{caseData.opened_at ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sanction</span>
              <span className="font-medium">{caseData.sanction ?? "Not determined"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Outcome</span>
              <span className="font-medium">{caseData.outcome ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resolved</span>
              <span className="font-medium">{caseData.resolved_at ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Trainer Visibility */}
        {canManage && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Trainer Visibility</p>
                  <p className="text-xs text-muted-foreground">
                    {caseData.visible_to_trainer ? "Visible in trainer portal" : "Hidden from trainer"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={caseData.visible_to_trainer ? "destructive" : "default"}
                  onClick={handleToggleVisibility}
                >
                  {caseData.visible_to_trainer ? "Hide" : "Release"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Event Dialog */}
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Timeline Event</DialogTitle>
            <DialogDescription>Record a new event in this case's timeline.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g. Show Cause Letter Issued" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} rows={3} placeholder="Details of this event..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEventOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent} disabled={loading || !eventTitle}>
              {loading ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
