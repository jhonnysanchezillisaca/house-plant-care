<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { data: user } = await useFetch('/api/user')
const { data: rooms } = await useFetch('/api/rooms')
const { data: plants } = await useFetch('/api/plants')
const { data: recentLogs } = await useFetch('/api/care-logs?limit=10')
const { data: overdue, refresh: refreshOverdue } = await useFetch('/api/overdue')

const showQuickLogModal = ref(false)
const quickLogPlantId = ref<number | null>(null)
const quickLogCareTypeId = ref<number | null>(null)
const quickLogNotes = ref('')
const quickLogLoading = ref(false)

const { data: careTypes } = await useFetch('/api/care-types')

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const careTypeIcons: Record<string, string> = {
  water: '💧',
  fertilizer: '🧪',
  mist: '🌫️',
  prune: '✂️',
  repot: '🪴',
  check: '👁️',
  rotate: '🔄',
  clean_leaves: '✨',
  propagate: '🌱'
}

function getCareTypeIcon(name: string): string {
  return careTypeIcons[name] || '🌿'
}

function openQuickLog(plantId: number, careTypeId: number) {
  quickLogPlantId.value = plantId
  quickLogCareTypeId.value = careTypeId
  quickLogNotes.value = ''
  showQuickLogModal.value = true
}

async function handleQuickLog() {
  if (!quickLogPlantId.value || !quickLogCareTypeId.value) return
  
  quickLogLoading.value = true
  
  try {
    await useFetch('/api/care-logs', {
      method: 'POST',
      body: {
        plantId: quickLogPlantId.value,
        careTypeId: quickLogCareTypeId.value,
        notes: quickLogNotes.value || undefined
      }
    })
    
    showQuickLogModal.value = false
    await refreshOverdue()
  } catch (e: any) {
    alert(e.data?.message || 'Failed to log activity')
  } finally {
    quickLogLoading.value = false
  }
}

function getOverdueColor(days: number): string {
  if (days <= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  if (days <= 7) return 'text-orange-600 bg-orange-50 border-orange-200'
  return 'text-red-600 bg-red-50 border-red-200'
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">
      Welcome, {{ user?.name || 'Plant Lover' }}!
    </h1>
    
    <!-- Overdue Plants Alert -->
    <div v-if="overdue && overdue.length > 0" class="mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span class="text-2xl">⚠️</span>
            Needs Attention
            <span class="bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded-full">
              {{ overdue.length }}
            </span>
          </h2>
        </div>
        
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="item in overdue.slice(0, 6)" 
            :key="`${item.plantId}-${item.careTypeId}`"
            class="p-4 rounded-lg border"
            :class="getOverdueColor(item.daysOverdue)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-xl flex-shrink-0">{{ getCareTypeIcon(item.careTypeName) }}</span>
                  <NuxtLink 
                    :to="`/plants/${item.plantId}`" 
                    class="font-medium hover:underline truncate"
                  >
                    {{ item.plantName }}
                  </NuxtLink>
                </div>
                <div class="text-sm mt-1">
                  <span class="capitalize">{{ item.careTypeName.replace('_', ' ') }}</span>
                  <span class="mx-1">•</span>
                  <span class="font-medium">{{ item.daysOverdue }} day{{ item.daysOverdue > 1 ? 's' : '' }} overdue</span>
                </div>
                <div class="text-xs opacity-75 mt-1">{{ item.roomName }}</div>
              </div>
              <button 
                @click="openQuickLog(item.plantId, item.careTypeId)"
                class="flex-shrink-0 px-2 py-1 text-xs bg-white/50 hover:bg-white rounded border border-current/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
        
        <p v-if="overdue.length > 6" class="text-sm text-gray-500 mt-3">
          And {{ overdue.length - 6 }} more...
        </p>
      </div>
    </div>
    
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-2">Quick Stats</h2>
        <div class="space-y-2">
          <p class="text-gray-600">Rooms: <span class="font-medium">{{ rooms?.length || 0 }}</span></p>
          <p class="text-gray-600">Plants: <span class="font-medium">{{ plants?.length || 0 }}</span></p>
          <p class="text-gray-600">
            Needs attention: 
            <span class="font-medium" :class="overdue?.length ? 'text-orange-600' : ''">
              {{ overdue?.length || 0 }}
            </span>
          </p>
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
        <div v-if="!recentLogs?.length" class="text-gray-500">
          No recent activity. Start caring for your plants!
        </div>
        <div v-else class="space-y-2 max-h-40 overflow-auto">
          <div 
            v-for="log in recentLogs" 
            :key="log.id"
            class="flex items-center gap-2 text-sm"
          >
            <span class="text-lg">{{ getCareTypeIcon(log.careType.name) }}</span>
            <div class="flex-1 min-w-0">
              <span class="font-medium">{{ log.plant.name }}</span>
              <span class="text-gray-500 ml-1">{{ log.careType.name.replace('_', ' ') }}</span>
            </div>
            <span class="text-xs text-gray-400">{{ formatDate(log.performedAt) }}</span>
          </div>
        </div>
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
          <h3 class="font-medium text-gray-900 truncate">{{ plant.name }}</h3>
          <p v-if="plant.species" class="text-sm text-gray-500 italic truncate">{{ plant.species }}</p>
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
    
    <!-- Quick Log Modal -->
    <div v-if="showQuickLogModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="showQuickLogModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Log Care Activity</h2>
        
        <form @submit.prevent="handleQuickLog" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea 
              v-model="quickLogNotes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Any notes about this activity..."
            />
          </div>
          
          <div class="flex gap-3">
            <button 
              type="submit"
              :disabled="quickLogLoading"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ quickLogLoading ? 'Logging...' : 'Done!' }}
            </button>
            <button 
              type="button"
              @click="showQuickLogModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>