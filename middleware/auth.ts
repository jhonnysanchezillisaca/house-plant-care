export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuth()

  if (!user.value) {
    const fetchedUser = await fetchUser()
    if (!fetchedUser) {
      return navigateTo('/login')
    }
  }
})