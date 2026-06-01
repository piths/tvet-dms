import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckIcon, XIcon, ClockIcon, TrendingUpIcon } from "lucide-react"

export default async function TrainerPromotionsPage() {
  const session = await getSessionUser()
  if (!session || !session.appUser.staff_id) redirect("/login")

  const supabase = await createClient()

  const { data: promotions } = await supabase
    .from("promotion")
    .select("*")
    .eq("staff_id", session.appUser.staff_id)
    .order("created_at", { ascending: false })

  const statusColors: Record<string, string> = {
    recommended: "bg-blue-100 text-blue-800",
    submitted: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    effected: "bg-purple-100 text-purple-800",
  }

  return (
    <>
      <PageHeader title="My Promotions" description="Your career progression records" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        {(!promotions || promotions.length === 0) ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No promotion records found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {promotions.map((p: any) => (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUpIcon className="h-4 w-4 text-primary" />
                      Job Group {p.from_job_group} → {p.to_job_group}
                    </CardTitle>
                    <Badge variant="secondary" className={statusColors[p.status] ?? ""}>
                      {p.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {p.from_designation ?? ""} → {p.to_designation ?? ""} · Basis: {p.basis ?? "—"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    {["recommended", "submitted", "approved", "effected"].map((step) => {
                      const stepOrder = ["recommended", "submitted", "approved", "effected"]
                      const currentIdx = stepOrder.indexOf(p.status)
                      const stepIdx = stepOrder.indexOf(step)
                      const isComplete = stepIdx <= currentIdx && p.status !== "rejected"
                      const isRejected = p.status === "rejected" && step === "approved"

                      return (
                        <div key={step} className="flex items-center gap-1.5">
                          {isRejected ? (
                            <XIcon className="h-4 w-4 text-red-600" />
                          ) : isComplete ? (
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="capitalize text-xs">{step}</span>
                        </div>
                      )
                    })}
                  </div>
                  {p.effective_date && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Effective: {new Date(p.effective_date).toLocaleDateString("en-KE")}
                    </p>
                  )}
                  {p.remarks && (
                    <p className="mt-2 text-xs text-muted-foreground">Remarks: {p.remarks}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
