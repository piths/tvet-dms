import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"
import { SessionProvider } from "@/components/session-provider"
import { TrainerSidebar } from "@/components/trainer/trainer-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

/**
 * Isolated layout for the trainer self-service portal.
 * Only trainers can access this — other tiers are redirected to /dashboard.
 */
export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  // Only trainers belong here
  if (session.appUser.tier !== "trainer") redirect("/dashboard")

  return (
    <SessionProvider session={session}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <TrainerSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
      <Toaster />
    </SessionProvider>
  )
}
