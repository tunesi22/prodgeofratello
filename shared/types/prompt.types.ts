export interface IPrompt {
  _id: string
  brandId: string
  text: string
  category: string
  isActive: boolean
  createdAt: Date
}

export interface CreatePromptDto {
  brandId: string
  text: string
  category: string
}
