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

function setStoredTheme(storage, accountId, theme) {
  const accounts = readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS)
  const account = accounts.find((candidate) => candidate.id === accountId)

  if (!account) {
    throw new Error(`Missing test account: ${accountId}`)
  }

  if (theme === undefined) {
    delete account.profile.theme
  } else {
    account.profile.theme = theme
  }

  storage.setItem(AUTH_STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts))
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

test('demo profile email changes are rejected without mutating storage', async () => {
  const { service, storage } = createTestService()

  const demo = await service.loginDemo()
  const accountsBefore = storage.getItem(AUTH_STORAGE_KEYS.ACCOUNTS)
  const userBefore = storage.getItem(AUTH_STORAGE_KEYS.USER)

  const result = service.updateProfile({
    ...demo.user,
    email: 'changed@forgeflow.local',
  })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'DEMO_EMAIL_IMMUTABLE')
  assert.match(result.error.message, /demo account email/i)
  assert.equal(storage.getItem(AUTH_STORAGE_KEYS.ACCOUNTS), accountsBefore)
  assert.equal(storage.getItem(AUTH_STORAGE_KEYS.USER), userBefore)
})

test('demo account permits non-email profile updates', async () => {
  const { service, storage } = createTestService()

  const demo = await service.loginDemo()
  const result = service.updateProfile({
    name: 'Updated Demo Name',
    email: DEMO_CREDENTIALS.email,
    title: 'Updated Title',
    bio: 'Updated bio.',
    avatar: 'https://example.com/demo.png',
    theme: 'light',
  })

  assert.equal(result.success, true)
  assert.equal(result.user.email, DEMO_CREDENTIALS.email)
  assert.equal(result.user.name, 'Updated Demo Name')
  assert.equal(result.user.title, 'Updated Title')
  assert.equal(result.user.bio, 'Updated bio.')
  assert.equal(result.user.avatar, 'https://example.com/demo.png')
  assert.equal(result.user.theme, 'light')
  assert.equal(result.user.isDemo, true)

  const account = readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS).find(
    (candidate) => candidate.id === demo.user.id
  )
  assert.equal(account.email, DEMO_CREDENTIALS.email)
  assert.equal(account.profile.email, DEMO_CREDENTIALS.email)
  assert.equal(account.profile.name, 'Updated Demo Name')
  assert.equal(account.profile.theme, 'light')

  const restored = createTestService(storage).service.restoreSession()
  assert.equal(restored.isAuthenticated, true)
  assert.equal(restored.user.email, DEMO_CREDENTIALS.email)
  assert.equal(restored.user.name, 'Updated Demo Name')
  assert.equal(restored.user.theme, 'light')
})

test('rejected demo email change keeps demo sign-in and restore consistent', async () => {
  const { service, storage } = createTestService()

  const firstDemoLogin = await service.loginDemo()

  const attemptedChange = service.updateProfile({
    ...firstDemoLogin.user,
    email: 'changed@forgeflow.local',
  })
  assert.equal(attemptedChange.success, false)
  assert.equal(attemptedChange.error.code, 'DEMO_EMAIL_IMMUTABLE')

  service.logout()

  const secondDemoLogin = await service.loginDemo()
  assert.equal(secondDemoLogin.success, true)
  assert.equal(secondDemoLogin.user.id, firstDemoLogin.user.id)
  assert.equal(secondDemoLogin.user.email, DEMO_CREDENTIALS.email)

  const accounts = readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS)
  assert.equal(accounts.length, 1)
  assert.equal(new Set(accounts.map((account) => account.id)).size, 1)
  assert.equal(accounts[0].id, firstDemoLogin.user.id)
  assert.equal(accounts[0].email, DEMO_CREDENTIALS.email)

  const restored = createTestService(storage).service.restoreSession()
  assert.equal(restored.isAuthenticated, true)
  assert.equal(restored.user.id, firstDemoLogin.user.id)
  assert.equal(restored.user.email, DEMO_CREDENTIALS.email)
  assert.equal(restored.user.name, firstDemoLogin.user.name)
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

test('theme updates persist per account and survive session restoration', async () => {
  const { service, storage } = createTestService()

  const registered = await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  const light = service.updateProfile({ theme: 'light' })
  assert.equal(light.success, true)
  assert.equal(light.user.theme, 'light')
  assert.equal(readJson(storage, AUTH_STORAGE_KEYS.USER).theme, 'light')
  assert.equal(
    readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS).find(
      (account) => account.id === registered.user.id
    ).profile.theme,
    'light'
  )

  const restoredLight = createTestService(storage).service.restoreSession()
  assert.equal(restoredLight.isAuthenticated, true)
  assert.equal(restoredLight.user.theme, 'light')

  const dark = service.updateProfile({ theme: 'dark' })
  assert.equal(dark.success, true)
  assert.equal(dark.user.theme, 'dark')

  const restoredDark = createTestService(storage).service.restoreSession()
  assert.equal(restoredDark.user.theme, 'dark')
})

