"use client"

import * as React from "react"
import { Suspense } from "react"
import {
  LayoutDashboardIcon,
  UsersIcon,
  Building2,
  BarChartIcon,
  SettingsIcon,
  CircleHelpIcon,
  GraduationCapIcon,
  ArrowRightLeftIcon,
  ClipboardListIcon,
  MapPinIcon,
  ShieldAlertIcon,
  type LucideIcon,
} from "lucide-react"

import { useSession, usePermissions } from "@/components/session-provider"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
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
import type { PermissionCode } from "@/lib/types"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  permission?: PermissionCode
}

function AppSidebarContent({ ...props }: AppSidebarProps) {
  const session = useSession()
  const { has } = usePermissions()

  // Build nav items based on permissions
  const allItems: NavItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon, permission: "dashboard.view" },
    { title: "Institutions", url: "/institutions", icon: Building2, permission: "enrolment.view" },
    { title: "Returns", url: "/returns", icon: ClipboardListIcon, permission: "return.view" },
    { title: "Transfers", url: "/transfers", icon: ArrowRightLeftIcon, permission: "transfer.endorse" },
    { title: "Staff Registry", url: "/staff-registry", icon: UsersIcon, permission: "staff.view" },
    { title: "Counties", url: "/counties", icon: MapPinIcon, permission: "dashboard.view" },
    { title: "Disciplinary", url: "/disciplinary", icon: ShieldAlertIcon, permission: "disciplinary.view" },
    { title: "Reports", url: "/reports", icon: BarChartIcon, permission: "dashboard.view" },
  ]

  // Also allow transfer.review and transfer.approve to see transfers
  const navItems = allItems.filter((item) => {
    if (!item.permission) return true
    if (item.url === "/transfers") {
      return has("transfer.endorse") || has("transfer.review") || has("transfer.approve")
    }
    return has(item.permission)
  })

  const navSecondary = [
    { title: "Settings", url: "/settings", icon: SettingsIcon },
    { title: "Help", url: "#", icon: CircleHelpIcon },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCapIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">TVET DMS</span>
                  <span className="text-[10px] text-sidebar-foreground/60">Management System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} label="Platform" />
        <NavSecondary items={navSecondary} className="mt-auto" />
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

export function AppSidebar(props: AppSidebarProps) {
  return (
    <Suspense fallback={<div className="w-64 bg-sidebar" />}>
      <AppSidebarContent {...props} />
    </Suspense>
  )
}
