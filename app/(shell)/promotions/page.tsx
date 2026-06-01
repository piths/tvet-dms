import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { PromotionsManagement } from "@/components/promotions/promotions-management"

export default async function PromotionsPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: promotions } = await supabase
    .from("promotion")
    .select("*, staff:staff_id(id, first_name, last_name, middle_name, employee_number, job_group), institution:institution_id(name)")
    .order("created_at", { ascending: false })

  // Staff list for institution users to recommend promotions
  let staffList: any[] = []
  if (session.appUser.tier === "institution" && session.appUser.institution_id) {
    const { data } = await supabase
      .from("staff")
      .select("id, first_name, last_name, middle_name, employee_number, job_group, designation")
      .eq("institution_id", session.appUser.institution_id)
      .order("last_name")
    staffList = data ?? []
  }

  return (
    <>
      <PageHeader title="Promotions" description="Trainer career progression tracking" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <PromotionsManagement
          promotions={promotions ?? []}
          staffList={staffList}
          userTier={session.appUser.tier}
          userId={session.appUser.id}
          userInstitutionId={session.appUser.institution_id}
        />
      </div>
    </>
  )
}
