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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCapIcon,
  UsersIcon,
  BanknoteIcon,
  ClipboardCheckIcon,
} from "lucide-react"
import { staffFullName, INSTITUTION_TYPE_LABELS } from "@/lib/types"
import type { UserTier } from "@/lib/types"

interface Props {
  institution: any
  enrolments: any[]
  staff: any[]
  financials: any[]
  infrastructure: any[]
  programmes: any[]
  returns: any[]
  userTier: UserTier
  userInstitutionId: string | null
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
  returned: "bg-amber-100 text-amber-800",
  locked: "bg-purple-100 text-purple-800",
}

const conditionColors: Record<string, string> = {
  good: "bg-green-100 text-green-800",
  fair: "bg-amber-100 text-amber-800",
  poor: "bg-red-100 text-red-800",
}

export function InstitutionDetail({
  institution,
  enrolments,
  staff,
  financials,
  infrastructure,
  programmes,
  returns,
}: Props) {
  const totalEnrolment = enrolments.reduce(
    (sum: number, e: any) => sum + (e.male_count || 0) + (e.female_count || 0),
    0
  )
  const totalMale = enrolments.reduce((sum: number, e: any) => sum + (e.male_count || 0), 0)
  const totalFemale = enrolments.reduce((sum: number, e: any) => sum + (e.female_count || 0), 0)
  const totalPWD = enrolments.reduce((sum: number, e: any) => sum + (e.pwd_count || 0), 0)
  const trainers = staff.filter((s: any) => s.category === "trainer")
  const latestReturn = returns[0]
  const totalCapExpected = financials.reduce((s: number, f: any) => s + Number(f.capitation_expected || 0), 0)
  const totalCapReceived = financials.reduce((s: number, f: any) => s + Number(f.capitation_received || 0), 0)
  const capPct = totalCapExpected > 0 ? Math.round((totalCapReceived / totalCapExpected) * 100) : 0

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="enrolment">Enrolment</TabsTrigger>
        <TabsTrigger value="staff">Staff</TabsTrigger>
        <TabsTrigger value="finance">Finance</TabsTrigger>
        <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <GraduationCapIcon className="h-3.5 w-3.5" /> Enrolment
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
                <UsersIcon className="h-3.5 w-3.5" /> Staff
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
                <BanknoteIcon className="h-3.5 w-3.5" /> Capitation
              </CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums">
                {capPct}%
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              KES {(totalCapReceived / 1e6).toFixed(2)}M of {(totalCapExpected / 1e6).toFixed(2)}M
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <ClipboardCheckIcon className="h-3.5 w-3.5" /> Return Status
              </CardDescription>
              <CardTitle className="text-lg">
                {latestReturn ? (
                  <Badge variant="secondary" className={statusColors[latestReturn.status] ?? ""}>
                    {latestReturn.status}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">No returns</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {latestReturn?.return_cycle?.name ?? "—"}
            </CardContent>
          </Card>
        </div>

        {/* Institution Info */}
        <Card>
          <CardHeader>
            <CardTitle>Institution Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Type</dt>
                <dd className="font-medium">{INSTITUTION_TYPE_LABELS[institution.type as keyof typeof INSTITUTION_TYPE_LABELS]}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Registration No.</dt>
                <dd className="font-medium">{institution.registration_no ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">County</dt>
                <dd className="font-medium">{institution.county?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Sub-County</dt>
                <dd className="font-medium">{institution.sub_county ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Accreditation</dt>
                <dd className="font-medium">{institution.accreditation_status ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Governance</dt>
                <dd className="font-medium">{institution.governance_structure ?? "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Enrolment Tab */}
      <TabsContent value="enrolment">
        <Card>
          <CardHeader>
            <CardTitle>Enrolment by Programme</CardTitle>
            <CardDescription>{enrolments.length} records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programme</TableHead>
                    <TableHead>CBET Level</TableHead>
                    <TableHead>Intake</TableHead>
                    <TableHead className="text-right">Male</TableHead>
                    <TableHead className="text-right">Female</TableHead>
                    <TableHead className="text-right">PWD</TableHead>
                    <TableHead className="text-right">Dropouts</TableHead>
                    <TableHead className="text-right">Graduated</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No enrolment data recorded for this institution.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {enrolments.map((e: any) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.programme?.name ?? "—"}</TableCell>
                          <TableCell>{e.cbet_level ?? e.programme?.cbet_level ?? "—"}</TableCell>
                          <TableCell>{e.intake ?? "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">{e.male_count}</TableCell>
                          <TableCell className="text-right tabular-nums">{e.female_count}</TableCell>
                          <TableCell className="text-right tabular-nums">{e.pwd_count}</TableCell>
                          <TableCell className="text-right tabular-nums">{e.dropout_count}</TableCell>
                          <TableCell className="text-right tabular-nums">{e.graduated_count}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {(e.male_count || 0) + (e.female_count || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-medium">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right tabular-nums">{totalMale}</TableCell>
                        <TableCell className="text-right tabular-nums">{totalFemale}</TableCell>
                        <TableCell className="text-right tabular-nums">{totalPWD}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {enrolments.reduce((s: number, e: any) => s + (e.dropout_count || 0), 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {enrolments.reduce((s: number, e: any) => s + (e.graduated_count || 0), 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{totalEnrolment}</TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Staff Tab */}
      <TabsContent value="staff">
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
                    <TableHead>Emp. No.</TableHead>
                    <TableHead>TSC No.</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Job Group</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Employment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No staff records for this institution.
                      </TableCell>
                    </TableRow>
                  ) : (
                    staff.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{staffFullName(s)}</TableCell>
                        <TableCell className="text-muted-foreground">{s.employee_number ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{s.tsc_number ?? "—"}</TableCell>
                        <TableCell><Badge variant="outline">{s.category}</Badge></TableCell>
                        <TableCell>{s.job_group ?? "—"}</TableCell>
                        <TableCell>{s.qualification_level ?? "—"}</TableCell>
                        <TableCell>{s.employment_type ?? "—"}</TableCell>
                        <TableCell>{s.status ?? "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Finance Tab */}
      <TabsContent value="finance" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Capitation Expected</CardDescription>
              <CardTitle className="text-xl tabular-nums">
                KES {(totalCapExpected / 1e6).toFixed(2)}M
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Capitation Received</CardDescription>
              <CardTitle className="text-xl tabular-nums">
                KES {(totalCapReceived / 1e6).toFixed(2)}M
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Budget Allocated</CardDescription>
              <CardTitle className="text-xl tabular-nums">
                KES {(financials.reduce((s: number, f: any) => s + Number(f.budget_allocated || 0), 0) / 1e6).toFixed(2)}M
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Expenditure</CardDescription>
              <CardTitle className="text-xl tabular-nums">
                KES {(financials.reduce((s: number, f: any) => s + Number(f.expenditure || 0), 0) / 1e6).toFixed(2)}M
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Financial Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Cap. Expected</TableHead>
                    <TableHead className="text-right">Cap. Received</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Expenditure</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No financial records.
                      </TableCell>
                    </TableRow>
                  ) : (
                    financials.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.period}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {Number(f.capitation_expected).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {Number(f.capitation_received).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {Number(f.budget_allocated).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {Number(f.expenditure).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{f.disbursement_status ?? "—"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Infrastructure Tab */}
      <TabsContent value="infrastructure">
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure & Facilities</CardTitle>
            <CardDescription>{infrastructure.length} items</CardDescription>
          </CardHeader>
          <CardContent>
            {infrastructure.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No infrastructure data recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {infrastructure.map((item: any) => (
                  <Card key={item.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{item.item_type}</CardTitle>
                        {item.condition && (
                          <Badge
                            variant="secondary"
                            className={conditionColors[item.condition.toLowerCase()] ?? ""}
                          >
                            {item.condition}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <CardDescription className="text-xs">{item.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {item.capacity && (
                        <div className="text-xs text-muted-foreground">
                          Capacity: <strong>{item.capacity}</strong>
                        </div>
                      )}
                      {item.utilisation_pct != null && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Utilisation</span>
                            <span className="font-medium">{Number(item.utilisation_pct)}%</span>
                          </div>
                          <Progress value={Number(item.utilisation_pct)} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
