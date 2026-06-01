// ─── Enums (match the live database) ────────────────────────────────────────

export type UserTier = 'trainer' | 'institution' | 'county' | 'ministry' | 'admin'

export type InstitutionType =
  | 'national_polytechnic'
  | 'tvc'
  | 'vtc'
  | 'ttc'
  | 'other'

export type StaffCategory = 'trainer' | 'non_teaching' | 'management'

export type ReturnStatus = 'draft' | 'submitted' | 'verified' | 'returned' | 'locked'

export type TransferStatus =
  | 'draft'
  | 'submitted'
  | 'institution_endorsed'
  | 'county_reviewed'
  | 'approved'
  | 'rejected'
  | 'withdrawn'

export type ApproverRole = 'institution' | 'county' | 'ministry'

export type ApproverDecision = 'pending' | 'approved' | 'rejected'

export type DisciplinaryStatus =
  | 'draft'
  | 'under_investigation'
  | 'active'
  | 'resolved'
  | 'dismissed'
  | 'appealed'

// ─── Core tables ──────────────────────────────────────────────────────────────

export interface County {
  id: number
  name: string
  code: string | null
}

export interface Institution {
  id: string
  name: string
  type: InstitutionType
  registration_no: string | null
  county_id: number | null
  sub_county: string | null
  gps_lat: number | null
  gps_lng: number | null
  accreditation_status: string | null
  governance_structure: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Programme {
  id: string
  institution_id: string
  name: string
  cbet_level: number | null
  accreditation_status: string | null
  is_active: boolean
  created_at: string
}

export interface AppUser {
  id: string
  auth_user_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  image_url: string | null
  designation: string | null
  tier: UserTier
  institution_id: string | null
  county_id: number | null
  staff_id: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
}

export interface Enrolment {
  id: string
  institution_id: string
  programme_id: string | null
  cbet_level: number | null
  intake: string | null
  male_count: number
  female_count: number
  pwd_count: number
  dropout_count: number
  graduated_count: number
  period: string
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  institution_id: string
  employee_number: string | null
  tsc_number: string | null
  cdacc_assessor_number: string | null
  first_name: string
  last_name: string
  middle_name: string | null
  gender: string | null
  category: StaffCategory
  designation: string | null
  job_group: string | null
  qualification_level: string | null
  employment_type: string | null
  terms_of_service: string | null
  date_joined: string | null
  status: string | null
  disability_status: boolean
  county_id: number | null
  created_at: string
  updated_at: string
}

export interface FinancialRecord {
  id: string
  institution_id: string
  period: string
  capitation_expected: number
  capitation_received: number
  budget_allocated: number
  expenditure: number
  disbursement_status: string | null
  created_at: string
  updated_at: string
}

export interface Infrastructure {
  id: string
  institution_id: string
  item_type: string
  description: string | null
  condition: string | null
  capacity: number | null
  utilisation_pct: number | null
  created_at: string
}

export interface ReturnCycle {
  id: string
  name: string
  period: string
  opens_at: string | null
  closes_at: string | null
  is_open: boolean
  created_at: string
}

export interface InstitutionReturn {
  id: string
  cycle_id: string
  institution_id: string
  status: ReturnStatus
  submitted_by: string | null
  submitted_at: string | null
  verified_by: string | null
  verified_at: string | null
  returned_reason: string | null
  payload_summary: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface TransferApplication {
  id: string
  reference_no: string | null
  staff_id: string
  from_institution_id: string
  to_institution_id: string
  reason: string | null
  status: TransferStatus
  applied_by: string | null
  applied_at: string
  submitted_at: string | null
  decided_at: string | null
  decision_notes: string | null
  created_at: string
  updated_at: string
}

export interface TransferApproval {
  id: string
  transfer_id: string
  approver_role: ApproverRole
  approver_user_id: string | null
  approver_name: string | null
  decision: ApproverDecision
  comments: string | null
  signed_at: string | null
  created_at: string
}

export interface DisciplinaryCase {
  id: string
  staff_id: string
  institution_id: string
  case_type: string | null
  description: string | null
  status: DisciplinaryStatus
  outcome: string | null
  opened_at: string | null
  resolved_at: string | null
  visible_to_trainer: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AuditEvent {
  id: string
  actor_user_id: string | null
  actor_name: string | null
  action: string
  entity_type: string
  entity_id: string | null
  before_data: Record<string, unknown> | null
  after_data: Record<string, unknown> | null
  created_at: string
}

// ─── RBAC ─────────────────────────────────────────────────────────────────────

export interface Role {
  id: number
  code: string
  name: string
  tier: UserTier
  description: string | null
}

export interface Permission {
  id: number
  code: string
  description: string | null
}

// ─── Session context ──────────────────────────────────────────────────────────

export interface SessionUser {
  appUser: AppUser
  permissions: string[]
  roles: string[]
}

// Permission code union for type-safe gating
export type PermissionCode =
  | 'enrolment.view'
  | 'enrolment.edit'
  | 'staff.view'
  | 'staff.edit'
  | 'finance.view'
  | 'finance.edit'
  | 'infrastructure.view'
  | 'infrastructure.edit'
  | 'return.view'
  | 'return.submit'
  | 'return.verify'
  | 'transfer.apply'
  | 'transfer.endorse'
  | 'transfer.review'
  | 'transfer.approve'
  | 'disciplinary.view'
  | 'disciplinary.edit'
  | 'disciplinary.view_own'
  | 'profile.view_own'
  | 'transfer.view_own'
  | 'dashboard.view'
  | 'export.kemis'
  | 'admin.users'
  | 'admin.cycles'

export function staffFullName(s: Pick<Staff, 'first_name' | 'middle_name' | 'last_name'>): string {
  return [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(' ')
}

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  national_polytechnic: 'National Polytechnic',
  tvc: 'TVC',
  vtc: 'VTC',
  ttc: 'TTC',
  other: 'Other',
}
