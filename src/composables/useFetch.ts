import { ref, onMounted } from 'vue'
import axios from 'axios'

export const useFetch = <T = unknown>(
  entity: string,
  options?: { method?: 'get' | 'post'; data?: T },
) => {
  axios.defaults.baseURL = 'http://localhost:3000/'

  const apiResponse = ref<string | null>(null)
  const apiError = ref<string | null>(null)

  const fetchData = async () => {
    try {
      let response

      if (options?.method === 'post') {
        response = await axios.post(`${entity}/new`, options.data)
      } else {
        response = await axios.get(entity)
      }

      apiResponse.value = response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        apiError.value = `HTTP ${options?.method?.toUpperCase() || 'GET'} error! Status: ${error.response?.status} - ${error.response?.statusText}`
      } else if (error instanceof Error) {
        apiError.value = error.message
      } else {
        apiError.value = 'An unknown error occurred'
      }
    }
  }

  if (!options?.method || options.method === 'get') {
    onMounted(fetchData)
  }

  return { apiResponse, apiError, fetchData }
}
