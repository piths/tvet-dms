"use client"

import { Suspense } from "react"
import {
  UserIcon,
  ArrowRightLeftIcon,
  ShieldAlertIcon,
  SettingsIcon,
  GraduationCapIcon,
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
} from "@/components/ui/sidebar"

function TrainerSidebarContent() {
  const session = useSession()

  const navItems = [
    { title: "My Profile", url: "/my-portal", icon: UserIcon },
    { title: "My Transfers", url: "/my-portal/transfers", icon: ArrowRightLeftIcon },
    { title: "My Cases", url: "/my-portal/cases", icon: ShieldAlertIcon },
    { title: "Settings", url: "/my-portal/settings", icon: SettingsIcon },
  ]

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/my-portal">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCapIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Trainer Portal</span>
                  <span className="text-[10px] text-sidebar-foreground/60">Self-Service</span>
                </div>
              </a>
            </SidebarMenuButton>
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
    <Suspense fallback={<div className="w-60 bg-sidebar" />}>
      <TrainerSidebarContent />
    </Suspense>
  )
}
