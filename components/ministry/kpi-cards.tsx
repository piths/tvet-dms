"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  UsersIcon,
  GraduationCapIcon,
  BanknoteIcon,
  ClipboardCheckIcon,
  Building2Icon,
  AccessibilityIcon,
} from "lucide-react"

interface KPIData {
  totalEnrolment: number
  totalMale: number
  totalFemale: number
  totalPWD: number
  totalTrainers: number
  totalStaff: number
  capitationExpected: number
  capitationReceived: number
  returnsSubmissionRate: number
  totalInstitutions: number
  totalCounties: number
}

export function MinistryKPICards({ data }: { data: KPIData }) {
  const capitationPct =
    data.capitationExpected > 0
      ? Math.round((data.capitationReceived / data.capitationExpected) * 100)
      : 0

  const cards = [
    {
      title: "Total Enrolment",
      value: data.totalEnrolment.toLocaleString(),
      description: `${data.totalMale.toLocaleString()} male · ${data.totalFemale.toLocaleString()} female`,
      icon: GraduationCapIcon,
      badge: `${data.totalInstitutions} institutions`,
    },
    {
      title: "PWD Learners",
      value: data.totalPWD.toLocaleString(),
      description: `${data.totalEnrolment > 0 ? ((data.totalPWD / data.totalEnrolment) * 100).toFixed(1) : 0}% of total enrolment`,
      icon: AccessibilityIcon,
      badge: "Inclusion",
    },
    {
      title: "Trainers",
      value: data.totalTrainers.toLocaleString(),
      description: `${data.totalStaff.toLocaleString()} total staff across all institutions`,
      icon: UsersIcon,
      badge: `${data.totalCounties} counties`,
    },
    {
      title: "Capitation",
      value: `KES ${(data.capitationReceived / 1_000_000).toFixed(1)}M`,
      description: `${capitationPct}% of KES ${(data.capitationExpected / 1_000_000).toFixed(1)}M expected`,
      icon: BanknoteIcon,
      badge: capitationPct >= 80 ? "On track" : "Below target",
    },
    {
      title: "Returns Submitted",
      value: `${data.returnsSubmissionRate}%`,
      description: "Institutions that have submitted current returns",
      icon: ClipboardCheckIcon,
      badge: data.returnsSubmissionRate >= 80 ? "Good" : "Needs follow-up",
    },
    {
      title: "Institutions",
      value: data.totalInstitutions.toLocaleString(),
      description: `Across ${data.totalCounties} counties`,
      icon: Building2Icon,
      badge: "Active",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="flex items-center gap-1.5">
                <card.icon className="h-3.5 w-3.5" />
                {card.title}
              </CardDescription>
              <Badge variant="secondary" className="text-xs">
                {card.badge}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {card.value}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            {card.description}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
