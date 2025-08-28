export interface TimeslotWithAssignments {
  id: number
  label: string
  sortOrder: number
  assignments: {
    monday: { classroom: { id: number; name: string } | null }
    tuesday: { classroom: { id: number; name: string } | null }
    wednesday: { classroom: { id: number; name: string } | null }
    thursday: { classroom: { id: number; name: string } | null }
    friday: { classroom: { id: number; name: string } | null }
    saturday: { classroom: { id: number; name: string } | null }
  }
}
