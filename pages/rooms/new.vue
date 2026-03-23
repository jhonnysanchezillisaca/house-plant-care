<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const router = useRouter()
const name = ref('')
const description = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  
  try {
    const response = await useFetch('/api/rooms', {
      method: 'POST',
      body: {
        name: name.value,
        description: description.value || undefined
      }
    })
    
    if (response.error.value) {
      error.value = response.error.value.data?.message || 'Failed to create room'
      return
    }
    
    await router.push('/rooms')
  } catch (e) {
    error.value = 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto">
    <div class="mb-6">
      <NuxtLink to="/rooms" class="text-green-600 hover:underline flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Rooms
      </NuxtLink>
    </div>
    
    <h1 class="text-2xl font-bold text-gray-900 mb-6">New Room</h1>
    
    <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          maxlength="100"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g., Living Room"
        />
      </div>
      
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          v-model="description"
          rows="3"
          maxlength="500"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Optional description of this room..."
        />
      </div>
      
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      
      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {{ loading ? 'Creating...' : 'Create Room' }}
        </button>
        <NuxtLink 
          to="/rooms" 
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>