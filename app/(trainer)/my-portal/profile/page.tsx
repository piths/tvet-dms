import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrainerProfile } from "@/components/trainer/profile"
import { StaffDocuments } from "@/components/staff/staff-documents"

export default async function TrainerProfilePage() {
  const session = await getSessionUser()
  if (!session || !session.appUser.staff_id) redirect("/login")

  const supabase = await createClient()
  const staffId = session.appUser.staff_id

  const [{ data: staffRecord }, { data: documents }] = await Promise.all([
    supabase.from("staff").select("*, institution:institution_id(name)").eq("id", staffId).single(),
    supabase.from("staff_document").select("*").eq("staff_id", staffId).order("created_at", { ascending: false }),
  ])

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your personal and employment records"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="documents">
              Documents ({(documents ?? []).length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <TrainerProfile staff={staffRecord} />
          </TabsContent>
          <TabsContent value="documents">
            <StaffDocuments
              documents={documents ?? []}
              staffId={staffId}
              canUpload={true}
              canVerify={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
