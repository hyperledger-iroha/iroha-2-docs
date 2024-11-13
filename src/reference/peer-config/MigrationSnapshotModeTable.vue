<template>
  <table>
    <thead>
      <tr>
        <th>Before: <code>creation_enabled</code></th>
        <th>After: <code>mode</code></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>false</code></td>
        <td><code>read_write</code></td>
      </tr>
      <tr>
        <td><code>true</code></td>
        <td><code>readonly</code></td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
th:nth-child(1),
td:nth-child(1) {
  text-align: right;
}
</style>
<script setup lang="ts"></script>
