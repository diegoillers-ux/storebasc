export type AssetFormat = 'story' | 'post' | 'banner' | 'card'
export type AssetStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED'

export interface GenerateAssetInput {
  entityType: 'service' | 'product'
  entityId: string
  entityName: string
  format: AssetFormat
  style?: string
}

export const ASSET_FORMAT_CONFIG: Record<AssetFormat, { label: string; ratio: string; description: string }> = {
  story: { label: 'Historia', ratio: '9:16', description: 'Instagram / WhatsApp story vertical' },
  post: { label: 'Post cuadrado', ratio: '1:1', description: 'Feed de Instagram' },
  banner: { label: 'Banner', ratio: '16:9', description: 'Portada o encabezado web' },
  card: { label: 'Tarjeta de servicio', ratio: '4:5', description: 'Presentación de servicio o producto' },
}
