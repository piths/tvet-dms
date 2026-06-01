"use client"

import { createContext, useContext } from "react"
import type { SessionUser, PermissionCode } from "@/lib/types"

const SessionContext = createContext<SessionUser | null>(null)

export function SessionProvider({
  session,
  children,
}: {
  session: SessionUser
  children: React.ReactNode
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionUser {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return ctx
}

/**
 * Permission-based UI gating. Use permission codes, not tier, for action visibility.
 */
export function usePermissions() {
  const session = useSession()
  return {
    has: (code: PermissionCode) => session.permissions.includes(code),
    hasAny: (...codes: PermissionCode[]) =>
      codes.some((c) => session.permissions.includes(c)),
    permissions: session.permissions,
    tier: session.appUser.tier,
  }
}