test('theme follows the active account across logout and login', async () => {
  const { service } = createTestService()

  const ada = await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })
  service.updateProfile({ theme: 'light' })
  service.logout()

  const grace = await service.register({
    name: 'Grace Hopper',
    email: 'grace@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })
  assert.equal(grace.user.theme, 'dark')
  service.logout()

  const adaLogin = await service.login({
    email: 'ada@example.com',
    password: 'password123',
  })
  assert.equal(adaLogin.success, true)
  assert.equal(adaLogin.user.id, ada.user.id)
  assert.equal(adaLogin.user.theme, 'light')
  service.logout()

  const graceLogin = await service.login({
    email: 'grace@example.com',
    password: 'password123',
  })
  assert.equal(graceLogin.success, true)
  assert.equal(graceLogin.user.theme, 'dark')
})

test('missing and invalid stored themes normalize to dark', async () => {
  const { service, storage } = createTestService()

  const registered = await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  setStoredTheme(storage, registered.user.id, undefined)
  const restoredWithoutTheme =
    createTestService(storage).service.restoreSession()
  assert.equal(restoredWithoutTheme.user.theme, 'dark')
  assert.equal(readJson(storage, AUTH_STORAGE_KEYS.USER).theme, 'dark')

  setStoredTheme(storage, registered.user.id, 'solarized')
  const restoredInvalidTheme =
    createTestService(storage).service.restoreSession()
  assert.equal(restoredInvalidTheme.user.theme, 'dark')
  assert.equal(readJson(storage, AUTH_STORAGE_KEYS.USER).theme, 'dark')
})

test('unsupported theme updates fail without changing stored data', async () => {
  const { service, storage } = createTestService()

  await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  const accountsBeforeUpdate = storage.getItem(AUTH_STORAGE_KEYS.ACCOUNTS)
  const userBeforeUpdate = storage.getItem(AUTH_STORAGE_KEYS.USER)
  const result = service.updateProfile({ theme: 'neon' })

  assert.equal(result.success, false)
  assert.equal(result.error.code, 'VALIDATION_ERROR')
  assert.match(result.error.message, /unsupported appearance option/i)
  assert.equal(
    storage.getItem(AUTH_STORAGE_KEYS.ACCOUNTS),
    accountsBeforeUpdate
  )
  assert.equal(storage.getItem(AUTH_STORAGE_KEYS.USER), userBeforeUpdate)
})

test('profile updates preserve the saved theme', async () => {
  const { service, storage } = createTestService()

  const registered = await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })
  service.updateProfile({ theme: 'light' })

  const updated = service.updateProfile({
    name: 'Ada Byron',
    email: '  ADA.BYRON@Example.COM ',
    title: 'Countess of Computing',
    bio: 'First computer programmer.',
    avatar: 'https://example.com/ada.png',
  })

  assert.equal(updated.success, true)
  assert.equal(updated.user.theme, 'light')
  assert.equal(readJson(storage, AUTH_STORAGE_KEYS.USER).theme, 'light')
  assert.equal(
    readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS).find(
      (account) => account.id === registered.user.id
    ).profile.theme,
    'light'
  )
})

test('appearance updates preserve profile information', async () => {
  const { service, storage } = createTestService()

  await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  const profileUpdate = service.updateProfile({
    name: 'Ada Byron',
    email: 'ada.byron@example.com',
    title: 'Countess of Computing',
    bio: 'First computer programmer.',
    avatar: 'https://example.com/ada.png',
  })
  const beforeAppearanceUpdate = profileUpdate.user

  const appearanceUpdate = service.updateProfile({ theme: 'light' })
  assert.equal(appearanceUpdate.success, true)
  assert.equal(appearanceUpdate.user.name, beforeAppearanceUpdate.name)
  assert.equal(appearanceUpdate.user.email, beforeAppearanceUpdate.email)
  assert.equal(appearanceUpdate.user.title, beforeAppearanceUpdate.title)
  assert.equal(appearanceUpdate.user.bio, beforeAppearanceUpdate.bio)
  assert.equal(appearanceUpdate.user.avatar, beforeAppearanceUpdate.avatar)

  const storedAccount = readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS).find(
    (account) => account.id === beforeAppearanceUpdate.id
  )
  assert.equal(storedAccount.profile.name, 'Ada Byron')
  assert.equal(storedAccount.profile.email, 'ada.byron@example.com')
  assert.equal(storedAccount.profile.title, 'Countess of Computing')
  assert.equal(storedAccount.profile.bio, 'First computer programmer.')
  assert.equal(storedAccount.profile.avatar, 'https://example.com/ada.png')
  assert.equal(storedAccount.profile.theme, 'light')
})

test('legacy notification profile data is ignored without purging the account record', async () => {
  const { service, storage } = createTestService()
  const registered = await service.register({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })

  const accounts = readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS)
  const storedAccount = accounts.find(
    (account) => account.id === registered.user.id
  )
  storedAccount.profile.notifications = true
  storage.setItem(AUTH_STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts))

  const restored = service.restoreSession()
  assert.equal(restored.isAuthenticated, true)
  assert.equal('notifications' in restored.user, false)

  const updated = service.updateProfile({ name: 'Ada Byron' })
  assert.equal(updated.success, true)
  assert.equal('notifications' in updated.user, false)

  const persistedAccount = readJson(storage, AUTH_STORAGE_KEYS.ACCOUNTS).find(
    (account) => account.id === registered.user.id
  )
  assert.equal(persistedAccount.profile.notifications, true)
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
