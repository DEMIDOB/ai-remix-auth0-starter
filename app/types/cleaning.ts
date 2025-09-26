export type CleanerStatus = 'active' | 'inactive'
export type JobStatus = 'open' | 'scheduled' | 'completed' | 'cancelled'
export type AssignmentStatus = 'scheduled' | 'completed' | 'cancelled'

export type CleanerInput = {
  name: string
  email?: string | null
  phone?: string | null
  status: CleanerStatus
  notes?: string | null
}

export type Cleaner = CleanerInput & {
  id: number
  email: string | null
  phone: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type JobInput = {
  title: string
  clientName?: string | null
  location?: string | null
  description?: string | null
  rate?: number | null
  status: JobStatus
}

export type Job = JobInput & {
  id: number
  clientName: string | null
  location: string | null
  description: string | null
  rate: number | null
  createdAt: Date
  updatedAt: Date
}

export type AssignmentInput = {
  jobId: number
  cleanerId: number
  serviceDate: string
  status: AssignmentStatus
  notes?: string | null
}

export type Assignment = AssignmentInput & {
  id: number
  jobTitle: string
  cleanerName: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
}
