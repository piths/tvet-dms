import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { InstitutionDetail } from "@/components/institutions/institution-detail"
import { INSTITUTION_TYPE_LABELS } from "@/lib/types"

export default async function InstitutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: institution, error } = await supabase
    .from("institution")
    .select("*, county:county_id(name)")
    .eq("id", id)
    .single()

  if (error || !institution) notFound()

  const [
    { data: enrolments },
    { data: staff },
    { data: financials },
    { data: infrastructure },
    { data: programmes },
    { data: returns },
  ] = await Promise.all([
    supabase
      .from("enrolment")
      .select("*, programme:programme_id(name, cbet_level)")
      .eq("institution_id", id)
      .order("period", { ascending: false }),
    supabase
      .from("staff")
      .select("*")
      .eq("institution_id", id)
      .order("last_name"),
    supabase
      .from("financial_record")
      .select("*")
      .eq("institution_id", id)
      .order("period", { ascending: false }),
    supabase
      .from("infrastructure")
      .select("*")
      .eq("institution_id", id),
    supabase
      .from("programme")
      .select("*")
      .eq("institution_id", id)
      .eq("is_active", true),
    supabase
      .from("institution_return")
      .select("*, return_cycle:cycle_id(name, period)")
      .eq("institution_id", id)
      .order("created_at", { ascending: false }),
  ])

  const typeLabel = INSTITUTION_TYPE_LABELS[institution.type as keyof typeof INSTITUTION_TYPE_LABELS] ?? institution.type

  return (
    <>
      <PageHeader
        title={institution.name}
        description={`${typeLabel} · ${institution.county?.name ?? ""} · Reg: ${institution.registration_no ?? "—"}`}
      />
      <div className="flex flex-1 flex-col p-4 lg:p-6">
        <InstitutionDetail
          institution={institution}
          enrolments={enrolments ?? []}
          staff={staff ?? []}
          financials={financials ?? []}
          infrastructure={infrastructure ?? []}
          programmes={programmes ?? []}
          returns={returns ?? []}
          userTier={session.appUser.tier}
          userInstitutionId={session.appUser.institution_id}
        />
      </div>
    </>
  )
}
