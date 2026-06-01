import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "@/components/ui/sonner"

/**
 * Shared shell layout for all authenticated non-trainer users.
 * Trainers are routed to /my-portal which has its own layout.
 */
export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSessionUser()
  if (!session) redirect("/login")

  // Trainers should not be in this shell — redirect to their portal
  if (session.appUser.tier === "trainer") redirect("/my-portal")

  return (
    <SessionProvider session={session}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "15rem",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
      <Toaster />
    </SessionProvider>
  )
}
