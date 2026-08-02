import type { PricingType } from '~/domain/mitra'
import type { Product } from '~/domain/product'

export interface ProductPrice {
  id: number
  product_id: number
  branch_id?: number
  pricing_type: PricingType
  duration: number
  price: number | string
  start_at?: string | null
  end_at?: string | null
  is_active: boolean
  product?: Pick<Product, 'id' | 'name' | 'sku' | 'default_pricing_type'> | null
  created_at?: string
  updated_at?: string
}

export interface ProductPricePayload {
  product_id: number
  pricing_type: PricingType
  duration: number
  price: number
  start_at: string | null
  end_at: string | null
  is_active: boolean
}

export interface PricingCollection<T> {
  data: T[]
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

export type PricingCollectionPayload<T> = T[] | PricingCollection<T>
