import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  // Fetch all data for KEMIS-compatible export
  const [
    { data: institutions },
    { data: enrolments },
    { data: staff },
    { data: financials },
  ] = await Promise.all([
    supabase.from("institution").select("*, county:county_id(name)").eq("is_active", true),
    supabase.from("enrolment").select("*, programme:programme_id(name), institution:institution_id(name)"),
    supabase.from("staff").select("*, institution:institution_id(name)"),
    supabase.from("financial_record").select("*, institution:institution_id(name)"),
  ])

  // Build a comprehensive KEMIS-format CSV
  let csv = "KEMIS Data Export - TVET DMS\n"
  csv += `Generated: ${new Date().toISOString()}\n\n`

  // Section 1: Institutions
  csv += "=== INSTITUTIONS ===\n"
  csv += "Institution Name,Type,County,Registration No,Accreditation Status\n"
  for (const inst of institutions ?? []) {
    csv += `"${inst.name}","${inst.type}","${inst.county?.name ?? ""}","${inst.registration_no ?? ""}","${inst.accreditation_status ?? ""}"\n`
  }

  // Section 2: Enrolment
  csv += "\n=== ENROLMENT ===\n"
  csv += "Institution,Programme,Period,Male,Female,PWD,Dropouts,Graduated\n"
  for (const e of enrolments ?? []) {
    csv += `"${e.institution?.name ?? ""}","${e.programme?.name ?? ""}","${e.period}",${e.male_count},${e.female_count},${e.pwd_count},${e.dropout_count},${e.graduated_count}\n`
  }

  // Section 3: Staffing
  csv += "\n=== STAFFING ===\n"
  csv += "Institution,Name,Category,Job Group,Qualification,Employment Type\n"
  for (const s of staff ?? []) {
    const name = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ")
    csv += `"${s.institution?.name ?? ""}","${name}","${s.category}","${s.job_group ?? ""}","${s.qualification_level ?? ""}","${s.employment_type ?? ""}"\n`
  }

  // Section 4: Finance
  csv += "\n=== FINANCE ===\n"
  csv += "Institution,Period,Capitation Expected,Capitation Received,Budget,Expenditure\n"
  for (const f of financials ?? []) {
    csv += `"${f.institution?.name ?? ""}","${f.period}",${f.capitation_expected},${f.capitation_received},${f.budget_allocated},${f.expenditure}\n`
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="kemis-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
