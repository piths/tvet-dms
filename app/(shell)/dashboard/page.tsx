import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { MinistryKPICards } from "@/components/ministry/kpi-cards"
import { MinistryCharts } from "@/components/ministry/charts"
import { ReturnsStatusTable } from "@/components/ministry/returns-status-table"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  // Fetch all data in parallel
  const [
    { data: enrolments },
    { data: staff },
    { data: financials },
    { data: institutions },
    { data: counties },
    { data: openCycle },
    { data: returns },
  ] = await Promise.all([
    supabase.from("enrolment").select("*"),
    supabase.from("staff").select("*"),
    supabase.from("financial_record").select("*"),
    supabase.from("institution").select("*").eq("is_active", true),
    supabase.from("county").select("*"),
    supabase.from("return_cycle").select("*").eq("is_open", true).limit(1).single(),
    supabase
      .from("institution_return")
      .select("*, institution:institution_id(name, type), return_cycle:cycle_id(name, period)")
      .order("submitted_at", { ascending: false, nullsFirst: false }),
  ])

  // Compute KPIs
  const totalEnrolment = (enrolments ?? []).reduce(
    (sum, e) => sum + (e.male_count || 0) + (e.female_count || 0),
    0
  )
  const totalMale = (enrolments ?? []).reduce((sum, e) => sum + (e.male_count || 0), 0)
  const totalFemale = (enrolments ?? []).reduce((sum, e) => sum + (e.female_count || 0), 0)
  const totalPWD = (enrolments ?? []).reduce((sum, e) => sum + (e.pwd_count || 0), 0)
  const totalTrainers = (staff ?? []).filter((s) => s.category === "trainer").length
  const totalStaff = (staff ?? []).length
  const capitationExpected = (financials ?? []).reduce(
    (sum, f) => sum + Number(f.capitation_expected || 0),
    0
  )
  const capitationReceived = (financials ?? []).reduce(
    (sum, f) => sum + Number(f.capitation_received || 0),
    0
  )
  const totalInstitutions = (institutions ?? []).length

  // Returns submission rate: count of institution_returns with status != 'draft' for the open cycle
  const currentCycleReturns = openCycle
    ? (returns ?? []).filter((r: any) => r.return_cycle?.period === openCycle.period)
    : (returns ?? [])
  const submittedCount = currentCycleReturns.filter(
    (r: any) => r.status === "submitted" || r.status === "verified" || r.status === "locked"
  ).length
  const returnsSubmissionRate =
    totalInstitutions > 0 ? Math.round((submittedCount / totalInstitutions) * 100) : 0

  const kpiData = {
    totalEnrolment,
    totalMale,
    totalFemale,
    totalPWD,
    totalTrainers,
    totalStaff,
    capitationExpected,
    capitationReceived,
    returnsSubmissionRate,
    totalInstitutions,
    totalCounties: (counties ?? []).length,
  }

  // Enrolment by institution for chart
  const enrolmentByInstitution = (enrolments ?? []).reduce(
    (acc: Record<string, { male: number; female: number; pwd: number }>, e: any) => {
      const instId = e.institution_id
      if (!acc[instId]) acc[instId] = { male: 0, female: 0, pwd: 0 }
      acc[instId].male += e.male_count || 0
      acc[instId].female += e.female_count || 0
      acc[instId].pwd += e.pwd_count || 0
      return acc
    },
    {}
  )

  const chartData = (institutions ?? []).map((inst: any) => ({
    name: inst.name,
    male: enrolmentByInstitution[inst.id]?.male ?? 0,
    female: enrolmentByInstitution[inst.id]?.female ?? 0,
    pwd: enrolmentByInstitution[inst.id]?.pwd ?? 0,
  }))

  return (
    <>
      <PageHeader
        title="National Overview"
        description={`Ministry KPI Dashboard — ${openCycle?.name ?? "At Your Fingertips"}`}
        actions={
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <DownloadIcon className="mr-1.5 h-3.5 w-3.5" />
              Export to KEMIS
            </Button>
          </Link>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <MinistryKPICards data={kpiData} />
        <MinistryCharts data={chartData} />
        <ReturnsStatusTable returns={(returns ?? []) as any[]} />
      </div>
    </>
  )
}
