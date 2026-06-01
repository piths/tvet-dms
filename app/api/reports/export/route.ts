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
    case "recruitment": {
      const { data } = await supabase
        .from("recruitment")
        .select("*, institution:institution_id(name), applicants:recruitment_applicant(id, status)")
        .order("created_at", { ascending: false })
      csv = "Institution,Vacancy,Job Group,Positions,Applications,Shortlisted,Appointed,Status,Closing Date\n"
      for (const row of data ?? []) {
        const apps = row.applicants ?? []
        csv += `"${row.institution?.name ?? ""}","${row.title}","${row.job_group ?? ""}",${row.positions_available},${apps.length},${apps.filter((a: any) => a.status === "shortlisted").length},${apps.filter((a: any) => a.status === "appointed").length},"${row.status}","${row.closing_date ?? ""}"\n`
      }
      break
    }
    case "promotions": {
      const { data } = await supabase
        .from("promotion")
        .select("*, staff:staff_id(first_name, last_name), institution:institution_id(name)")
        .order("created_at", { ascending: false })
      csv = "Trainer,Institution,From Group,To Group,Years in Grade,Basis,Status,Effective Date\n"
      for (const row of data ?? []) {
        const name = row.staff ? `${row.staff.first_name} ${row.staff.last_name}` : ""
        csv += `"${name}","${row.institution?.name ?? ""}","${row.from_job_group}","${row.to_job_group}",${row.years_in_grade ?? ""},"${row.basis ?? ""}","${row.status}","${row.effective_date ?? ""}"\n`
      }
      break
    }
    case "disciplinary": {
      const { data } = await supabase
        .from("disciplinary_case")
        .select("*, staff:staff_id(first_name, last_name), institution:institution_id(name)")
        .order("created_at", { ascending: false })
      csv = "Staff,Institution,Case Type,Status,Sanction,Opened,Resolved,Visible to Trainer\n"
      for (const row of data ?? []) {
        const name = row.staff ? `${row.staff.first_name} ${row.staff.last_name}` : ""
        csv += `"${name}","${row.institution?.name ?? ""}","${row.case_type ?? ""}","${row.status}","${row.sanction ?? ""}","${row.opened_at ?? ""}","${row.resolved_at ?? ""}","${row.visible_to_trainer}"\n`
      }
      break
    }
    case "qa": {
      const { data } = await supabase
        .from("qa_assessment")
        .select("*, institution:institution_id(name)")
        .order("assessment_date", { ascending: false })
      csv = "Institution,Category,Title,Assessor,Date,Score,Compliance,Status\n"
      for (const row of data ?? []) {
        csv += `"${row.institution?.name ?? ""}","${row.category}","${row.title}","${row.assessor_name ?? ""}","${row.assessment_date ?? ""}",${row.overall_score ?? ""},"${row.compliance_level ?? ""}","${row.status}"\n`
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
