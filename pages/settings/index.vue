<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { data: tokens, refresh } = await useFetch('/api/tokens')
const newTokenName = ref('')
const newlyCreatedToken = ref<string | null>(null)
const error = ref('')
const loading = ref(false)

async function createToken() {
  if (!newTokenName.value.trim()) return
  error.value = ''
  loading.value = true

  try {
    const result = await $fetch('/api/tokens', {
      method: 'POST',
      body: { name: newTokenName.value.trim() }
    })
    newlyCreatedToken.value = (result as any).token
    newTokenName.value = ''
    await refresh()
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to create token'
  } finally {
    loading.value = false
  }
}

async function deleteToken(id: number) {
  try {
    await $fetch(`/api/tokens/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    console.error('Failed to delete token')
  }
}

function copyToken() {
  if (newlyCreatedToken.value) {
    navigator.clipboard.writeText(newlyCreatedToken.value)
  }
}

function dismissNewToken() {
  newlyCreatedToken.value = null
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">API Tokens</h2>
      <p class="text-sm text-gray-600 mb-4">
        Create API tokens to integrate with external services like Home Assistant.
        Tokens authenticate requests via the <code class="bg-gray-100 px-1 rounded text-sm">Authorization: Bearer &lt;token&gt;</code> header.
      </p>

      <div v-if="newlyCreatedToken" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
        <p class="text-sm font-medium text-green-800 mb-2">
          Token created successfully! Copy it now — it won't be shown again.
        </p>
        <div class="flex items-center gap-2">
          <code class="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all select-all">
            {{ newlyCreatedToken }}
          </code>
          <button
            @click="copyToken"
            class="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex-shrink-0"
          >
            Copy
          </button>
          <button
            @click="dismissNewToken"
            class="px-3 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50 flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      </div>

      <form @submit.prevent="createToken" class="flex gap-2 mb-4">
        <input
          v-model="newTokenName"
          type="text"
          required
          maxlength="100"
          placeholder="e.g., Home Assistant"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          :disabled="loading || !newTokenName.trim()"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {{ loading ? 'Creating...' : 'Create Token' }}
        </button>
      </form>

      <p v-if="error" class="text-red-600 text-sm mb-2">{{ error }}</p>

      <div v-if="tokens && tokens.length > 0" class="space-y-2">
        <div
          v-for="token in tokens"
          :key="token.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
        >
          <div>
            <p class="font-medium text-gray-900">{{ token.name }}</p>
            <p class="text-xs text-gray-500">
              Created {{ new Date(token.createdAt).toLocaleDateString() }}
              <span v-if="token.lastUsedAt">
                &middot; Last used {{ new Date(token.lastUsedAt).toLocaleDateString() }}
              </span>
            </p>
          </div>
          <button
            @click="deleteToken(token.id)"
            class="text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
      <p v-else-if="tokens" class="text-sm text-gray-500 italic">
        No API tokens yet. Create one to get started.
      </p>
    </div>
  </div>
</template>