<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { data: rooms, refresh } = await useFetch('/api/rooms')

async function deleteRoom(id: number) {
  if (!confirm('Are you sure you want to delete this room?')) return
  
  try {
    await useFetch(`/api/rooms/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    alert('Failed to delete room')
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Rooms</h1>
      <NuxtLink 
        to="/rooms/new" 
        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Room
      </NuxtLink>
    </div>
    
    <div v-if="!rooms?.length" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No rooms</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new room.</p>
      <NuxtLink 
        to="/rooms/new" 
        class="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Add your first room
      </NuxtLink>
    </div>
    
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="room in rooms" 
        :key="room.id" 
        class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
      >
        <NuxtLink :to="`/rooms/${room.id}`" class="block">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ room.name }}</h2>
          <p v-if="room.description" class="text-gray-600 text-sm line-clamp-2 mb-3">
            {{ room.description }}
          </p>
          <p class="text-xs text-gray-400">
            Added {{ new Date(room.createdAt).toLocaleDateString() }}
          </p>
        </NuxtLink>
        <div class="flex gap-2 mt-3 pt-3 border-t">
          <NuxtLink 
            :to="`/rooms/${room.id}/edit`" 
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </NuxtLink>
          <button 
            @click="deleteRoom(room.id)" 
            class="text-sm text-red-600 hover:text-red-800 ml-auto"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>