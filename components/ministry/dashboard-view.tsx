"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  GraduationCapIcon,
  UsersIcon,
  BanknoteIcon,
  ClipboardCheckIcon,
  Building2Icon,
  TrendingUpIcon,
  ArrowRightLeftIcon,
  AccessibilityIcon,
  MapPinIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { useState } from "react"
import { PeriodSelector } from "@/components/period-selector"
import { getCurrentTerm, getCurrentQuarter, getCurrentFY } from "@/lib/periods"

interface Props {
  enrolments: any[]
  staff: any[]
  financials: any[]
  institutions: any[]
  counties: any[]
  returns: any[]
  transfers: any[]
  infrastructure: any[]
  openCycle: any
}

const COLORS = [
  "oklch(0.65 0.22 350)",   // pink/magenta (primary)
  "oklch(0.6 0.18 150)",    // green
  "oklch(0.6 0.15 270)",    // purple
  "oklch(0.65 0.15 80)",    // amber/orange
  "oklch(0.55 0.15 200)",   // teal
]

const KPI_ICON_COLORS = [
  { bg: "bg-rose-500/15 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-400" },
  { bg: "bg-emerald-500/15 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-violet-500/15 dark:bg-violet-500/20", text: "text-violet-600 dark:text-violet-400" },
  { bg: "bg-amber-500/15 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-sky-500/15 dark:bg-sky-500/20", text: "text-sky-600 dark:text-sky-400" },
]

