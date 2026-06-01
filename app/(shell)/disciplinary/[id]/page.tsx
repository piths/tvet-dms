import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { CaseDetail } from "@/components/disciplinary/case-detail"

export default async function DisciplinaryCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: caseData, error } = await supabase
    .from("disciplinary_case")
    .select("*, staff:staff_id(id, first_name, last_name, middle_name, employee_number, tsc_number, job_group, designation), institution:institution_id(name)")
    .eq("id", id)
    .single()

  if (error || !caseData) notFound()

  const { data: events } = await supabase
    .from("disciplinary_event")
    .select("*")
    .eq("case_id", id)
    .order("event_date", { ascending: true })

  return (
    <>
      <PageHeader
        title={`Case: ${caseData.case_type ?? "Disciplinary"}`}
        description={`${caseData.staff ? [caseData.staff.first_name, caseData.staff.last_name].join(" ") : "—"} · ${caseData.institution?.name ?? ""}`}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <CaseDetail
          caseData={caseData}
          events={events ?? []}
          userTier={session.appUser.tier}
          userId={session.appUser.id}
          userName={session.appUser.full_name}
        />
      </div>
    </>
  )
}
