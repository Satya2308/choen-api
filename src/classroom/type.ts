export interface TimeslotWithAssignments {
  id: number
  label: string
  duration: string
  sortOrder: number
  assignments: {
    monday: { teacher: { id: number; code: string } | null }
    tuesday: { teacher: { id: number; code: string } | null }
    wednesday: { teacher: { id: number; code: string } | null }
    thursday: { teacher: { id: number; code: string } | null }
    friday: { teacher: { id: number; code: string } | null }
    saturday: { teacher: { id: number; code: string } | null }
  }
}
