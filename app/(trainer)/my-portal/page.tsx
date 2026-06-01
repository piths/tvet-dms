import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { TrainerProfile } from "@/components/trainer/profile"

export default async function TrainerPortalPage() {
  const session = await getSessionUser()
  if (!session || !session.appUser.staff_id) redirect("/login")

  const supabase = await createClient()

  const { data: staffRecord } = await supabase
    .from("staff")
    .select("*, institution:institution_id(name)")
    .eq("id", session.appUser.staff_id)
    .single()

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.appUser.full_name}`}
        description={staffRecord?.institution?.name ?? "Trainer Portal"}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <TrainerProfile staff={staffRecord} />
      </div>
    </>
  )
}
