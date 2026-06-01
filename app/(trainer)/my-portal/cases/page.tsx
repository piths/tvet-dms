import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { TrainerDisciplinary } from "@/components/trainer/disciplinary"

export default async function TrainerCasesPage() {
  const session = await getSessionUser()
  if (!session || !session.appUser.staff_id) redirect("/login")

  const supabase = await createClient()

  // RLS enforces isolation; we also filter visible_to_trainer for defense-in-depth
  const { data: cases } = await supabase
    .from("disciplinary_case")
    .select("*")
    .eq("staff_id", session.appUser.staff_id)
    .eq("visible_to_trainer", true)
    .order("created_at", { ascending: false })

  return (
    <>
      <PageHeader
        title="My Cases"
        description="Disciplinary cases disclosed to you"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <TrainerDisciplinary cases={cases ?? []} />
      </div>
    </>
  )
}
