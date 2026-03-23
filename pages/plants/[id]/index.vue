<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const id = computed(() => parseInt(route.params.id as string))

const { data: plant, error } = await useFetch(() => `/api/plants/${id.value}`)
const { data: careSchedules, refresh: refreshSchedules } = await useFetch(() => `/api/care-schedules?plantId=${id.value}`)
const { data: careLogs, refresh: refreshLogs } = await useFetch(() => `/api/care-logs?plantId=${id.value}`)
const { data: careTypes } = await useFetch('/api/care-types')

const showAddModal = ref(false)
const editingSchedule = ref<any>(null)

const selectedCareTypeId = ref<number | null>(null)
const frequencyDays = ref(7)
const notes = ref('')
const modalError = ref('')
const modalLoading = ref(false)

const showLogModal = ref(false)
const logCareTypeId = ref<number | null>(null)
const logNotes = ref('')
const logLoading = ref(false)

function openAddModal() {
  editingSchedule.value = null
  selectedCareTypeId.value = null
  frequencyDays.value = 7
  notes.value = ''
  modalError.value = ''
  showAddModal.value = true
}

function openEditModal(schedule: any) {
  editingSchedule.value = schedule
  selectedCareTypeId.value = schedule.careType.id
  frequencyDays.value = schedule.frequencyDays
  notes.value = schedule.notes || ''
  modalError.value = ''
  showAddModal.value = true
}

const availableCareTypes = computed(() => {
  if (!careTypes.value) return []
  if (!careSchedules.value) return careTypes.value
  
  const usedTypeIds = careSchedules.value.map((s: any) => s.careType.id)
  
  if (editingSchedule.value) {
    return careTypes.value
  }
  
  return careTypes.value.filter((t: any) => !usedTypeIds.includes(t.id))
})

async function handleSaveSchedule() {
  modalError.value = ''
  
  if (!selectedCareTypeId.value) {
    modalError.value = 'Please select a care type'
    return
  }
  
  if (!frequencyDays.value || frequencyDays.value < 1) {
    modalError.value = 'Please enter a valid frequency'
    return
  }
  
  modalLoading.value = true
  
  try {
    if (editingSchedule.value) {
      await useFetch(`/api/care-schedules/${editingSchedule.value.id}`, {
        method: 'PUT',
        body: {
          careTypeId: selectedCareTypeId.value,
          frequencyDays: frequencyDays.value,
          notes: notes.value || undefined
        }
      })
    } else {
      await useFetch('/api/care-schedules', {
        method: 'POST',
        body: {
          plantId: id.value,
          careTypeId: selectedCareTypeId.value,
          frequencyDays: frequencyDays.value,
          notes: notes.value || undefined
        }
      })
    }
    
    showAddModal.value = false
    await refreshSchedules()
  } catch (e: any) {
    modalError.value = e.data?.message || 'Failed to save schedule'
  } finally {
    modalLoading.value = false
  }
}

async function deleteSchedule(scheduleId: number) {
  if (!confirm('Are you sure you want to delete this care schedule?')) return
  
  try {
    await useFetch(`/api/care-schedules/${scheduleId}`, { method: 'DELETE' })
    await refreshSchedules()
  } catch (e) {
    alert('Failed to delete schedule')
  }
}

function openLogModal() {
  logCareTypeId.value = null
  logNotes.value = ''
  showLogModal.value = true
}

async function handleLogCare() {
  if (!logCareTypeId.value) {
    alert('Please select a care type')
    return
  }
  
  logLoading.value = true
  
  try {
    await useFetch('/api/care-logs', {
      method: 'POST',
      body: {
        plantId: id.value,
        careTypeId: logCareTypeId.value,
        notes: logNotes.value || undefined
      }
    })
    
    showLogModal.value = false
    await refreshLogs()
  } catch (e: any) {
    alert(e.data?.message || 'Failed to log activity')
  } finally {
    logLoading.value = false
  }
}

async function deleteLog(logId: number) {
  if (!confirm('Delete this activity log?')) return
  
  try {
    await useFetch(`/api/care-logs/${logId}`, { method: 'DELETE' })
    await refreshLogs()
  } catch (e) {
    alert('Failed to delete log')
  }
}

