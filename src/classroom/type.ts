export interface TimeslotWithAssignments {
  id: number
  label: string
  sortOrder: number
  assignments: {
    monday: { teacher: { id: number; name: string; code: string } | null }
    tuesday: { teacher: { id: number; name: string; code: string } | null }
    wednesday: { teacher: { id: number; name: string; code: string } | null }
    thursday: { teacher: { id: number; name: string; code: string } | null }
    friday: { teacher: { id: number; name: string; code: string } | null }
    saturday: { teacher: { id: number; name: string; code: string } | null }
  }
}
