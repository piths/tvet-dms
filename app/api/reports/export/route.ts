import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  const supabase = await createClient()
  let csv = ""

  switch (type) {
    case "enrolment": {
      const { data } = await supabase
        .from("enrolment")
        .select("*, programme:programme_id(name), institution:institution_id(name)")
        .order("institution_id")
      csv = "Institution,Programme,Period,Male,Female,PWD,Dropouts,Graduated,Total\n"
      for (const row of data ?? []) {
        const total = (row.male_count || 0) + (row.female_count || 0)
        csv += `"${row.institution?.name ?? ""}","${row.programme?.name ?? ""}","${row.period}",${row.male_count},${row.female_count},${row.pwd_count},${row.dropout_count},${row.graduated_count},${total}\n`
      }
      break
    }
    case "staffing": {
      const { data } = await supabase
        .from("staff")
        .select("*, institution:institution_id(name), county:county_id(name)")
        .order("last_name")
      csv = "Name,Employee No,TSC No,Institution,County,Category,Job Group,Qualification,Employment Type,Status\n"
      for (const row of data ?? []) {
        const name = [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ")
        csv += `"${name}","${row.employee_number ?? ""}","${row.tsc_number ?? ""}","${row.institution?.name ?? ""}","${row.county?.name ?? ""}","${row.category}","${row.job_group ?? ""}","${row.qualification_level ?? ""}","${row.employment_type ?? ""}","${row.status ?? ""}"\n`
      }
      break
    }
    case "finance": {
      const { data } = await supabase
        .from("financial_record")
        .select("*, institution:institution_id(name)")
        .order("institution_id")
      csv = "Institution,Period,Capitation Expected,Capitation Received,Budget Allocated,Expenditure,Disbursement Status\n"
      for (const row of data ?? []) {
        csv += `"${row.institution?.name ?? ""}","${row.period}",${row.capitation_expected},${row.capitation_received},${row.budget_allocated},${row.expenditure},"${row.disbursement_status ?? ""}"\n`
      }
      break
    }
    case "returns": {
      const { data } = await supabase
        .from("institution_return")
        .select("*, institution:institution_id(name), return_cycle:cycle_id(name, period)")
        .order("submitted_at", { ascending: false, nullsFirst: false })
      csv = "Institution,Cycle,Period,Status,Submitted At,Verified At\n"
      for (const row of data ?? []) {
        csv += `"${row.institution?.name ?? ""}","${row.return_cycle?.name ?? ""}","${row.return_cycle?.period ?? ""}","${row.status}","${row.submitted_at ?? ""}","${row.verified_at ?? ""}"\n`
      }
      break
    }
    default:
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="tvet-dms-${type}.csv"`,
    },
  })
}
