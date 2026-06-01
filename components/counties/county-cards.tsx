"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2Icon, GraduationCapIcon, UsersIcon, ClipboardCheckIcon } from "lucide-react"

interface CountyData {
  id: number
  name: string
  code: string | null
  institutionCount: number
  totalEnrolment: number
  trainerCount: number
  returnsSubmitted: number
  returnsTotal: number
}

export function CountyCards({ counties }: { counties: CountyData[] }) {
  if (counties.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No counties found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {counties.map((c) => (
        <Link key={c.id} href={`/counties/${c.id}`}>
          <Card className="h-full transition-colors hover:border-primary/40 hover:shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2Icon className="h-3.5 w-3.5" />
                  <span><strong className="text-foreground">{c.institutionCount}</strong> institutions</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <GraduationCapIcon className="h-3.5 w-3.5" />
                  <span><strong className="text-foreground">{c.totalEnrolment.toLocaleString()}</strong> enrolled</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <UsersIcon className="h-3.5 w-3.5" />
                  <span><strong className="text-foreground">{c.trainerCount}</strong> trainers</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ClipboardCheckIcon className="h-3.5 w-3.5" />
                  <span><strong className="text-foreground">{c.returnsSubmitted}</strong> of {c.returnsTotal} submitted</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
