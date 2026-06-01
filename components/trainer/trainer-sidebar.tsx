"use client"

import { Suspense } from "react"
import {
  UserIcon,
  ArrowRightLeftIcon,
  ShieldAlertIcon,
  SettingsIcon,
  GraduationCapIcon,
  PanelLeft,
  TrendingUpIcon,
  LayoutDashboardIcon,
} from "lucide-react"

import { useSession } from "@/components/session-provider"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

function TrainerSidebarContent() {
  const session = useSession()
  const { toggleSidebar } = useSidebar()

  const navItems = [
    { title: "Dashboard", url: "/my-portal", icon: LayoutDashboardIcon },
    { title: "My Profile", url: "/my-portal/profile", icon: UserIcon },
    { title: "My Transfers", url: "/my-portal/transfers", icon: ArrowRightLeftIcon },
    { title: "My Promotions", url: "/my-portal/promotions", icon: TrendingUpIcon },
    { title: "My Cases", url: "/my-portal/cases", icon: ShieldAlertIcon },
    { title: "Settings", url: "/my-portal/settings", icon: SettingsIcon },
  ]

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between">
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5 flex-1">
                <a href="/my-portal">
                  <GraduationCapIcon className="h-5 w-5" />
                  <span className="text-base font-semibold">Trainer Portal</span>
                </a>
              </SidebarMenuButton>
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 shrink-0">
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} label="My Portal" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session.appUser.full_name,
            email: session.appUser.email ?? "",
            avatar: session.appUser.image_url ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

export function TrainerSidebar() {
  return (
    <Suspense fallback={<div className="w-64 bg-sidebar" />}>
      <TrainerSidebarContent />
    </Suspense>
  )
}
