"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2Icon, CircleIcon, XIcon, ArrowRightIcon } from "lucide-react"

interface ChecklistItem {
  id: string
  label: string
  description: string
  complete: boolean
  href: string
}

interface Props {
  items: ChecklistItem[]
  institutionName: string
}

export function OnboardingChecklist({ items, institutionName }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const completed = items.filter(i => i.complete).length
  const total = items.length
  const pct = Math.round((completed / total) * 100)

  if (pct === 100) return null // All done, hide

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Setup Checklist</CardTitle>
            <CardDescription>
              Complete these steps to get {institutionName} fully onboarded
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDismissed(true)}>
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Progress value={pct} className="h-2 flex-1" />
          <span className="text-xs font-medium tabular-nums">{pct}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link key={item.id} href={item.href}>
            <div className={`flex items-center gap-3 rounded-md p-2 transition-colors ${item.complete ? "opacity-60" : "hover:bg-primary/5"}`}>
              {item.complete ? (
                <CheckCircle2Icon className="h-4 w-4 text-green-600 shrink-0" />
              ) : (
                <CircleIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.complete ? "line-through text-muted-foreground" : "font-medium"}`}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
              {!item.complete && <ArrowRightIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
