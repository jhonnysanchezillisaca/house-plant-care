interface User {
  id: number
  email: string
  name: string
  createdAt?: string
}

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const isLoggedIn = computed(() => !!user.value)
  const loading = ref(false)

  async function fetchUser() {
    try {
      const data = await $fetch<User>('/api/user')
      user.value = data
      return data
    } catch {
      user.value = null
      return null
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const data = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  async function signup(email: string, password: string, name: string) {
    loading.value = true
    try {
      const data = await $fetch<{ user: User }>('/api/auth/signup', {
        method: 'POST',
        body: { email, password, name }
      })
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  return {
    user,
    isLoggedIn,
    loading,
    fetchUser,
    login,
    signup,
    logout
  }
}