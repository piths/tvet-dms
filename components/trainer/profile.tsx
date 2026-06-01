"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { staffFullName } from "@/lib/types"

interface Props {
  staff: any
}

export function TrainerProfile({ staff }: Props) {
  if (!staff) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No staff record found. Contact your institution administrator.
        </CardContent>
      </Card>
    )
  }

  const fields = [
    { label: "Full Name", value: staffFullName(staff) },
    { label: "Employee Number", value: staff.employee_number ?? "—" },
    { label: "TSC Number", value: staff.tsc_number ?? "—" },
    { label: "CDACC Assessor No.", value: staff.cdacc_assessor_number ?? "—" },
    { label: "Job Group", value: staff.job_group ?? "—" },
    { label: "Qualification Level", value: staff.qualification_level ?? "—" },
    { label: "Designation", value: staff.designation ?? "—" },
    { label: "Employment Type", value: staff.employment_type ?? "—" },
    { label: "Terms of Service", value: staff.terms_of_service ?? "—" },
    { label: "Gender", value: staff.gender ?? "—" },
    { label: "Disability Status", value: staff.disability_status ? "Yes" : "No" },
    { label: "Date Joined", value: staff.date_joined ?? "—" },
    { label: "Current Institution", value: staff.institution?.name ?? "—" },
    { label: "Status", value: staff.status ?? "—" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{staffFullName(staff)}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="secondary">{staff.category}</Badge>
          {staff.job_group && <Badge variant="outline">{staff.job_group}</Badge>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-xs font-medium text-muted-foreground">{field.label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{field.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
