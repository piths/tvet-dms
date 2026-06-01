import { createAdminClient } from '@/lib/supabase/admin'

interface NotifyParams {
  recipientEmail: string
  recipientUserId?: string | null
  subject: string
  body: string
  triggerType: string
  entityType?: string
  entityId?: string | null
}

/**
 * Logs a notification to notification_log.
 * Actual email delivery is a separate concern — this proves the system knows when to notify.
 */
export async function logNotification({
  recipientEmail,
  recipientUserId,
  subject,
  body,
  triggerType,
  entityType,
  entityId,
}: NotifyParams): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('notification_log').insert({
    recipient_email: recipientEmail,
    recipient_user_id: recipientUserId ?? null,
    subject,
    body,
    trigger_type: triggerType,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    status: 'pending',
  })
  if (error) {
    console.error('[notify] failed to log notification:', error.message)
  }
}

/**
 * Helper to find the relevant user to notify based on role/scope.
 */
export async function findRecipient(tier: string, countyId?: number | null, institutionId?: string | null): Promise<{ email: string; id: string } | null> {
  const admin = createAdminClient()

  let query = admin.from('app_user').select('id, email').eq('is_active', true)

  if (tier === 'county' && countyId) {
    query = query.eq('tier', 'county').eq('county_id', countyId)
  } else if (tier === 'institution' && institutionId) {
    query = query.eq('tier', 'institution').eq('institution_id', institutionId)
  } else if (tier === 'ministry') {
    query = query.eq('tier', 'ministry')
  }

  const { data } = await query.limit(1).single()
  if (data && data.email) return { email: data.email, id: data.id }
  return null
}
