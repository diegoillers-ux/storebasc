export function createManualBookingRequest(payload: unknown, proof?: File | null) {
  const body = new FormData()
  body.append('payload', JSON.stringify(payload))
  if (proof) body.append('proof', proof)

  // Let fetch set the multipart boundary; an explicit Content-Type breaks parsing.
  return { method: 'POST' as const, body }
}