export function DashboardView({
  enrolments,
  staff,
  financials,
  institutions,
  counties,
  returns,
  transfers,
  infrastructure,
  openCycle,
}: Props) {
  // ─── Compute KPIs ──────────────────────────────────────────────────────────
  const currentTerm = getCurrentTerm()
  const [selectedPeriod, setSelectedPeriod] = useState(currentTerm.code)

  const totalEnrolment = enrolments.reduce((s, e) => s + (e.male_count || 0) + (e.female_count || 0), 0)
  const totalMale = enrolments.reduce((s, e) => s + (e.male_count || 0), 0)
  const totalFemale = enrolments.reduce((s, e) => s + (e.female_count || 0), 0)
  const totalPWD = enrolments.reduce((s, e) => s + (e.pwd_count || 0), 0)
  const totalDropouts = enrolments.reduce((s, e) => s + (e.dropout_count || 0), 0)
  const totalTrainers = staff.filter((s) => s.category === "trainer").length
  const totalNonTeaching = staff.filter((s) => s.category === "non_teaching").length
  const totalManagement = staff.filter((s) => s.category === "management").length
  const totalStaff = staff.length
  const capExpected = financials.reduce((s, f) => s + Number(f.capitation_expected || 0), 0)
  const capReceived = financials.reduce((s, f) => s + Number(f.capitation_received || 0), 0)
  const budgetAllocated = financials.reduce((s, f) => s + Number(f.budget_allocated || 0), 0)
  const expenditure = financials.reduce((s, f) => s + Number(f.expenditure || 0), 0)
  const capPct = capExpected > 0 ? Math.round((capReceived / capExpected) * 100) : 0
  const budgetUtilPct = budgetAllocated > 0 ? Math.round((expenditure / budgetAllocated) * 100) : 0

  const submittedReturns = returns.filter((r: any) => r.status !== "draft").length
  const returnsPct = institutions.length > 0 ? Math.round((submittedReturns / institutions.length) * 100) : 0

  const pendingTransfers = transfers.filter((t: any) => !["approved", "rejected", "withdrawn"].includes(t.status)).length

  // ─── Chart Data ─────────────────────────────────────────────────────────────

  // Gender distribution
  const genderData = [
    { name: "Male", value: totalMale, fill: COLORS[0] },
    { name: "Female", value: totalFemale, fill: COLORS[1] },
  ]

  // Staff composition
  const staffData = [
    { name: "Trainers", value: totalTrainers, fill: COLORS[0] },
    { name: "Non-Teaching", value: totalNonTeaching, fill: COLORS[2] },
    { name: "Management", value: totalManagement, fill: COLORS[3] },
  ]

  // Enrolment by institution
  const enrolByInst = institutions.map((inst: any) => {
    const instEnrolments = enrolments.filter((e: any) => e.institution_id === inst.id)
    return {
      name: inst.name.length > 20 ? inst.name.slice(0, 20) + "…" : inst.name,
      fullName: inst.name,
      male: instEnrolments.reduce((s: number, e: any) => s + (e.male_count || 0), 0),
      female: instEnrolments.reduce((s: number, e: any) => s + (e.female_count || 0), 0),
      pwd: instEnrolments.reduce((s: number, e: any) => s + (e.pwd_count || 0), 0),
    }
  })

  // Capitation by institution
  const capByInst = institutions.map((inst: any) => {
    const instFin = financials.filter((f: any) => f.institution_id === inst.id)
    return {
      name: inst.name.length > 20 ? inst.name.slice(0, 20) + "…" : inst.name,
      expected: instFin.reduce((s: number, f: any) => s + Number(f.capitation_expected || 0), 0) / 1e6,
      received: instFin.reduce((s: number, f: any) => s + Number(f.capitation_received || 0), 0) / 1e6,
    }
  })

  // Budget utilisation
  const budgetData = institutions.map((inst: any) => {
    const instFin = financials.filter((f: any) => f.institution_id === inst.id)
    return {
      name: inst.name.length > 20 ? inst.name.slice(0, 20) + "…" : inst.name,
      budget: instFin.reduce((s: number, f: any) => s + Number(f.budget_allocated || 0), 0) / 1e6,
      expenditure: instFin.reduce((s: number, f: any) => s + Number(f.expenditure || 0), 0) / 1e6,
    }
  })

  // Infrastructure condition
  const infraCondition = infrastructure.reduce((acc: Record<string, number>, item: any) => {
    const cond = (item.condition || "unknown").toLowerCase()
    acc[cond] = (acc[cond] || 0) + 1
    return acc
  }, {})
  const infraData = Object.entries(infraCondition).map(([name, value], i) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: name === "good" ? COLORS[4] : name === "fair" ? COLORS[2] : COLORS[1],
  }))

  // Returns status breakdown
  const returnsBreakdown = returns.reduce((acc: Record<string, number>, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const enrolChartConfig = {
    male: { label: "Male", color: COLORS[0] },
    female: { label: "Female", color: COLORS[1] },
    pwd: { label: "PWD", color: COLORS[2] },
  } satisfies ChartConfig

  const capChartConfig = {
    expected: { label: "Expected", color: "oklch(0.5 0.08 200)" },
    received: { label: "Received", color: COLORS[0] },
  } satisfies ChartConfig

  const budgetChartConfig = {
    budget: { label: "Budget", color: "oklch(0.5 0.08 200)" },
    expenditure: { label: "Expenditure", color: COLORS[0] },
  } satisfies ChartConfig

  return (
    <div className="space-y-6">
      {/* ─── Period Selector ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PeriodSelector
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            className="w-[220px]"
          />
          <p className="text-xs text-muted-foreground hidden sm:block">
            Showing data for the selected period. Financial data follows the Kenya FY (Jul–Jun).
          </p>
        </div>
      </div>

      {/* ─── KPI Cards Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
        <KPICard
          icon={GraduationCapIcon}
          label="Total Enrolment"
          value={totalEnrolment.toLocaleString()}
          sub={`${totalMale} M · ${totalFemale} F`}
          colorIndex={0}
        />
        <KPICard
          icon={UsersIcon}
          label="Staff"
          value={totalStaff.toLocaleString()}
          sub={`${totalTrainers} trainers`}
          colorIndex={1}
        />
        <KPICard
          icon={BanknoteIcon}
          label="Capitation"
          value={`${capPct}%`}
          sub={`KES ${(capReceived / 1e6).toFixed(1)}M of ${(capExpected / 1e6).toFixed(1)}M`}
          colorIndex={2}
        />
        <KPICard
          icon={ClipboardCheckIcon}
          label="Returns"
          value={`${returnsPct}%`}
          sub={`${submittedReturns} of ${institutions.length} submitted`}
          colorIndex={3}
        />
        <KPICard
          icon={ArrowRightLeftIcon}
          label="Pending Transfers"
          value={pendingTransfers.toString()}
          sub={`${transfers.length} total applications`}
          colorIndex={4}
          className="hidden xl:flex"
        />
      </div>

      {/* ─── Charts Row 1: Gender + Staff + Returns ────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Gender Distribution Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gender Distribution</CardTitle>
            <CardDescription>Learner enrolment by gender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <PieChart width={200} height={200}>
                <Pie
                  data={genderData}
                  cx={100}
                  cy={100}
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: COLORS[0] }} />
                Male ({totalMale})
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: COLORS[1] }} />
                Female ({totalFemale})
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Gender parity index: {totalFemale > 0 ? (totalFemale / totalMale).toFixed(2) : "—"}
            </p>
          </CardContent>
        </Card>

        {/* Staff Composition Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Staff Composition</CardTitle>
            <CardDescription>By category across all institutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <PieChart width={200} height={200}>
                <Pie
                  data={staffData}
                  cx={100}
                  cy={100}
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {staffData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {staffData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ background: item.fill }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Returns Compliance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Returns Compliance</CardTitle>
            <CardDescription>{openCycle?.name ?? "Current cycle"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <RadialBarChart
                width={200}
                height={200}
                cx={100}
                cy={100}
                innerRadius={60}
                outerRadius={90}
                barSize={14}
                data={[{ value: returnsPct, fill: returnsPct >= 80 ? COLORS[4] : COLORS[2] }]}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  background={{ fill: "oklch(0.9 0.01 220)" }}
                  cornerRadius={10}
                />
                <text x={100} y={95} textAnchor="middle" className="fill-foreground text-2xl font-bold">
                  {returnsPct}%
                </text>
                <text x={100} y={115} textAnchor="middle" className="fill-muted-foreground text-xs">
                  submitted
                </text>
              </RadialBarChart>
            </div>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              {Object.entries(returnsBreakdown).map(([status, count]) => (
                <span key={status} className="capitalize">
                  {status}: <strong className="text-foreground">{count as number}</strong>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Charts Row 2: Enrolment Bar + Capitation ──────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Enrolment by Institution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enrolment by Institution</CardTitle>
            <CardDescription>Gender-disaggregated comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={enrolChartConfig} className="h-[260px] w-full">
              <BarChart data={enrolByInst} margin={{ left: 0, right: 8, bottom: 40 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 4 }} />
                <Bar dataKey="male" name="Male" fill="var(--color-male)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="female" name="Female" fill="var(--color-female)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="pwd" name="PWD" fill="var(--color-pwd)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Capitation Expected vs Received */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Capitation: Expected vs Received</CardTitle>
            <CardDescription>KES Millions by institution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={capChartConfig} className="h-[260px] w-full">
              <BarChart data={capByInst} margin={{ left: 0, right: 8, bottom: 40 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} unit="M" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 4 }} />
                <Bar dataKey="expected" name="Expected" fill="var(--color-expected)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="received" name="Received" fill="var(--color-received)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ─── Charts Row 3: Budget + Infrastructure ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Budget Utilisation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilisation</CardTitle>
            <CardDescription>Allocated vs Expenditure (KES M)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={budgetChartConfig} className="h-[240px] w-full">
              <AreaChart data={budgetData} margin={{ left: 0, right: 8, bottom: 40 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} unit="M" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="budget"
                  name="Budget"
                  stroke="var(--color-budget)"
                  fill="var(--color-budget)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenditure"
                  name="Expenditure"
                  stroke="var(--color-expenditure)"
                  fill="var(--color-expenditure)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Infrastructure Condition */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Infrastructure Condition</CardTitle>
            <CardDescription>{infrastructure.length} facilities assessed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <PieChart width={220} height={200}>
                <Pie
                  data={infraData}
                  cx={110}
                  cy={100}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {infraData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs mt-2">
              {infraData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                  {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Quick Stats Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat icon={MapPinIcon} label="Counties" value={counties.length.toString()} />
        <MiniStat icon={Building2Icon} label="Institutions" value={institutions.length.toString()} />
        <MiniStat icon={AccessibilityIcon} label="PWD Learners" value={totalPWD.toString()} sub={`${totalEnrolment > 0 ? ((totalPWD / totalEnrolment) * 100).toFixed(1) : 0}%`} />
        <MiniStat icon={AlertTriangleIcon} label="Dropouts" value={totalDropouts.toString()} sub={`${totalEnrolment > 0 ? ((totalDropouts / totalEnrolment) * 100).toFixed(1) : 0}%`} />
      </div>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function KPICard({
  icon: Icon,
  label,
  value,
  sub,
  colorIndex = 0,
  className,
}: {
  icon: any
  label: string
  value: string
  sub: string
  colorIndex?: number
  className?: string
}) {
  const color = KPI_ICON_COLORS[colorIndex % KPI_ICON_COLORS.length]
  return (
    <Card className={`relative overflow-hidden ${className ?? ""}`}>
      <CardContent className="p-4">
        <div className={`inline-flex rounded-xl p-2.5 ${color.bg}`}>
          <Icon className={`h-5 w-5 ${color.text}`} />
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-md bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
