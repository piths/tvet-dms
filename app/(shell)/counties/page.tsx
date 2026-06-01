import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { CountyCards } from "@/components/counties/county-cards"

export default async function CountiesPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: counties } = await supabase.from("county").select("*").order("name")
  const { data: institutions } = await supabase.from("institution").select("id, county_id").eq("is_active", true)
  const { data: enrolments } = await supabase.from("enrolment").select("institution_id, male_count, female_count")
  const { data: staff } = await supabase.from("staff").select("institution_id, category")
  const { data: returns } = await supabase.from("institution_return").select("institution_id, status")

  // Build institution → county map
  const instCountyMap: Record<string, number> = {}
  for (const i of institutions ?? []) {
    if (i.county_id) instCountyMap[i.id] = i.county_id
  }

  // Aggregate per county
  const countyData = (counties ?? []).map((c: any) => {
    const countyInstIds = (institutions ?? []).filter((i: any) => i.county_id === c.id).map((i: any) => i.id)
    const countyEnrolment = (enrolments ?? [])
      .filter((e: any) => countyInstIds.includes(e.institution_id))
      .reduce((sum: number, e: any) => sum + (e.male_count || 0) + (e.female_count || 0), 0)
    const countyTrainers = (staff ?? [])
      .filter((s: any) => countyInstIds.includes(s.institution_id) && s.category === "trainer").length
    const countyReturns = (returns ?? []).filter((r: any) => countyInstIds.includes(r.institution_id))
    const submitted = countyReturns.filter((r: any) => r.status !== "draft").length

    return {
      ...c,
      institutionCount: countyInstIds.length,
      totalEnrolment: countyEnrolment,
      trainerCount: countyTrainers,
      returnsSubmitted: submitted,
      returnsTotal: countyReturns.length,
    }
  })

  return (
    <>
      <PageHeader title="Counties" description={`${(counties ?? []).length} counties`} />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <CountyCards counties={countyData} />
      </div>
    </>
  )
}
