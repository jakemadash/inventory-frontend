import { ref, onMounted } from 'vue'
import axios from 'axios'

export const useFetch = (entity: string) => {
  axios.defaults.baseURL = 'http://localhost:3000/'

  const apiResponse = ref<string | null>(null)
  const apiError = ref<string | null>(null)

  const fetchData = async () => {
    try {
      const response = await axios.get(entity)
      apiResponse.value = response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        apiError.value = `HTTP error! Status: ${error.response?.status} - ${error.response?.statusText}`
      } else if (error instanceof Error) {
        apiError.value = error.message
      } else {
        apiError.value = 'An unknown error occurred'
      }
    }
  }

  onMounted(fetchData)
  return { apiResponse, apiError }
}
