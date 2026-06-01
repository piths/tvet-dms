"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DownloadIcon, FileSpreadsheetIcon, PackageIcon } from "lucide-react"

export function ReportsView() {
  const [exporting, setExporting] = useState<string | null>(null)

  async function handleExport(type: string) {
    setExporting(type)
    try {
      const res = await fetch(`/api/reports/export?type=${type}`)
      if (!res.ok) {
        toast.error("Export failed")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tvet-dms-${type}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${type} export generated`)
    } catch {
      toast.error("Export failed")
    }
    setExporting(null)
  }

  async function handleKemisExport() {
    setExporting("kemis")
    try {
      const res = await fetch("/api/reports/kemis-export")
      if (!res.ok) {
        toast.error("KEMIS export failed")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `kemis-export-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("KEMIS export package generated")
    } catch {
      toast.error("KEMIS export failed")
    }
    setExporting(null)
  }

  const reports = [
    { id: "enrolment", title: "Enrolment Summary", description: "Enrolment data by institution, programme, and gender", icon: FileSpreadsheetIcon },
    { id: "staffing", title: "Staffing Report", description: "Staff register by institution, category, and qualification", icon: FileSpreadsheetIcon },
    { id: "finance", title: "Financial Summary", description: "Capitation and budget data by institution and period", icon: FileSpreadsheetIcon },
    { id: "returns", title: "Returns Compliance", description: "Return submission status across all institutions", icon: FileSpreadsheetIcon },
  ]

  return (
    <div className="space-y-6">
      {/* KEMIS Export — prominent */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <PackageIcon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Export to KEMIS</CardTitle>
              <CardDescription>
                Generate a KEMIS-compatible data package for the current cycle
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={handleKemisExport} disabled={exporting === "kemis"}>
            <DownloadIcon className="mr-1.5 h-4 w-4" />
            {exporting === "kemis" ? "Generating..." : "Generate KEMIS Export"}
          </Button>
        </CardContent>
      </Card>

      {/* Individual Reports */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <report.icon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">{report.title}</CardTitle>
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(report.id)}
                disabled={exporting === report.id}
              >
                <DownloadIcon className="mr-1.5 h-3.5 w-3.5" />
                {exporting === report.id ? "Exporting..." : "Download CSV"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
