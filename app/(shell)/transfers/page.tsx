import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { TransfersView } from "@/components/transfers/transfers-view"

export default async function TransfersPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: transfers } = await supabase
    .from("transfer_application")
    .select(`
      *,
      staff:staff_id(id, first_name, last_name, middle_name, tsc_number, employee_number, job_group, qualification_level),
      from_institution:from_institution_id(id, name),
      to_institution:to_institution_id(id, name),
      approvals:transfer_approval(*)
    `)
    .order("created_at", { ascending: false })

  return (
    <>
      <PageHeader
        title="Transfer Applications"
        description="Manage trainer transfer requests"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <TransfersView
          transfers={transfers ?? []}
          userTier={session.appUser.tier}
          userId={session.appUser.id}
          userName={session.appUser.full_name}
          userInstitutionId={session.appUser.institution_id}
        />
      </div>
    </>
  )
}
