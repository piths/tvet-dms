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
import { UsersIcon, GraduationCapIcon, UserIcon } from "lucide-react"
import { staffFullName } from "@/lib/types"

interface StaffRow {
  id: string
  first_name: string
  last_name: string
  middle_name: string | null
  employee_number: string | null
  tsc_number: string | null
  category: string
  job_group: string | null
  qualification_level: string | null
  status: string | null
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
                    <TableRow key={s.id}>
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
    </div>
  )
}
