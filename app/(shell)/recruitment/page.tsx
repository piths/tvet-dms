import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { RecruitmentManagement } from "@/components/recruitment/recruitment-management"

export default async function RecruitmentPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: recruitments } = await supabase
    .from("recruitment")
    .select("*, institution:institution_id(name), applicants:recruitment_applicant(id, status)")
    .order("created_at", { ascending: false })

  return (
    <>
      <PageHeader
        title="Recruitment"
        description="Manage trainer vacancies and hiring"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <RecruitmentManagement
          recruitments={recruitments ?? []}
          userTier={session.appUser.tier}
          userId={session.appUser.id}
          userName={session.appUser.full_name}
          userInstitutionId={session.appUser.institution_id}
        />
      </div>
    </>
  )
}
