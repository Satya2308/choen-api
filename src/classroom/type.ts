export interface TimeslotWithAssignments {
  id: number
  label: string
  duration: string
  sortOrder: number
  assignments: {
    monday: { teacher: { id: number; name: string } | null }
    tuesday: { teacher: { id: number; name: string } | null }
    wednesday: { teacher: { id: number; name: string } | null }
    thursday: { teacher: { id: number; name: string } | null }
    friday: { teacher: { id: number; name: string } | null }
    saturday: { teacher: { id: number; name: string } | null }
  }
}
