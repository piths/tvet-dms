import { createAdminClient } from '@/lib/supabase/admin'

interface LogAuditParams {
  actorId: string | null
  actorName: string | null
  action: string
  entityType: string
  entityId: string | null
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
}

/**
 * Writes an audit_event using the service-role client.
 * audit_event has no INSERT policy for authenticated users — writes must be privileged.
 */
export async function logAudit({
  actorId,
  actorName,
  action,
  entityType,
  entityId,
  before = null,
  after = null,
}: LogAuditParams): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('audit_event').insert({
    actor_user_id: actorId,
    actor_name: actorName,
    action,
    entity_type: entityType,
    entity_id: entityId,
    before_data: before,
    after_data: after,
  })
  if (error) {
    // Audit failures should not crash the user flow, but must be visible in logs
    console.error('[audit] failed to write audit_event:', error.message)
  }
}
