export interface Table {
  id: string
  tenantId: string
  number: string
  capacity: number
  status: "free" | "occupied" | "reserved"
  label: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTableInput {
  number: string
  capacity: number
  status?: "free" | "occupied" | "reserved"
  label?: string
}

export interface UpdateTableInput {
  number?: string
  capacity?: number
  status?: "free" | "occupied" | "reserved"
  label?: string
}
