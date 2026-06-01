"use client"

import { Badge } from "@/components/ui/badge"
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
  GraduationCapIcon,
  UsersIcon,
  BanknoteIcon,
  ClipboardCheckIcon,
} from "lucide-react"

interface Props {
  institution: any
  enrolments: any[]
  staff: any[]
  financials: any[]
  returns: any[]
  programmes: any[]
}

export function InstitutionOverview({
  institution,
  enrolments,
  staff,
  financials,
  returns,
  programmes,
}: Props) {
  const totalEnrolment = enrolments.reduce(
    (sum, e) => sum + (e.male_count || 0) + (e.female_count || 0),
    0
  )
  const totalMale = enrolments.reduce((sum, e) => sum + (e.male_count || 0), 0)
  const totalFemale = enrolments.reduce((sum, e) => sum + (e.female_count || 0), 0)
  const totalPWD = enrolments.reduce((sum, e) => sum + (e.pwd_count || 0), 0)
  const trainers = staff.filter((s) => s.category === "trainer")
  const latestReturn = returns[0]
  const totalCapitationReceived = financials.reduce(
    (sum, f) => sum + (f.capitation_received || 0),
    0
  )
  const totalBudget = financials.reduce(
    (sum, f) => sum + (f.budget_allocated || 0),
    0
  )

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    submitted: "bg-blue-100 text-blue-800",
    verified: "bg-green-100 text-green-800",
    returned: "bg-amber-100 text-amber-800",
    locked: "bg-purple-100 text-purple-800",
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <GraduationCapIcon className="h-3.5 w-3.5" />
              Enrolment
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {totalEnrolment.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {totalMale} male · {totalFemale} female · {totalPWD} PWD
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <UsersIcon className="h-3.5 w-3.5" />
              Staff
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {staff.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {trainers.length} trainers · {staff.length - trainers.length} other
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <BanknoteIcon className="h-3.5 w-3.5" />
              Capitation Received
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              KES {(totalCapitationReceived / 1_000_000).toFixed(2)}M
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Budget: KES {(totalBudget / 1_000_000).toFixed(2)}M
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <ClipboardCheckIcon className="h-3.5 w-3.5" />
              Return Status
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {latestReturn ? (
                <Badge variant="secondary" className={statusColors[latestReturn.status] ?? ""}>
                  {latestReturn.status}
                </Badge>
              ) : (
                "No returns"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {latestReturn?.return_cycle?.name ?? "—"}
          </CardContent>
        </Card>
      </div>

      {/* Enrolment by Programme */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolment by Programme</CardTitle>
          <CardDescription>
            Disaggregated by gender and level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programme</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Male</TableHead>
                  <TableHead className="text-right">Female</TableHead>
                  <TableHead className="text-right">PWD</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No enrolment data
                    </TableCell>
                  </TableRow>
                ) : (
                  enrolments.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">
                        {e.programme?.name ?? "—"}
                      </TableCell>
                      <TableCell>{e.programme?.level ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {e.male_count}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {e.female_count}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {e.pwd_count}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {(e.male_count || 0) + (e.female_count || 0)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Register</CardTitle>
          <CardDescription>{staff.length} staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Job Group</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Employment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No staff data
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.full_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.category}</Badge>
                      </TableCell>
                      <TableCell>{s.job_group ?? "—"}</TableCell>
                      <TableCell>{s.qualification_level ?? "—"}</TableCell>
                      <TableCell>{s.employment_type ?? "—"}</TableCell>
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
