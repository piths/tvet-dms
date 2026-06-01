"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  UserIcon,
  ArrowRightLeftIcon,
  TrendingUpIcon,
  ShieldAlertIcon,
  FileTextIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  AwardIcon,
  CheckCircle2Icon,
  ClockIcon,
  BuildingIcon,
} from "lucide-react"
import { staffFullName } from "@/lib/types"

interface Props {
  staff: any
  transfers: Array<{ id: string; status: string; created_at: string }>
  promotions: Array<{ id: string; status: string; from_job_group: string; to_job_group: string; created_at: string }>
  cases: Array<{ id: string; status: string; case_type: string }>
  documents: Array<{ id: string; verified: boolean }>
}

export function TrainerDashboard({ staff, transfers, promotions, cases, documents }: Props) {
  const pendingTransfers = transfers.filter(t => !["approved", "rejected", "withdrawn"].includes(t.status)).length
  const pendingPromotions = promotions.filter(p => !["approved", "rejected", "effected"].includes(p.status)).length
  const activeCases = cases.filter(c => c.status !== "resolved" && c.status !== "dismissed").length
  const verifiedDocs = documents.filter(d => d.verified).length

  // Profile completeness calculation
  const profileFields = [
    staff?.employee_number,
    staff?.tsc_number,
    staff?.cdacc_assessor_number,
    staff?.job_group,
    staff?.qualification_level,
    staff?.designation,
    staff?.date_joined,
    staff?.employment_type,
  ]
  const filledFields = profileFields.filter(Boolean).length
  const profileCompleteness = Math.round((filledFields / profileFields.length) * 100)

  // Years of service
  const yearsOfService = staff?.date_joined
    ? ((new Date().getTime() - new Date(staff.date_joined).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)
    : "—"

  const initials = staff
    ? `${staff.first_name?.[0] ?? ""}${staff.last_name?.[0] ?? ""}`.toUpperCase()
    : "?"

  return (
    <div className="space-y-6">
      {/* Hero Profile Banner */}
      <Card className="overflow-hidden border-primary/20">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shrink-0">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold">{staff ? staffFullName(staff) : "—"}</h2>
                <p className="text-sm text-muted-foreground">{staff?.designation ?? "Trainer"}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">{staff?.category ?? "—"}</Badge>
                  {staff?.job_group && <Badge variant="outline">Job Group {staff.job_group}</Badge>}
                  {staff?.status && (
                    <Badge variant={staff.status === "active" ? "default" : "secondary"} className={staff.status === "active" ? "bg-green-600" : ""}>
                      {staff.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Link href="/my-portal/profile">
              <Button variant="outline" size="sm">
                View Full Profile
                <ArrowRightIcon className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick facts strip */}
        <CardContent className="grid grid-cols-2 gap-4 border-t p-4 sm:grid-cols-4">
          <QuickFact icon={BuildingIcon} label="Institution" value={staff?.institution?.name ?? "—"} />
          <QuickFact icon={CalendarIcon} label="Years of Service" value={`${yearsOfService} yrs`} />
          <QuickFact icon={AwardIcon} label="Qualification" value={staff?.qualification_level ?? "—"} />
          <QuickFact icon={BriefcaseIcon} label="Employment" value={staff?.employment_type ?? "—"} />
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatusCard
          icon={ArrowRightLeftIcon}
          label="Transfers"
          value={transfers.length}
          pending={pendingTransfers}
          href="/my-portal/transfers"
          color="blue"
        />
        <StatusCard
          icon={TrendingUpIcon}
          label="Promotions"
          value={promotions.length}
          pending={pendingPromotions}
          href="/my-portal/promotions"
          color="purple"
        />
        <StatusCard
          icon={ShieldAlertIcon}
          label="Cases"
          value={cases.length}
          pending={activeCases}
          pendingLabel="active"
          href="/my-portal/cases"
          color="amber"
        />
        <StatusCard
          icon={FileTextIcon}
          label="Documents"
          value={documents.length}
          pending={documents.length - verifiedDocs}
          pendingLabel="unverified"
          href="/my-portal/profile"
          color="emerald"
        />
      </div>

      {/* Two-column: Career Snapshot + Profile Completeness */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Career Snapshot (timeline) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
              Career Snapshot
            </CardTitle>
            <CardDescription>Your latest records at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Latest promotion */}
            {promotions.length > 0 ? (
              (() => {
                const latest = [...promotions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                const statusColor: Record<string, string> = {
                  recommended: "bg-blue-100 text-blue-800",
                  submitted: "bg-amber-100 text-amber-800",
                  approved: "bg-green-100 text-green-800",
                  rejected: "bg-red-100 text-red-800",
                  effected: "bg-purple-100 text-purple-800",
                }
                return (
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-purple-500/10 p-2">
                        <TrendingUpIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Promotion: Group {latest.from_job_group} → {latest.to_job_group}</p>
                        <p className="text-xs text-muted-foreground">{new Date(latest.created_at).toLocaleDateString("en-KE")}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={statusColor[latest.status] ?? ""}>{latest.status}</Badge>
                  </div>
                )
              })()
            ) : (
              <div className="flex items-center gap-3 rounded-md border border-dashed p-3 text-muted-foreground">
                <TrendingUpIcon className="h-4 w-4" />
                <span className="text-sm">No promotion records yet</span>
              </div>
            )}

            {/* Latest transfer */}
            {transfers.length > 0 ? (
              (() => {
                const latest = [...transfers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                return (
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-blue-500/10 p-2">
                        <ArrowRightLeftIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Transfer Application</p>
                        <p className="text-xs text-muted-foreground">{new Date(latest.created_at).toLocaleDateString("en-KE")}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">{latest.status.replace(/_/g, " ")}</Badge>
                  </div>
                )
              })()
            ) : (
              <div className="flex items-center gap-3 rounded-md border border-dashed p-3 text-muted-foreground">
                <ArrowRightLeftIcon className="h-4 w-4" />
                <span className="text-sm">No transfer applications</span>
              </div>
            )}

            {/* Current posting */}
            <div className="flex items-center gap-3 rounded-md border p-3">
              <div className="rounded-md bg-emerald-500/10 p-2">
                <MapPinIcon className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Current Posting</p>
                <p className="text-xs text-muted-foreground">
                  {staff?.institution?.name ?? "—"} · since {staff?.date_joined ? new Date(staff.date_joined).getFullYear() : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completeness */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2Icon className="h-4 w-4 text-muted-foreground" />
              Profile Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - profileCompleteness / 100)}`}
                    strokeLinecap="round"
                    className="text-primary transition-all"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-2xl font-bold">{profileCompleteness}%</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-center">
                {filledFields} of {profileFields.length} fields complete
              </p>
              {profileCompleteness < 100 && (
                <Link href="/my-portal/profile" className="mt-3">
                  <Button variant="outline" size="sm" className="text-xs">
                    Complete Profile
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuickFact({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

function StatusCard({
  icon: Icon,
  label,
  value,
  pending,
  pendingLabel = "pending",
  href,
  color,
}: {
  icon: any
  label: string
  value: number
  pending: number
  pendingLabel?: string
  href: string
  color: string
}) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
    purple: { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400" },
    amber: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
    emerald: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
  }
  const c = colorClasses[color] ?? colorClasses.blue

  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:border-primary/30">
        <CardContent className="p-4">
          <div className={`inline-flex rounded-lg p-2 ${c.bg}`}>
            <Icon className={`h-4 w-4 ${c.text}`} />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          {pending > 0 && (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
              {pending} {pendingLabel}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
