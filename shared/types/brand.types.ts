export interface IBrand {
  _id: string
  userId: string
  name: string
  website: string
  industry: string
  competitors: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateBrandDto {
  name: string
  website: string
  industry: string
  competitors?: string[]
}
