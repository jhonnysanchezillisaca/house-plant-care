<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const user = await useFetch('/api/user')
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">
      Welcome, {{ user.data?.name || 'Plant Lover' }}!
    </h1>
    
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-2">Getting Started</h2>
        <p class="text-gray-600 mb-4">
          Your plant care journey begins here. Start by adding rooms to organize your plants.
        </p>
        <NuxtLink 
          to="/rooms" 
          class="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          View Rooms
        </NuxtLink>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-2">Quick Stats</h2>
        <div class="space-y-2">
          <p class="text-gray-600">Rooms: <span class="font-medium">0</span></p>
          <p class="text-gray-600">Plants: <span class="font-medium">0</span></p>
          <p class="text-gray-600">Needs attention: <span class="font-medium text-orange-600">0</span></p>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-2">Recent Activity</h2>
        <p class="text-gray-600">
          No recent activity. Start caring for your plants!
        </p>
      </div>
    </div>
  </div>
</template>