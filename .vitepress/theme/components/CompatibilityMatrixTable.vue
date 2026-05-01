<script setup lang="ts">
import { useTask } from '@vue-kakuyaku/core'
import { withBase } from 'vitepress'
import { computed } from 'vue'
import CompatibilityMatrixTableIcon, { type Status } from './CompatibilityMatrixTableIcon.vue'

const REQUEST_TIMEOUT_MS = 10_000
const DEFAULT_COMPAT_MATRIX_URL = withBase('/compat-matrix.json')

interface Matrix {
  source?: MatrixSource
  included_sdks: MatrixSdkDeclaration[]
  stories: MatrixStory[]
}

interface MatrixSource {
  repo?: string
  repo_url?: string
  branch?: string
  branch_url?: string
  commit?: string
  dirty?: boolean
  generated_at?: string
}

interface MatrixSdkDeclaration {
  name: string
}

interface MatrixStory {
  name: string
  results: MatrixStoryResult[]
}

interface MatrixStoryResult {
  status: Status
}

const configuredCompatMatrixUrl = import.meta.env.VITE_COMPAT_MATRIX_URL?.trim()
const COMPAT_MATRIX_URL = configuredCompatMatrixUrl || DEFAULT_COMPAT_MATRIX_URL

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStatus(value: unknown): value is Status {
  return value === 'ok' || value === 'failed' || value === 'no-data'
}

function isSdkDeclaration(value: unknown): value is MatrixSdkDeclaration {
  return isRecord(value) && typeof value.name === 'string'
}

function isStoryResult(value: unknown): value is MatrixStoryResult {
  return isRecord(value) && isStatus(value.status)
}

function isStory(value: unknown): value is MatrixStory {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    Array.isArray(value.results) &&
    value.results.every(isStoryResult)
  )
}

function isMatrix(value: unknown): value is Matrix {
  return (
    isRecord(value) &&
    Array.isArray(value.included_sdks) &&
    value.included_sdks.every(isSdkDeclaration) &&
    Array.isArray(value.stories) &&
    value.stories.every(isStory)
  )
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

async function fetchMatrix(): Promise<Matrix> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(COMPAT_MATRIX_URL, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Endpoint returned ${response.status} ${response.statusText}`.trim())
    }

    const data: unknown = await response.json()

    if (!isMatrix(data)) {
      throw new Error('Endpoint returned an unsupported compatibility matrix format')
    }

    return data
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Endpoint did not respond within ${REQUEST_TIMEOUT_MS / 1000} seconds`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

const task = useTask<Matrix>(() => fetchMatrix(), { immediate: true })

const table = computed(() => {
  if (!task.state.fulfilled) return null
  const data = task.state.fulfilled.value

  const headers = ['Story', ...data.included_sdks.map((x) => x.name)]
  const rows = data.stories.map((story) => {
    return {
      story: story.name,
      results: data.included_sdks.map((_, i) => story.results[i]?.status ?? 'no-data'),
    }
  })

  return { headers, rows }
})

function toHttpUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined
  } catch {
    return undefined
  }
}

const matrixSource = computed(() => {
  if (!task.state.fulfilled) return null

  const { source } = task.state.fulfilled.value
  if (!source) return null

  return {
    repo: source.repo,
    repoUrl: toHttpUrl(source.repo_url),
    branch: source.branch,
    branchUrl: toHttpUrl(source.branch_url),
    commit: source.commit,
    dirty: source.dirty,
    generatedAt: source.generated_at,
  }
})

const rejectionReason = computed(() => {
  if (!task.state.rejected) return null
  return toErrorMessage(task.state.rejected.reason)
})
</script>

<template>
  <div v-if="table">
    <table aria-label="Compatibility matrix">
      <thead>
        <tr>
          <th
            v-for="name in table.headers"
            :key="name"
          >
            {{ name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in table.rows"
          :key="i"
        >
          <td>{{ row.story }}</td>
          <td
            v-for="(status, j) in row.results"
            :key="j"
            class="status-cell"
            :title="`Status: ${status}`"
          >
            <CompatibilityMatrixTableIcon :status="status" />
          </td>
        </tr>
      </tbody>
    </table>

    <p
      v-if="matrixSource"
      class="compat-source"
    >
      Source:
      <a
        v-if="matrixSource.repo && matrixSource.repoUrl"
        :href="matrixSource.repoUrl"
        target="_blank"
        rel="noreferrer"
      >
        {{ matrixSource.repo }}
      </a>
      <span v-else-if="matrixSource.repo">{{ matrixSource.repo }}</span>
      <template v-if="matrixSource.branch">
        | branch
        <a
          v-if="matrixSource.branchUrl"
          :href="matrixSource.branchUrl"
          target="_blank"
          rel="noreferrer"
        >
          {{ matrixSource.branch }}
        </a>
        <span v-else>{{ matrixSource.branch }}</span>
      </template>
      <template v-if="matrixSource.commit">
        | {{ matrixSource.commit }}
      </template>
      <template v-if="matrixSource.dirty">
        | dirty worktree
      </template>
      <template v-if="matrixSource.generatedAt">
        | generated {{ matrixSource.generatedAt }}
      </template>
    </p>
  </div>

  <div
    v-else
    class="border rounded p-2 my-4"
  >
    <div
      v-if="task.state.pending"
      class="flex space-x-2 items-center"
    >
      <span>Loading compatibility matrix data...</span>
    </div>
    <div
      v-else-if="rejectionReason"
      class="compat-error"
      role="alert"
    >
      <strong>Compatibility matrix data is unavailable.</strong>
      <span>{{ rejectionReason }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.border {
  border-color: var(--vp-c-border);
}

.compat-error {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  span {
    color: var(--vp-c-text-2);
  }
}

.compat-source {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin-top: 0.75rem;
}

td.status-cell {
  font-size: 1.3em;
  padding: 0;

  svg {
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
