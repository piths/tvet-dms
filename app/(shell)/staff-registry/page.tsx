import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { StaffRegistryView } from "@/components/staff/staff-registry-view"

export default async function StaffRegistryPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const { data: staff } = await supabase
    .from("staff")
    .select("*, institution:institution_id(name, county_id), county:county_id(name)")
    .order("last_name")

  const { data: counties } = await supabase.from("county").select("id, name").order("name")
  const { data: institutions } = await supabase.from("institution").select("id, name").eq("is_active", true).order("name")

  const totalStaff = (staff ?? []).length
  const trainers = (staff ?? []).filter((s) => s.category === "trainer").length
  const nonTeaching = (staff ?? []).filter((s) => s.category === "non_teaching").length

  return (
    <>
      <PageHeader
        title="Staff Registry"
        description="National Trainer Register"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <StaffRegistryView
          staff={staff ?? []}
          counties={counties ?? []}
          institutions={institutions ?? []}
          summary={{ totalStaff, trainers, nonTeaching }}
        />
      </div>
    </>
  )
}
