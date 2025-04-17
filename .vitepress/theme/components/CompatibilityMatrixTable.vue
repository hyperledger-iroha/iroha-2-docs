<script setup lang="ts">
import { useTask } from '@vue-kakuyaku/core'
import { computed } from 'vue'
import CompatibilityMatrixTableIcon, { type Status } from './CompatibilityMatrixTableIcon.vue'

interface Matrix {
  included_sdks: MatrixSdkDeclaration[]
  stories: MatrixStory[]
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

const COMPAT_MATRIX_URL: string = import.meta.env.VITE_COMPAT_MATRIX_URL

const task = useTask<Matrix>(
  () => {
    return fetch(COMPAT_MATRIX_URL, {}).then((x) => x.json())
  },
  { immediate: true },
)

const table = computed(() => {
  if (!task.state.fulfilled) return null
  const data = task.state.fulfilled.value

  const headers = ['Story', ...data.included_sdks.map((x) => x.name)]
  const rows = data.stories.map((story) => {
    return { story: story.name, results: story.results.map((x) => x.status) }
  })

  return { headers, rows }
})
</script>

<template>
  <table v-if="table">
    <thead>
      <th
        v-for="name in table.headers"
        :key="name"
      >
        {{ name }}
      </th>
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

  <div
    v-else
    class="border rounded p-2 my-4"
  >
    <div
      v-if="task.state.pending"
      class="flex space-x-2 items-center"
    >
      <span>Loading data...</span>
    </div>
    <div v-else-if="task.state.rejected">
      Failed to load compatibility matrix data: {{ task.state.rejected.reason }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.border {
  border-color: var(--vp-c-border);
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
