/**
 * Kenya TVET Period System
 *
 * Academic Terms (3 per calendar year):
 *   Term 1: January – April
 *   Term 2: May – August
 *   Term 3: September – December
 *
 * Financial Year (July 1 – June 30):
 *   FY 2025/26 = July 2025 – June 2026
 *
 * Fiscal Quarters (aligned to FY):
 *   Q1: July – September
 *   Q2: October – December
 *   Q3: January – March
 *   Q4: April – June
 */

export type PeriodType = 'term' | 'quarter' | 'financial_year'

export interface Period {
  code: string       // e.g. "2026-T1", "FY2025/26-Q1", "FY2025/26"
  label: string      // e.g. "Term 1 2026", "Q1 FY 2025/26", "FY 2025/26"
  type: PeriodType
  startMonth: number // 1-indexed
  endMonth: number
  year: number       // calendar year of start
}

/**
 * Generate all academic terms for a given calendar year.
 */
export function getTermsForYear(year: number): Period[] {
  return [
    {
      code: `${year}-T1`,
      label: `Term 1 ${year}`,
      type: 'term',
      startMonth: 1,
      endMonth: 4,
      year,
    },
    {
      code: `${year}-T2`,
      label: `Term 2 ${year}`,
      type: 'term',
      startMonth: 5,
      endMonth: 8,
      year,
    },
    {
      code: `${year}-T3`,
      label: `Term 3 ${year}`,
      type: 'term',
      startMonth: 9,
      endMonth: 12,
      year,
    },
  ]
}

/**
 * Generate fiscal quarters for a given financial year.
 * FY 2025/26 starts July 2025, ends June 2026.
 */
export function getQuartersForFY(startYear: number): Period[] {
  const fy = `FY${startYear}/${(startYear + 1).toString().slice(-2)}`
  return [
    {
      code: `${fy}-Q1`,
      label: `Q1 ${fy} (Jul–Sep)`,
      type: 'quarter',
      startMonth: 7,
      endMonth: 9,
      year: startYear,
    },
    {
      code: `${fy}-Q2`,
      label: `Q2 ${fy} (Oct–Dec)`,
      type: 'quarter',
      startMonth: 10,
      endMonth: 12,
      year: startYear,
    },
    {
      code: `${fy}-Q3`,
      label: `Q3 ${fy} (Jan–Mar)`,
      type: 'quarter',
      startMonth: 1,
      endMonth: 3,
      year: startYear + 1,
    },
    {
      code: `${fy}-Q4`,
      label: `Q4 ${fy} (Apr–Jun)`,
      type: 'quarter',
      startMonth: 4,
      endMonth: 6,
      year: startYear + 1,
    },
  ]
}

/**
 * Get the financial year period.
 */
export function getFinancialYear(startYear: number): Period {
  return {
    code: `FY${startYear}/${(startYear + 1).toString().slice(-2)}`,
    label: `FY ${startYear}/${startYear + 1}`,
    type: 'financial_year',
    startMonth: 7,
    endMonth: 6,
    year: startYear,
  }
}

/**
 * Get the current academic term based on today's date.
 */
export function getCurrentTerm(): Period {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  if (month >= 1 && month <= 4) return getTermsForYear(year)[0]
  if (month >= 5 && month <= 8) return getTermsForYear(year)[1]
  return getTermsForYear(year)[2]
}

/**
 * Get the current fiscal quarter based on today's date.
 */
export function getCurrentQuarter(): Period {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // FY starts in July
  const fyStart = month >= 7 ? year : year - 1
  const quarters = getQuartersForFY(fyStart)

  if (month >= 7 && month <= 9) return quarters[0]
  if (month >= 10 && month <= 12) return quarters[1]
  if (month >= 1 && month <= 3) return quarters[2]
  return quarters[3]
}

/**
 * Get the current financial year.
 */
export function getCurrentFY(): Period {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const fyStart = month >= 7 ? year : year - 1
  return getFinancialYear(fyStart)
}

/**
 * Get all available periods for selection (recent terms + quarters + FY).
 */
export function getAllPeriods(): { terms: Period[]; quarters: Period[]; financialYears: Period[] } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const fyStart = month >= 7 ? year : year - 1

  return {
    terms: [
      ...getTermsForYear(year - 1),
      ...getTermsForYear(year),
    ],
    quarters: [
      ...getQuartersForFY(fyStart - 1),
      ...getQuartersForFY(fyStart),
    ],
    financialYears: [
      getFinancialYear(fyStart - 1),
      getFinancialYear(fyStart),
    ],
  }
}

/**
 * Map a period code to its date range for filtering.
 */
export function periodToDateRange(period: Period): { start: Date; end: Date } {
  if (period.type === 'financial_year') {
    return {
      start: new Date(period.year, 6, 1), // July 1
      end: new Date(period.year + 1, 5, 30), // June 30
    }
  }

  const startYear = period.type === 'quarter' && period.startMonth >= 7
    ? period.year
    : period.year

  return {
    start: new Date(startYear, period.startMonth - 1, 1),
    end: new Date(
      period.endMonth === 12 ? startYear : (period.startMonth > period.endMonth ? startYear + 1 : startYear),
      period.endMonth % 12,
      0
    ),
  }
}