async function deletePlant() {
  if (!confirm('Are you sure you want to delete this plant?')) return
  
  try {
    await useFetch(`/api/plants/${id.value}`, { method: 'DELETE' })
    await router.push('/plants')
  } catch (e) {
    alert('Failed to delete plant')
  }
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

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink to="/plants" class="text-green-600 hover:underline flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Plants
      </NuxtLink>
    </div>
    
    <div v-if="plant" class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="plant.imageUrl" class="aspect-video bg-gray-100">
        <img 
          :src="plant.imageUrl" 
          :alt="plant.name"
          class="w-full h-full object-cover"
        />
      </div>
      <div v-else class="aspect-video bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
      
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ plant.name }}</h1>
            <p v-if="plant.species" class="text-gray-500 italic">{{ plant.species }}</p>
          </div>
          <div class="flex gap-2">
            <NuxtLink 
              :to="`/plants/${plant.id}/edit`" 
              class="text-blue-600 hover:text-blue-800"
            >
              Edit
            </NuxtLink>
            <button 
              @click="deletePlant" 
              class="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
        
        <div class="space-y-4 mb-6">
          <div>
            <h2 class="text-sm font-medium text-gray-500 mb-1">Location</h2>
            <NuxtLink 
              :to="`/rooms/${plant.roomId}`" 
              class="text-green-600 hover:underline flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              {{ plant.room?.name || 'Unknown Room' }}
            </NuxtLink>
          </div>
          
          <div v-if="plant.notes">
            <h2 class="text-sm font-medium text-gray-500 mb-1">Notes</h2>
            <p class="text-gray-900">{{ plant.notes }}</p>
          </div>
          
          <div class="text-sm text-gray-400">
            Added {{ new Date(plant.addedAt).toLocaleDateString() }}
          </div>
        </div>
        
        <!-- Quick Log Button -->
        <div class="border-t pt-4 mb-6">
          <button 
            @click="openLogModal"
            class="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Log Care Activity
          </button>
        </div>
        
        <!-- Care Schedule -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Care Schedule</h2>
            <button 
              @click="openAddModal"
              class="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Add
            </button>
          </div>
          
          <div v-if="!careSchedules?.length" class="text-center py-8 text-gray-500">
            <p>No care schedule configured yet.</p>
            <p class="text-sm mt-1">Add care reminders like watering, fertilizing, etc.</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="schedule in careSchedules" 
              :key="schedule.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ getCareTypeIcon(schedule.careType.name) }}</span>
                <div>
                  <div class="font-medium text-gray-900 capitalize">{{ schedule.careType.name.replace('_', ' ') }}</div>
                  <div class="text-sm text-gray-500">Every {{ schedule.frequencyDays }} day{{ schedule.frequencyDays > 1 ? 's' : '' }}</div>
                  <div v-if="schedule.notes" class="text-xs text-gray-400">{{ schedule.notes }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="openEditModal(schedule)" class="text-blue-600 hover:text-blue-800 text-sm">
                  Edit
                </button>
                <button @click="deleteSchedule(schedule.id)" class="text-red-600 hover:text-red-800 text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Activity History -->
        <div class="border-t pt-6 mt-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Activity History</h2>
          
          <div v-if="!careLogs?.length" class="text-center py-8 text-gray-500">
            <p>No activity logged yet.</p>
            <p class="text-sm mt-1">Log your first care activity above!</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="log in careLogs" 
              :key="log.id"
              class="flex items-start justify-between p-3 bg-gray-50 rounded-md"
            >
              <div class="flex items-start gap-3">
                <span class="text-2xl">{{ getCareTypeIcon(log.careType.name) }}</span>
                <div>
                  <div class="font-medium text-gray-900 capitalize">{{ log.careType.name.replace('_', ' ') }}</div>
                  <div class="text-sm text-gray-500">
                    by {{ log.user.name }} • {{ formatDate(log.performedAt) }}
                  </div>
                  <div v-if="log.notes" class="text-xs text-gray-400 mt-1">{{ log.notes }}</div>
                </div>
              </div>
              <button @click="deleteLog(log.id)" class="text-red-600 hover:text-red-800 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Schedule Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="showAddModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">{{ editingSchedule ? 'Edit Care Schedule' : 'Add Care Schedule' }}</h2>
        
        <form @submit.prevent="handleSaveSchedule" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Care Type</label>
            <select 
              v-model="selectedCareTypeId"
              :disabled="!!editingSchedule"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option :value="null" disabled>Select a care type</option>
              <option v-for="type in availableCareTypes" :key="type.id" :value="type.id">
                {{ getCareTypeIcon(type.name) }} {{ type.name.replace('_', ' ') }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Frequency (days)</label>
            <input 
              v-model="frequencyDays"
              type="number"
              min="1"
              max="365"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p class="text-xs text-gray-500 mt-1">How often should this care be performed?</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea 
              v-model="notes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Any special instructions..."
            />
          </div>
          
          <p v-if="modalError" class="text-red-600 text-sm">{{ modalError }}</p>
          
          <div class="flex gap-3">
            <button 
              type="submit"
              :disabled="modalLoading"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ modalLoading ? 'Saving...' : 'Save' }}
            </button>
            <button 
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Log Care Modal -->
    <div v-if="showLogModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="showLogModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Log Care Activity</h2>
        
        <form @submit.prevent="handleLogCare" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">What did you do?</label>
            <select 
              v-model="logCareTypeId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option :value="null" disabled>Select activity</option>
              <option v-for="type in careTypes" :key="type.id" :value="type.id">
                {{ getCareTypeIcon(type.name) }} {{ type.name.replace('_', ' ') }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea 
              v-model="logNotes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Any notes about this activity..."
            />
          </div>
          
          <div class="flex gap-3">
            <button 
              type="submit"
              :disabled="logLoading"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ logLoading ? 'Logging...' : 'Log Activity' }}
            </button>
            <button 
              type="button"
              @click="showLogModal = false"
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