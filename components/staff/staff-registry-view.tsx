"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { UsersIcon, GraduationCapIcon, UserIcon } from "lucide-react"
import { staffFullName } from "@/lib/types"

interface StaffRow {
  id: string
  first_name: string
  last_name: string
  middle_name: string | null
  employee_number: string | null
  tsc_number: string | null
  cdacc_assessor_number: string | null
  gender: string | null
  category: string
  designation: string | null
  job_group: string | null
  qualification_level: string | null
  employment_type: string | null
  terms_of_service: string | null
  date_joined: string | null
  status: string | null
  disability_status: boolean
  institution: { name: string; county_id: number | null } | null
  county: { name: string } | null
}

interface Props {
  staff: StaffRow[]
  counties: { id: number; name: string }[]
  institutions: { id: string; name: string }[]
  summary: { totalStaff: number; trainers: number; nonTeaching: number }
}

export function StaffRegistryView({ staff, counties, institutions, summary }: Props) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedStaff, setSelectedStaff] = useState<StaffRow | null>(null)

  const filtered = staff.filter((s) => {
    const name = staffFullName(s).toLowerCase()
    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      (s.employee_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.tsc_number ?? "").toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <UsersIcon className="h-3.5 w-3.5" /> Total Staff
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">{summary.totalStaff}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <GraduationCapIcon className="h-3.5 w-3.5" /> Trainers
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">{summary.trainers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" /> Non-Teaching
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">{summary.nonTeaching}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name, employee no., or TSC no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="trainer">Trainer</SelectItem>
            <SelectItem value="non_teaching">Non-Teaching</SelectItem>
            <SelectItem value="management">Management</SelectItem>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Emp. No.</TableHead>
                  <TableHead>TSC No.</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>County</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Job Group</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No staff records match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedStaff(s)}
                    >
                      <TableCell className="font-medium">{staffFullName(s)}</TableCell>
                      <TableCell className="text-muted-foreground">{s.employee_number ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{s.tsc_number ?? "—"}</TableCell>
                      <TableCell>{s.institution?.name ?? "—"}</TableCell>
                      <TableCell>{s.county?.name ?? "—"}</TableCell>
                      <TableCell><Badge variant="outline">{s.category}</Badge></TableCell>
                      <TableCell>{s.job_group ?? "—"}</TableCell>
                      <TableCell>{s.qualification_level ?? "—"}</TableCell>
                      <TableCell>{s.status ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Detail Sheet */}
      <Sheet open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto p-0">
          {selectedStaff && (
            <>
              {/* Hero header with gradient + avatar */}
              <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 pt-12">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {`${selectedStaff.first_name?.[0] ?? ""}${selectedStaff.last_name?.[0] ?? ""}`.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-lg leading-tight">{staffFullName(selectedStaff)}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selectedStaff.designation ?? "—"}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="capitalize">{selectedStaff.category}</Badge>
                      {selectedStaff.job_group && (
                        <Badge variant="outline">Group {selectedStaff.job_group}</Badge>
                      )}
                      {selectedStaff.status && (
                        <Badge
                          variant={selectedStaff.status === "active" ? "default" : "secondary"}
                          className={selectedStaff.status === "active" ? "bg-green-600" : ""}
                        >
                          {selectedStaff.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <SheetDescription className="sr-only">Staff member details</SheetDescription>
              </div>

              {/* Quick facts strip */}
              <div className="grid grid-cols-3 gap-2 border-y bg-muted/30 px-6 py-3 text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Emp. No.</p>
                  <p className="text-xs font-semibold truncate">{selectedStaff.employee_number ?? "—"}</p>
                </div>
                <div className="border-x">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">TSC No.</p>
                  <p className="text-xs font-semibold truncate">{selectedStaff.tsc_number ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Joined</p>
                  <p className="text-xs font-semibold truncate">
                    {selectedStaff.date_joined ? new Date(selectedStaff.date_joined).getFullYear() : "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <DetailSection title="Personal Information">
                  <DetailField label="First Name" value={selectedStaff.first_name} />
                  <DetailField label="Last Name" value={selectedStaff.last_name} />
                  <DetailField label="Middle Name" value={selectedStaff.middle_name} />
                  <DetailField label="Gender" value={selectedStaff.gender} />
                  <DetailField label="Disability" value={selectedStaff.disability_status ? "Yes" : "No"} />
                </DetailSection>

                <DetailSection title="Employment Details">
                  <DetailField label="CDACC Assessor No." value={selectedStaff.cdacc_assessor_number} />
                  <DetailField label="Designation" value={selectedStaff.designation} />
                  <DetailField label="Job Group" value={selectedStaff.job_group} />
                  <DetailField label="Category" value={selectedStaff.category} />
                  <DetailField label="Employment Type" value={selectedStaff.employment_type} />
                  <DetailField label="Terms of Service" value={selectedStaff.terms_of_service} />
                  <DetailField label="Date Joined" value={selectedStaff.date_joined} />
                </DetailSection>

                <DetailSection title="Qualifications">
                  <DetailField label="Qualification Level" value={selectedStaff.qualification_level} />
                </DetailSection>

                <DetailSection title="Current Posting">
                  <DetailField label="Institution" value={selectedStaff.institution?.name} />
                  <DetailField label="County" value={selectedStaff.county?.name} />
                </DetailSection>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">{children}</dl>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium mt-0.5 break-words">{value ?? "—"}</dd>
    </div>
  )
}
