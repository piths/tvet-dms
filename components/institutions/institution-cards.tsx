"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { INSTITUTION_TYPE_LABELS } from "@/lib/types"
import type { InstitutionType } from "@/lib/types"
import { SearchIcon } from "lucide-react"

interface EnrichedInstitution {
  id: string
  name: string
  type: InstitutionType
  county_name: string
  accreditation_status: string | null
  total_enrolment: number
  trainer_count: number
  capitation_received: number
  return_status: string | null
}

const typeColors: Record<string, string> = {
  national_polytechnic: "bg-primary/10 text-primary border-primary/20",
  tvc: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  vtc: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  ttc: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  other: "bg-muted text-muted-foreground",
}

const returnDot: Record<string, string> = {
  submitted: "bg-green-500",
  verified: "bg-green-500",
  locked: "bg-green-500",
  draft: "bg-amber-500",
  returned: "bg-red-500",
}

export function InstitutionCards({
  institutions,
}: {
  institutions: EnrichedInstitution[]
}) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filtered = institutions.filter((inst) => {
    const matchesSearch = inst.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || inst.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search institutions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="national_polytechnic">National Polytechnic</SelectItem>
            <SelectItem value="tvc">TVC</SelectItem>
            <SelectItem value="vtc">VTC</SelectItem>
            <SelectItem value="ttc">TTC</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No institutions match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((inst) => (
            <Link key={inst.id} href={`/institutions/${inst.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40 hover:shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      {inst.name}
                    </CardTitle>
                    {inst.return_status && (
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${returnDot[inst.return_status] ?? "bg-gray-400"}`}
                        title={`Return: ${inst.return_status}`}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="outline" className={typeColors[inst.type] ?? ""}>
                      {INSTITUTION_TYPE_LABELS[inst.type]}
                    </Badge>
                    {inst.accreditation_status && (
                      <Badge
                        variant="outline"
                        className={
                          inst.accreditation_status.toLowerCase() === "accredited"
                            ? "border-green-300 text-green-700"
                            : "border-amber-300 text-amber-700"
                        }
                      >
                        {inst.accreditation_status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    {inst.county_name}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      <strong className="text-foreground">{inst.total_enrolment.toLocaleString()}</strong> enrolled
                    </span>
                    <span>
                      <strong className="text-foreground">{inst.trainer_count}</strong> trainers
                    </span>
                    <span>
                      KES <strong className="text-foreground">{(inst.capitation_received / 1_000_000).toFixed(1)}M</strong>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
