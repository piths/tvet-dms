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
  PanelLeft,
  GraduationCapIcon,
  ArrowRightLeftIcon,
  ClipboardListIcon,
  MapPinIcon,
  ShieldAlertIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
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
  const { toggleSidebar } = useSidebar()

  // Build nav items in groups based on permissions
  const overviewItems: NavItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon, permission: "dashboard.view" },
  ]

  const dataItems: NavItem[] = [
    { title: "Institutions", url: "/institutions", icon: Building2, permission: "enrolment.view" },
    { title: "Staff Registry", url: "/staff-registry", icon: UsersIcon, permission: "staff.view" },
    { title: "Counties", url: "/counties", icon: MapPinIcon, permission: "dashboard.view" },
  ]

  const hrItems: NavItem[] = [
    { title: "Transfers", url: "/transfers", icon: ArrowRightLeftIcon, permission: "transfer.endorse" },
    { title: "Recruitment", url: "/recruitment", icon: BriefcaseIcon, permission: "staff.edit" },
    { title: "Promotions", url: "/promotions", icon: TrendingUpIcon, permission: "staff.view" },
  ]

  const complianceItems: NavItem[] = [
    { title: "Returns", url: "/returns", icon: ClipboardListIcon, permission: "return.view" },
    { title: "Disciplinary", url: "/disciplinary", icon: ShieldAlertIcon, permission: "disciplinary.view" },
    { title: "Quality Assurance", url: "/quality-assurance", icon: ShieldCheckIcon, permission: "dashboard.view" },
  ]

  const reportItems: NavItem[] = [
    { title: "Reports", url: "/reports", icon: BarChartIcon, permission: "dashboard.view" },
  ]

  function filterItems(items: NavItem[]) {
    return items.filter((item) => {
      if (!item.permission) return true
      if (item.url === "/transfers") {
        return has("transfer.endorse") || has("transfer.review") || has("transfer.approve")
      }
      return has(item.permission)
    })
  }

  const groups = [
    { label: "Overview", items: filterItems(overviewItems) },
    { label: "Data", items: filterItems(dataItems) },
    { label: "HR Management", items: filterItems(hrItems) },
    { label: "Compliance", items: filterItems(complianceItems) },
    { label: "Reporting", items: filterItems(reportItems) },
  ].filter((g) => g.items.length > 0)

  const navSecondary = [
    { title: "Settings", url: "/settings", icon: SettingsIcon },
    { title: "Help", url: "#", icon: CircleHelpIcon },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between">
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5 flex-1"
              >
                <a href="/dashboard">
                  <GraduationCapIcon className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-none">TVET DMS</span>
                    <span className="text-[10px] text-sidebar-foreground/60 leading-tight">State Department for TVET</span>
                  </div>
                </a>
              </SidebarMenuButton>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 shrink-0"
              >
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <NavMain key={group.label} items={group.items} label={group.label} />
        ))}
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
