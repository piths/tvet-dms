import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { CountyDetail } from "@/components/counties/county-detail"

export default async function CountyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: county, error } = await supabase
    .from("county")
    .select("*")
    .eq("id", Number(id))
    .single()

  if (error || !county) notFound()

  const { data: institutions } = await supabase
    .from("institution")
    .select("*")
    .eq("county_id", county.id)
    .eq("is_active", true)
    .order("name")

  const instIds = (institutions ?? []).map((i: any) => i.id)

  const [{ data: enrolments }, { data: staff }, { data: financials }] = await Promise.all([
    supabase.from("enrolment").select("institution_id, male_count, female_count, pwd_count").in("institution_id", instIds.length > 0 ? instIds : ["__none__"]),
    supabase.from("staff").select("institution_id, category").in("institution_id", instIds.length > 0 ? instIds : ["__none__"]),
    supabase.from("financial_record").select("institution_id, capitation_received").in("institution_id", instIds.length > 0 ? instIds : ["__none__"]),
  ])

  const totalEnrolment = (enrolments ?? []).reduce((s: number, e: any) => s + (e.male_count || 0) + (e.female_count || 0), 0)
  const totalTrainers = (staff ?? []).filter((s: any) => s.category === "trainer").length
  const totalCapitation = (financials ?? []).reduce((s: number, f: any) => s + Number(f.capitation_received || 0), 0)

  // Enrolment per institution for chart
  const chartData = (institutions ?? []).map((inst: any) => {
    const instEnrolments = (enrolments ?? []).filter((e: any) => e.institution_id === inst.id)
    return {
      name: inst.name,
      male: instEnrolments.reduce((s: number, e: any) => s + (e.male_count || 0), 0),
      female: instEnrolments.reduce((s: number, e: any) => s + (e.female_count || 0), 0),
      pwd: instEnrolments.reduce((s: number, e: any) => s + (e.pwd_count || 0), 0),
    }
  })

  return (
    <>
      <PageHeader title={county.name} description={`County Code: ${county.code ?? "—"}`} />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <CountyDetail
          county={county}
          institutions={institutions ?? []}
          summary={{ totalEnrolment, totalTrainers, totalCapitation, institutionCount: instIds.length }}
          chartData={chartData}
        />
      </div>
    </>
  )
}
