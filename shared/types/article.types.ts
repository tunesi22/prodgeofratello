import type { ArticleFormat, ArticleStatus } from '../constants'

export interface IArticle {
  _id: string
  brandId: string
  promptId: string
  title: string
  content: string
  format: ArticleFormat
  status: ArticleStatus
  generatedAt: Date
}

export interface GenerateArticleDto {
  brandId: string
  promptId: string
  format?: ArticleFormat
}
