<script setup lang="ts">
const user = await useFetch('/api/user')

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold text-gray-900">
              🌱 Plant Care
            </NuxtLink>
            <div class="hidden md:flex md:ml-8 md:gap-4">
              <NuxtLink 
                to="/" 
                class="text-gray-600 hover:text-gray-900 px-3 py-2"
                active-class="text-green-600"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink 
                to="/rooms" 
                class="text-gray-600 hover:text-gray-900 px-3 py-2"
                active-class="text-green-600"
              >
                Rooms
              </NuxtLink>
              <NuxtLink 
                to="/plants" 
                class="text-gray-600 hover:text-gray-900 px-3 py-2"
                active-class="text-green-600"
              >
                Plants
              </NuxtLink>
              <NuxtLink 
                to="/settings" 
                class="text-gray-600 hover:text-gray-900 px-3 py-2"
                active-class="text-green-600"
              >
                Settings
              </NuxtLink>
            </div>
          </div>
          
          <div v-if="user.data.value" class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ user.data.value.name }}</span>
            <button
              @click="handleLogout"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div class="md:hidden border-t">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <NuxtLink 
            to="/" 
            class="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
            active-class="bg-gray-100 text-green-600"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/rooms" 
            class="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
            active-class="bg-gray-100 text-green-600"
          >
            Rooms
          </NuxtLink>
          <NuxtLink 
            to="/plants" 
            class="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
            active-class="bg-gray-100 text-green-600"
          >
            Plants
          </NuxtLink>
          <NuxtLink 
            to="/settings" 
            class="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
            active-class="bg-gray-100 text-green-600"
          >
            Settings
          </NuxtLink>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>