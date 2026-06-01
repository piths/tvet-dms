import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { logAudit } from "@/lib/audit"
import { logNotification, findRecipient } from "@/lib/notify"

export async function POST(request: Request) {
  const body = await request.json()
  const { returnId, action, reason, userId, userName } = body

  if (!returnId || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get current state for audit
  const { data: current } = await admin
    .from("institution_return")
    .select("*")
    .eq("id", returnId)
    .single()

  if (!current) {
    return NextResponse.json({ error: "Return not found" }, { status: 404 })
  }

  let update: Record<string, unknown> = {}

  switch (action) {
    case "submit":
      if (current.status !== "draft" && current.status !== "returned") {
        return NextResponse.json({ error: "Can only submit from draft or returned status" }, { status: 400 })
      }
      update = {
        status: "submitted",
        submitted_by: userId,
        submitted_at: new Date().toISOString(),
        returned_reason: null,
      }
      break

    case "verify":
      if (current.status !== "submitted") {
        return NextResponse.json({ error: "Can only verify submitted returns" }, { status: 400 })
      }
      update = {
        status: "verified",
        verified_by: userId,
        verified_at: new Date().toISOString(),
      }
      break

    case "return":
      if (current.status !== "submitted") {
        return NextResponse.json({ error: "Can only return submitted returns" }, { status: 400 })
      }
      if (!reason) {
        return NextResponse.json({ error: "Reason is required" }, { status: 400 })
      }
      update = {
        status: "returned",
        returned_reason: reason,
      }
      break

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const { error } = await admin
    .from("institution_return")
    .update(update)
    .eq("id", returnId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Write audit event
  await logAudit({
    actorId: userId,
    actorName: userName,
    action: `return.${action}`,
    entityType: "institution_return",
    entityId: returnId,
    before: current,
    after: { ...current, ...update },
  })

  // Log notifications
  const admin2 = createAdminClient()
  const { data: inst } = await admin2.from("institution").select("name, county_id").eq("id", current.institution_id).single()

  if (action === "submit" && inst) {
    const county = await findRecipient("county", inst.county_id)
    if (county) {
      await logNotification({
        recipientEmail: county.email,
        recipientUserId: county.id,
        subject: `Return Submitted: ${inst.name}`,
        body: `${inst.name} has submitted their return for verification.`,
        triggerType: "return_submitted",
        entityType: "institution_return",
        entityId: returnId,
      })
    }
  } else if ((action === "verify" || action === "return") && inst) {
    const principal = await findRecipient("institution", null, current.institution_id)
    if (principal) {
      await logNotification({
        recipientEmail: principal.email,
        recipientUserId: principal.id,
        subject: action === "verify" ? `Return Verified: ${inst.name}` : `Return Returned: ${inst.name}`,
        body: action === "verify"
          ? `Your institution's return has been verified by the county.`
          : `Your return has been sent back for correction. Reason: ${reason}`,
        triggerType: action === "verify" ? "return_verified" : "return_returned",
        entityType: "institution_return",
        entityId: returnId,
      })
    }
  }

  return NextResponse.json({ success: true })
}
