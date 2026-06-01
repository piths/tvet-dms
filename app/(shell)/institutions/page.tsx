import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { InstitutionCards } from "@/components/institutions/institution-cards"

export default async function InstitutionsPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  // Fetch institutions with county join
  const { data: institutions } = await supabase
    .from("institution")
    .select("*, county:county_id(name)")
    .eq("is_active", true)
    .order("name")

  // Fetch aggregates
  const { data: enrolments } = await supabase.from("enrolment").select("institution_id, male_count, female_count")
  const { data: staffRows } = await supabase.from("staff").select("institution_id, category")
  const { data: financials } = await supabase.from("financial_record").select("institution_id, capitation_received")
  const { data: returns } = await supabase
    .from("institution_return")
    .select("institution_id, status")
    .order("created_at", { ascending: false })

  // Aggregate per institution
  const enrolmentMap: Record<string, number> = {}
  for (const e of enrolments ?? []) {
    enrolmentMap[e.institution_id] = (enrolmentMap[e.institution_id] || 0) + (e.male_count || 0) + (e.female_count || 0)
  }

  const trainerMap: Record<string, number> = {}
  for (const s of staffRows ?? []) {
    if (s.category === "trainer") {
      trainerMap[s.institution_id] = (trainerMap[s.institution_id] || 0) + 1
    }
  }

  const capitationMap: Record<string, number> = {}
  for (const f of financials ?? []) {
    capitationMap[f.institution_id] = (capitationMap[f.institution_id] || 0) + Number(f.capitation_received || 0)
  }

  // Latest return status per institution
  const returnStatusMap: Record<string, string> = {}
  for (const r of returns ?? []) {
    if (!returnStatusMap[r.institution_id]) {
      returnStatusMap[r.institution_id] = r.status
    }
  }

  const enriched = (institutions ?? []).map((inst: any) => ({
    ...inst,
    county_name: inst.county?.name ?? "—",
    total_enrolment: enrolmentMap[inst.id] ?? 0,
    trainer_count: trainerMap[inst.id] ?? 0,
    capitation_received: capitationMap[inst.id] ?? 0,
    return_status: returnStatusMap[inst.id] ?? null,
  }))

  return (
    <>
      <PageHeader
        title="Institutions"
        description={`${enriched.length} registered institution${enriched.length !== 1 ? "s" : ""}`}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <InstitutionCards institutions={enriched} />
      </div>
    </>
  )
}
