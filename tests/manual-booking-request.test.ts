import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createManualBookingRequest } from '../src/lib/checkout/manual-booking-request'

test('el pago manual usa multipart con boundary generado por fetch', async () => {
  const payload = { serviceId: 'service-1', paymentMethod: 'NEQUI' }
  const request = createManualBookingRequest(payload)
  const httpRequest = new Request('http://localhost/api/bookings/create', request)

  assert.equal(request.method, 'POST')
  assert.equal(request.body.get('payload'), JSON.stringify(payload))
  assert.match(httpRequest.headers.get('content-type') || '', /^multipart\/form-data; boundary=/)
})
