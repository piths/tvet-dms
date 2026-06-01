import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { logAudit } from "@/lib/audit"

export async function POST(request: Request) {
  const body = await request.json()
  const { transferId, decision, approverRole, userId, userName, comments } = body

  if (!transferId || !decision || !approverRole) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get current transfer state
  const { data: transfer } = await admin
    .from("transfer_application")
    .select("*")
    .eq("id", transferId)
    .single()

  if (!transfer) {
    return NextResponse.json({ error: "Transfer not found" }, { status: 404 })
  }

  // Determine new status
  let newStatus: string
  if (decision === "rejected") {
    newStatus = "rejected"
  } else {
    switch (approverRole) {
      case "institution":
        newStatus = "institution_endorsed"
        break
      case "county":
        newStatus = "county_reviewed"
        break
      case "ministry":
        newStatus = "approved"
        break
      default:
        return NextResponse.json({ error: "Invalid approver role" }, { status: 400 })
    }
  }

  // Update the existing approval row for this role (created at transfer submission)
  const { error: approvalError } = await admin
    .from("transfer_approval")
    .update({
      approver_user_id: userId,
      approver_name: userName,
      decision,
      comments: comments || null,
      signed_at: new Date().toISOString(),
    })
    .eq("transfer_id", transferId)
    .eq("approver_role", approverRole)

  if (approvalError) {
    // If no existing row, insert one
    await admin.from("transfer_approval").insert({
      transfer_id: transferId,
      approver_role: approverRole,
      approver_user_id: userId,
      approver_name: userName,
      decision,
      comments: comments || null,
      signed_at: new Date().toISOString(),
    })
  }

  // Update transfer status
  const updateData: Record<string, unknown> = { status: newStatus }
  if (newStatus === "approved" || newStatus === "rejected") {
    updateData.decided_at = new Date().toISOString()
    updateData.decision_notes = comments || null
  }

  const { error: updateError } = await admin
    .from("transfer_application")
    .update(updateData)
    .eq("id", transferId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Audit
  await logAudit({
    actorId: userId,
    actorName: userName,
    action: `transfer.${decision}`,
    entityType: "transfer_application",
    entityId: transferId,
    before: transfer,
    after: { ...transfer, ...updateData },
  })

  return NextResponse.json({ success: true })
}
