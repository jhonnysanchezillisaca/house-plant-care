import type { Ref } from 'vue'

interface User {
  id: number
  email: string
  name: string
  createdAt?: string
}

export const useAuth = () => {
  const user: Ref<User | null> = useState('user', () => null)
  const isLoggedIn = computed(() => !!user.value)
  
  async function fetchUser() {
    try {
      const { data } = await useFetch('/api/user')
      user.value = data.value as User | null
      return data.value
    } catch {
      user.value = null
      return null
    }
  }
  
  async function login(email: string, password: string) {
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    
    if (error.value) {
      throw new Error(error.value.data?.message || 'Login failed')
    }
    
    user.value = data.value?.user as User
    return data.value
  }
  
  async function signup(email: string, password: string, name: string) {
    const { data, error } = await useFetch('/api/auth/signup', {
      method: 'POST',
      body: { email, password, name }
    })
    
    if (error.value) {
      throw new Error(error.value.data?.message || 'Signup failed')
    }
    
    user.value = data.value?.user as User
    return data.value
  }
  
  async function logout() {
    await useFetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }
  
  return {
    user,
    isLoggedIn,
    fetchUser,
    login,
    signup,
    logout
  }
}