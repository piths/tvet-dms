"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface ChartDataItem {
  name: string
  male: number
  female: number
  pwd: number
}

const chartConfig = {
  male: {
    label: "Male",
    color: "oklch(0.45 0.1 200)",
  },
  female: {
    label: "Female",
    color: "oklch(0.6 0.15 330)",
  },
  pwd: {
    label: "PWD",
    color: "oklch(0.65 0.12 80)",
  },
} satisfies ChartConfig

export function MinistryCharts({ data }: { data: ChartDataItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolment by Institution</CardTitle>
        <CardDescription>
          Gender-disaggregated enrolment across institutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <BarChart
            data={data}
            margin={{ left: 0, right: 16, bottom: 60 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-20}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 8 }}
            />
            <Bar
              dataKey="male"
              name="Male"
              fill="var(--color-male)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="female"
              name="Female"
              fill="var(--color-female)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="pwd"
              name="PWD"
              fill="var(--color-pwd)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
