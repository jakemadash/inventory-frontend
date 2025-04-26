import { ref, onMounted } from 'vue'
import axios from 'axios'

type EntityData = {
  artist?: string
  album?: string
  genre?: string
  year?: string
}

export const useAxios = (entity: string) => {
  axios.defaults.baseURL = 'http://localhost:3000/'

  const apiResponse = ref<string | null>(null)
  const apiError = ref<string | null>(null)

  const handleError = (e: unknown) => {
    if (axios.isAxiosError(e)) {
      apiError.value = `HTTP error! Status: ${e.response?.status} - ${e.response?.statusText}`
    } else if (e instanceof Error) {
      apiError.value = e.message
    } else {
      apiError.value = 'An unknown error occurred'
    }
  }

  const fetchData = async () => {
    try {
      const response = await axios.get(entity)
      apiResponse.value = response.data
    } catch (e) {
      handleError(e)
    }
  }

  const postData = async (data: EntityData) => {
    try {
      await axios.post(`${entity}/new`, data)
    } catch (e) {
      handleError(e)
    }
  }

  onMounted(fetchData)
  return { fetchData, postData, apiResponse, apiError }
}
