import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { DisciplinaryView } from "@/components/disciplinary/disciplinary-view"

export default async function DisciplinaryPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: cases } = await supabase
    .from("disciplinary_case")
    .select("*, staff:staff_id(first_name, last_name, middle_name)")
    .order("created_at", { ascending: false })

  return (
    <>
      <PageHeader
        title="Disciplinary Cases"
        description="Manage and review disciplinary cases"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <DisciplinaryView
          cases={cases ?? []}
          userTier={session.appUser.tier}
        />
      </div>
    </>
  )
}
