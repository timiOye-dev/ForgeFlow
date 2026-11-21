import assert from 'node:assert/strict'
import { webcrypto } from 'node:crypto'
import test from 'node:test'

import {
  AUTH_STORAGE_KEYS,
  PASSWORD_HASH_CONFIG,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  createAuthService,
} from './authService.js'
import { DEMO_CREDENTIALS } from '../../mocks/initialData.js'

function createMemoryStorage() {
  const values = new Map()

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

function createTestService(
  storage = createMemoryStorage(),
  cryptoApi = webcrypto
) {
  const service = createAuthService({
    storage,
    crypto: cryptoApi,
    hashConfig: { ...PASSWORD_HASH_CONFIG, iterations: 1000 },
  })

  return { service, storage }
}

function readJson(storage, key) {
  const raw = storage.getItem(key)
  return raw ? JSON.parse(raw) : null
}

function storageContains(storage, value) {
  return Object.values(AUTH_STORAGE_KEYS).some((key) => {
    const raw = storage.getItem(key)
    return Boolean(raw && raw.includes(value))
  })
}

test('uses the agreed PBKDF2 baseline and password length bounds', () => {
  assert.equal(PASSWORD_HASH_CONFIG.algorithm, 'PBKDF2-HMAC-SHA256')
  assert.equal(PASSWORD_HASH_CONFIG.hashFunction, 'SHA-256')
  assert.equal(PASSWORD_HASH_CONFIG.iterations, 600000)
  assert.equal(PASSWORD_MIN_LENGTH, 8)
  assert.equal(PASSWORD_MAX_LENGTH, 128)
})

test('successful registration creates a hashed account and authenticates automatically', async () => {
  const { service, storage } = createTestService()
  const password = 'correct horse battery'

  const result = await service.register({
    name: 'Ada Lovelace',
    email: '  ADA@Example.COM ',
    password,
    confirmPassword: password,
  })

  assert.equal(result.success, true)
  assert.equal(result.user.name, 'Ada Lovelace')
  assert.equal(result.user.email, 'ada@example.com')

  const accounts = readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS)
  const registered = accounts.find(
    (account) => account.email === 'ada@example.com'
  )

  assert.ok(registered)
  assert.equal(registered.passwordHash.algorithm, 'PBKDF2-HMAC-SHA256')
  assert.equal(registered.passwordHash.iterations, 1000)
  assert.equal(storageContains(storage, password), false)
  assert.equal(service.restoreSession().isAuthenticated, true)
})

test('registration rejects mismatched passwords', async () => {
  const { service, storage } = createTestService()

  const result = await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password456',
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'PASSWORDS_MISMATCH')
  assert.equal(storage.getItem(AUTH_STORAGE_KEYS.ACCOUNTS), null)
})

test('registration enforces the 8 to 128 character password bounds', async () => {
  const { service } = createTestService()

  const tooShort = await service.register({
    name: 'Ada Lovelace',
    email: 'short@example.com',
    password: '1234567',
    confirmPassword: '1234567',
  })
  assert.equal(tooShort.success, false)
  assert.equal(tooShort.error.code, 'VALIDATION_ERROR')

  const tooLong = await service.register({
    name: 'Ada Lovelace',
    email: 'long@example.com',
    password: 'a'.repeat(129),
    confirmPassword: 'a'.repeat(129),
  })
  assert.equal(tooLong.success, false)
  assert.equal(tooLong.error.code, 'VALIDATION_ERROR')

  const minimum = await service.register({
    name: 'Ada Lovelace',
    email: 'minimum@example.com',
    password: '12345678',
    confirmPassword: '12345678',
  })
  assert.equal(minimum.success, true)
})

test('registration rejects duplicate normalized emails', async () => {
  const { service, storage } = createTestService()

  await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  const duplicate = await service.register({
    name: 'Another Ada',
    email: '  ADA@EXAMPLE.COM ',
    password: 'password456',
    confirmPassword: 'password456',
  })

  assert.equal(duplicate.success, false)
  assert.equal(duplicate.error.code, 'EMAIL_ALREADY_EXISTS')
  assert.equal(readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS).length, 2)
})

test('registration rejects the seeded demo email', async () => {
  const { service } = createTestService()

  const result = await service.register({
    name: 'Impostor',
    email: DEMO_CREDENTIALS.email.toUpperCase(),
    password: 'password123',
    confirmPassword: 'password123',
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'EMAIL_ALREADY_EXISTS')
})

test('login succeeds with correct credentials after logout', async () => {
  const { service } = createTestService()

  await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })
  service.logout()

  const result = await service.login({
    email: ' ADA@example.com ',
    password: 'password123',
  })

  assert.equal(result.success, true)
  assert.equal(result.user.email, 'ada@example.com')
})

test('login rejects an incorrect password with a generic error', async () => {
  const { service } = createTestService()

  await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })
  service.logout()

  const result = await service.login({
    email: 'ada@example.com',
    password: 'wrongpassword',
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'INVALID_CREDENTIALS')
  assert.equal(result.error.message, 'Invalid email or password.')
  assert.equal(service.restoreSession().isAuthenticated, false)
})

