<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const name = ref('')
const error = ref('')
const loading = ref(false)

async function handleSignup() {
  error.value = ''
  loading.value = true
  
  try {
    const response = await useFetch('/api/auth/signup', {
      method: 'POST',
      body: { email: email.value, password: password.value, name: name.value }
    })
    
    if (response.error.value) {
      error.value = response.error.value.data?.message || 'Signup failed'
      return
    }
    
    await navigateTo('/')
  } catch (e) {
    error.value = 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">🌱 Plant Care</h1>
        <p class="text-gray-600 mt-2">Create your account</p>
      </div>
      
      <form @submit.prevent="handleSignup" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Your name"
          />
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="••••••••"
          />
        </div>
        
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>
      
      <p class="mt-4 text-center text-gray-600">
        Already have an account?
        <NuxtLink to="/login" class="text-green-600 hover:underline">
          Sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>