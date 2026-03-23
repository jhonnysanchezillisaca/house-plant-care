<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const id = computed(() => parseInt(route.params.id as string))

const { data: plant, error: fetchError } = await useFetch(() => `/api/plants/${id.value}`)
const { data: rooms } = await useFetch('/api/rooms')

const name = ref('')
const roomId = ref<number | null>(null)
const species = ref('')
const notes = ref('')
const imageUrl = ref('')
const error = ref('')
const loading = ref(false)

const photoPreview = ref('')
const photoFile = ref<File | null>(null)

const searchingSpecies = ref(false)
const speciesResults = ref<any[]>([])
const showSpeciesSearch = ref(false)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(species, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (!newVal || newVal.length < 2) {
    showSpeciesSearch.value = false
    speciesResults.value = []
    return
  }
  
  searchTimeout = setTimeout(async () => {
    searchingSpecies.value = true
    showSpeciesSearch.value = true
    try {
      const { data } = await useFetch('/api/trefle/search', {
        query: { q: newVal }
      })
      
      if (data.value?.data) {
        speciesResults.value = data.value.data
      }
    } catch (e) {
      console.error('Species search failed:', e)
    } finally {
      searchingSpecies.value = false
    }
  }, 300)
})

watch(plant, (newPlant) => {
  if (newPlant) {
    name.value = newPlant.name
    roomId.value = newPlant.roomId
    species.value = newPlant.species || ''
    notes.value = newPlant.notes || ''
    imageUrl.value = newPlant.imageUrl || ''
  }
}, { immediate: true })

if (fetchError.value) {
  await router.push('/plants')
}

function handlePhotoSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    photoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function selectSpecies(result: any) {
  species.value = result.scientificName || result.commonName || ''
  if (result.imageUrl) {
    imageUrl.value = result.imageUrl
  }
  showSpeciesSearch.value = false
  speciesResults.value = []
}

async function handleSubmit() {
  error.value = ''
  
  if (!name.value.trim()) {
    error.value = 'Name is required'
    return
  }
  
  if (!roomId.value) {
    error.value = 'Room is required'
    return
  }
  
  loading.value = true
  
  try {
    let finalImageUrl = imageUrl.value
    
    if (photoFile.value) {
      const formData = new FormData()
      formData.append('photo', photoFile.value)
      
      const uploadResponse = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (uploadResponse.url) {
        finalImageUrl = uploadResponse.url
      }
    }
    
    const response = await useFetch(`/api/plants/${id.value}`, {
      method: 'PUT',
      body: {
        name: name.value,
        roomId: roomId.value,
        species: species.value || undefined,
        imageUrl: finalImageUrl || undefined,
        notes: notes.value || undefined
      }
    })
    
    if (response.error.value) {
      error.value = response.error.value.data?.message || 'Failed to update plant'
      return
    }
    
    await router.push(`/plants/${id.value}`)
  } catch (e: any) {
    error.value = e.data?.message || 'An error occurred'
  } finally {
    loading.value = false
  }
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
    
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Edit Plant</h1>
    
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
          placeholder="e.g., My Monstera"
        />
      </div>
      
      <div>
        <label for="room" class="block text-sm font-medium text-gray-700 mb-1">
          Room <span class="text-red-500">*</span>
        </label>
        <select
          id="room"
          v-model="roomId"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option :value="null" disabled>Select a room</option>
          <option v-for="room in rooms" :key="room.id" :value="room.id">
            {{ room.name }}
          </option>
        </select>
      </div>
      
      <div class="relative">
        <label for="species" class="block text-sm font-medium text-gray-700 mb-1">
          Species
        </label>
        <input
          id="species"
          v-model="species"
          type="text"
          maxlength="200"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Type to search... e.g., Monstera"
        />
        <p class="text-xs text-gray-500 mt-1">
          {{ searchingSpecies ? 'Searching...' : 'Start typing to search species via Trefle API' }}
        </p>
        
        <div 
          v-if="showSpeciesSearch && (speciesResults.length > 0 || searchingSpecies)" 
          class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto"
        >
          <div v-if="searchingSpecies" class="p-4 text-center text-gray-500">
            <svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <template v-else>
            <button
              v-for="result in speciesResults"
              :key="result.id"
              type="button"
              @click="selectSpecies(result)"
              class="w-full px-4 py-3 text-left hover:bg-gray-100 flex gap-3"
            >
              <img 
                v-if="result.imageUrl" 
                :src="result.imageUrl" 
                :alt="result.commonName || result.scientificName"
                class="w-12 h-12 object-cover rounded-md bg-gray-100 flex-shrink-0"
              />
              <div 
                v-else 
                class="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-gray-900 truncate">
                  {{ result.commonName || result.scientificName }}
                </div>
                <div v-if="result.commonName" class="text-sm text-gray-500 italic truncate">
                  {{ result.scientificName }}
                </div>
                <div v-if="result.family" class="text-xs text-gray-400">
                  {{ result.family }}
                </div>
              </div>
            </button>
          </template>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Photo
        </label>
        <div v-if="photoPreview || imageUrl" class="mb-2">
          <img 
            :src="photoPreview || imageUrl" 
            alt="Preview" 
            class="w-32 h-32 object-cover rounded-md" 
          />
          <button
            type="button"
            @click="photoPreview = ''; photoFile = null; imageUrl = ''"
            class="text-sm text-red-600 hover:text-red-800 mt-1"
          >
            Remove
          </button>
        </div>
        <input
          v-else
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          @change="handlePhotoSelect"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      
      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          v-model="notes"
          rows="3"
          maxlength="1000"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Any special notes about this plant..."
        />
      </div>
      
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      
      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
        <NuxtLink 
          :to="`/plants/${id}`" 
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>