import { getSessionUser } from '~~/server/utils/session'

const TREFLE_API = 'https://trefle.io/api/v1'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const query = getQuery(event)
  const search = query.q as string
  
  if (!search || search.length < 2) {
    return { data: [] }
  }
  
  const token = process.env.TREFLE_API_TOKEN
  
  if (!token) {
    return { 
      data: [],
      error: 'Trefle API token not configured. Set TREFLE_API_TOKEN environment variable.'
    }
  }
  
  try {
    const response = await fetch(
      `${TREFLE_API}/plants/search?token=${token}&q=${encodeURIComponent(search)}&limit=20`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Trefle API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    const plants = (data.data || []).map((plant: any) => ({
      id: plant.id,
      scientificName: plant.scientific_name,
      commonName: plant.common_name,
      family: plant.family?.name || plant.family,
      imageUrl: plant.image_url,
      native: plant.distributions?.native,
      year: plant.year
    }))
    
    return { data: plants }
  } catch (error) {
    console.error('Trefle API error:', error)
    return { 
      data: [],
      error: 'Failed to search plants. Please try again.'
    }
  }
})