import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { DashboardView } from "@/components/ministry/dashboard-view"
import { ActivityFeed } from "@/components/ministry/activity-feed"

export default async function DashboardPage() {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const supabase = await createClient()

  const [
    { data: enrolments },
    { data: staff },
    { data: financials },
    { data: institutions },
    { data: counties },
    { data: openCycle },
    { data: returns },
    { data: transfers },
    { data: infrastructure },
    { data: auditEvents },
  ] = await Promise.all([
    supabase.from("enrolment").select("*, programme:programme_id(name), institution:institution_id(name)"),
    supabase.from("staff").select("*, institution:institution_id(name)"),
    supabase.from("financial_record").select("*, institution:institution_id(name)"),
    supabase.from("institution").select("*, county:county_id(name)").eq("is_active", true),
    supabase.from("county").select("*"),
    supabase.from("return_cycle").select("*").eq("is_open", true).limit(1).single(),
    supabase
      .from("institution_return")
      .select("*, institution:institution_id(name, type), return_cycle:cycle_id(name, period)")
      .order("submitted_at", { ascending: false, nullsFirst: false }),
    supabase.from("transfer_application").select("id, status, created_at"),
    supabase.from("infrastructure").select("id, item_type, condition, institution_id"),
    supabase.from("audit_event").select("id, actor_name, action, entity_type, created_at").order("created_at", { ascending: false }).limit(15),
  ])

  return (
    <>
      <PageHeader
        title="National Overview"
        description={`Ministry KPI Dashboard — ${openCycle?.name ?? "At Your Fingertips"}`}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <DashboardView
          enrolments={enrolments ?? []}
          staff={staff ?? []}
          financials={financials ?? []}
          institutions={institutions ?? []}
          counties={counties ?? []}
          returns={returns ?? []}
          transfers={transfers ?? []}
          infrastructure={infrastructure ?? []}
          openCycle={openCycle}
        />
        <ActivityFeed events={auditEvents ?? []} />
      </div>
    </>
  )
}
