import { getDownloadUrl, put } from '@vercel/blob'

export const ALLOWED_PROOF_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf'])
export const MAX_PROOF_SIZE_BYTES = 2 * 1024 * 1024

export async function uploadPaymentProof(file: File, scope: string): Promise<{
  url: string
  buffer: Buffer
}> {
  if (!ALLOWED_PROOF_TYPES.has(file.type)) {
    throw new Error('Formato no permitido. Usa JPG, PNG o PDF.')
  }

  if (file.size > MAX_PROOF_SIZE_BYTES) {
    throw new Error('El comprobante supera 2MB.')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const uploaded = await put(`proofs/${scope}/${Date.now()}-${safeName}`, buffer, {
    access: 'private',
    contentType: file.type,
  })

  return { url: getDownloadUrl(uploaded.url), buffer }
}
