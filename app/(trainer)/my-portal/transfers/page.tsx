import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { TrainerTransfers } from "@/components/trainer/transfers"

export default async function TrainerTransfersPage() {
  const session = await getSessionUser()
  if (!session || !session.appUser.staff_id) redirect("/login")

  const supabase = await createClient()

  const { data: transfers } = await supabase
    .from("transfer_application")
    .select(`
      *,
      from_institution:from_institution_id(name),
      to_institution:to_institution_id(name),
      approvals:transfer_approval(approver_role, decision, approver_name, comments, signed_at)
    `)
    .eq("staff_id", session.appUser.staff_id)
    .order("created_at", { ascending: false })

  return (
    <>
      <PageHeader
        title="My Transfers"
        description="Your transfer applications and their status"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <TrainerTransfers transfers={transfers ?? []} />
      </div>
    </>
  )
}
