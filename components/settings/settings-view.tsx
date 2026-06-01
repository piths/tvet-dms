"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SessionUser } from "@/lib/types"

export function SettingsView({ session }: { session: SessionUser }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Full Name</dt>
            <dd className="font-medium">{session.appUser.full_name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="font-medium">{session.appUser.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Phone</dt>
            <dd className="font-medium">{session.appUser.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Designation</dt>
            <dd className="font-medium">{session.appUser.designation ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Tier</dt>
            <dd><Badge variant="secondary">{session.appUser.tier}</Badge></dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Roles</dt>
            <dd className="flex flex-wrap gap-1">
              {session.roles.map((r) => (
                <Badge key={r} variant="outline">{r}</Badge>
              ))}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
