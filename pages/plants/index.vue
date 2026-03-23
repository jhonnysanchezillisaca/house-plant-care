<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const roomId = computed(() => route.query.roomId as string | undefined)

const { data: plants, refresh } = await useFetch('/api/plants', {
  query: { roomId }
})

const { data: rooms } = await useFetch('/api/rooms')

const selectedRoom = ref<string>('')

watch(selectedRoom, () => {
  if (selectedRoom.value) {
    navigateTo(`/plants?roomId=${selectedRoom.value}`)
  } else {
    navigateTo('/plants')
  }
})

async function deletePlant(id: number) {
  if (!confirm('Are you sure you want to delete this plant?')) return
  
  try {
    await useFetch(`/api/plants/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    alert('Failed to delete plant')
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Plants</h1>
      <div class="flex items-center gap-4">
        <select 
          v-model="selectedRoom"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Rooms</option>
          <option v-for="room in rooms" :key="room.id" :value="room.id">
            {{ room.name }}
          </option>
        </select>
        <NuxtLink 
          to="/plants/new" 
          class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Plant
        </NuxtLink>
      </div>
    </div>
    
    <div v-if="!plants?.length" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No plants</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by adding your first plant.</p>
      <NuxtLink 
        to="/plants/new" 
        class="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Add your first plant
      </NuxtLink>
    </div>
    
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div 
        v-for="plant in plants" 
        :key="plant.id" 
        class="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
      >
        <NuxtLink :to="`/plants/${plant.id}`">
          <div v-if="plant.imageUrl" class="aspect-[4/3] bg-gray-100">
            <img 
              :src="plant.imageUrl" 
              :alt="plant.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div v-else class="aspect-[4/3] bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </NuxtLink>
        <div class="p-4">
          <NuxtLink :to="`/plants/${plant.id}`" class="block">
            <h2 class="text-lg font-semibold text-gray-900">{{ plant.name }}</h2>
            <p v-if="plant.species" class="text-sm text-gray-500 italic">{{ plant.species }}</p>
            <p v-if="plant.room" class="text-xs text-gray-400 mt-1">
              {{ plant.room.name }}
            </p>
          </NuxtLink>
          <div class="flex gap-3 mt-3 pt-3 border-t">
            <NuxtLink 
              :to="`/plants/${plant.id}/edit`" 
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </NuxtLink>
            <button 
              @click="deletePlant(plant.id)" 
              class="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>