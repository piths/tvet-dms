import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { TrainerDashboard } from "@/components/trainer/trainer-dashboard"

export default async function TrainerPortalPage() {
  const session = await getSessionUser()
  if (!session || !session.appUser.staff_id) redirect("/login")

  const supabase = await createClient()
  const staffId = session.appUser.staff_id

  const [
    { data: staffRecord },
    { data: transfers },
    { data: promotions },
    { data: cases },
    { data: documents },
  ] = await Promise.all([
    supabase.from("staff").select("*, institution:institution_id(name)").eq("id", staffId).single(),
    supabase.from("transfer_application").select("id, status, created_at").eq("staff_id", staffId),
    supabase.from("promotion").select("id, status, from_job_group, to_job_group, created_at").eq("staff_id", staffId),
    supabase.from("disciplinary_case").select("id, status, case_type").eq("staff_id", staffId).eq("visible_to_trainer", true),
    supabase.from("staff_document").select("id, verified").eq("staff_id", staffId),
  ])

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session.appUser.full_name}`}
        description={staffRecord?.institution?.name ?? "Trainer Self-Service Portal"}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <TrainerDashboard
          staff={staffRecord}
          transfers={transfers ?? []}
          promotions={promotions ?? []}
          cases={cases ?? []}
          documents={documents ?? []}
        />
      </div>
    </>
  )
}
