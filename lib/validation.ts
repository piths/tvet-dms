/**
 * Business rule validation for TVET DMS forms.
 * Returns an array of error messages. Empty = valid.
 */

export interface ValidationError {
  field: string
  message: string
}

export function validateEnrolment(data: {
  male_count: number
  female_count: number
  pwd_count: number
  dropout_count: number
  graduated_count: number
}): ValidationError[] {
  const errors: ValidationError[] = []
  const total = data.male_count + data.female_count

  if (data.male_count < 0) errors.push({ field: "male_count", message: "Male count cannot be negative" })
  if (data.female_count < 0) errors.push({ field: "female_count", message: "Female count cannot be negative" })
  if (data.pwd_count < 0) errors.push({ field: "pwd_count", message: "PWD count cannot be negative" })
  if (data.dropout_count < 0) errors.push({ field: "dropout_count", message: "Dropout count cannot be negative" })
  if (data.graduated_count < 0) errors.push({ field: "graduated_count", message: "Graduated count cannot be negative" })
  if (data.pwd_count > total) errors.push({ field: "pwd_count", message: "PWD count cannot exceed total enrolment" })
  if (data.dropout_count + data.graduated_count > total) {
    errors.push({ field: "dropout_count", message: "Dropouts + graduated cannot exceed total enrolment" })
  }

  return errors
}

export function validateFinancialRecord(data: {
  capitation_expected: number
  capitation_received: number
  budget_allocated: number
  expenditure: number
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (data.capitation_expected < 0) errors.push({ field: "capitation_expected", message: "Cannot be negative" })
  if (data.capitation_received < 0) errors.push({ field: "capitation_received", message: "Cannot be negative" })
  if (data.budget_allocated < 0) errors.push({ field: "budget_allocated", message: "Cannot be negative" })
  if (data.expenditure < 0) errors.push({ field: "expenditure", message: "Cannot be negative" })
  if (data.capitation_received > data.capitation_expected) {
    errors.push({ field: "capitation_received", message: "Received cannot exceed expected capitation" })
  }
  // Soft warning for overspend (not a hard block)
  // if (data.expenditure > data.budget_allocated) { ... }

  return errors
}

export function validateTransfer(data: {
  from_institution_id: string
  to_institution_id: string
  staff_has_active_case?: boolean
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (data.from_institution_id === data.to_institution_id) {
    errors.push({ field: "to_institution_id", message: "Cannot transfer to the same institution" })
  }
  if (data.staff_has_active_case) {
    errors.push({ field: "staff_id", message: "Warning: This trainer has an active disciplinary case" })
  }

  return errors
}

export function validateRecruitment(data: {
  closing_date: string | null
  positions_available: number
  status: string
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (data.status === "advertised" && data.closing_date) {
    const closing = new Date(data.closing_date)
    if (closing <= new Date()) {
      errors.push({ field: "closing_date", message: "Closing date must be in the future when advertising" })
    }
  }
  if (data.positions_available < 1) {
    errors.push({ field: "positions_available", message: "Must have at least 1 position available" })
  }

  return errors
}

export function validateStaffQualification(data: {
  job_group: string | null
  qualification_level: string | null
}): ValidationError[] {
  const errors: ValidationError[] = []

  // Job group K+ requires at least a degree
  const degreeRequired = ["K", "L", "M", "N", "P", "Q"]
  const degreeQualifications = ["Bachelors", "Masters", "PhD", "Doctorate"]

  if (
    data.job_group &&
    degreeRequired.includes(data.job_group) &&
    data.qualification_level &&
    !degreeQualifications.some(q => data.qualification_level!.toLowerCase().includes(q.toLowerCase()))
  ) {
    errors.push({
      field: "qualification_level",
      message: `Job Group ${data.job_group} typically requires at least a degree qualification`,
    })
  }

  return errors
}
