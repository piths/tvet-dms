"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  label = "Platform",
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: number | string
    items?: {
      title: string
      url: string
    }[]
  }[]
  label?: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (url: string, e: React.MouseEvent) => {
    e.preventDefault()
    router.push(url)
  }

  const isItemActive = useCallback(
    (url: string) => {
      if (url === "#") return false
      return pathname === url || pathname.startsWith(url + "/")
    },
    [pathname]
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="sticky top-0 z-10 bg-sidebar">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // If item has sub-items, use collapsible
          if (item.items && item.items.length > 0) {
            const subItems = item.items
            const isActive = item.isActive ?? isItemActive(item.url)
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.badge != null && (
                        <span className="ml-auto mr-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-accent px-1.5 text-[10px] font-semibold tabular-nums text-sidebar-accent-foreground">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isItemActive(subItem.url)}
                          >
                            <a
                              href={subItem.url}
                              onClick={(e) =>
                                handleNavigation(subItem.url, e)
                              }
                            >
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          // If no sub-items, use direct link
          const isActive = item.isActive ?? isItemActive(item.url)
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive}
                asChild
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.badge != null && (
                <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
