import { type SchemaTypeDefinition } from 'sanity'
import { productType } from './productType'
import { aboutPageType } from './aboutPageType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [productType, aboutPageType],
}
