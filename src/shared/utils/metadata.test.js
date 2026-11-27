import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const metadataPath = new URL('../../../metadata.json', import.meta.url)

test('metadata does not declare an unsupported Gemini capability', () => {
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))

  assert.deepEqual(metadata.majorCapabilities, [])
  assert.equal(
    metadata.majorCapabilities.includes(
      'MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API'
    ),
    false
  )
})
