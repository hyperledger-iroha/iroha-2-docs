<script setup lang="ts">
import { useSlots } from 'vue'

const props = defineProps<{
  env?: string
  type?: 'string' | 'file-path' | 'public-key' | 'socket-addr' | 'number' | 'millis' | 'bytes' | 'bool'
  defaultValue?: string
  defaultNote?: string
}>()

const slots = useSlots()

function showDefault() {
  return props.defaultValue || !!slots['default-value']
}
</script>

<template>
  <table>
    <tbody>
      <tr class="transposed-table">
        <th>
          <strong>Type:</strong>
        </th>
        <td>
          <slot name="type">
            <template v-if="type === 'string'">
              String
            </template>
            <template v-else-if="type === 'file-path'">
              String, file path (relative to the config file or CWD)
            </template>
            <template v-else-if="type === 'public-key'">
              String, public key multihash
            </template>
            <template v-else-if="type === 'socket-addr'">
              String, socket address (host/IPv4/IPv6 + port)
            </template>
            <template v-else-if="type === 'number'">
              Number
            </template>
            <template v-else-if="type === 'millis'">
              Number, duration in milliseconds
            </template>
            <template v-else>
              <code>todo {{ type }}</code>
            </template>
          </slot>
        </td>
      </tr>

      <tr
        v-if="showDefault()"
        class="transposed-table"
      >
        <th>
          <strong>Default:</strong>
        </th>
        <td>
          <slot name="default-value">
            <code>{{ defaultValue }}</code>
            <template v-if="defaultNote">
              ({{ defaultNote }})
            </template>
          </slot>
        </td>
      </tr>

      <tr
        v-if="env"
        class="transposed-table"
      >
        <th>
          <strong>Env:</strong>
        </th>
        <td>
          <code>{{ env }}</code>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style lang="scss" scoped>
th {
  text-align: right;
}
</style>
