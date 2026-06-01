import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { QAManagement } from "@/components/qa/qa-management"

export default async function QualityAssurancePage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: assessments } = await supabase
    .from("qa_assessment")
    .select("*, institution:institution_id(id, name)")
    .order("created_at", { ascending: false })

  const { data: institutions } = await supabase
    .from("institution")
    .select("id, name")
    .eq("is_active", true)
    .order("name")

  return (
    <>
      <PageHeader title="Quality Assurance" description="CBET, ICT, IGA & Greening assessments" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <QAManagement
          assessments={assessments ?? []}
          institutions={institutions ?? []}
          userTier={session.appUser.tier}
          userId={session.appUser.id}
          userName={session.appUser.full_name}
        />
      </div>
    </>
  )
}
