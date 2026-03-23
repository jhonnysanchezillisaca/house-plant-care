<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const id = computed(() => parseInt(route.params.id as string))

const { data: room, error } = await useFetch(() => `/api/rooms/${id.value}`)
const { data: plants, refresh: refreshPlants } = await useFetch(() => `/api/plants?roomId=${id.value}`)

if (error.value) {
  await router.push('/rooms')
}

async function deletePlant(plantId: number) {
  if (!confirm('Are you sure you want to delete this plant?')) return
  
  try {
    await useFetch(`/api/plants/${plantId}`, { method: 'DELETE' })
    await refreshPlants()
  } catch (e) {
    alert('Failed to delete plant')
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6">
      <NuxtLink to="/rooms" class="text-green-600 hover:underline flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Rooms
      </NuxtLink>
    </div>
    
    <div v-if="room" class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ room.name }}</h1>
          <p v-if="room.description" class="text-gray-500 mt-1">{{ room.description }}</p>
        </div>
        <NuxtLink 
          :to="`/rooms/${room.id}/edit`" 
          class="text-blue-600 hover:text-blue-800"
        >
          Edit
        </NuxtLink>
      </div>
      
      <div class="text-sm text-gray-400">
        Added {{ new Date(room.createdAt).toLocaleDateString() }}
      </div>
    </div>
    
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Plants in this room</h2>
      <NuxtLink 
        v-if="room"
        :to="`/plants/new?roomId=${room.id}`" 
        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Plant
      </NuxtLink>
    </div>
    
    <div v-if="!plants?.length" class="bg-white rounded-lg shadow p-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No plants in this room</h3>
      <p class="mt-1 text-sm text-gray-500">Add plants to start tracking their care.</p>
    </div>
    
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <h3 class="text-lg font-semibold text-gray-900">{{ plant.name }}</h3>
            <p v-if="plant.species" class="text-sm text-gray-500 italic">{{ plant.species }}</p>
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