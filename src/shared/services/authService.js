import { DEMO_CREDENTIALS, INITIAL_USER } from '../../mocks/initialData.js'
import { isSupportedTheme, normalizeTheme } from '../utils/theme.js'

export { DEMO_CREDENTIALS }

export const AUTH_STORAGE_KEYS = Object.freeze({
  ACCOUNTS: 'forgeflow_auth_accounts_v1',
  SESSION: 'forgeflow_auth_session_v1',
  USER: 'forgeflow_user',
  LEGACY_TOKEN: 'forgeflow_token',
})

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const PASSWORD_HASH_CONFIG = Object.freeze({
  algorithm: 'PBKDF2-HMAC-SHA256',
  hashFunction: 'SHA-256',
  iterations: 600000,
  saltBytes: 16,
  derivedKeyBytes: 32,
})

const SESSION_VERSION = 1
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const HEX_PATTERN = /^[0-9a-f]+$/i
const TEXT_ENCODER = new TextEncoder()

const browserStorageAdapter = {
  getItem: (key) => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
  removeItem: (key) => globalThis.localStorage.removeItem(key),
}

function createServiceError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

function failure(code, message) {
  return { success: false, error: { code, message } }
}

function success(user) {
  return { success: true, user }
}

function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase()
}

function isValidEmail(email) {
  return EMAIL_PATTERN.test(email)
}

function getPasswordValidationError(password) {
  const value = String(password ?? '')

  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  }

  if (value.length > PASSWORD_MAX_LENGTH) {
    return `Password must be no more than ${PASSWORD_MAX_LENGTH} characters.`
  }

  return null
}

function isHex(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length % 2 === 0 &&
    HEX_PATTERN.test(value)
  )
}

function isValidPasswordHash(record) {
  return Boolean(
    record &&
    typeof record === 'object' &&
    typeof record.algorithm === 'string' &&
    typeof record.hashFunction === 'string' &&
    Number.isInteger(record.iterations) &&
    record.iterations > 0 &&
    isHex(record.salt) &&
    isHex(record.hash)
  )
}

function isValidAccountRecord(record) {
  return Boolean(
    record &&
    typeof record === 'object' &&
    typeof record.id === 'string' &&
    record.id &&
    typeof record.name === 'string' &&
    typeof record.email === 'string' &&
    record.email &&
    record.profile &&
    typeof record.profile === 'object' &&
    isValidPasswordHash(record.passwordHash)
  )
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  )
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }
  return bytes
}

function constantTimeEqualHex(left, right) {
  if (left.length !== right.length) return false

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

function ensureCrypto(cryptoApi) {
  if (
    !cryptoApi ||
    typeof cryptoApi.getRandomValues !== 'function' ||
    !cryptoApi.subtle ||
    typeof cryptoApi.subtle.importKey !== 'function' ||
    typeof cryptoApi.subtle.deriveBits !== 'function'
  ) {
    throw createServiceError(
      'HASHING_UNAVAILABLE',
      'Secure password hashing is unavailable in this browser.'
    )
  }
}

async function hashPassword(password, cryptoApi, config) {
  ensureCrypto(cryptoApi)

  const salt = cryptoApi.getRandomValues(new Uint8Array(config.saltBytes))
  const key = await cryptoApi.subtle.importKey(
    'raw',
    TEXT_ENCODER.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const derivedBits = await cryptoApi.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: config.hashFunction,
      salt,
      iterations: config.iterations,
    },
    key,
    config.derivedKeyBytes * 8
  )

  return {
    algorithm: config.algorithm,
    hashFunction: config.hashFunction,
    iterations: config.iterations,
    salt: bytesToHex(salt),
    hash: bytesToHex(new Uint8Array(derivedBits)),
  }
}

async function verifyPassword(password, passwordHash, cryptoApi) {
  ensureCrypto(cryptoApi)

  const key = await cryptoApi.subtle.importKey(
    'raw',
    TEXT_ENCODER.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const derivedBits = await cryptoApi.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: passwordHash.hashFunction,
      salt: hexToBytes(passwordHash.salt),
      iterations: passwordHash.iterations,
    },
    key,
    hexToBytes(passwordHash.hash).length * 8
  )

  return constantTimeEqualHex(
    passwordHash.hash,
    bytesToHex(new Uint8Array(derivedBits))
  )
}

function toUser(account) {
  return {
    id: account.id,
    name: account.profile.name ?? account.name,
    email: account.email,
    avatar: account.profile.avatar ?? INITIAL_USER.avatar,
    title: account.profile.title ?? INITIAL_USER.title,
    bio: account.profile.bio ?? INITIAL_USER.bio,
    theme: normalizeTheme(account.profile.theme),
    notifications:
      typeof account.profile.notifications === 'boolean'
        ? account.profile.notifications
        : INITIAL_USER.notifications,
    createdAt: account.createdAt ?? INITIAL_USER.createdAt,
    isDemo: Boolean(account.isDemo),
  }
}

