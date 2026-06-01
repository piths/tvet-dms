import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { logAudit } from "@/lib/audit"

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

  return NextResponse.json({ success: true })
}
