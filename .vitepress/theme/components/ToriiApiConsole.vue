<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

type CheckState = 'idle' | 'checking' | 'ok' | 'error'

interface GeneratorTarget {
  id: string
  label: string
  output: string
}

interface OpenApiDocument {
  paths?: Record<string, unknown>
  servers?: OpenApiServer[]
  [key: string]: unknown
}

interface OpenApiServer {
  description?: string
  url: string
}

const DEFAULT_TORII_URL = import.meta.env.VITE_TORII_OPENAPI_URL?.trim() || 'https://taira.sora.org'
const LEGACY_DEFAULT_TORII_URLS = new Set(['http://127.0.0.1:8080', 'http://localhost:8080'])

const STORAGE_KEY = 'iroha-docs-torii-url'

const generatorTargets: GeneratorTarget[] = [
  {
    id: 'typescript-fetch',
    label: 'TypeScript fetch',
    output: './iroha-torii-typescript',
  },
  {
    id: 'python',
    label: 'Python',
    output: './iroha-torii-python',
  },
  {
    id: 'rust',
    label: 'Rust',
    output: './iroha-torii-rust',
  },
  {
    id: 'kotlin',
    label: 'Kotlin',
    output: './iroha-torii-kotlin',
  },
  {
    id: 'java',
    label: 'Java',
    output: './iroha-torii-java',
  },
  {
    id: 'swift5',
    label: 'Swift',
    output: './iroha-torii-swift',
  },
]

const { isDark } = useData()

const rapidocLoaded = ref(false)
const viewerSpecUrl = ref('')
const baseUrlInput = ref(getInitialToriiUrl())
const selectedGenerator = ref(generatorTargets[0].id)
const checkState = ref<CheckState>('idle')
const statusMessage = ref('Load a running Torii endpoint to inspect and test its live OpenAPI routes.')
const copiedLabel = ref('')
const viewerKey = ref(0)

let copiedTimer: ReturnType<typeof setTimeout> | undefined

const pendingBaseUrl = computed(() => normalizeToriiBaseUrl(baseUrlInput.value))

const selectedTarget = computed(() => {
  return generatorTargets.find((target) => target.id === selectedGenerator.value) ?? generatorTargets[0]
})

const generatorCommand = computed(() => {
  const target = selectedTarget.value

  return [
    `export TORII_URL=${pendingBaseUrl.value}`,
    "node --input-type=module <<'EOF' > iroha-torii.openapi.json",
    'const toriiUrl = process.env.TORII_URL',
    'const response = await fetch(`${toriiUrl}/openapi.json`)',
    'if (!response.ok) throw new Error(`HTTP ${response.status}`)',
    'const spec = await response.json()',
    "spec.servers = [{ url: toriiUrl, description: 'Selected Torii endpoint' }]",
    'console.log(JSON.stringify(spec, null, 2))',
    'EOF',
    '',
    'pnpm dlx @openapitools/openapi-generator-cli generate',
    '  -i iroha-torii.openapi.json \\',
    `  -g ${target.id} \\`,
    `  -o ${target.output}`,
  ].join('\n')
})

const rapidocTheme = computed(() => (isDark.value ? 'dark' : 'light'))
const rapidocBgColor = computed(() => (isDark.value ? '#161618' : '#ffffff'))
const rapidocTextColor = computed(() => (isDark.value ? '#e4e4e7' : '#1f2328'))

onMounted(async () => {
  await import('rapidoc')
  rapidocLoaded.value = true
  await loadSpec()
})

onBeforeUnmount(() => {
  revokeViewerSpecUrl()
})

function getInitialToriiUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_TORII_URL

  const queryUrl = new URL(window.location.href).searchParams.get('torii')?.trim()
  const storedUrl = window.localStorage.getItem(STORAGE_KEY)?.trim()
  const normalizedStoredUrl = storedUrl ? normalizeToriiBaseUrl(storedUrl) : ''

  if (queryUrl) return queryUrl
  if (normalizedStoredUrl && !LEGACY_DEFAULT_TORII_URLS.has(normalizedStoredUrl)) return normalizedStoredUrl

  return DEFAULT_TORII_URL
}