function createAccountRecord({
  id,
  name,
  email,
  profile,
  passwordHash,
  isDemo = false,
  createdAt,
}) {
  return {
    id,
    name,
    email,
    profile: {
      ...INITIAL_USER,
      ...profile,
      theme: normalizeTheme(profile?.theme ?? INITIAL_USER.theme),
      name,
      email,
    },
    passwordHash,
    isDemo,
    createdAt: createdAt ?? new Date().toISOString().split('T')[0],
  }
}

function createAccountId(cryptoApi) {
  const suffix = cryptoApi.getRandomValues(new Uint8Array(6))
  return `usr_${Date.now()}_${bytesToHex(suffix)}`
}

function normalizeFailure(error) {
  if (error?.code === 'HASHING_UNAVAILABLE') {
    return failure(error.code, error.message)
  }
  return failure(
    'AUTH_SERVICE_ERROR',
    'Authentication is temporarily unavailable.'
  )
}

export function createAuthService({
  storage = browserStorageAdapter,
  crypto: cryptoApi = globalThis.crypto,
  hashConfig = PASSWORD_HASH_CONFIG,
} = {}) {
  function removeLegacyToken() {
    storage.removeItem(AUTH_STORAGE_KEYS.LEGACY_TOKEN)
  }

  function readAccounts() {
    const raw = storage.getItem(AUTH_STORAGE_KEYS.ACCOUNTS)
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        storage.removeItem(AUTH_STORAGE_KEYS.ACCOUNTS)
        return []
      }
      return parsed.filter(isValidAccountRecord)
    } catch {
      storage.removeItem(AUTH_STORAGE_KEYS.ACCOUNTS)
      return []
    }
  }

  function writeAccounts(accounts) {
    storage.setItem(AUTH_STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts))
  }

  function readSession() {
    const raw = storage.getItem(AUTH_STORAGE_KEYS.SESSION)
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw)
      const isValid =
        parsed &&
        typeof parsed === 'object' &&
        parsed.version === SESSION_VERSION &&
        typeof parsed.accountId === 'string' &&
        parsed.accountId.length > 0 &&
        Number.isFinite(parsed.issuedAt) &&
        parsed.issuedAt > 0

      if (!isValid) {
        storage.removeItem(AUTH_STORAGE_KEYS.SESSION)
        return null
      }

      return parsed
    } catch {
      storage.removeItem(AUTH_STORAGE_KEYS.SESSION)
      return null
    }
  }

  function clearSession() {
    storage.removeItem(AUTH_STORAGE_KEYS.SESSION)
    storage.removeItem(AUTH_STORAGE_KEYS.USER)
    removeLegacyToken()
  }

  function writeUserCache(account) {
    storage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(toUser(account)))
  }

  function createSession(account) {
    removeLegacyToken()
    storage.setItem(
      AUTH_STORAGE_KEYS.SESSION,
      JSON.stringify({
        version: SESSION_VERSION,
        accountId: account.id,
        issuedAt: Date.now(),
      })
    )
    writeUserCache(account)
  }

  async function ensureDemoAccount() {
    const accounts = readAccounts()
    const demoEmail = normalizeEmail(DEMO_CREDENTIALS.email)

    if (accounts.some((account) => account.email === demoEmail)) {
      return accounts
    }

    const passwordHash = await hashPassword(
      DEMO_CREDENTIALS.password,
      cryptoApi,
      hashConfig
    )
    const demoAccount = createAccountRecord({
      id: INITIAL_USER.id,
      name: INITIAL_USER.name,
      email: demoEmail,
      profile: INITIAL_USER,
      passwordHash,
      isDemo: true,
      createdAt: INITIAL_USER.createdAt,
    })

    const nextAccounts = [...accounts, demoAccount]
    writeAccounts(nextAccounts)
    return nextAccounts
  }

  function restoreSession() {
    removeLegacyToken()

    const session = readSession()
    if (!session) {
      storage.removeItem(AUTH_STORAGE_KEYS.USER)
      return { isAuthenticated: false, user: null }
    }

    const account = readAccounts().find(
      (candidate) => candidate.id === session.accountId
    )
    if (!account || !isValidPasswordHash(account.passwordHash)) {
      clearSession()
      return { isAuthenticated: false, user: null }
    }

    writeUserCache(account)
    return { isAuthenticated: true, user: toUser(account) }
  }

  async function register({ name, email, password, confirmPassword } = {}) {
    const displayName = String(name ?? '').trim()
    const normalizedEmail = normalizeEmail(email)

    if (!displayName) {
      return failure('VALIDATION_ERROR', 'Full name is required.')
    }

    if (!isValidEmail(normalizedEmail)) {
      return failure('INVALID_EMAIL', 'Enter a valid email address.')
    }

    const passwordError = getPasswordValidationError(password)
    if (passwordError) {
      return failure('VALIDATION_ERROR', passwordError)
    }

    if (!confirmPassword) {
      return failure('VALIDATION_ERROR', 'Confirm your password.')
    }

    if (password !== confirmPassword) {
      return failure('PASSWORDS_MISMATCH', 'Passwords do not match.')
    }

    try {
      const accounts = await ensureDemoAccount()

      if (accounts.some((account) => account.email === normalizedEmail)) {
        return failure(
          'EMAIL_ALREADY_EXISTS',
          'An account with this email already exists.'
        )
      }

      const passwordHash = await hashPassword(password, cryptoApi, hashConfig)
      const account = createAccountRecord({
        id: createAccountId(cryptoApi),
        name: displayName,
        email: normalizedEmail,
        profile: INITIAL_USER,
        passwordHash,
      })

      writeAccounts([...accounts, account])
      createSession(account)
      return success(toUser(account))
    } catch (error) {
      return normalizeFailure(error)
    }
  }

  async function login({ email, password } = {}) {
    const normalizedEmail = normalizeEmail(email)

    if (!isValidEmail(normalizedEmail)) {
      return failure('VALIDATION_ERROR', 'Enter a valid email address.')
    }

    const passwordError = getPasswordValidationError(password)
    if (passwordError) {
      return failure('VALIDATION_ERROR', passwordError)
    }

    const invalidCredentials = failure(
      'INVALID_CREDENTIALS',
      'Invalid email or password.'
    )

    try {
      const accounts = await ensureDemoAccount()
      const account = accounts.find(
        (candidate) => candidate.email === normalizedEmail
      )

      if (!account || !isValidPasswordHash(account.passwordHash)) {
        return invalidCredentials
      }

      const isValid = await verifyPassword(
        password,
        account.passwordHash,
        cryptoApi
      )
      if (!isValid) {
        return invalidCredentials
      }

      createSession(account)
      return success(toUser(account))
    } catch (error) {
      return normalizeFailure(error)
    }
  }

  function loginDemo() {
    return login(getDemoCredentials())
  }

  function logout() {
    clearSession()
    return { success: true }
  }

  function updateProfile(updates = {}) {
    removeLegacyToken()

    const session = readSession()
    if (!session) {
      storage.removeItem(AUTH_STORAGE_KEYS.USER)
      return failure(
        'SESSION_INVALID',
        'Your session is no longer valid. Please sign in again.'
      )
    }

    const accounts = readAccounts()
    const accountIndex = accounts.findIndex(
      (account) => account.id === session.accountId
    )

    if (accountIndex === -1) {
      clearSession()
      return failure(
        'SESSION_INVALID',
        'Your session is no longer valid. Please sign in again.'
      )
    }

    const currentAccount = accounts[accountIndex]
    const nextName =
      updates.name === undefined
        ? currentAccount.name
        : String(updates.name).trim()
    const nextEmail =
      updates.email === undefined
        ? currentAccount.email
        : normalizeEmail(updates.email)

    if (!nextName) {
      return failure('VALIDATION_ERROR', 'Full name is required.')
    }

    if (!isValidEmail(nextEmail)) {
      return failure('INVALID_EMAIL', 'Enter a valid email address.')
    }

    const duplicate = accounts.some(
      (account, index) => index !== accountIndex && account.email === nextEmail
    )
    if (duplicate) {
      return failure(
        'EMAIL_ALREADY_EXISTS',
        'An account with this email already exists.'
      )
    }

    if (updates.theme !== undefined && !isSupportedTheme(updates.theme)) {
      return failure(
        'VALIDATION_ERROR',
        'Unsupported appearance option. Choose Light or Dark.'
      )
    }

    const profileUpdates = {
      theme:
        updates.theme === undefined
          ? normalizeTheme(currentAccount.profile.theme)
          : updates.theme,
    }
    for (const field of ['avatar', 'title', 'bio']) {
      if (typeof updates[field] === 'string') {
        profileUpdates[field] = updates[field]
      }
    }
    if (typeof updates.notifications === 'boolean') {
      profileUpdates.notifications = updates.notifications
    }

    const nextAccount = {
      ...currentAccount,
      name: nextName,
      email: nextEmail,
      profile: {
        ...currentAccount.profile,
        ...profileUpdates,
        name: nextName,
        email: nextEmail,
      },
    }

    accounts[accountIndex] = nextAccount
    writeAccounts(accounts)
    writeUserCache(nextAccount)

    return success(toUser(nextAccount))
  }

  function getDemoCredentials() {
    return { ...DEMO_CREDENTIALS }
  }

  function forgotPassword() {
    return failure(
      'PASSWORD_RESET_UNAVAILABLE',
      'Password reset is not available in this local demo. Use the demo credentials or register a new account.'
    )
  }

  return {
    restoreSession,
    register,
    login,
    loginDemo,
    logout,
    updateProfile,
    getDemoCredentials,
    forgotPassword,
  }
}

export const authService = createAuthService()
