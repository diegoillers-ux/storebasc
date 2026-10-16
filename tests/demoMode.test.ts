import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isDemoMode } from '../src/lib/demoMode'

function withEnv(vars: Record<string, string | undefined>, run: () => void) {
  const saved: Record<string, string | undefined> = {}
  for (const key of Object.keys(vars)) saved[key] = process.env[key]

  try {
    for (const [key, value] of Object.entries(vars)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    run()
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

test('el modo demo falla cerrado en producción aunque la variable pública esté activa', () => {
  withEnv({ NODE_ENV: 'production', NEXT_PUBLIC_DEMO_MODE: 'true' }, () => {
    assert.equal(isDemoMode(), false)
  })
})

test('el modo demo solo se activa fuera de producción y con la variable en true', () => {
  withEnv({ NODE_ENV: 'development', NEXT_PUBLIC_DEMO_MODE: 'true' }, () => {
    assert.equal(isDemoMode(), true)
  })

  withEnv({ NODE_ENV: 'development', NEXT_PUBLIC_DEMO_MODE: 'false' }, () => {
    assert.equal(isDemoMode(), false)
  })

  withEnv({ NODE_ENV: 'production', NEXT_PUBLIC_DEMO_MODE: 'false' }, () => {
    assert.equal(isDemoMode(), false)
  })
})
