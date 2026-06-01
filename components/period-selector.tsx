"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getAllPeriods,
  getCurrentTerm,
  getCurrentQuarter,
  getCurrentFY,
  type Period,
} from "@/lib/periods"

interface PeriodSelectorProps {
  value: string
  onChange: (value: string) => void
  showTerms?: boolean
  showQuarters?: boolean
  showFY?: boolean
  className?: string
}

export function PeriodSelector({
  value,
  onChange,
  showTerms = true,
  showQuarters = true,
  showFY = true,
  className,
}: PeriodSelectorProps) {
  const { terms, quarters, financialYears } = getAllPeriods()
  const currentTerm = getCurrentTerm()
  const currentQuarter = getCurrentQuarter()
  const currentFY = getCurrentFY()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? "w-[200px]"}>
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {showTerms && (
          <SelectGroup>
            <SelectLabel>Academic Terms</SelectLabel>
            {terms.map((t) => (
              <SelectItem key={t.code} value={t.code}>
                {t.label}
                {t.code === currentTerm.code ? " (current)" : ""}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {showQuarters && (
          <SelectGroup>
            <SelectLabel>Fiscal Quarters</SelectLabel>
            {quarters.map((q) => (
              <SelectItem key={q.code} value={q.code}>
                {q.label}
                {q.code === currentQuarter.code ? " (current)" : ""}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {showFY && (
          <SelectGroup>
            <SelectLabel>Financial Year</SelectLabel>
            {financialYears.map((fy) => (
              <SelectItem key={fy.code} value={fy.code}>
                {fy.label}
                {fy.code === currentFY.code ? " (current)" : ""}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  )
}
