import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { DisciplinaryManagement } from "@/components/disciplinary/disciplinary-management"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export default async function DisciplinaryPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: cases } = await supabase
    .from("disciplinary_case")
    .select("*, staff:staff_id(id, first_name, last_name, middle_name, employee_number, tsc_number), institution:institution_id(name)")
    .order("created_at", { ascending: false })

  // Get staff list for the "New Case" form (institution tier only)
  let staffList: any[] = []
  if (session.appUser.tier === "institution" && session.appUser.institution_id) {
    const { data } = await supabase
      .from("staff")
      .select("id, first_name, last_name, middle_name, employee_number")
      .eq("institution_id", session.appUser.institution_id)
      .order("last_name")
    staffList = data ?? []
  }

  return (
    <>
      <PageHeader
        title="Disciplinary Cases"
        description="Manage trainer disciplinary proceedings"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <DisciplinaryManagement
          cases={cases ?? []}
          staffList={staffList}
          userTier={session.appUser.tier}
          userId={session.appUser.id}
          userName={session.appUser.full_name}
          userInstitutionId={session.appUser.institution_id}
        />
      </div>
    </>
  )
}