function normalizeToriiBaseUrl(value: string): string {
  const trimmed = value.trim() || DEFAULT_TORII_URL
  const withoutOpenApi = trimmed.replace(/\/+$/u, '').replace(/\/openapi(?:\.json)?$/u, '')
  const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//iu.test(withoutOpenApi)

  return (hasProtocol ? withoutOpenApi : `http://${withoutOpenApi}`).replace(/\/+$/u, '')
}

function persistBaseUrl(baseUrl: string): void {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, baseUrl)
}

async function loadSpec(): Promise<void> {
  const baseUrl = pendingBaseUrl.value

  checkState.value = 'checking'
  statusMessage.value = `Loading ${baseUrl}/openapi.json...`

  try {
    const document = await fetchOpenApiDocument(baseUrl)
    const routeCount = document.paths ? Object.keys(document.paths).length : 0
    const routeLabel = routeCount === 1 ? 'route' : 'routes'

    baseUrlInput.value = baseUrl
    setViewerSpecDocument(document, baseUrl)
    checkState.value = 'ok'
    statusMessage.value = `Loaded ${routeCount} OpenAPI ${routeLabel} from ${baseUrl}.`
    viewerKey.value += 1
    persistBaseUrl(baseUrl)
  } catch (error) {
    checkState.value = 'error'
    statusMessage.value =
      error instanceof Error ? error.message : 'Unable to load the OpenAPI document from this Torii endpoint.'
  }
}

async function checkEndpoint(): Promise<void> {
  await loadSpec()
}

async function fetchOpenApiDocument(baseUrl: string): Promise<OpenApiDocument> {
  const response = await fetch(`${baseUrl}/openapi.json`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`OpenAPI request failed with HTTP ${response.status}`)
  }

  return (await response.json()) as OpenApiDocument
}

function setViewerSpecDocument(document: OpenApiDocument, baseUrl: string): void {
  const normalizedDocument = normalizeSpecServers(document, baseUrl)
  const blob = new Blob([JSON.stringify(normalizedDocument)], {
    type: 'application/json',
  })

  revokeViewerSpecUrl()
  viewerSpecUrl.value = URL.createObjectURL(blob)
}

function normalizeSpecServers(document: OpenApiDocument, baseUrl: string): OpenApiDocument {
  const normalizedDocument = structuredClone(document) as OpenApiDocument
  const selectedServer: OpenApiServer = {
    description: 'Selected Torii endpoint',
    url: baseUrl,
  }

  function visit(value: unknown): void {
    if (!value || typeof value !== 'object') return

    const record = value as Record<string, unknown>

    if (Array.isArray(record.servers)) {
      record.servers = [selectedServer]
    }

    for (const item of Object.values(record)) {
      visit(item)
    }
  }

  normalizedDocument.servers = [selectedServer]
  visit(normalizedDocument)

  return normalizedDocument
}

function revokeViewerSpecUrl(): void {
  if (!viewerSpecUrl.value) return

  URL.revokeObjectURL(viewerSpecUrl.value)
  viewerSpecUrl.value = ''
}

async function copyText(value: string, label: string): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    copiedLabel.value = 'Clipboard is not available in this browser.'
    return
  }

  await navigator.clipboard.writeText(value)
  copiedLabel.value = `${label} copied.`

  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copiedLabel.value = ''
  }, 2400)
}
</script>

