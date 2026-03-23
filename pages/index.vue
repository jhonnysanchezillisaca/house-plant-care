<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { data: user } = await useFetch('/api/user')
const { data: rooms } = await useFetch('/api/rooms')
const { data: plants } = await useFetch('/api/plants')
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">
      Welcome, {{ user?.name || 'Plant Lover' }}!
    </h1>
    
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-2">Quick Stats</h2>
        <div class="space-y-2">
          <p class="text-gray-600">Rooms: <span class="font-medium">{{ rooms?.length || 0 }}</span></p>
          <p class="text-gray-600">Plants: <span class="font-medium">{{ plants?.length || 0 }}</span></p>
          <p class="text-gray-600">Needs attention: <span class="font-medium text-orange-600">0</span></p>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-2">Getting Started</h2>
        <p class="text-gray-600 mb-4">
          Your plant care journey begins here. Start by adding rooms and plants to organize your collection.
        </p>
        <div class="flex gap-2">
          <NuxtLink 
            to="/rooms" 
            class="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            View Rooms
          </NuxtLink>
          <NuxtLink 
            to="/plants" 
            class="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            View Plants
          </NuxtLink>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-2">Recent Activity</h2>
        <p class="text-gray-600">
          No recent activity. Start caring for your plants!
        </p>
      </div>
    </div>
    
    <div v-if="plants?.length" class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Your Plants</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink 
          v-for="plant in plants.slice(0, 4)" 
          :key="plant.id"
          :to="`/plants/${plant.id}`"
          class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div v-if="plant.imageUrl" class="w-full aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden">
            <img :src="plant.imageUrl" :alt="plant.name" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-full aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 class="font-medium text-gray-900">{{ plant.name }}</h3>
          <p v-if="plant.species" class="text-sm text-gray-500 italic">{{ plant.species }}</p>
          <p v-if="plant.room" class="text-xs text-gray-400 mt-1">{{ plant.room.name }}</p>
        </NuxtLink>
      </div>
      <NuxtLink 
        v-if="plants.length > 4" 
        to="/plants" 
        class="mt-4 inline-block text-green-600 hover:underline"
      >
        View all {{ plants.length }} plants →
      </NuxtLink>
    </div>
  </div>
</template>