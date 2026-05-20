export default defineEventHandler(() => {
  return {
    message: 'Hello from Plant Care Test!',
    timestamp: new Date().toISOString()
  }
})