<template>
  <div class="torii-api-console">
    <form
      class="torii-api-console__toolbar"
      @submit.prevent="loadSpec()"
    >
      <label
        class="torii-api-console__field"
        for="torii-api-base-url"
      >
        <span>Torii endpoint</span>
        <input
          id="torii-api-base-url"
          v-model="baseUrlInput"
          autocomplete="url"
          inputmode="url"
          spellcheck="false"
          type="text"
        >
      </label>

      <div class="torii-api-console__actions">
        <button type="submit">
          Load
        </button>
        <button
          type="button"
          :disabled="checkState === 'checking'"
          @click="checkEndpoint"
        >
          {{ checkState === 'checking' ? 'Loading...' : 'Check' }}
        </button>
      </div>
    </form>

    <p
      class="torii-api-console__status"
      :class="`torii-api-console__status--${checkState}`"
      aria-live="polite"
    >
      {{ statusMessage }}
    </p>

    <section class="torii-api-console__codegen">
      <div class="torii-api-console__codegen-header">
        <label
          class="torii-api-console__select"
          for="torii-api-generator"
        >
          <span>Generate client</span>
          <select
            id="torii-api-generator"
            v-model="selectedGenerator"
          >
            <option
              v-for="target in generatorTargets"
              :key="target.id"
              :value="target.id"
            >
              {{ target.label }}
            </option>
          </select>
        </label>

        <button
          type="button"
          @click="copyText(generatorCommand, 'Generator command')"
        >
          Copy command
        </button>
      </div>

      <pre><code>{{ generatorCommand }}</code></pre>

      <p class="torii-api-console__hint">
        Generated OpenAPI clients are best for JSON operator and app routes. Use the Iroha SDKs for signed ledger
        transactions, signed queries, and Norito-native payloads.
      </p>
    </section>

    <p
      v-if="copiedLabel"
      class="torii-api-console__copied"
      aria-live="polite"
    >
      {{ copiedLabel }}
    </p>

    <ClientOnly>
      <div class="torii-api-console__viewer">
        <rapi-doc
          v-if="rapidocLoaded && viewerSpecUrl"
          :key="`${viewerKey}-${rapidocTheme}`"
          :spec-url="viewerSpecUrl"
          :theme="rapidocTheme"
          :bg-color="rapidocBgColor"
          :text-color="rapidocTextColor"
          allow-authentication="true"
          allow-spec-file-load="false"
          allow-spec-url-load="false"
          allow-try="true"
          default-schema-tab="schema"
          fill-request-fields-with-example="true"
          layout="column"
          mono-font="JetBrains Mono, Menlo, Monaco, Consolas, monospace"
          primary-color="#b00020"
          regular-font="Sora, Inter, system-ui, sans-serif"
          render-style="view"
          response-area-height="320px"
          schema-style="table"
          show-curl-before-try="true"
          show-header="false"
          show-method-in-nav-bar="as-colored-block"
          sort-endpoints-by="method"
          use-path-in-nav-bar="true"
        />
        <div
          v-else
          class="torii-api-console__loading"
        >
          Loading API console...
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped lang="scss">
.torii-api-console {
  display: grid;
  gap: 18px;
  margin: 24px 0;
}

.torii-api-console__toolbar,
.torii-api-console__codegen {
  display: grid;
  gap: 14px;
  padding: 18px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.torii-api-console__toolbar {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
}

.torii-api-console__field,
.torii-api-console__select {
  display: grid;
  gap: 7px;
  min-width: 0;
  font-size: 0.86rem;
  font-weight: 650;
  color: var(--vp-c-text-1);
}

.torii-api-console__field input,
.torii-api-console__select select {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  font: inherit;
  font-weight: 450;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
}

.torii-api-console__field input {
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
}

.torii-api-console__actions,
.torii-api-console__codegen-header {
  display: flex;
  gap: 10px;
  align-items: end;
}

.torii-api-console__codegen-header {
  justify-content: space-between;
}

.torii-api-console button {
  min-height: 40px;
  padding: 0 14px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  cursor: pointer;
  background: var(--vp-c-brand-2);
  border: 0;
  border-radius: 6px;
}

.torii-api-console button:hover:not(:disabled) {
  background: var(--vp-c-brand-1);
}

.torii-api-console button:disabled {
  cursor: not-allowed;
  opacity: 0.56;
}

.torii-api-console__status,
.torii-api-console__hint,
.torii-api-console__copied {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.torii-api-console__status--ok,
.torii-api-console__copied {
  color: var(--vp-c-brand-1);
}

.torii-api-console__status--error {
  color: var(--vp-c-danger-1);
}

.torii-api-console__codegen pre {
  margin: 0;
  padding: 14px;
  overflow-x: auto;
  background: var(--vp-code-block-bg);
  border-radius: 8px;
}

.torii-api-console__codegen code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.86rem;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.torii-api-console__viewer {
  min-height: 720px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.torii-api-console__viewer rapi-doc {
  display: block;
  width: 100%;
  min-height: 720px;
}

.torii-api-console__loading {
  display: grid;
  min-height: 260px;
  place-items: center;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

@media (max-width: 760px) {
  .torii-api-console__toolbar,
  .torii-api-console__codegen-header {
    grid-template-columns: 1fr;
  }

  .torii-api-console__toolbar {
    align-items: stretch;
  }

  .torii-api-console__actions,
  .torii-api-console__codegen-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
