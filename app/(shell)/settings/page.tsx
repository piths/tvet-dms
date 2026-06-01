import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { SettingsView } from "@/components/settings/settings-view"

export default async function SettingsPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  return (
    <>
      <PageHeader title="Settings" description="Manage your account" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <SettingsView session={session} />
      </div>
    </>
  )
}
