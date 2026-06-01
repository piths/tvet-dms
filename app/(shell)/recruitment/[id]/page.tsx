import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { VacancyDetail } from "@/components/recruitment/vacancy-detail"

export default async function VacancyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: vacancy, error } = await supabase
    .from("recruitment")
    .select("*, institution:institution_id(name)")
    .eq("id", id)
    .single()

  if (error || !vacancy) notFound()

  const { data: applicants } = await supabase
    .from("recruitment_applicant")
    .select("*")
    .eq("recruitment_id", id)
    .order("created_at")

  // Get current staff count for this job group at the institution (staffing gap context)
  const { count: currentStaffCount } = await supabase
    .from("staff")
    .select("*", { count: "exact", head: true })
    .eq("institution_id", vacancy.institution_id)
    .eq("job_group", vacancy.job_group)

  return (
    <>
      <PageHeader
        title={vacancy.title}
        description={`${vacancy.institution?.name} · Job Group ${vacancy.job_group ?? "—"}`}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <VacancyDetail
          vacancy={vacancy}
          applicants={applicants ?? []}
          currentStaffInGroup={currentStaffCount ?? 0}
          userTier={session.appUser.tier}
          userId={session.appUser.id}
          userName={session.appUser.full_name}
        />
      </div>
    </>
  )
}
