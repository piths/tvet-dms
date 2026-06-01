import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { ReturnsView } from "@/components/returns/returns-view"

export default async function ReturnsPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  // Get all cycles (for the selector) and the open one
  const { data: allCycles } = await supabase
    .from("return_cycle")
    .select("*")
    .order("period", { ascending: false })

  const openCycle = (allCycles ?? []).find((c: any) => c.is_open) ?? null

  // Get all returns with institution + cycle info
  const { data: returns } = await supabase
    .from("institution_return")
    .select("*, institution:institution_id(id, name, type, county_id), return_cycle:cycle_id(id, name, period)")
    .order("submitted_at", { ascending: false, nullsFirst: false })

  // Get counties for filter
  const { data: counties } = await supabase.from("county").select("id, name").order("name")

  // Get institutions for the institution-tier view
  const { data: institutions } = await supabase.from("institution").select("id, name").eq("is_active", true)

  // For institution tier: check data completeness
  let completeness = null
  if (session.appUser.tier === "institution" && session.appUser.institution_id) {
    const instId = session.appUser.institution_id
    const [{ count: enrolCount }, { count: staffCount }, { count: finCount }] = await Promise.all([
      supabase.from("enrolment").select("*", { count: "exact", head: true }).eq("institution_id", instId),
      supabase.from("staff").select("*", { count: "exact", head: true }).eq("institution_id", instId),
      supabase.from("financial_record").select("*", { count: "exact", head: true }).eq("institution_id", instId),
    ])
    completeness = {
      hasEnrolment: (enrolCount ?? 0) > 0,
      hasStaff: (staffCount ?? 0) > 0,
      hasFinance: (finCount ?? 0) > 0,
    }
  }

  return (
    <>
      <PageHeader
        title="Returns"
        description={openCycle ? `Active: ${openCycle.name} (${openCycle.period})` : "No active cycle"}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <ReturnsView
          returns={returns ?? []}
          counties={counties ?? []}
          institutions={institutions ?? []}
          openCycle={openCycle}
          allCycles={allCycles ?? []}
          userTier={session.appUser.tier}
          userInstitutionId={session.appUser.institution_id}
          userId={session.appUser.id}
          userName={session.appUser.full_name}
          completeness={completeness}
        />
      </div>
    </>
  )
}
