"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MinistryCharts } from "@/components/ministry/charts"
import { Building2Icon, GraduationCapIcon, UsersIcon, BanknoteIcon } from "lucide-react"
import { INSTITUTION_TYPE_LABELS } from "@/lib/types"
import type { InstitutionType } from "@/lib/types"

interface Props {
  county: any
  institutions: any[]
  summary: { totalEnrolment: number; totalTrainers: number; totalCapitation: number; institutionCount: number }
  chartData: Array<{ name: string; male: number; female: number; pwd: number }>
}

export function CountyDetail({ county, institutions, summary, chartData }: Props) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Building2Icon className="h-3.5 w-3.5" /> Institutions
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">{summary.institutionCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <GraduationCapIcon className="h-3.5 w-3.5" /> Enrolment
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">{summary.totalEnrolment.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <UsersIcon className="h-3.5 w-3.5" /> Trainers
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">{summary.totalTrainers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <BanknoteIcon className="h-3.5 w-3.5" /> Capitation Received
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">KES {(summary.totalCapitation / 1e6).toFixed(2)}M</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && <MinistryCharts data={chartData} />}

      {/* Institutions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Institutions in {county.name}</CardTitle>
          <CardDescription>{institutions.length} institutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Accreditation</TableHead>
                  <TableHead>Registration No.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutions.map((inst: any) => (
                  <TableRow key={inst.id}>
                    <TableCell>
                      <Link href={`/institutions/${inst.id}`} className="font-medium text-primary hover:underline">
                        {inst.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {INSTITUTION_TYPE_LABELS[inst.type as InstitutionType] ?? inst.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{inst.accreditation_status ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{inst.registration_no ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
