<template>
  <div style="max-width: 600px; margin: 40px auto; padding: 24px; font-family: system-ui, sans-serif; border: 2px solid #4caf50; border-radius: 8px;">
    <h1>🪴 Plant Care Test</h1>
    <p>Nuxt + Nginx ingress test</p>

    <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 16px 0;">
      <h2 style="margin-top: 0; font-size: 16px;">API Test</h2>
      <button @click="testApi" :disabled="loading" style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
        {{ loading ? 'Fetching...' : 'Test /api/hello' }}
      </button>
      <p v-if="data" style="color: #2e7d32;">{{ data }}</p>
      <p v-if="error" style="color: #c62828;">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
const { data, error, refresh } = await useFetch('/api/hello')
const loading = ref(false)

async function testApi() {
  loading.value = true
  await refresh()
  loading.value = false
}
</script>