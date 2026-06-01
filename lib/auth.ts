import { createClient } from '@/lib/supabase/server'
import type { AppUser, SessionUser, PermissionCode } from '@/lib/types'

/**
 * Resolves the current authenticated user's app_user record, roles, and permissions.
 * Uses auth.getUser() (not getSession()) for trust decisions as per security requirements.
 * Returns null if not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient()

  // Trust decision: getUser() validates the JWT with the Supabase auth server
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: appUser, error: appUserError } = await supabase
    .from('app_user')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (appUserError || !appUser) return null

  // Resolve roles + permissions via the RBAC join tables
  const { data: userRoles } = await supabase
    .from('app_user_role')
    .select('role:role_id(id, code, name)')
    .eq('app_user_id', appUser.id)

  const roleCodes = (userRoles ?? [])
    .map((ur: any) => ur.role?.code)
    .filter(Boolean)
  const roleIds = (userRoles ?? [])
    .map((ur: any) => ur.role?.id)
    .filter(Boolean)

  let permissions: string[] = []
  if (roleIds.length > 0) {
    const { data: rolePerms } = await supabase
      .from('role_permission')
      .select('permission:permission_id(code)')
      .in('role_id', roleIds)

    permissions = [
      ...new Set(
        (rolePerms ?? [])
          .map((rp: any) => rp.permission?.code)
          .filter(Boolean)
      ),
    ]
  }

  return {
    appUser: appUser as AppUser,
    permissions,
    roles: roleCodes,
  }
}

/**
 * Returns the landing path for a tier after login.
 * Trainers go to their isolated self-service portal; everyone else to the shared shell.
 */
export function getDashboardPath(tier: string): string {
  if (tier === 'trainer') return '/my-portal'
  return '/dashboard'
}

export function hasPermission(
  session: SessionUser | null,
  code: PermissionCode
): boolean {
  return !!session && session.permissions.includes(code)
}