test('login rejects a nonexistent email with the same generic error', async () => {
  const { service } = createTestService()

  const result = await service.login({
    email: 'nobody@example.com',
    password: 'password123',
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'INVALID_CREDENTIALS')
  assert.equal(result.error.message, 'Invalid email or password.')
})

test('a valid session survives a service refresh', async () => {
  const { service, storage } = createTestService()

  const registered = await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  const refreshed = createTestService(storage).service.restoreSession()

  assert.equal(refreshed.isAuthenticated, true)
  assert.equal(refreshed.user.id, registered.user.id)
  assert.equal(refreshed.user.email, 'ada@example.com')
})

test('demo quick sign in uses the dedicated seeded demo account', async () => {
  const { service, storage } = createTestService()

  const result = await service.loginDemo()

  assert.equal(result.success, true)
  assert.equal(result.user.email, DEMO_CREDENTIALS.email)
  assert.equal(result.user.name, 'Timilehin Oye')

  const accounts = readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS)
  const demo = accounts.find(
    (account) => account.email === DEMO_CREDENTIALS.email
  )
  assert.equal(demo.isDemo, true)
  assert.equal(storageContains(storage, DEMO_CREDENTIALS.password), false)
})

test('legacy, malformed, and orphaned sessions do not authenticate', () => {
  const { service, storage } = createTestService()

  storage.setItem(AUTH_STORAGE_KEYS.LEGACY_TOKEN, 'demo-auth-token-xyz')
  assert.equal(service.restoreSession().isAuthenticated, false)
  assert.equal(storage.getItem(AUTH_STORAGE_KEYS.LEGACY_TOKEN), null)

  storage.setItem(AUTH_STORAGE_KEYS.SESSION, 'not-json')
  assert.equal(service.restoreSession().isAuthenticated, false)
  assert.equal(storage.getItem(AUTH_STORAGE_KEYS.SESSION), null)

  storage.setItem(
    AUTH_STORAGE_KEYS.SESSION,
    JSON.stringify({
      version: 1,
      accountId: 'usr_missing',
      issuedAt: Date.now(),
    })
  )
  assert.equal(service.restoreSession().isAuthenticated, false)
  assert.equal(storage.getItem(AUTH_STORAGE_KEYS.SESSION), null)
  assert.equal(storage.getItem(AUTH_STORAGE_KEYS.USER), null)
})

test('logout clears session state but preserves registered accounts', async () => {
  const { service, storage } = createTestService()

  await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  const accountsBeforeLogout = storage.getItem(AUTH_STORAGE_KEYS.ACCOUNTS)
  const result = service.logout()

  assert.equal(result.success, true)
  assert.equal(storage.getItem(AUTH_STORAGE_KEYS.SESSION), null)
  assert.equal(storage.getItem(AUTH_STORAGE_KEYS.USER), null)
  assert.equal(
    storage.getItem(AUTH_STORAGE_KEYS.ACCOUNTS),
    accountsBeforeLogout
  )
  assert.equal(service.restoreSession().isAuthenticated, false)
})

test('profile updates normalize email and keep account lookup synchronized', async () => {
  const { service, storage } = createTestService()

  const registered = await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  const updated = service.updateProfile({
    ...registered.user,
    name: 'Ada Byron',
    email: '  ADA.BYRON@Example.COM ',
    title: 'Countess of Computing',
  })

  assert.equal(updated.success, true)
  assert.equal(updated.user.name, 'Ada Byron')
  assert.equal(updated.user.email, 'ada.byron@example.com')

  const accounts = readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS)
  assert.equal(
    accounts.find((account) => account.id === registered.user.id).email,
    'ada.byron@example.com'
  )

  service.logout()
  const oldEmailLogin = await service.login({
    email: 'ada@example.com',
    password: 'password123',
  })
  const newEmailLogin = await service.login({
    email: 'ada.byron@example.com',
    password: 'password123',
  })

  assert.equal(oldEmailLogin.success, false)
  assert.equal(newEmailLogin.success, true)
})

test('profile email changes reject duplicates', async () => {
  const { service } = createTestService()

  const first = await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })
  service.logout()

  await service.register({
    name: 'Grace Hopper',
    email: 'grace@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  await service.login({ email: 'ada@example.com', password: 'password123' })

  const duplicate = service.updateProfile({
    ...first.user,
    email: 'grace@example.com',
  })

  assert.equal(duplicate.success, false)
  assert.equal(duplicate.error.code, 'EMAIL_ALREADY_EXISTS')
})

test('hashing failures fail closed without plaintext fallback', async () => {
  const { service, storage } = createTestService(createMemoryStorage(), {})

  const result = await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'HASHING_UNAVAILABLE')
  assert.equal(storageContains(storage, 'password123'), false)
})

test('forgot password reports that reset is unavailable in the local demo', () => {
  const { service } = createTestService()

  const result = service.forgotPassword('ada@example.com')

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'PASSWORD_RESET_UNAVAILABLE')
  assert.match(result.error.message, /not available in this local demo/i)
})
