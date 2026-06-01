import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { ReportsView } from "@/components/reports/reports-view"

export default async function ReportsPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  return (
    <>
      <PageHeader
        title="Reports"
        description="Export and reporting centre"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <ReportsView />
      </div>
    </>
  )
}
