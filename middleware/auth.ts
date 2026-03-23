export default defineNuxtRouteMiddleware(async (to) => {
  const { data } = await useFetch('/api/user')
  
  if (!data.value) {
    return navigateTo('/login')
  }
})